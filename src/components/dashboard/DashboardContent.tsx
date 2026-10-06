import type { DashboardSnapshot } from '../../data/models'
import { DashboardGrid, DashboardPanel } from '../layout/DashboardLayout'
import { MetricGrid } from '../cards/MetricGrid'
import { EventPanel } from '../events/EventPanel'
import { DataFreshnessIndicator } from '../status/DataFreshnessIndicator'
import { StatusIndicator } from '../status/StatusIndicator'
import { HealthIndicator } from '../status/SeverityBadge'

export function DashboardContent({ data, children, map, details }: { data: DashboardSnapshot; children?: React.ReactNode; map?: React.ReactNode; details?: React.ReactNode }) {
  return (
    <>
      <section className="overview-strip"><div><StatusIndicator status={data.status} label={data.headline} description={data.summary} /><p>{data.summary}</p></div><div className="overview-strip-meta"><HealthIndicator health={data.health} /><DataFreshnessIndicator updatedAt={data.updatedAt} freshness={data.freshness} /></div></section>
      <DashboardGrid><MetricGrid metrics={data.metrics} status={data.status} /></DashboardGrid>
      <DashboardGrid>
        {map && <DashboardPanel title="Operational map" subtitle="Live regional positioning and severity layers">{map}</DashboardPanel>}
        <EventPanel events={data.events} />
      </DashboardGrid>
      {children && <DashboardGrid>{children}</DashboardGrid>}
      {details && <DashboardPanel title="Detailed information" subtitle="Current operating parameters and source data">{details}</DashboardPanel>}
      <footer className="data-footer"><span>DATA SOURCE: {data.source.toUpperCase()}</span><span>FRESHNESS: {data.freshness}</span><span>LAST VERIFIED: {data.updatedAt}</span></footer>
    </>
  )
}
