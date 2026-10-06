import type { DashboardSnapshot } from '../../data/models'
import { DashboardContent } from '../../components/dashboard/DashboardContent'
import { NordicMap } from '../../components/maps/NordicMap'
import { DashboardPanel } from '../../components/layout/DashboardLayout'

export function Traffic({ data }: { data: DashboardSnapshot }) {
  return <DashboardContent data={data} map={<NordicMap layers={data.mapLayers ?? []} />} details={<div className="detail-grid"><div><span>Average queue</span><strong>7 min</strong></div><div><span>Congestion window</span><strong>08:20–10:10</strong></div><div><span>Sensor coverage</span><strong>98.4%</strong></div><div><span>Incident state</span><strong>Contained</strong></div></div>}>
    <DashboardPanel title="Corridor flow" subtitle="Vehicle movement and delay by corridor"><div className="flow-chart">{[['E18', 49, 52], ['E4', 57, 28], ['E6', 61, 20]].map(([name, speed, flow]) => <div key={name as string}><span>{name}</span><div><i style={{ width: `${flow}%` }} /></div><strong>{speed} km/h</strong></div>)}</div></DashboardPanel>
  </DashboardContent>
}
