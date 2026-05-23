import Head from 'next/head'

import type * as types from '@/lib/types'
import * as config from '@/lib/config'
import { getSeoDescription } from '@/lib/seo'

export function PageHead({
  site,
  recordMap,
  title,
  description,
  pageId,
  image,
  url,
  isBlogPost
}: types.PageProps & {
  title?: string
  description?: string
  image?: string
  url?: string
  isBlogPost?: boolean
}) {
  const rssFeedUrl = `${config.host}/feed`

  title = title ?? site?.name
  const finalDescription = getSeoDescription(
    description,
    site?.description,
    recordMap,
    isBlogPost
  )

  // Use the social image API for all pages to ensure a consistent preview card
  // Use a cache buster based on the current date (changes daily) to refresh social media previews
  // This is safer than using timestamps which can cause cache issues
  const cacheBuster = new Date().toISOString().split('T')[0]
  const socialImageUrl = image || (pageId
    ? `${config.host}/api/social-image?id=${pageId}&v=${cacheBuster}`
    : null)

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: config.author,
    url: config.host,
    jobTitle: 'Industrial Engineer | Researcher',
    description: config.description
  }

  return (
    <Head>
      <meta charSet='utf-8' />
      <meta httpEquiv='Content-Type' content='text/html; charset=utf-8' />
      <meta
        name='viewport'
        content='width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover'
      />

      <meta name='mobile-web-app-capable' content='yes' />
      <meta name='apple-mobile-web-app-status-bar-style' content='black' />

      <meta
        name='theme-color'
        media='(prefers-color-scheme: light)'
        content='#fefffe'
        key='theme-color-light'
      />
      <meta
        name='theme-color'
        media='(prefers-color-scheme: dark)'
        content='#2d3439'
        key='theme-color-dark'
      />

      <meta name='robots' content='index,follow' />
      <meta property='og:type' content='website' />

      {site && (
        <>
          <meta property='og:site_name' content={site.name} />
          <meta property='twitter:domain' content={site.domain} />
        </>
      )}

      {config.twitter && (
        <meta name='twitter:creator' content={`@${config.twitter}`} />
      )}

      {finalDescription && (
        <>
          <meta name='description' content={finalDescription} />
          <meta property='og:description' content={finalDescription} />
          <meta name='twitter:description' content={finalDescription} />
        </>
      )}

      {socialImageUrl ? (
        <>
          <meta name='twitter:card' content='summary_large_image' />
          <meta name='twitter:image' content={socialImageUrl} />
          <meta property='og:image' content={socialImageUrl} />
          {/* Fixed dimensions for the generated social card */}
          <meta property='og:image:width' content='1200' />
          <meta property='og:image:height' content='630' />
        </>
      ) : (
        <meta name='twitter:card' content='summary' />
      )}

      {url && (
        <>
          <link rel='canonical' href={url} />
          <meta property='og:url' content={url} />
          <meta property='twitter:url' content={url} />
        </>
      )}

      <link
        rel='alternate'
        type='application/rss+xml'
        href={rssFeedUrl}
        title={site?.name}
      />

      <meta property='og:title' content={title} />
      <meta name='twitter:title' content={title} />
      <title>{title}</title>

      <script type='application/ld+json'>
        {JSON.stringify(structuredData)}
      </script>

      {isBlogPost && (
        <script type='application/ld+json'>
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            '@id': `${url}#BlogPosting`,
            mainEntityOfPage: url,
            url,
            headline: title,
            name: title,
            description: finalDescription,
            author: {
              '@type': 'Person',
              name: config.author
            },
            image: socialImageUrl
          })}
        </script>
      )}
    </Head>
  )
}
