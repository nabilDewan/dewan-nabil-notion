import { NotionAPI } from 'notion-client'

export const notion = new NotionAPI({
  apiBaseUrl: process.env.NOTION_API_BASE_URL
})

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const originalGetPage = notion.getPage.bind(notion)
const NOTION_API_REQUEST_DELAY_MS = 2000
let lastNotionRequestTime = 0
let notionRequestQueue: Promise<void> = Promise.resolve()

function enqueueNotionRequest<T>(fn: () => Promise<T>): Promise<T> {
  const result = notionRequestQueue.then(async () => {
    const now = Date.now()
    const wait = Math.max(0, NOTION_API_REQUEST_DELAY_MS - (now - lastNotionRequestTime))

    if (wait > 0) {
      await sleep(wait)
    }

    lastNotionRequestTime = Date.now()
    return fn()
  })

  notionRequestQueue = result.then(() => undefined, () => undefined)
  return result
}

notion.getPage = async function (pageId: string, options?: any) {
  let attempt = 1

  while (true) {
    try {
      return await enqueueNotionRequest(() => originalGetPage(pageId, options))
    } catch (err: any) {
      const message = String(err?.message || '')
      const is429 = err?.statusCode === 429 || /\b429\b/.test(message)

      if (!is429 || attempt >= 5) {
        throw err
      }

      const delay = NOTION_API_REQUEST_DELAY_MS * attempt
      console.warn(`Notion API 429 for ${pageId}, retrying in ${delay}ms (attempt ${attempt})`)
      await sleep(delay)
      attempt += 1
    }
  }
}
