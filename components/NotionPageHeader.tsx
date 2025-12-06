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
    setIsMenuOpen(!isMenuOpen)
  }

  // Renders the links. 'isMobile' adds specific classes for styling.
  const renderLinks = (isMobile: boolean) => {
    return navigationLinks
      ?.map((link, index) => {
        if (!link?.pageId && !link?.url) return null

        if (link.pageId) {
          return (
            <components.PageLink
              href={mapPageUrl(link.pageId)}
              key={index}
              className={cs(
                styles.navLink, 
                'breadcrumb', 
                'button', 
                isMobile ? 'mobile-link-item' : 'desktop-link-item'
              )}
              onClick={isMobile ? () => setIsMenuOpen(false) : undefined}
            >
              {link.title}
            </components.PageLink>
          )
        } else {
          return (
            <components.Link
              href={link.url}
              key={index}
              className={cs(
                styles.navLink, 
                'breadcrumb', 
                'button', 
                isMobile ? 'mobile-link-item' : 'desktop-link-item'
              )}
              onClick={isMobile ? () => setIsMenuOpen(false) : undefined}
            >
              {link.title}
            </components.Link>
          )
        }
      })
      .filter(Boolean)
  }

  return (
    <header className='notion-header'>
      <div className='notion-nav-header'>
        {/* LEFT: Logo / Breadcrumbs */}
        <div className="nav-left">
          <Breadcrumbs block={block} rootOnly={true} />
        </div>

        {/* RIGHT: Desktop Menu (HIDDEN ON MOBILE) */}
        <div className='nav-right-desktop'>
          {renderLinks(false)}
          <ToggleThemeButton />
          {isSearchEnabled && <Search block={block} title={null} />}
        </div>

        {/* RIGHT: Mobile Toggle Button (VISIBLE ONLY ON MOBILE) */}
        <div 
          className='nav-mobile-toggle' 
          onClick={toggleMenu}
        >
          {isMenuOpen ? <IoClose /> : <IoMenu />}
        </div>
      </div>

      {/* MOBILE OVERLAY (ABSOLUTE POSITIONED) */}
      {isMenuOpen && (
        <div className='nav-mobile-overlay'>
          <div className="mobile-links-wrapper">
            {renderLinks(true)}
          </div>
          <div className="mobile-utils">
            <ToggleThemeButton />
          </div>
        </div>
      )}
    </header>
  )
}