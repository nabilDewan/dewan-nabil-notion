import { type ExtendedRecordMap } from 'notion-types'
import {
  getBlockValue,
  getPageProperty,
  normalizeTitle,
  parsePageId
} from 'notion-utils'

import type { PageProps } from './types'
import * as acl from './acl'
import { blogIndexPageId } from './blog'
import {
  environment,
  includeNotionIdInUrls,
  navigationLinks,
  pageUrlAdditions,
  pageUrlOverrides,
  site
} from './config'
import { db } from './db'
import { getCanonicalPageId } from './get-canonical-page-id'
import { getSiteMap } from './get-site-map'
import { getPage } from './notion'
import { notion } from './notion-api'

const getNavigationLinkPageId = (rawPageId?: string) => {
  if (!rawPageId) return undefined

  for (const link of navigationLinks || []) {
    if (!link?.pageId || !link.title) {
      continue
    }

    const slug = normalizeTitle(link.title)
    if (slug === rawPageId) {
      return parsePageId(link.pageId)
    }
  }

  return undefined
}

// -----------------------------------------------------------------------------
// Fast lookup of page URLs (slugs) for pages linked from the navigation pages,
// e.g. blog posts in the Blogs database. This lets new posts resolve without a
// redeploy, and without crawling the whole workspace (which is too slow to run
// inside a single request).
// -----------------------------------------------------------------------------

// how long a navigation page's list of child pages is reused, and how stale it
// must be before an unknown URL (e.g. a just-published post) triggers a refresh
const NAV_PAGE_MAP_TTL_MS = 5 * 60 * 1000
const NAV_PAGE_MAP_MIN_REFRESH_MS = 30 * 1000

// the full workspace crawl is a last resort at runtime; never let it hold a
// request long enough to hit Vercel's function time limit
const SITE_MAP_RUNTIME_BUDGET_MS = 6000

const navPageMapCache = new Map<
  string,
  { time: number; promise: Promise<Record<string, string>> }
>()

async function loadNavPageMap(navPageId: string) {
  const recordMap = await notion.getPage(navPageId, { signFileUrls: false })
  const map: Record<string, string> = {}

  for (const id of Object.keys(recordMap.block)) {
    const block = getBlockValue(recordMap.block[id])
    if (block?.type !== 'page') continue

    // respect the same "Public" checkbox the full site map honours
    if (getPageProperty<boolean | null>('Public', block, recordMap) === false) {
      continue
    }

    const canonicalPageId = getCanonicalPageId(id, recordMap, {
      uuid: includeNotionIdInUrls
    })
    if (canonicalPageId && !map[canonicalPageId]) {
      map[canonicalPageId] = id
    }
  }

  return map
}

function getNavPageMap(navPageId: string, maxAgeMs = NAV_PAGE_MAP_TTL_MS) {
  const cached = navPageMapCache.get(navPageId)
  if (cached && Date.now() - cached.time < maxAgeMs) {
    return cached.promise
  }

  const promise = loadNavPageMap(navPageId)
  navPageMapCache.set(navPageId, { time: Date.now(), promise })
  promise.catch(() => navPageMapCache.delete(navPageId))
  return promise
}

async function findPageIdViaNavigationPages(
  slug: string
): Promise<string | undefined> {
  const linkedPageIds = (navigationLinks ?? [])
    .map((link) => parsePageId(link?.pageId))
    .filter((id): id is string => !!id)

  // the Blogs page is by far the most likely home of a new page
  const navPageIds = [
    ...linkedPageIds.filter((id) => id === blogIndexPageId),
    ...linkedPageIds.filter((id) => id !== blogIndexPageId)
  ]

  const lookup = async (maxAgeMs: number) => {
    for (const navPageId of navPageIds) {
      try {
        const pageId = (await getNavPageMap(navPageId, maxAgeMs))[slug]
        if (pageId) return pageId
      } catch (err: any) {
        console.warn('navigation page lookup failed', navPageId, err?.message)
      }
    }
    return undefined
  }

  // cached lists first; on a miss, re-fetch any list older than 30 seconds so
  // a post published moments ago is found
  const cached = await lookup(NAV_PAGE_MAP_TTL_MS)
  return cached ?? lookup(NAV_PAGE_MAP_MIN_REFRESH_MS)
}

