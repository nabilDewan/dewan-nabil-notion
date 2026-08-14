import { NotionAPI } from 'notion-client'

// Notion's private API refuses anonymous requests from some datacenter IPs with
// a 403. Supplying a logged-in session (the `token_v2` cookie) via env vars is
// the escape hatch; all three are optional and unset by default.
export const notion = new NotionAPI({
  apiBaseUrl: process.env.NOTION_API_BASE_URL,
  authToken: process.env.NOTION_AUTH_TOKEN,
  activeUser: process.env.NOTION_ACTIVE_USER,
  userTimeZone: process.env.NOTION_USER_TIME_ZONE
})

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const originalGetPage = notion.getPage.bind(notion)
const NOTION_API_REQUEST_DELAY_MS = 3000
let lastNotionRequestTime = 0
let notionRequestQueue: Promise<void> = Promise.resolve()

function enqueueNotionRequest<T>(fn: () => Promise<T>): Promise<T> {
  const result = notionRequestQueue.then(async () => {
    const now = Date.now()
    const wait = Math.max(
      0,
      NOTION_API_REQUEST_DELAY_MS - (now - lastNotionRequestTime)
    )

    if (wait > 0) {
      await sleep(wait)
    }

    lastNotionRequestTime = Date.now()
    return fn()
  })

  notionRequestQueue = result.then(
    () => undefined,
    () => undefined
  )
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
      const is502 = err?.statusCode === 502 || /\b502\b/.test(message)
      // Notion also answers 403 when it decides an unauthenticated request looks
      // like a bot, which is often transient and worth retrying. A page that is
      // genuinely not shared publicly 403s every time and exhausts the retries.
      const is403 = err?.statusCode === 403 || /\b403\b/.test(message)

      if ((!is429 && !is502 && !is403) || attempt >= 5) {
        if (is403) {
          console.error(
            `Notion API 403 for ${pageId} after ${attempt} attempt(s). Either the page is not shared publicly ` +
              `(Notion > Share > Publish to web), or Notion is blocking this IP. ` +
              `See NOTION_AUTH_TOKEN / NOTION_API_BASE_URL in the readme.`
          )
        }

        throw err
      }

      const delay = NOTION_API_REQUEST_DELAY_MS * attempt
      console.warn(
        `Notion API ${err?.statusCode || 'error'} for ${pageId}, retrying in ${delay}ms (attempt ${attempt})`
      )
      await sleep(delay)
      attempt += 1
    }
  }
}
