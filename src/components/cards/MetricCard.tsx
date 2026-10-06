export function MetricCard({ label, value, change, trend, detail, accent = 'info' }: { label: string; value: string; change?: string; trend?: 'up' | 'down' | 'steady'; detail: string; accent?: 'info' | 'ok' | 'warning' | 'critical' }) {
  return (
    <article className={`metric-card metric-${accent}`} aria-label={`${label}: ${value}`}>
      <span className="metric-label">{label}</span>
      <strong className="metric-value">{value}</strong>
      {change && <span className={`metric-change metric-change-${trend ?? 'steady'}`}>{change}</span>}
      <small>{detail}</small>
    </article>
  )
}
