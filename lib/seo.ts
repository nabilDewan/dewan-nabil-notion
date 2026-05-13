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
  siteDescription: string | null | undefined
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

  return cleanDescription(siteDescription)
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
