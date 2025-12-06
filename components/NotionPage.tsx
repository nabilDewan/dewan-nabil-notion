import * as React from 'react'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { NotionRenderer } from 'react-notion-x'
import { getPageTitle } from 'notion-utils'
import { searchNotion } from '@/lib/search-notion'

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
        
        // Disable ToC
        showTableOfContents={false}
        minTableOfContentsItems={3}
        
        defaultPageIcon={undefined}
        defaultPageCover={undefined}
        defaultPageCoverPosition={0.5}
        
        // 2. CONNECT THE COMPONENTS
        components={{
          Code,
          Collection,
          Equation,
          Pdf,
          Modal,
          Header: NotionPageHeader // <--- THIS IS THE FIX
        }}
      />
    </>
  )
}