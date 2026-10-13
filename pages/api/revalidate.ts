import { timingSafeEqual } from 'node:crypto'

import { type NextApiRequest, type NextApiResponse } from 'next'
import { normalizeTitle, parsePageId } from 'notion-utils'

import { blogIndexPageId } from '../../lib/blog'
import { navigationLinks } from '../../lib/config'

/**
 * On-demand refresh, for when you want a Notion change live right away
 * instead of waiting for the hourly refresh:
 *
 *   https://<your-domain>/api/revalidate?secret=<REVALIDATE_SECRET>
 *
 * refreshes the home page and the Blogs page. Add `&path=/some-page` (several
 * paths can be comma-separated) to refresh other pages too. The endpoint is
 * disabled unless REVALIDATE_SECRET is set in the Vercel project settings.
 */
export default async function revalidate(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const secret = process.env.REVALIDATE_SECRET
  if (!secret) {
    return res.status(404).json({ error: 'not found' })
  }

  const given = Buffer.from(String(req.query.secret ?? ''))
  const expected = Buffer.from(secret)
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return res.status(401).json({ error: 'invalid secret' })
  }

  const blogLink = navigationLinks?.find(
    (link) => link?.pageId && parsePageId(link.pageId) === blogIndexPageId
  )

  const extraPaths = String(req.query.path ?? '')
    .split(',')
    .map((path) => path.trim())
    .filter((path) => path.startsWith('/'))

  const paths = [
    ...new Set([
      '/',
      ...(blogLink ? [`/${normalizeTitle(blogLink.title)}`] : []),
      ...extraPaths
    ])
  ]

  const results: Record<string, string> = {}
  for (const path of paths) {
    try {
      await res.revalidate(path)
      results[path] = 'refreshed'
    } catch (err: any) {
      results[path] = `failed: ${err?.message ?? 'unknown error'}`
    }
  }

  res.setHeader('Cache-Control', 'no-store')
  return res.status(200).json({ results })
}
