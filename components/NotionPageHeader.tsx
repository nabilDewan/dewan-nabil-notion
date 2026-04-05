import type * as types from 'notion-types'
import cs from 'classnames'
import * as React from 'react'
import { Breadcrumbs, Header, Search, useNotionContext } from 'react-notion-x'

import { isSearchEnabled, navigationLinks, navigationStyle } from '@/lib/config'
import { MoonIcon } from '@/lib/icons/moon'
import { SunIcon } from '@/lib/icons/sun'
import { useDarkMode } from '@/lib/use-dark-mode'

import styles from './styles.module.css'

function ToggleThemeButton() {
  const [hasMounted, setHasMounted] = React.useState(false)
  const { isDarkMode, toggleDarkMode } = useDarkMode()

  React.useEffect(() => {
    setHasMounted(true)
  }, [])

  const onToggleTheme = React.useCallback(() => {
    toggleDarkMode()
  }, [toggleDarkMode])

  return (
    <div
      className={cs('breadcrumb', 'button', !hasMounted && styles.hidden)}
      onClick={onToggleTheme}
    >
      {hasMounted && isDarkMode ? <MoonIcon /> : <SunIcon />}
    </div>
  )
}

export function NotionPageHeader({
  block
}: {
  block: types.CollectionViewPageBlock | types.PageBlock
}) {
  const { components, mapPageUrl } = useNotionContext()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  if (navigationStyle === 'default') {
    return <Header block={block} />
  }

  const navItems = navigationLinks?.filter(
    (link): link is NonNullable<typeof link> => !!link && (!!link.pageId || !!link.url)
  ) ?? []

  return (
    <header className={styles.customHeader}>
      <div className={styles.customNavHeader}>
        <div className={styles.navDesktop}>
          <nav className={cs(styles.customNavRhs, 'breadcrumbs')} aria-label='Primary navigation'>
            {navItems.map((link, index) => {
              if (link?.pageId) {
                return (
                  <components.PageLink
                    href={mapPageUrl(link.pageId)}
                    key={index}
                    className={cs(styles.navLink, 'breadcrumb', 'button')}
                  >
                    {link.title}
                  </components.PageLink>
                )
              }

              return (
                <components.Link
                  href={link.url}
                  key={index}
                  className={cs(styles.navLink, 'breadcrumb', 'button')}
                >
                  {link.title}
                </components.Link>
              )
            })}

            <ToggleThemeButton />

            {isSearchEnabled && <Search block={block} title={null} />}
          </nav>
        </div>

        <div className={styles.navMobile}>
          <button
            type='button'
            className={styles.mobileNavToggle}
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-expanded={isMobileMenuOpen}
          >
            Menu {isMobileMenuOpen ? '▲' : '▼'}
          </button>

          {isMobileMenuOpen && (
            <nav className={styles.mobileNavDropdown} aria-label='Mobile navigation'>
              {navItems.map((link, index) => {
                if (link?.pageId) {
                  return (
                    <components.PageLink
                      href={mapPageUrl(link.pageId)}
                      key={index}
                      className={cs(styles.navLink, 'breadcrumb', 'button', styles.mobileNavLink)}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.title}
                    </components.PageLink>
                  )
                }

                return (
                  <components.Link
                    href={link.url}
                    key={index}
                    className={cs(styles.navLink, 'breadcrumb', 'button', styles.mobileNavLink)}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.title}
                  </components.Link>
                )
              })}

              {isSearchEnabled && <Search block={block} title={null} />}
            </nav>
          )}
        </div>
      </div>
    </header>
  )
}
