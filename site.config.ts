import { siteConfig } from './lib/site-config'

export default siteConfig({
  // 1. YOUR ROOT NOTION PAGE ID
  rootNotionPageId: '7fa50bcefad34a29af1feae083c179f6',

  // 2. DOMAIN SETTINGS
  domain: 'dewanhafiznabil.com',
  
  // 3. SITE METADATA
  name: 'Dewan Hafiz Nabil',
  author: 'Dewan Hafiz Nabil',
  description: 'Dewan Hafiz Nabil is a Ph.D. researcher at Warwick Manufacturing Group (WMG), University of Warwick, UK.',

  // 4. SOCIALS
  twitter: null,
  github: null,
  linkedin: null,

  // 5. IMAGES & PREVIEWS
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