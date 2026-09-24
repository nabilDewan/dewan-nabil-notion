import { type NextApiRequest, type NextApiResponse } from 'next'

import {
  fetchScholarMetrics,
  scholarFallback,
  type ScholarMetrics
} from '../../lib/scholar'

export interface ScholarMetricsResponse {
  metrics: ScholarMetrics | null
  source: 'live' | 'fallback' | 'none'
}

// last successful result on this server instance, preferred over the fallback
let lastLive: ScholarMetrics | null = null

export default async function scholarMetrics(
  req: NextApiRequest,
  res: NextApiResponse<ScholarMetricsResponse | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).send({ error: 'method not allowed' })
  }

  const live = await fetchScholarMetrics()
  if (live) lastLive = live
  const fallback = lastLive ?? scholarFallback

  // The CDN caches this response, so Google Scholar is asked at most about
  // once a day. Failures are retried sooner, serving the fallback meanwhile.
  res.setHeader(
    'Cache-Control',
    live
      ? 'public, s-maxage=86400, max-age=3600, stale-while-revalidate=604800'
      : 'public, s-maxage=3600, max-age=600, stale-while-revalidate=86400'
  )

  res
    .status(200)
    .json(
      live
        ? { metrics: live, source: 'live' }
        : { metrics: fallback, source: fallback ? 'fallback' : 'none' }
    )
}
