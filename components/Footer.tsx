import * as React from 'react'

import * as config from '@/lib/config'
import { GitHubIcon } from '@/lib/icons/github'
import { LinkedInIcon } from '@/lib/icons/linkedin'
import { TwitterIcon } from '@/lib/icons/twitter'

import styles from './styles.module.css'

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
        {config.twitter && (
          <a
            href={`https://x.com/${config.twitter}`}
            title={`X @${config.twitter}`}
            target='_blank'
            rel='noopener noreferrer'
            className={styles.footerSocialButton}
          >
            <TwitterIcon />
          </a>
        )}
        {config.github && (
          <a
            href={`https://github.com/${config.github}`}
            title={`GitHub @${config.github}`}
            target='_blank'
            rel='noopener noreferrer'
            className={styles.footerSocialButton}
          >
            <GitHubIcon />
          </a>
        )}
        {config.linkedin && (
          <a
            href={`https://www.linkedin.com/in/${config.linkedin}`}
            title={`LinkedIn ${config.author}`}
            target='_blank'
            rel='noopener noreferrer'
            className={styles.footerSocialButton}
          >
            <LinkedInIcon />
          </a>
        )}
      </div>

      <div className={styles.copyright}>
        Copyright © {currentYear} | {config.author} | All rights reserved.
      </div>
    </footer>
  )
}

export const Footer = React.memo(FooterImpl)
