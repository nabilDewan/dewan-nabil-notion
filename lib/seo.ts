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
  recordMap?: any,
  isBlogPost?: boolean
): string {
  const cleanPageDescription = cleanDescription(pageDescription)

  // 1. Use explicit page description if provided
  if (
    cleanPageDescription &&
    !starterKitDescriptions.some(
      (description) =>
        cleanPageDescription.toLowerCase() === description.toLowerCase()
    )
  ) {
    return cleanPageDescription
  }

  // 2. Fallback to extracting text from the page content
  if (recordMap) {
    const pageText = extractPageText(recordMap)
    if (pageText) {
      return cleanDescription(pageText)
    }
  }

  // 3. Final fallback:
  // If it's a blog post and we still have no description, DO NOT use the site bio.
  // This prevents the generic "Dewan Hafiz Nabil is an Industrial Engineer..." from appearing on blogs.
  if (isBlogPost) {
    return ''
  }

  return cleanDescription(siteDescription)
}

function extractPageText(recordMap: any): string | null {
  const blocks = Object.values(recordMap.block || {})
  let text = ''
  const processedBlocks = new Set<string>()

  // Prioritize meaningful content blocks in order of importance
  const blockTypePriority: Record<string, number> = {
    'quote': 5,
    'callout': 4,
    'sub_sub_header': 3,
    'sub_header': 3,
    'header': 2,
    'text': 1
  }

  // Sort blocks by priority (higher priority first)
  const sortedBlocks = Object.entries(recordMap.block || {})
    .map(([id, blockValue]: [string, any]) => ({
      id,
      value: blockValue?.value,
      priority: blockTypePriority[(blockValue?.value?.type as string) || ''] || 0
    }))
    .filter(item => item.priority > 0)
    .sort((a, b) => b.priority - a.priority)

  for (const item of sortedBlocks) {
    if (processedBlocks.has(item.id)) continue
    
    const block = item.value
    if (!block) continue

    const blockText = block.properties?.title
      ?.map((t: any) => (Array.isArray(t) ? t[0] : t))
      .join('')
      .trim()
    
    if (blockText && blockText.length > 10) {
      // Skip very short fragments or common UI text
      const lowerText = blockText.toLowerCase()
      if (
        lowerText.includes('table of contents') ||
        lowerText.includes('related posts') ||
        lowerText.includes('subscribe') ||
        lowerText.includes('share this')
      ) {
        continue
      }
      
      processedBlocks.add(item.id)
      text += blockText + ' '
      
      // For high-priority blocks (quotes, callouts), we can stop earlier
      if (item.priority >= 4 && text.length > 150) break
      if (text.length > 300) break
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
