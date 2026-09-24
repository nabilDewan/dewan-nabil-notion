import * as React from 'react'

import {
  type ScholarMetrics as Metrics,
  scholarProfileUrl
} from '@/lib/scholar'

import styles from './ScholarMetrics.module.css'

const numberFormat = new Intl.NumberFormat('en-GB')

/**
 * Citation metrics from Google Scholar, loaded from a CDN-cached API route so
 * the page itself never waits on (or breaks because of) Google Scholar.
 * Renders nothing if no metrics are available.
 */
export function ScholarMetrics() {
  const [metrics, setMetrics] = React.useState<Metrics | null>(null)

  React.useEffect(() => {
    const controller = new AbortController()

    fetch('/api/scholar-metrics', { signal: controller.signal })
      .then((res) =>
        res.ok ? (res.json() as Promise<{ metrics: Metrics | null }>) : null
      )
      .then((data) => {
        if (data?.metrics) setMetrics(data.metrics)
      })
      .catch(() => {
        // metrics are optional; leave them hidden
      })

    return () => controller.abort()
  }, [])

  if (!metrics) return null

  const items = [
    { label: 'Citations', value: metrics.citations },
    { label: 'h-index', value: metrics.hIndex },
    { label: 'i10-index', value: metrics.i10Index }
  ]

  return (
    <section className={styles.metrics} aria-label='Google Scholar metrics'>
      <dl className={styles.list}>
        {items.map((item) => (
          <div key={item.label} className={styles.item}>
            <dt className={styles.label}>{item.label}</dt>
            <dd className={styles.value}>{numberFormat.format(item.value)}</dd>
          </div>
        ))}
      </dl>

      <a
        className={styles.source}
        href={scholarProfileUrl}
        target='_blank'
        rel='noopener noreferrer'
      >
        Google Scholar ↗
      </a>
    </section>
  )
}
