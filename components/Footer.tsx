import * as React from 'react'
import { useNotionContext } from 'react-notion-x'

import * as config from '@/lib/config'

import styles from './styles.module.css'

const socialLinks = [
  {
    title: 'Google Scholar',
    href: 'https://scholar.google.com/citations?user=gJ4XFLAAAAAJ&hl=en',
    label: 'Google Scholar'
  },
  {
    title: 'LinkedIn',
    href: 'https://www.linkedin.com/in/dh-nabil/',
    label: 'LinkedIn'
  },
  {
    title: 'ResearchGate',
    href: 'https://www.researchgate.net/profile/Dewan-Nabil',
    label: 'ResearchGate'
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
          >
            {link.label}
          </a>
        ))}
      </div>

      <div className={styles.copyright}>
        © {currentYear} {config.author}. All rights reserved.
      </div>
    </footer>
  )
}

export const Footer = React.memo(FooterImpl)
