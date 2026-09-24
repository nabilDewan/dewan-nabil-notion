import { parsePageId } from 'notion-utils'

import { navigationLinks } from './config'

/** The Research page, where the metrics are shown under the title. */
export const researchPageId: string | null =
  parsePageId(
    navigationLinks?.find((link) => link && /research/i.test(link.title))
      ?.pageId
  ) ?? null

export const scholarUserId = 'gJ4XFLAAAAAJ'
export const scholarProfileUrl = `https://scholar.google.com/citations?user=${scholarUserId}&hl=en`

export interface ScholarMetrics {
  citations: number
  hIndex: number
  i10Index: number
}

/**
 * Numbers shown when Google Scholar can't be reached (it has no API and often
 * blocks requests from cloud servers). Update these occasionally from your
 * profile; set to null to hide the metrics whenever the live fetch fails.
 */
export const scholarFallback: ScholarMetrics | null = null

/**
 * Reads the "Cited by" table (#gsc_rsb_st) from a Scholar profile page. Its
 * six value cells are, in order: citations (all, since), h-index (all, since),
 * i10-index (all, since). We show the all-time column.
 */
export function parseScholarMetrics(html: string): ScholarMetrics | null {
  const tableStart = html.indexOf('id="gsc_rsb_st"')
  if (tableStart === -1) return null

  const tableEnd = html.indexOf('</table>', tableStart)
  const table = html.slice(tableStart, tableEnd === -1 ? undefined : tableEnd)

  const values = [
    ...table.matchAll(/<td class="gsc_rsb_std">\s*([\d,]+)\s*<\/td>/g)
  ].map((match) => Number(match[1]!.replaceAll(',', '')))

  if (values.length < 6 || values.some((value) => !Number.isFinite(value))) {
    return null
  }

  return {
    citations: values[0]!,
    hIndex: values[2]!,
    i10Index: values[4]!
  }
}

export async function fetchScholarMetrics(): Promise<ScholarMetrics | null> {
  try {
    const res = await fetch(scholarProfileUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
        'Accept-Language': 'en-GB,en;q=0.9'
      },
      signal: AbortSignal.timeout(8000)
    })

    if (!res.ok) return null
    return parseScholarMetrics(await res.text())
  } catch {
    return null
  }
}
