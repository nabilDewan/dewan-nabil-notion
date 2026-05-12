import { siteConfig } from './lib/site-config'

export default siteConfig({
  // the site's root Notion page (required)
  rootNotionPageId: '7fa50bcefad34a29af1feae083c179f6',

  // if you want to restrict pages to a single notion workspace (optional)
  // (this should be a Notion ID; see the docs for how to extract this)
  rootNotionSpaceId: null,

  // basic site info (required)
  name: 'Dewan Hafiz Nabil',
  domain: 'dewan-hafiz-nabil.com',
  author: 'Dewan Hafiz Nabil',

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
  ],

  // open graph metadata (optional)
  description:
    'Hi, This is Dewan Hafiz Nabil (often known as Dewan or Nabil). Industrial Engineer | Researcher | UKRI (EPSRC) Funded PhD Student. From ideas to impact, I explore solutions for a sustainable future.',

  // social usernames (optional)
  twitter: 'Dewan_Nabil',
  github: 'nabilDewan',
  linkedin: 'dewannabil',
  // mastodon: '#', // optional mastodon profile URL, provides link verification
  // newsletter: '#', // optional newsletter URL
  // youtube: '#', // optional youtube channel name or `channel/UCGbXXXXXXXXXXXXXXXXXXXXXX`

  // default notion icon and cover images for site-wide consistency (optional)
  // page-specific values will override these site-wide defaults
  defaultPageIcon:
    'https://www.notion.so/image/attachment%3A234a15bd-73b5-414b-9a73-ace2f756d42e%3A9131b1e0-e1a3-45ea-adf1-45501ef3f632.png?table=block&id=30445d8f-74b5-8024-8cc7-f5770dde5689&cache=v2',
  defaultPageCover: null,
  defaultPageCoverPosition: 0.5,

  // whether or not to enable support for LQIP preview images (optional)
  isPreviewImageSupportEnabled: true,

  // whether or not redis is enabled for caching generated preview images (optional)
  // NOTE: if you enable redis, you need to set the `REDIS_HOST` and `REDIS_PASSWORD`
  // environment variables. see the readme for more info
  isRedisEnabled: false,

  // map of notion page IDs to URL paths (optional)
  // any pages defined here will override their default URL paths
  // example:
  //
  // pageUrlOverrides: {
  //   '/foo': '067dd719a912471ea9a3ac10710e7fdf',
  //   '/bar': '0be6efce9daf42688f65c76b89f8eb27'
  // }
  pageUrlOverrides: null
})
