import { siteConfig } from './lib/site-config'

export default siteConfig({
  // 1. YOUR ROOT NOTION PAGE ID
  rootNotionPageId: '7fa50bcefad34a29af1feae083c179f6',

  // 2. DOMAIN SETTINGS
  domain: 'dewanhafiznabil.com',
  
  // 3. SITE METADATA (SEO OPTIMIZED)
  // Adding the title helps rank for "Researcher" queries
  name: 'Dewan Hafiz Nabil | PhD Researcher', 
  
  author: 'Dewan Hafiz Nabil',
  
  // 4. KEYWORD-RICH DESCRIPTION
  // This sentence includes: "Dewan Hafiz", "Dewan Nabil", "Nabil", "Industrial Engineer"
  description: 'Official portfolio of Dewan Hafiz Nabil (Dewan Nabil). Ph.D. researcher in Clean Energy Supply Chains at WMG, University of Warwick. Expert in Hydrogen Supply Chains, Nabil is dedicated to sustainable energy solutions.',

  // 5. SOCIALS (CRITICAL FOR KNOWLEDGE GRAPH)
  // Google uses these to verify you are a real person.
  // REPLACE these with your actual usernames (remove the 'your_' part).
  twitter: 'dewanhafiznabil1', 
  github: 'nabilDewan',           
  linkedin: 'dh-nabil',    

  // 6. IMAGES & PREVIEWS
  defaultPageIcon: null,
  defaultPageCover: null,
  defaultPageCoverPosition: 0.5,
  isPreviewImageSupportEnabled: true,
  isTweetEmbedSupportEnabled: true,
  isRedisEnabled: false, 

  // 7. NAVIGATION CONFIGURATION
  navigationStyle: 'custom',
  
  navigationLinks: [
    { 
      title: 'Home', 
      pageId: '7fa50bcefad34a29af1feae083c179f6' 
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