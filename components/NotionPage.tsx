import * as React from 'react'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { NotionRenderer } from 'react-notion-x'
import { getPageTitle } from 'notion-utils'
import { mapPageUrl } from '@/lib/map-page-url'
import { searchNotion } from '@/lib/search-notion'

// 1. Dynamic imports for heavy Notion blocks (Code, Equations, Collections)
// This keeps the site fast while keeping all Notion features working.
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

export const NotionPage = ({
  recordMap,
  rootPageId
}) => {
  if (!recordMap) {
    return null
  }

  const title = getPageTitle(recordMap)

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
        
        // Pass standard components so code/math/databases work
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