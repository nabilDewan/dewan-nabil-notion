import { type GetStaticProps } from 'next'

import { NotionPage } from '@/components/NotionPage'
import { domain, isDev, pageRevalidateSeconds } from '@/lib/config'
import { getSiteMap } from '@/lib/get-site-map'
import { resolveNotionPage } from '@/lib/resolve-notion-page'
import { type PageProps, type Params } from '@/lib/types'

export const getStaticProps: GetStaticProps<PageProps, Params> = async (
  context
) => {
  const rawPageId = context.params?.pageId as string

  try {
    const props = await resolveNotionPage(domain, rawPageId)

    if (props.error?.statusCode === 404) {
      // re-check unknown pages every few minutes, so a page published in
      // Notion shortly after someone first tried its link still appears
      return { notFound: true, revalidate: 5 * 60 }
    }

    return { props, revalidate: pageRevalidateSeconds }
  } catch (err) {
    console.error('page error', domain, rawPageId, err)

    // we don't want to publish the error version of this page, so
    // let next.js know explicitly that incremental SSG failed
    throw err
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
    // pages added in Notion after the last deploy (e.g. a new blog post) are
    // rendered on their first visit instead of returning 404
    fallback: 'blocking'
  }
}

export default function NotionDomainDynamicPage(props: PageProps) {
  return <NotionPage {...props} />
}
