import {
  getAllPagesInSpace,
  getBlockValue,
  getPageProperty,
  uuidToId
} from 'notion-utils'
import pMemoize from 'p-memoize'

import type * as types from './types'
import * as config from './config'
import { includeNotionIdInUrls } from './config'
import { getCanonicalPageId } from './get-canonical-page-id'
import { notion } from './notion-api'

const uuid = !!includeNotionIdInUrls

export async function getSiteMap(): Promise<types.SiteMap> {
  const partialSiteMap = await getAllPages(
    config.rootNotionPageId,
    config.rootNotionSpaceId ?? undefined
  )

  return {
    site: config.site,
    ...partialSiteMap
  } as types.SiteMap
}

const getAllPages = pMemoize(getAllPagesImpl, {
  cacheKey: (...args) => JSON.stringify(args)
})

const getPage = async (pageId: string, opts?: any) => {
  console.log('\nnotion getPage', uuidToId(pageId))
  return notion.getPage(pageId, {
    kyOptions: {
      timeout: 30_000
    },
    ...opts
  })
}

async function getAllPagesImpl(
  rootNotionPageId: string,
  rootNotionSpaceId?: string,
  {
    maxDepth = 10
  }: {
    maxDepth?: number
  } = {}
): Promise<Partial<types.SiteMap>> {
  const pageMap = await getAllPagesInSpace(
    rootNotionPageId,
    rootNotionSpaceId,
    getPage,
    {
      maxDepth,
      concurrency: 1,
      traverseCollections: true
    }
  )

  const canonicalPageMap = Object.keys(pageMap).reduce(
    (map: Record<string, string>, pageId: string) => {
      const recordMap = pageMap[pageId]
      if (!recordMap) {
        // The root page is load-bearing: without it there is no site, so fail
        // the build loudly rather than deploying an empty one. Any other page
        // failing to load is tolerated so one bad page can't block a deploy —
        // it is simply left out of the site map.
        if (uuidToId(pageId) === uuidToId(rootNotionPageId)) {
          throw new Error(`Error loading root page "${pageId}"`)
        }

        console.warn(`error loading page "${pageId}"; omitting from site map`)
        return map
      }

      const block = getBlockValue(recordMap.block[pageId])
      if (
        !(getPageProperty<boolean | null>('Public', block!, recordMap) ?? true)
      ) {
        return map
      }

      const canonicalPageId = getCanonicalPageId(pageId, recordMap, {
        uuid
      })!

      if (map[canonicalPageId]) {
        // you can have multiple pages in different collections that have the same id
        // TODO: we may want to error if neither entry is a collection page
        console.warn('error duplicate canonical page id', {
          canonicalPageId,
          pageId,
          existingPageId: map[canonicalPageId]
        })

        return map
      } else {
        return {
          ...map,
          [canonicalPageId]: pageId
        }
      }
    },
    {}
  )

  return {
    pageMap,
    canonicalPageMap
  }
}
