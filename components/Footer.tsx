import * as React from 'react'
import { useNotionContext } from 'react-notion-x'

import * as config from '@/lib/config'

import styles from './styles.module.css'

function ScholarIcon() {
  return (
    <svg viewBox='0 0 24 24' aria-hidden='true' fill='currentColor'>
      <path d='M5.242 13.769L0 9.5 12 0l12 9.5-5.242 4.269C17.548 11.249 14.978 9.5 12 9.5c-2.977 0-5.548 1.748-6.758 4.269zM12 10a7 7 0 1 0 0 14 7 7 0 0 0 0-14z' />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg viewBox='0 0 24 24' aria-hidden='true' fill='currentColor'>
      <path d='M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z' />
    </svg>
  )
}

function ResearchGateIcon() {
  return (
    <svg viewBox='0 0 24 24' aria-hidden='true'>
      <rect width='24' height='24' rx='5' fill='currentColor' />
      <text
        x='12'
        y='16.4'
        textAnchor='middle'
        fontSize='11'
        fontWeight='700'
        fontFamily='Arial, Helvetica, sans-serif'
        fill='#fff'
      >
        RG
      </text>
    </svg>
  )
}

const socialLinks = [
  {
    title: 'Google Scholar',
    href: 'https://scholar.google.com/citations?user=gJ4XFLAAAAAJ&hl=en',
    brand: 'scholar',
    icon: <ScholarIcon />
  },
  {
    title: 'LinkedIn',
    href: 'https://www.linkedin.com/in/dh-nabil/',
    brand: 'linkedin',
    icon: <LinkedInIcon />
  },
  {
    title: 'ResearchGate',
    href: 'https://www.researchgate.net/profile/Dewan-Nabil',
    brand: 'researchgate',
    icon: <ResearchGateIcon />
  }
]

export function FooterImpl() {
  const currentYear = new Date().getFullYear()
  const { components, mapPageUrl } = useNotionContext()

  return (
    <footer className={styles.footer}>
      <div className={styles.footerNav}>
        {(config.navigationLinks || []).filter(Boolean).map((link) => {
          if (link?.pageId) {
            return (
              <components.PageLink
                key={link.title}
                href={mapPageUrl(link.pageId)}
                className={styles.footerLink}
              >
                {link.title}
              </components.PageLink>
            )
          }

          return (
            <a
              key={link!.title}
              href={link!.url ?? '#'}
              className={styles.footerLink}
            >
              {link!.title}
            </a>
          )
        })}
      </div>

      <div className={styles.footerSocialNav}>
        {socialLinks.map((link) => (
          <a
            key={link.title}
            href={link.href}
            title={link.title}
            target='_blank'
            rel='noopener noreferrer'
            className={styles.footerSocialButton}
            data-brand={link.brand}
          >
            {link.icon}
            <span>{link.title}</span>
          </a>
        ))}
      </div>

      <div className={styles.copyright}>
        Copyright © {currentYear} | {config.author} | All rights reserved.
      </div>
    </footer>
  )
}

export const Footer = React.memo(FooterImpl)
