import { siteConfig } from './lib/site-config'

export default siteConfig({
  // Your Notion Page ID
  rootNotionPageId: '7fa50bcefad34a29af1feae083c179f6',

  // Basic site info
  name: 'Dewan Hafiz Nabil',
  domain: 'dewanhafiznabil.com',
  author: 'Dewan Hafiz Nabil',
  description: 'Dewan Hafiz Nabil is a Ph.D. researcher at Warwick Manufacturing Group (WMG), University of Warwick, UK.',

  // Socials: Set all to undefined to remove them
  twitter: undefined,
  github: undefined,
  linkedin: undefined,
  mastodon: undefined,
  newsletter: undefined,
  youtube: undefined,

  // Images
  defaultPageIcon: null,
  defaultPageCover: null,
  defaultPageCoverPosition: 0.5,

  // Settings
  isPreviewImageSupportEnabled: true,
  isRedisEnabled: false,
  pageUrlOverrides: null,

  // Navigation
  navigationStyle: 'default'
})