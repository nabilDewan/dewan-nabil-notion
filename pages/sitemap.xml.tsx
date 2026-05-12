import type { GetServerSideProps } from 'next'

import type { SiteMap } from '@/lib/types'
import { host } from '@/lib/config'
import { getSiteMap } from '@/lib/get-site-map'

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  if (req.method !== 'GET') {
    res.statusCode = 405
    res.setHeader('Content-Type', 'application/json')
    res.write(JSON.stringify({ error: 'method not allowed' }))
    res.end()
    return {
      props: {}
    }
  }

  const siteMap = await getSiteMap()

  // cache for up to 8 hours
  res.setHeader(
    'Cache-Control',
    'public, max-age=28800, stale-while-revalidate=28800'
  )
  res.setHeader('Content-Type', 'text/xml')
  res.write(createSitemap(siteMap))
  res.end()

  return {
    props: {}
  }
}

const createSitemap = (siteMap: SiteMap) => {
  const lastMod = new Date().toISOString().split('T')[0]

  return `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
      <loc>${host}</loc>
      <lastmod>${lastMod}</lastmod>
      <changefreq>daily</changefreq>
      <priority>1.0</priority>
    </url>

    ${Object.keys(siteMap.canonicalPageMap)
      .map((canonicalPagePath) => {
        const pageId = siteMap.canonicalPageMap[canonicalPagePath]
        const block = siteMap.site.recordMap.block[pageId!]?.value
        const lastModDate = block?.last_edited_time
          ? new Date(block.last_edited_time).toISOString().split('T')[0]
          : lastMod

        return `
          <url>
            <loc>${host}/${canonicalPagePath}</loc>
            <lastmod>${lastModDate}</lastmod>
            <changefreq>weekly</changefreq>
            <priority>0.7</priority>
          </url>
        `.trim()
      })
      .join('')}
  </urlset>
`
}

export default function noop() {
  return null
}
