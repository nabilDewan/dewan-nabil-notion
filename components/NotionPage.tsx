import * as React from 'react'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { NotionRenderer } from 'react-notion-x'
import { getPageTitle, getTextContent } from 'notion-utils'
import { searchNotion } from '@/lib/search-notion'
import { mapImageUrl } from '@/lib/map-image-url' 
import * as config from '@/lib/config'
import { useDarkMode } from '@/lib/use-dark-mode'

import { NotionPageHeader } from './NotionPageHeader'

const Code = dynamic(() =>
  import('react-notion-x/build/third-party/code').then((m) => m.Code)
)
const Collection = dynamic(() =>
  import('react-notion-x/build/third-party/collection').then(
    (m) => m.Collection
  )
)
const Equation = dynamic(() =>
  import('react-notion-x/build/third-party/equation').then((m) => m.Equation)
)
const Pdf = dynamic(
  () => import('react-notion-x/build/third-party/pdf').then((m) => m.Pdf),
  { ssr: false }
)
const Modal = dynamic(
  () => import('react-notion-x/build/third-party/modal').then((m) => m.Modal),
  { ssr: false }
)

interface NotionPageProps {
  recordMap?: any
  rootPageId?: string
  [key: string]: any
}

export const NotionPage = ({
  recordMap,
  rootPageId
}: NotionPageProps) => {
  if (!recordMap) {
    return null
  }

  const title = getPageTitle(recordMap)
  const { isDarkMode } = useDarkMode()

  const { autoDescription, autoImage } = React.useMemo(() => {
    let text = null
    let img = null
    const keys = Object.keys(recordMap?.block || {})
    const block = recordMap?.block?.[keys[0]!]?.value

    if (block?.content) {
      for (const childId of block.content) {
        const child = recordMap?.block?.[childId]?.value
        if (!child) continue
        
        if (!text && child.type === 'text') {
          const t = getTextContent(child.properties?.title)
          if (t) text = t
        }
        if (!img && child.type === 'image') {
          const src = child.properties?.source?.[0]?.[0]
          if (src) img = mapImageUrl(src, child)
        }
        if (text && img) break 
      }
    }
    return { autoDescription: text, autoImage: img }
  }, [recordMap])

  const mapPageUrl = (pageId: string) => {
    if (pageId === rootPageId) {
      return '/'
    }
    return `/${pageId}`
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Dewan Hafiz Nabil',
    alternateName: ['Dewan Hafiz', 'Dewan Nabil', 'Hafiz Nabil', 'Nabil', 'Nabil Dewan'],
    url: `https://${config.domain}`,
    image: config.defaultPageIcon || autoImage,
    sameAs: [
      config.twitter ? `https://twitter.com/${config.twitter}` : null,
      config.github ? `https://github.com/${config.github}` : null,
      config.linkedin ? `https://linkedin.com/in/${config.linkedin}` : null,
    ].filter(Boolean),
    jobTitle: 'Ph.D. Researcher',
    worksFor: {
      '@type': 'Organization',
      name: 'WMG, University of Warwick'
    },
    description: config.description
  }

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta 
          name="keywords" 
          content="Dewan Hafiz Nabil, Dewan Hafiz, Nabil WMG, Dewan Nabil, Industrial Engineering, Hydrogen Supply Chain, Warwick Researcher" 
        />
        <meta name="description" content={autoDescription || config.description || "Dewan Hafiz Nabil - Researcher & Engineer"} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={autoDescription || config.description || "Dewan Hafiz Nabil - Researcher & Engineer"} />
        {autoImage && <meta property="og:image" content={autoImage} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={autoDescription || config.description || "Dewan Hafiz Nabil - Researcher & Engineer"} />
        {autoImage && <meta name="twitter:image" content={autoImage} />}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>

      <NotionRenderer
        // KEY REMOVED: No more flashing/reloading!
        recordMap={recordMap}
        fullPage={true}
        darkMode={isDarkMode}
        rootPageId={rootPageId}
        mapPageUrl={mapPageUrl}
        searchNotion={searchNotion}
        previewImages={!!recordMap.preview_images}
        showCollectionViewDropdown={false}
        showTableOfContents={false}
        minTableOfContentsItems={3}
        defaultPageIcon={undefined}
        defaultPageCover={undefined}
        defaultPageCoverPosition={0.5}
        mapImageUrl={mapImageUrl}
        components={{
          Code,
          Collection,
          Equation,
          Pdf,
          Modal,
          Header: NotionPageHeader 
        }}
      />
    </>
  )
}