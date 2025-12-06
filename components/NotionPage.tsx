import * as React from 'react'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { NotionRenderer } from 'react-notion-x'
import { getPageTitle, getTextContent } from 'notion-utils'
import { searchNotion } from '@/lib/search-notion'
import { mapImageUrl } from '@/lib/map-image-url' // Ensure this exists in your lib

// 1. IMPORT THE HEADER COMPONENT
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

  // SMART SHARING LOGIC: Extract Text & Image from Body
  const { autoDescription, autoImage } = React.useMemo(() => {
    let text = null
    let img = null
    const keys = Object.keys(recordMap?.block || {})
    const block = recordMap?.block?.[keys[0]!]?.value

    if (block?.content) {
      for (const childId of block.content) {
        const child = recordMap?.block?.[childId]?.value
        if (!child) continue
        
        // Grab first paragraph text for description
        if (!text && child.type === 'text') {
          const t = getTextContent(child.properties?.title)
          if (t) text = t
        }
        // Grab first image for social card
        if (!img && child.type === 'image') {
          const src = child.properties?.source?.[0]?.[0]
          if (src) img = mapImageUrl(src, child)
        }
        if (text && img) break // Stop once we have both
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

  return (
    <>
      <Head>
        <title>{title}</title>
        {/* SEO META TAGS */}
        <meta name="description" content={autoDescription || "Dewan Hafiz Nabil - Researcher & Engineer"} />
        
        {/* Open Graph / Facebook / LinkedIn */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={autoDescription || "Dewan Hafiz Nabil - Researcher & Engineer"} />
        {autoImage && <meta property="og:image" content={autoImage} />}
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={autoDescription || "Dewan Hafiz Nabil - Researcher & Engineer"} />
        {autoImage && <meta name="twitter:image" content={autoImage} />}
      </Head>

      <NotionRenderer
        recordMap={recordMap}
        fullPage={true}
        darkMode={false}
        rootPageId={rootPageId}
        mapPageUrl={mapPageUrl}
        searchNotion={searchNotion}
        previewImages={!!recordMap.preview_images}
        showCollectionViewDropdown={false}
        
        // Disable ToC
        showTableOfContents={false}
        minTableOfContentsItems={3}
        
        defaultPageIcon={undefined}
        defaultPageCover={undefined}
        defaultPageCoverPosition={0.5}
        mapImageUrl={mapImageUrl}
        
        // 2. CONNECT THE COMPONENTS
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