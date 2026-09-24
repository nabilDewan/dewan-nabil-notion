import {
  type Block,
  type Collection,
  type ExtendedRecordMap
} from 'notion-types'
import {
  getBlockValue,
  getPageProperty,
  getTextContent,
  parsePageId
} from 'notion-utils'

import * as config from './config'

const WORDS_PER_MINUTE = 220

export interface ArticleMeta {
  author: string
  description: string | null
  publishedTime: number | null
  readingMinutes: number
  tags: string[]
}

/**
 * The Notion page that lists every blog post (the "Blogs" navigation link).
 */
export const blogIndexPageId: string | null =
  parsePageId(
    config.navigationLinks?.find((link) => link && /blog/i.test(link.title))
      ?.pageId
  ) ?? null

export function isBlogIndexPage(pageId: string | undefined): boolean {
  return !!blogIndexPageId && parsePageId(pageId) === blogIndexPageId
}

/**
 * Collection items are treated as blog posts elsewhere on the site, but other
 * pages (e.g. Research) may also contain databases. Walk up the parent chain so
 * the article layout only applies to posts that live under the Blogs page.
 * If the chain can't be resolved we fall back to treating it as a post.
 */
export function isBlogArticle(
  block: Block | undefined,
  recordMap: ExtendedRecordMap
): boolean {
  if (block?.type !== 'page' || block.parent_table !== 'collection') {
    return false
  }

  if (!blogIndexPageId) {
    return true
  }

  let parentId: string | undefined = block.parent_id
  let parentTable: string | undefined = block.parent_table

  for (let depth = 0; parentId && depth < 8; depth++) {
    if (parsePageId(parentId) === blogIndexPageId) {
      return true
    }

    const parent: Block | Collection | undefined =
      parentTable === 'collection'
        ? getBlockValue(recordMap.collection?.[parentId])
        : getBlockValue(recordMap.block?.[parentId])

    if (!parent) {
      return true
    }

    parentId = parent.parent_id
    parentTable = parent.parent_table
  }

  return false
}

function countWords(
  blockId: string,
  recordMap: ExtendedRecordMap,
  visited: Set<string>
): number {
  if (visited.has(blockId)) return 0
  visited.add(blockId)

  const block = getBlockValue(recordMap.block?.[blockId])
  if (!block) return 0

  let words = 0
  const text = getTextContent((block as any).properties?.title)
  if (text) {
    words += text.split(/\s+/).filter(Boolean).length
  }

  for (const childId of block.content ?? []) {
    const child = getBlockValue(recordMap.block?.[childId])
    // don't descend into sub-pages; they are separate articles
    if (child?.type === 'page') continue
    words += countWords(childId, recordMap, visited)
  }

  return words
}

export function getReadingMinutes(
  block: Block,
  recordMap: ExtendedRecordMap
): number {
  const visited = new Set<string>([block.id])
  let words = 0

  for (const childId of block.content ?? []) {
    words += countWords(childId, recordMap, visited)
  }

  return Math.max(1, Math.round(words / WORDS_PER_MINUTE))
}

function getTags(block: Block, recordMap: ExtendedRecordMap): string[] {
  for (const name of ['Tags', 'Tag', 'Category', 'Categories', 'Topics']) {
    const value = getPageProperty<string[] | string>(name, block, recordMap)
    const tags = (Array.isArray(value) ? value : value ? [value] : [])
      .map((tag) => tag.trim())
      .filter(Boolean)

    if (tags.length) return tags
  }

  return []
}

export function getArticleMeta(
  block: Block,
  recordMap: ExtendedRecordMap
): ArticleMeta {
  const published =
    getPageProperty<number>('Published', block, recordMap) ??
    getPageProperty<number>('Date', block, recordMap)

  return {
    author:
      getPageProperty<string>('Author', block, recordMap)?.trim() ||
      config.author,
    description:
      getPageProperty<string>('Description', block, recordMap)?.trim() || null,
    publishedTime:
      typeof published === 'number' && !Number.isNaN(published)
        ? published
        : (block.created_time ?? null),
    readingMinutes: getReadingMinutes(block, recordMap),
    tags: getTags(block, recordMap)
  }
}

export function formatArticleDate(time: number): string {
  return new Date(time).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  })
}
