import type { DashboardSnapshot } from '../../data/models'
import { DashboardContent } from '../../components/dashboard/DashboardContent'
import { NordicMap } from '../../components/maps/NordicMap'
import { DashboardPanel } from '../../components/layout/DashboardLayout'

export function DataCenters({ data }: { data: DashboardSnapshot }) {
  return <DashboardContent data={data} map={<NordicMap layers={data.mapLayers ?? []} />} details={<div className="detail-grid"><div><span>Active facilities</span><strong>14 / 14</strong></div><div><span>Cooling variance</span><strong>+12%</strong></div><div><span>Power capacity</span><strong>81.6 MW</strong></div><div><span>Maintenance</span><strong>Scheduled</strong></div></div>}>
    <DashboardPanel title="Facility capacity" subtitle="Power and cooling utilization"><div className="facility-grid">{[['OSL-04', 'Cooling', 82, 'warning'], ['STH-02', 'Power', 72, 'ok'], ['HEL-01', 'Network', 58, 'ok']].map(([id, type, value, tone]) => <div key={id as string}><span>{id}</span><strong>{type}</strong><div><i style={{ width: `${value}%` }} className={tone as string} /></div><small>{value}%</small></div>)}</div></DashboardPanel>
  </DashboardContent>
}
