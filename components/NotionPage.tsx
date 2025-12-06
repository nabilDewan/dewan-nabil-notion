import * as React from 'react'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { NotionRenderer } from 'react-notion-x'
import { getPageTitle } from 'notion-utils'
import type { ExtendedRecordMap } from 'notion-types'
import { searchNotion } from '@/lib/search-notion'

// 1. Dynamic imports for heavy Notion blocks
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

// 2. Define the exact types
interface NotionPageProps {
  recordMap: ExtendedRecordMap
  rootPageId?: string
}

export const NotionPage = ({
  recordMap,
  rootPageId
}: NotionPageProps) => {
  if (!recordMap) {
    return null
  }

  const title = getPageTitle(recordMap)

  // 3. FIX: A simple function to handle links without the complex library
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
        showTableOfContents={true}
        minTableOfContentsItems={3}
        defaultPageIcon={null}
        defaultPageCover={null}
        defaultPageCoverPosition={0.5}
        
        components={{
          Code,
          Collection,
          Equation,
          Pdf,
          Modal
        }}
      />
    </>
  )
}