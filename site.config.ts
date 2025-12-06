import { siteConfig } from './lib/site-config'

export default siteConfig({
  // 1. YOUR ROOT NOTION PAGE ID
  rootNotionPageId: '7fa50bcefad34a29af1feae083c179f6',

  // 2. DOMAIN SETTINGS
  // Essential for Sitemap generation and Canonical URLs (prevents duplicate content issues)
  domain: 'dewanhafiznabil.com',
  
  // 3. SITE METADATA
  name: 'Dewan Hafiz Nabil',
  author: 'Dewan Hafiz Nabil',
  // This description acts as the "fallback" meta description for pages without one
  description: 'Dewan Hafiz Nabil is a Ph.D. researcher at Warwick Manufacturing Group (WMG), University of Warwick, UK, specializing in sustainable supply chains and hydrogen energy.',

  // 4. SOCIALS (CRITICAL FOR SEO)
  // Search engines use this to build your "Knowledge Graph" card.
  // Replace these nulls with your actual usernames (no @ symbols).
  twitter: 'your_twitter_username', 
  github: 'your_github_username',   
  linkedin: 'your_linkedin_username', 
  // mastodon: '...', // Optional
  // youtube: '...', // Optional

  // 5. IMAGES & PREVIEWS
  // 'true' helps Core Web Vitals (CLS score) by loading a blurry preview first
  defaultPageIcon: null,
  defaultPageCover: null,
  defaultPageCoverPosition: 0.5,
  isPreviewImageSupportEnabled: true,
  isTweetEmbedSupportEnabled: true,
  isRedisEnabled: false, 

  // 6. STICKY NAVIGATION CONFIGURATION
  navigationStyle: 'custom',
  
  navigationLinks: [
    { 
      title: 'Home', 
      pageId: '7fa50bcefad34a29af1feae083c179f6' // Root ID
    },
    { 
      title: 'About Me', 
      pageId: 'a293502a14dd4315b9b4ec6242f1c792' 
    },
    { 
      title: 'Academics', 
      pageId: '524cba980d3547d89a873d772a590bcc' 
    },
    { 
      title: 'Research', 
      pageId: '25110164209144858a9c9be596dd7b46' 
    },
    { 
      title: 'Experience', 
      pageId: '9ec541bcbb944e38942f09b4525bf67b' 
    },
    { 
      title: 'Blogs', 
      pageId: '6bad9a8286f246479c235939659999c7' 
    },
    { 
      title: 'Contact', 
      pageId: 'e766c2c57a354ea3891a7ec8d9173276' 
    }
  ]
})