const isBuild = process.env.NEXT_PHASE === 'phase-production-build'

async function getSiteMapWithinBudget() {
  if (isBuild) return getSiteMap()

  // the crawl keeps running (and is memoized) if it overruns the budget, so a
  // later request can still use it
  return Promise.race([
    getSiteMap(),
    new Promise<undefined>((resolve) =>
      setTimeout(resolve, SITE_MAP_RUNTIME_BUDGET_MS)
    )
  ])
}

// page slugs are lower-case words joined by hyphens; anything else (bots probing
// for /wp-admin.php and the like) is not worth an expensive workspace crawl
const isPlausibleSlug = (slug: string) =>
  slug.length <= 200 && /^[\p{L}\p{N}-]+$/u.test(slug)

export async function resolveNotionPage(
  domain: string,
  rawPageId?: string
): Promise<PageProps> {
  let pageId: string | undefined
  let recordMap: ExtendedRecordMap

  if (rawPageId && rawPageId !== 'index') {
    pageId = parsePageId(rawPageId)!

    if (!pageId) {
      // check if the site configuration provides an override or a fallback for
      // the page's URI
      const override =
        pageUrlOverrides[rawPageId] || pageUrlAdditions[rawPageId]

      if (override) {
        pageId = parsePageId(override)!
      }
    }

    if (!pageId) {
      pageId = getNavigationLinkPageId(rawPageId)
    }

    const useUriToPageIdCache = true
    const cacheKey = `uri-to-page-id:${domain}:${environment}:${rawPageId}`
    // TODO: should we use a TTL for these mappings or make them permanent?
    // const cacheTTL = 8.64e7 // one day in milliseconds
    const cacheTTL = undefined // disable cache TTL

    if (!pageId && useUriToPageIdCache) {
      try {
        // check if the database has a cached mapping of this URI to page ID
        pageId = await db.get(cacheKey)

        // console.log(`redis get "${cacheKey}"`, pageId)
      } catch (err: any) {
        // ignore redis errors
        console.warn(`redis error get "${cacheKey}"`, err.message)
      }
    }

    // (during a build the full site map is already loaded, so this is only
    // needed at runtime)
    if (!pageId && !isBuild && isPlausibleSlug(rawPageId)) {
      pageId = await findPageIdViaNavigationPages(rawPageId)
    }

    if (pageId) {
      recordMap = await getPage(pageId)
    } else if (isPlausibleSlug(rawPageId)) {
      // handle mapping of user-friendly canonical page paths to Notion page IDs
      // e.g., /developer-x-entrepreneur versus /71201624b204481f862630ea25ce62fe
      const siteMap = await getSiteMapWithinBudget()
      pageId = siteMap?.canonicalPageMap[rawPageId]

      if (pageId) {
        // TODO: we're not re-using the page recordMap from siteMaps because it is
        // cached aggressively
        // recordMap = siteMap.pageMap[pageId]

        recordMap = await getPage(pageId)

        if (useUriToPageIdCache) {
          try {
            // update the database mapping of URI to pageId
            await db.set(cacheKey, pageId, cacheTTL)

            // console.log(`redis set "${cacheKey}"`, pageId, { cacheTTL })
          } catch (err: any) {
            // ignore redis errors
            console.warn(`redis error set "${cacheKey}"`, err.message)
          }
        }
      } else {
        // note: we're purposefully not caching URI to pageId mappings for 404s
        return {
          error: {
            message: `Not found "${rawPageId}"`,
            statusCode: 404
          }
        }
      }
    } else {
      return {
        error: {
          message: `Not found "${rawPageId}"`,
          statusCode: 404
        }
      }
    }
  } else {
    pageId = site.rootNotionPageId

    console.log(site)
    recordMap = await getPage(pageId)
  }

  const props: PageProps = { site, recordMap, pageId }
  return { ...props, ...(await acl.pageAcl(props)) }
}
