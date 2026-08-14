import type { PageProps } from '@/lib/types'
import { NotionPage } from '@/components/NotionPage'
import { domain, site } from '@/lib/config'
import { resolveNotionPage } from '@/lib/resolve-notion-page'

export const getStaticProps = async () => {
  try {
    const props = await resolveNotionPage(domain)

    return { props, revalidate: 10 }
  } catch (err) {
    console.error('page error', domain, err)

    // Notion being unreachable must not fail the build, otherwise a transient
    // API error means no deploy at all. Render an error page with a short
    // revalidate so ISR replaces it with the real homepage as soon as Notion
    // responds again — without needing a redeploy.
    return {
      props: {
        site,
        error: {
          message: `Unable to load the site's Notion content: ${(err as Error)?.message}`,
          statusCode: 503
        }
      } satisfies PageProps,
      revalidate: 10
    }
  }
}

export default function NotionDomainPage(props: PageProps) {
  return <NotionPage {...props} />
}
