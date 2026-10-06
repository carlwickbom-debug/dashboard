import type { DashboardSnapshot } from '../../data/models'
import { DashboardContent } from '../../components/dashboard/DashboardContent'
import { NordicMap } from '../../components/maps/NordicMap'
import { DashboardPanel } from '../../components/layout/DashboardLayout'

export function Cyber({ data }: { data: DashboardSnapshot }) {
  return <DashboardContent data={data} map={<NordicMap layers={data.mapLayers ?? []} />} details={<div className="detail-grid"><div><span>Detection engine</span><strong>Online</strong></div><div><span>Identity controls</span><strong>Enforced</strong></div><div><span>Containment</span><strong>In progress</strong></div><div><span>Evidence chain</span><strong>Archived</strong></div></div>}>
    <DashboardPanel title="Security controls" subtitle="Current protection coverage"><div className="security-controls">{[['MFA', '99.2%', 'ok'], ['Endpoint', '98.7%', 'ok'], ['SIEM', '100%', 'ok'], ['Response', 'Ready', 'warning']].map(([name, value, tone]) => <div key={name}><span>{name}</span><strong>{value}</strong><i className={tone} /></div>)}</div></DashboardPanel>
  </DashboardContent>
}
