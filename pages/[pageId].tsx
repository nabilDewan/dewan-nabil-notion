import { type GetStaticProps } from 'next'

import { NotionPage } from '@/components/NotionPage'
import { domain, isDev } from '@/lib/config'
import { getSiteMap } from '@/lib/get-site-map'
import { resolveNotionPage } from '@/lib/resolve-notion-page'
import { type PageProps, type Params } from '@/lib/types'

export const getStaticProps: GetStaticProps<PageProps, Params> = async (
  context
) => {
  const rawPageId = context.params?.pageId as string

  try {
    const props = await resolveNotionPage(domain, rawPageId)

    return { props, revalidate: 10 }
  } catch (err) {
    console.error('page error', domain, rawPageId, err)

    // we don't want to publish the error version of this page, but we also
    // don't want one unreachable page to fail the entire build, so serve a 404
    // and let ISR re-attempt the page on the next request after `revalidate`
    return { notFound: true, revalidate: 60 }
  }
}

export async function getStaticPaths() {
  if (isDev) {
    return {
      paths: [],
      fallback: true
    }
  }

  const siteMap = await getSiteMap()
  const paths = Object.keys(siteMap.canonicalPageMap).map((pageId) => ({
    params: {
      pageId
    }
  }))

  return {
    paths,
    // 'blocking' so that any page missing from the site map at build time (e.g.
    // because Notion was briefly unreachable) is still rendered on demand
    // instead of hard-404ing until the next deploy
    fallback: 'blocking'
  }
}

export default function NotionDomainDynamicPage(props: PageProps) {
  return <NotionPage {...props} />
}
