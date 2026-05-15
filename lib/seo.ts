import { host } from './config'

const starterKitDescriptions = [
  'Example Next.js Notion Starter Kit Site',
  'The perfect starter kit for building beautiful websites with Next.js and Notion.',
  'Notion Blog'
]

export function cleanDescription(
  description: string | null | undefined = ''
): string {
  const desc = description || ''
  if (!desc) return ''

  return desc.replaceAll(/\s+/g, ' ').trim().split('\n')[0]!.slice(0, 160)
}

export function getSeoDescription(
  pageDescription: string | null | undefined,
  siteDescription: string | null | undefined,
  recordMap?: any
): string {
  const cleanPageDescription = cleanDescription(pageDescription)

  if (
    cleanPageDescription &&
    !starterKitDescriptions.some(
      (description) =>
        cleanPageDescription.toLowerCase() === description.toLowerCase()
    )
  ) {
    return cleanPageDescription
  }

  // Fallback to extracting text from the page content if available
  if (recordMap) {
    const pageText = extractPageText(recordMap)
    if (pageText) {
      return cleanDescription(pageText)
    }
  }

  return cleanDescription(siteDescription)
}

function extractPageText(recordMap: any): string | null {
  const blocks = Object.values(recordMap.block || {})
  let text = ''

  for (const blockValue of blocks) {
    const block = (blockValue as any)?.value
    if (
      block &&
      (block.type === 'text' ||
        block.type === 'header' ||
        block.type === 'sub_header' ||
        block.type === 'sub_sub_header')
    ) {
      const blockText = block.properties?.title
        ?.map((t: any) => t[0])
        .join('')
        .trim()
      if (blockText) {
        text += blockText + ' '
        if (text.length > 200) break
      }
    }
  }

  return text.trim() || null
}

export function absoluteUrl(
  url: string | null | undefined
): string | undefined {
  if (!url) return undefined

  try {
    return new URL(url, host).toString()
  } catch {
    return undefined
  }
}

export function getSocialImageUrl(pageId: string, domain: string): string {
  return `https://${domain}/api/social-image?id=${pageId}`
}
