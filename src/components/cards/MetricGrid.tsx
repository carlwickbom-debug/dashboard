import type { DashboardSnapshot } from '../../data/models'
import { MetricCard } from './MetricCard'

export function MetricGrid({ metrics, status }: { metrics: DashboardSnapshot['metrics']; status: DashboardSnapshot['status'] }) {
  return <div className="metric-grid">{metrics.map((metric) => <MetricCard key={metric.label} {...metric} accent={status === 'CRITICAL' ? 'critical' : status === 'WARNING' ? 'warning' : 'ok'} />)}</div>
}
