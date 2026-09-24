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
const authorImage = '/author.jpg'

function Avatar({ size }: { size: number }) {
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
      className: styles.linkedin,
      icon: <LinkedInIcon />,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
    },
    {
      label: 'X',
      className: styles.x,
      icon: <XIcon />,
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}${
        config.twitter ? `&via=${config.twitter}` : ''
      }`
    },
    {
      label: 'Email',
      className: styles.email,
      icon: <MailIcon />,
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
            className={cs(styles.shareButton, link.className)}
            target='_blank'
            rel='noopener noreferrer'
          >
            {link.icon}
            {link.label}
          </a>
        ))}
        <button
          type='button'
          className={cs(styles.shareButton, styles.copy)}
          onClick={onCopy}
        >
          <LinkIcon />
          {copied ? 'Copied' : 'Copy link'}
        </button>
      </div>
    </div>
  )
}

function LinkedInIcon() {
  return (
    <svg viewBox='0 0 24 24' aria-hidden='true' fill='currentColor'>
      <path d='M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z' />
    </svg>
  )
}

function XIcon() {
  return (
    <svg viewBox='0 0 24 24' aria-hidden='true' fill='currentColor'>
      <path d='M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.4l-5.8-7.58-6.63 7.58H.49l8.6-9.83L0 1.15h7.59l5.24 6.93 6.07-6.93zm-1.29 19.5h2.04L6.48 3.24H4.3l13.31 17.41z' />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg
      viewBox='0 0 24 24'
      aria-hidden='true'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <rect x='3' y='5' width='18' height='14' rx='2' />
      <path d='m3 7 9 6 9-6' />
    </svg>
  )
}

function LinkIcon() {
  return (
    <svg
      viewBox='0 0 24 24'
      aria-hidden='true'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path d='M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5' />
      <path d='M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5' />
    </svg>
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
