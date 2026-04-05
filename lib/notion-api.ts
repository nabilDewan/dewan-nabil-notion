import { NotionAPI } from 'notion-client'

export const notion = new NotionAPI({
  apiBaseUrl: process.env.NOTION_API_BASE_URL
})

// Global queue to serialize Notion API calls
class NotionQueue {
  private queue: Array<() => Promise<any>> = []
  private processing = false

  async add<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn()
          resolve(result)
        } catch (error) {
          reject(error)
        }
      })
      this.process()
    })
  }

  private async process() {
    if (this.processing || this.queue.length === 0) return

    this.processing = true

    while (this.queue.length > 0) {
      const task = this.queue.shift()!
      await task()
      // Small delay between requests to be extra safe
      await new Promise(resolve => setTimeout(resolve, 2000))
    }

    this.processing = false
  }
}

const notionQueue = new NotionQueue()

// Wrap the notion.getPage method to use the queue
const originalGetPage = notion.getPage
notion.getPage = function(pageId: string, options?: any) {
  return notionQueue.add(() => originalGetPage.call(this, pageId, options))
}
