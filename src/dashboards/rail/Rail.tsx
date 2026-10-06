import type { DashboardSnapshot } from '../../data/models'
import { DashboardContent } from '../../components/dashboard/DashboardContent'
import { NordicMap } from '../../components/maps/NordicMap'
import { DashboardPanel } from '../../components/layout/DashboardLayout'
import { SeverityBadge } from '../../components/status/SeverityBadge'

export function Rail({ data }: { data: DashboardSnapshot }) {
  return <DashboardContent data={data} map={<NordicMap layers={data.mapLayers ?? []} />} details={<div className="detail-grid"><div><span>Track availability</span><strong>96.1%</strong></div><div><span>Headway interval</span><strong>8 min</strong></div><div><span>Service mode</span><strong>Reduced</strong></div><div><span>Maintenance ID</span><strong>R-14</strong></div></div>}>
    <DashboardPanel title="Line service status" subtitle="Current operating intervals"><div className="service-list">{[['Main line', '8 min', 'CRITICAL'], ['Northern branch', '12 min', 'LOW'], ['Coastal line', '6 min', 'OK']].map(([line, interval, severity]) => <div key={line}><strong>{line}</strong><span>{interval}</span><SeverityBadge severity={severity as any} compact /></div>)}</div></DashboardPanel>
  </DashboardContent>
}
