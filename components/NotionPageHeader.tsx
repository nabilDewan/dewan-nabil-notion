import * as React from 'react'
import cs from 'classnames'
import { Breadcrumbs, Search, useNotionContext } from 'react-notion-x'
import { IoMoonSharp } from '@react-icons/all-files/io5/IoMoonSharp'
import { IoSunnyOutline } from '@react-icons/all-files/io5/IoSunnyOutline'
import { IoMenu } from '@react-icons/all-files/io5/IoMenu'
import { IoClose } from '@react-icons/all-files/io5/IoClose'

import { navigationLinks, isSearchEnabled } from '@/lib/config'
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
      {hasMounted && isDarkMode ? <IoMoonSharp /> : <IoSunnyOutline />}
    </div>
  )
}

export function NotionPageHeader({ block }: { block: any }) {
  const { components, mapPageUrl } = useNotionContext()
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)

  const toggleMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <header className='notion-header'>
      <div className='notion-nav-header'>
        <Breadcrumbs block={block} rootOnly={true} />

        <div 
          className='notion-nav-mobile-menu-button' 
          onClick={toggleMenu}
          role="button"
        >
          {isMenuOpen ? <IoClose /> : <IoMenu />}
        </div>

        <div
          className={cs(
            'notion-nav-header-rhs',
            'breadcrumbs',
            isMenuOpen ? 'notion-nav-mobile-open' : ''
          )}
        >
          {navigationLinks
            ?.map((link, index) => {
              if (!link?.pageId && !link?.url) return null

              if (link.pageId) {
                return (
                  <components.PageLink
                    href={mapPageUrl(link.pageId)}
                    key={index}
                    className={cs(styles.navLink, 'breadcrumb', 'button')}
                    onClick={closeMenu}
                  >
                    {link.title}
                  </components.PageLink>
                )
              } else {
                return (
                  <components.Link
                    href={link.url}
                    key={index}
                    className={cs(styles.navLink, 'breadcrumb', 'button')}
                    onClick={closeMenu}
                  >
                    {link.title}
                  </components.Link>
                )
              }
            })
            .filter(Boolean)}

          <ToggleThemeButton />

          {isSearchEnabled && <Search block={block} title={null} />}
        </div>
      </div>
    </header>
  )
}