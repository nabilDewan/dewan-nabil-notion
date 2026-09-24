import cs from 'classnames'
import * as React from 'react'
import { useNotionContext } from 'react-notion-x'

import {
  type ArticleMeta,
  blogIndexPageId,
  formatArticleDate
} from '@/lib/blog'
import * as config from '@/lib/config'

import styles from './BlogArticle.module.css'

const aboutPageId = config.navigationLinks?.find(
  (link) => link && /about/i.test(link.title)
)?.pageId

// photo shown next to the author's name at the top and bottom of each post
const authorImage = config.defaultPageIcon

function Avatar({ size }: { size: number }) {
  if (!authorImage) return null

  return (
    <img
      className={styles.avatar}
      src={authorImage}
      alt={config.author}
      width={size}
      height={size}
      loading='lazy'
    />
  )
}

function BackToBlog({ className }: { className?: string }) {
  const { components, mapPageUrl } = useNotionContext()
  if (!blogIndexPageId) return null

  return (
    <components.PageLink
      href={mapPageUrl(blogIndexPageId)}
      className={cs(styles.backLink, className)}
    >
      <span aria-hidden='true'>←</span> All articles
    </components.PageLink>
  )
}

export function ArticleHeader({
  title,
  meta
}: {
  title: string
  meta: ArticleMeta
}) {
  return (
    <header className={styles.header}>
      <BackToBlog className={styles.headerBackLink} />

      <h1 className={styles.title}>{title}</h1>

      {meta.tags.length > 0 && (
        <ul className={styles.tags} aria-label='Topics'>
          {meta.tags.slice(0, 3).map((tag) => (
            <li key={tag} className={styles.tag}>
              {tag}
            </li>
          ))}
        </ul>
      )}

      {meta.description && <p className={styles.dek}>{meta.description}</p>}

      <div className={styles.byline}>
        <Avatar size={44} />
        <div className={styles.bylineText}>
          <span className={styles.author}>{meta.author}</span>
          <span className={styles.metaLine}>
            {meta.publishedTime && (
              <time dateTime={new Date(meta.publishedTime).toISOString()}>
                {formatArticleDate(meta.publishedTime)}
              </time>
            )}
            {meta.publishedTime && <span aria-hidden='true'> · </span>}
            <span>{meta.readingMinutes} min read</span>
          </span>
        </div>
      </div>
    </header>
  )
}

function ShareLinks({ title, url }: { title: string; url?: string }) {
  const [copied, setCopied] = React.useState(false)
  const [shareUrl, setShareUrl] = React.useState(url)

  React.useEffect(() => {
    if (!url) setShareUrl(window.location.href)
  }, [url])

  const onCopy = React.useCallback(async () => {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard may be unavailable (e.g. insecure context); ignore
    }
  }, [shareUrl])

  const encodedUrl = encodeURIComponent(shareUrl ?? '')
  const encodedTitle = encodeURIComponent(title)

  const links = [
    {
      label: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
    },
    {
      label: 'X',
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}${
        config.twitter ? `&via=${config.twitter}` : ''
      }`
    },
    {
      label: 'Email',
      href: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`
    }
  ]

  return (
    <div className={styles.share}>
      <span className={styles.shareLabel}>Share</span>
      <div className={styles.shareButtons}>
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className={styles.shareButton}
            target='_blank'
            rel='noopener noreferrer'
          >
            {link.label}
          </a>
        ))}
        <button type='button' className={styles.shareButton} onClick={onCopy}>
          {copied ? 'Copied ✓' : 'Copy link'}
        </button>
      </div>
    </div>
  )
}

export function ArticleFooter({ title, url }: { title: string; url?: string }) {
  const { components, mapPageUrl } = useNotionContext()

  return (
    <footer className={styles.articleFooter}>
      <ShareLinks title={title} url={url} />

      <aside className={styles.authorCard}>
        <Avatar size={64} />
        <div>
          <span className={styles.authorCardKicker}>Written by</span>
          <span className={styles.authorCardName}>{config.author}</span>
          <p className={styles.authorCardBio}>{config.description}</p>
          {aboutPageId && (
            <components.PageLink
              href={mapPageUrl(aboutPageId)}
              className={styles.authorCardLink}
            >
              More about me →
            </components.PageLink>
          )}
        </div>
      </aside>

      <BackToBlog className={styles.footerBackLink} />
    </footer>
  )
}

export function ReadingProgress() {
  const barRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    let frame = 0

    const update = () => {
      frame = 0
      const el = document.documentElement
      const max = el.scrollHeight - el.clientHeight
      const progress = max > 0 ? Math.min(1, el.scrollTop / max) : 0
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${progress})`
      }
    }

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <div className={styles.progress} aria-hidden='true'>
      <div ref={barRef} className={styles.progressBar} />
    </div>
  )
}
