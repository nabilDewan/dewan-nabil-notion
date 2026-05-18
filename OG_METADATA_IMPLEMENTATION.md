# Dynamic Open Graph Metadata Implementation Guide

## Overview

This document outlines the improvements made to your Next.js Notion starter kit to enable dynamic, content-specific Open Graph (OG) metadata for social media sharing. Instead of always showing the same generic bio text, each page/blog post now displays relevant images and descriptions extracted from the content.

## What Has Been Implemented

### 1. **Enhanced Content Extraction** (`lib/seo.ts`)

**Improvements:**
- **Priority-based block extraction**: The system now prioritizes meaningful content blocks in order of importance:
  - Quotes (priority 5)
  - Callouts (priority 4)
  - Sub-headers (priority 3)
  - Headers (priority 2)
  - Regular text (priority 1)

- **Smarter filtering**: Automatically skips common UI text like "Table of Contents", "Related Posts", "Subscribe", etc.

- **Better description generation**: For blog posts, if no explicit description is found, the system extracts the most relevant content snippet instead of falling back to the generic site bio.

**Code Location**: `lib/seo.ts` - `extractPageText()` function

### 2. **Improved Image Selection** (`pages/api/social-image.tsx`)

**Improvements:**
- **Better filtering**: Excludes more UI elements (favicons, badges, profile pictures) to find truly meaningful images
- **Smart prioritization**: 
  1. Explicit "Social Image" property (if set in Notion)
  2. Page cover image
  3. First meaningful content image (filtered)
  4. Default fallback image

- **Category/Topic support**: Now checks for "Category" or "Topic" properties in Notion to display in the OG image

**Code Location**: `pages/api/social-image.tsx` - `getNotionPageInfo()` function

### 3. **Improved Cache Busting** (`components/PageHead.tsx`)

**Improvements:**
- Changed from timestamp-based cache busting to **date-based cache busting**
- Cache buster changes once per day, preventing excessive cache invalidation
- Social media platforms can still refresh previews when needed
- More reliable for social media crawlers

**Code Location**: `components/PageHead.tsx` - Cache buster logic

### 4. **New Type Support** (`lib/types.ts`)

Added `excerpt` field to `NotionPageInfo` interface for future extensibility.

## How to Use

### For Blog Posts and Content Pages

The system automatically extracts relevant information. However, you can optimize results by:

#### Option 1: Set Explicit Notion Properties

In your Notion database, add these optional properties to any page/blog post:

| Property | Type | Purpose | Example |
|----------|------|---------|---------|
| **Social Image** | URL/File | Override the OG image | Link to a high-quality image |
| **Description** | Text | Override the OG description | "Learn how to optimize supply chains" |
| **Category** | Select/Text | Shown in OG image detail | "Energy", "Technology", "Research" |
| **Topic** | Select/Text | Alternative to Category | "Geopolitics", "Sustainability" |

#### Option 2: Rely on Automatic Extraction

If you don't set explicit properties, the system will:
1. Use the page cover as the OG image
2. Extract the first meaningful content block (quote, callout, or text) as the description
3. Display the publication date (for blog posts) or category (if available) in the image

### Example Notion Setup

For a blog post titled "Energy Supply Chains Under Geopolitical Pressure":

```
Title: Energy Supply Chains Under Geopolitical Pressure
Published: [Date field]
Category: Energy
Social Image: [Link to diagram or hero image]
Description: Explore how geopolitical tensions impact energy supply chains and the UK's strategic position
```

When this blog is shared on social media, it will display:
- **OG Image**: The Social Image (or page cover if not set)
- **OG Title**: "Energy Supply Chains Under Geopolitical Pressure"
- **OG Description**: The custom description (or extracted from first content block)
- **Detail in Image**: "Energy" (category) or publication date

## Technical Details

### Cache Control

The API endpoint uses aggressive caching:
```
Cache-Control: public, immutable, no-transform, max-age=31536000
```

This means:
- Images are cached for 1 year
- Cache busting happens via the `v` query parameter (changes daily)
- Social media crawlers will refresh previews daily if needed

### Image Generation

OG images are generated dynamically using **Next.js Image Response API** (Edge Runtime compatible):
- Dimensions: 1200x630px (standard for social media)
- Includes page title, detail text, and optional background image
- Author profile picture in top-left corner
- Fully responsive and optimized

### Description Extraction Logic

For blog posts:
1. Check for explicit "Description" property in Notion
2. Extract first high-priority block (quote/callout)
3. Fall back to first text block
4. **Never** use generic site bio (prevents the issue you reported)

For regular pages:
1. Check for explicit "Description" property
2. Extract first meaningful content block
3. Fall back to site description (only for non-blog pages)

## Testing Your Implementation

### 1. Test with Facebook Sharing Debugger
- Go to [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/sharing/)
- Enter your blog URL
- Click "Scrape Again" to refresh
- Verify the correct image and description appear

### 2. Test with Twitter Card Validator
- Go to [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- Enter your blog URL
- Verify the card displays correctly

### 3. Test Locally
```bash
npm run dev
# Visit http://localhost:3000/[page-id]
# Check browser DevTools > Network for /api/social-image requests
```

## Best Practices

### 1. **Always Set a Page Cover**
- Use a high-quality, relevant image (1200x630px or larger)
- This becomes the default OG image if no "Social Image" is set

### 2. **Write Good First Paragraphs**
- The first meaningful text block is extracted for the description
- Make it compelling and descriptive (160 characters ideal)

### 3. **Use Categories**
- Set the "Category" property for better context in OG images
- Examples: "Research", "Technology", "Sustainability"

### 4. **For Important Posts, Set Explicit Properties**
- Use "Social Image" for a custom, optimized image
- Use "Description" for a carefully crafted preview text

### 5. **Monitor Social Media Previews**
- Periodically test your pages with social media debuggers
- Adjust Notion properties as needed

## Troubleshooting

### Issue: Generic Bio Still Appearing

**Solution**: 
- Ensure the page is a blog post (database item with `parent_table === 'collection'`)
- Or set an explicit "Description" property
- Clear social media cache using their debugger tools

### Issue: Wrong Image Showing

**Solution**:
- Set an explicit "Social Image" property in Notion
- Or ensure the page cover is set correctly
- Check that the image URL is publicly accessible

### Issue: Cache Not Updating

**Solution**:
- Use social media debugger to force refresh
- The cache buster changes daily, so wait until tomorrow
- Or manually set a new "Social Image" to trigger an update

## File Changes Summary

| File | Changes |
|------|---------|
| `lib/seo.ts` | Enhanced `extractPageText()` with priority-based extraction |
| `pages/api/social-image.tsx` | Improved image filtering, added Category support, added excerpt extraction |
| `components/PageHead.tsx` | Changed to date-based cache busting |
| `lib/types.ts` | Added `excerpt` field to `NotionPageInfo` |

## Future Enhancements

Potential improvements for future versions:
1. **AI-powered description generation**: Use an LLM to generate better descriptions
2. **Image optimization**: Automatically crop/resize images for better OG cards
3. **A/B testing**: Track which OG variations get more clicks
4. **Custom OG templates**: Allow different designs for different content types
5. **Analytics integration**: Track social media shares and clicks

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the code comments in modified files
3. Test with social media debugger tools
4. Check your Notion page properties are set correctly

---

**Last Updated**: May 2026
**Next.js Version**: 16.2.0+
**Notion Starter Kit Version**: 2.0.0+
