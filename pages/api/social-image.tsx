import ky from 'ky'
import { type NextApiRequest, type NextApiResponse } from 'next'
import { ImageResponse } from 'next/og'
import { type PageBlock } from 'notion-types'
import {
  getBlockIcon,
  getBlockTitle,
  getBlockValue,
  getPageImageUrls,
  getPageProperty,
  isUrl,
  parsePageId
} from 'notion-utils'

import * as libConfig from '@/lib/config'
import interSemiBoldFont from '@/lib/fonts/inter-semibold'
import { mapImageUrl } from '@/lib/map-image-url'
import { notion } from '@/lib/notion-api'
import { type NotionPageInfo, type PageError } from '@/lib/types'

export const runtime = 'nodejs'

export default async function OGImage(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { searchParams } = new URL(req.url!, libConfig.host)
  const pageId = parsePageId(
    searchParams.get('id') || libConfig.rootNotionPageId
  )
  if (!pageId) {
    return res.status(400).send('Invalid notion page id')
  }

  const pageInfoOrError = await getNotionPageInfo({ pageId })
  if (pageInfoOrError.type === 'error') {
    return res.status(pageInfoOrError.error.statusCode).send({
      error: pageInfoOrError.error.message
    })
  }
  const pageInfo = pageInfoOrError.data

  const imageResponse = new ImageResponse(
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#1F2027',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'black'
      }}
    >
      {pageInfo.image && (
        <img
          src={pageInfo.image}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      )}

      <div
        style={{
          position: 'relative',
          width: 900,
          height: 465,
          display: 'flex',
          flexDirection: 'column',
          border: '16px solid rgba(0,0,0,0.3)',
          borderRadius: 8,
          zIndex: '1'
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-around',
            backgroundColor: '#fff',
            padding: 24,
            alignItems: 'center',
            textAlign: 'center'
          }}
        >
          {pageInfo.detail && (
            <div style={{ fontSize: 32, opacity: 0 }}>{pageInfo.detail}</div>
          )}

          <div
            style={{
              fontSize: 70,
              fontWeight: 700,
              fontFamily: 'Inter'
            }}
          >
            {pageInfo.title}
          </div>

          {pageInfo.detail && (
            <div style={{ fontSize: 32, opacity: 0.6 }}>{pageInfo.detail}</div>
          )}
        </div>
      </div>

      {pageInfo.authorImage && (
        <div
          style={{
            position: 'absolute',
            top: 47,
            left: 104,
            height: 128,
            width: 128,
            display: 'flex',
            borderRadius: '50%',
            border: '4px solid #fff',
            zIndex: '5'
          }}
        >
          <img
            src={pageInfo.authorImage}
            style={{
              width: '100%',
              height: '100%'
            }}
          />
        </div>
      )}
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Inter',
          data: interSemiBoldFont,
          style: 'normal',
          weight: 700
        }
      ]
    }
  )

  res.setHeader('Content-Type', 'image/png')
  res.setHeader(
    'Cache-Control',
    'public, immutable, no-transform, max-age=31536000'
  )
  return res.status(200).send(Buffer.from(await imageResponse.arrayBuffer()))
}

export async function getNotionPageInfo({
  pageId
}: {
  pageId: string
}): Promise<
  | { type: 'success'; data: NotionPageInfo }
  | { type: 'error'; error: PageError }
