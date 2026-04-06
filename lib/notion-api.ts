import { NotionAPI } from 'notion-client'

export const notion = new NotionAPI({
  apiBaseUrl: process.env.NOTION_API_BASE_URL
})

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const originalGetPage = notion.getPage.bind(notion)
notion.getPage = async function (pageId: string, options?: any) {
  let attempt = 1

  while (true) {
    try {
      return await originalGetPage(pageId, options)
    } catch (err: any) {
      const message = String(err?.message || '')
      const is429 = err?.statusCode === 429 || /\b429\b/.test(message)

      if (!is429 || attempt >= 5) {
        throw err
      }

      const delay = 500 * 2 ** (attempt - 1)
      console.warn(`Notion API 429 for ${pageId}, retrying in ${delay}ms (attempt ${attempt})`)
      await sleep(delay)
      attempt += 1
    }
  }
}
