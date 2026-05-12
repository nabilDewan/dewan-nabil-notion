export function cleanDescription(
  description: string | null | undefined
): string {
  const desc = description || ''
  if (!desc) return ''

  return desc
    .replaceAll(/\s+/g, ' ')
    .trim()
    .split('\n')[0]!
    .slice(0, 160)
}

export function getSocialImageUrl(pageId: string, domain: string): string {
  return `https://${domain}/api/social-image?id=${pageId}`
}