> {
  const recordMap = await notion.getPage(pageId)

  const keys = Object.keys(recordMap?.block || {})
  const block = getBlockValue(recordMap?.block?.[keys[0]!])

  if (!block) {
    throw new Error('Invalid recordMap for page')
  }

  const blockSpaceId = block.space_id

  if (
    blockSpaceId &&
    libConfig.rootNotionSpaceId &&
    blockSpaceId !== libConfig.rootNotionSpaceId
  ) {
    return {
      type: 'error',
      error: {
        statusCode: 400,
        message: `Notion page "${pageId}" belongs to a different workspace.`
      }
    }
  }

  const isBlogPost =
    block.type === 'page' && block.parent_table === 'collection'
  const title = getBlockTitle(block, recordMap) || libConfig.name

  const imageCoverPosition =
    (block as PageBlock).format?.page_cover_position ??
    libConfig.defaultPageCoverPosition
  const imageObjectPosition = imageCoverPosition
    ? `center ${(1 - imageCoverPosition) * 100}%`
    : undefined

  const explicitSocialImage = getPageProperty<string>(
    'Social Image',
    block,
    recordMap
  )
  const pageCoverImage = (block as PageBlock).format?.page_cover
  
  // Custom logic to find the first actual image block in the content
  const contentImageUrls = getPageImageUrls(recordMap, { mapImageUrl })
  
  // Be more aggressive in finding a meaningful content image
  const firstContentImage = contentImageUrls.find(url => {
    if (!url) return false
    const lUrl = url.toLowerCase()
    // Exclude common small icons, avatars, and UI elements
    return !lUrl.includes('avatar') && 
           !lUrl.includes('icon') && 
           !lUrl.includes('logo') &&
           !lUrl.includes('profile')
  }) || contentImageUrls[0]

  const imageCandidates = [
    explicitSocialImage ? mapImageUrl(explicitSocialImage, block) : undefined,
    pageCoverImage ? mapImageUrl(pageCoverImage, block) : undefined,
    firstContentImage,
    mapImageUrl(libConfig.defaultPageCover, block)
  ]

  const blockIcon = getBlockIcon(block, recordMap)
  const authorImageBlockUrl = mapImageUrl(
    blockIcon && isUrl(blockIcon) ? blockIcon : undefined,
    block
  )
  const authorImageFallbackUrl = mapImageUrl(libConfig.defaultPageIcon, block)
  const [authorImage, image] = await Promise.all([
    getCompatibleImageUrl([authorImageBlockUrl, authorImageFallbackUrl]),
    getCompatibleImageUrl(imageCandidates)
  ])

  const author =
    getPageProperty<string>('Author', block, recordMap) || libConfig.author

  const publishedTime = getPageProperty<number>('Published', block, recordMap)
  const datePublished = publishedTime ? new Date(publishedTime) : undefined
  const date =
    isBlogPost && datePublished
      ? `${datePublished.toLocaleString('en-US', {
          month: 'long'
        })} ${datePublished.getFullYear()}`
      : undefined
  // For blog posts, we want to prioritize the date or specific detail, 
  // and NOT show the generic site bio if possible.
  const detail = date || (isBlogPost ? author : (author || libConfig.domain))

  const pageInfo: NotionPageInfo = {
    pageId,
    title,
    image,
    imageObjectPosition,
    author,
    authorImage,
    detail
  }

  return {
    type: 'success',
    data: pageInfo
  }
}

async function isUrlReachable(
  url: string | undefined | null
): Promise<boolean> {
  if (!url) {
    return false
  }

  try {
    await ky.head(url)
    return true
  } catch {
    return false
  }
}

async function getCompatibleImageUrl(
  candidates: Array<string | undefined | null>
): Promise<string | undefined> {
  const image = await getFirstReachableUrl(candidates)

  if (image) {
    const imageUrl = new URL(image)

    if (imageUrl.host === 'images.unsplash.com') {
      if (!imageUrl.searchParams.has('w')) {
        imageUrl.searchParams.set('w', '1200')
        imageUrl.searchParams.set('fit', 'max')
        return imageUrl.toString()
      }
    }
  }

  return image ?? undefined
}

async function getFirstReachableUrl(
  candidates: Array<string | undefined | null>
): Promise<string | undefined> {
  for (const candidate of candidates) {
    if (await isUrlReachable(candidate)) {
      return candidate ?? undefined
    }
  }

  return undefined
}
