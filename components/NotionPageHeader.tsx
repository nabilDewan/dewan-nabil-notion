import * as React from 'react'
import cs from 'classnames'
import { Breadcrumbs, Search, useNotionContext } from 'react-notion-x'
import { IoMoonSharp } from '@react-icons/all-files/io5/IoMoonSharp'
import { IoSunnyOutline } from '@react-icons/all-files/io5/IoSunnyOutline'
import { IoChevronForward } from '@react-icons/all-files/io5/IoChevronForward'

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
  
  // Reference to the scroll container
  const scrollRef = React.useRef<HTMLDivElement>(null)

  // SMART SCROLL LOGIC: Loop back to start if at end
  const handleScrollRight = () => {
    const container = scrollRef.current
    if (container) {
      const { scrollLeft, scrollWidth, clientWidth } = container
      
      // Check if we are near the end (within 10px tolerance)
      const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 10

      if (isAtEnd) {
        // Loop back to the first button
        container.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        // Scroll right normally
        container.scrollBy({ left: 150, behavior: 'smooth' })
      }
    }
  }

  // Render Links Helper
  const renderLinks = () => {
    return navigationLinks
      ?.map((link, index) => {
        if (!link?.pageId && !link?.url) return null

        if (link.pageId) {
          return (
            <components.PageLink
              href={mapPageUrl(link.pageId)}
              key={index}
              className={cs(styles.navLink, 'breadcrumb', 'button', 'nav-item')}
            >
              {link.title}
            </components.PageLink>
          )
        } else {
          return (
            <components.Link
              href={link.url}
              key={index}
              className={cs(styles.navLink, 'breadcrumb', 'button', 'nav-item')}
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
        {/* LEFT: Logo (Hidden on Mobile) */}
        <div className="nav-left">
          <Breadcrumbs block={block} rootOnly={true} />
        </div>

        {/* RIGHT: Scrollable Links */}
        <div className='nav-right-scrollable' ref={scrollRef}>
          {renderLinks()}
          <ToggleThemeButton />
          {isSearchEnabled && <Search block={block} title={null} />}
        </div>

        {/* CLICKABLE ARROW (Loops to start when at end) */}
        <div 
          className='nav-scroll-arrow' 
          onClick={handleScrollRight}
          role="button"
          tabIndex={0}
        >
          <IoChevronForward />
        </div>
      </div>
    </header>
  )
}