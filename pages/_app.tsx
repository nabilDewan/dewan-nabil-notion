// pages/_app.tsx
import 'katex/dist/katex.min.css'
import 'prismjs/themes/prism-coy.css'
import 'react-notion-x/src/styles.css'
import 'styles/global.css'
import 'styles/notion.css'
import 'styles/prism-theme.css'

import type { AppProps } from 'next/app'
import * as Fathom from 'fathom-client'
import { useRouter } from 'next/router'
import { posthog } from 'posthog-js'
import * as React from 'react'

import { bootstrap } from '@/lib/bootstrap-client'
import {
  fathomConfig,
  fathomId,
  isServer,
  posthogConfig,
  posthogId
} from '@/lib/config'

import Footer from '@/components/Footer' 

if (!isServer) {
  bootstrap()
}

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()

  React.useEffect(() => {
    function onRouteChangeComplete() {
      if (fathomId) {
        Fathom.trackPageview()
      }

      if (posthogId) {
        posthog.capture('$pageview')
      }
    }

    if (fathomId) {
      Fathom.load(fathomId, fathomConfig)
    }

    if (posthogId) {
      posthog.init(posthogId, posthogConfig)
    }

    router.events.on('routeChangeComplete', onRouteChangeComplete)

    return () => {
      router.events.off('routeChangeComplete', onRouteChangeComplete)
    }
  }, [router.events])

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      backgroundColor: 'var(--bg-color)' // Ensure background fills space
    }}>
      {/* FIX: Applied 800px constraint directly here.
        This forces the "body" content to behave like it did before.
      */}
      <main style={{ 
        flex: '1 0 auto', 
        width: '100%', 
        maxWidth: '800px', // The critical fix
        margin: '0 auto',  // Centers the 800px column
        position: 'relative',
        padding: '0 20px'  // Safe padding for mobile edges
      }}>
        <Component {...pageProps} />
      </main>
      <Footer />
    </div>
  )
}