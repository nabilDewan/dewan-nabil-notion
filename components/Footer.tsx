import * as React from 'react'

import * as config from '@/lib/config'
import styles from './styles.module.css'

const socialLinks = [
  {
    title: 'Google Scholar',
    href: 'https://scholar.google.com/citations?user=gJ4XFLAAAAAJ&hl=en',
    label: '🎓'
  },
  {
    title: 'LinkedIn',
    href: 'https://www.linkedin.com/in/dh-nabil/',
    label: 'in'
  },
  {
    title: 'ResearchGate',
    href: 'https://www.researchgate.net/profile/Dewan-Nabil',
    label: 'RG'
  }
]

export function FooterImpl() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={styles.footerNav}>
        {(config.navigationLinks || []).filter(Boolean).map((link) => (
          <a
            key={link!.title}
            href={link!.url ?? `/${link!.pageId}`}
            className={styles.footerLink}
          >
            {link!.title}
          </a>
        ))}
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
            <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>
              {link.label}
            </span>
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
