import type { DashboardSnapshot } from '../../data/models'
import { DashboardContent } from '../../components/dashboard/DashboardContent'
import { NordicMap } from '../../components/maps/NordicMap'
import { DashboardPanel } from '../../components/layout/DashboardLayout'

export function Networks({ data }: { data: DashboardSnapshot }) {
  return <DashboardContent data={data} map={<NordicMap layers={data.mapLayers ?? []} />} details={<div className="detail-grid"><div><span>Traffic volume</span><strong>12.4 Tbps</strong></div><div><span>Packet loss</span><strong>0.03%</strong></div><div><span>DNS response</span><strong>17 ms</strong></div><div><span>Routing policy</span><strong>Primary</strong></div></div>}>
    <DashboardPanel title="Edge performance" subtitle="Regional latency and route health"><div className="network-list">{[['E-07', 'Helsinki', '84 ms', 'MEDIUM'], ['E-12', 'Stockholm', '42 ms', 'INFO'], ['E-19', 'Oslo', '51 ms', 'LOW']].map(([id, region, latency, severity]) => <div key={id}><strong>{id}</strong><span>{region}</span><em>{latency}</em><b>{severity}</b></div>)}</div></DashboardPanel>
  </DashboardContent>
}
