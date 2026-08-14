import { type GetStaticProps } from 'next'

import { NotionPage } from '@/components/NotionPage'
import { domain } from '@/lib/config'
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
  // Deliberately no pre-rendering: crawling Notion here made every deploy
  // depend on Notion answering during the build, so a single API failure took
  // the whole site down. Pages are rendered on first request instead and then
  // cached by ISR, which keeps builds independent of Notion's availability.
  return {
    paths: [],
    fallback: 'blocking'
  }
}

export default function NotionDomainDynamicPage(props: PageProps) {
  return <NotionPage {...props} />
}
