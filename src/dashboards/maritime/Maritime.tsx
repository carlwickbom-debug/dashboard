import type { DashboardSnapshot } from '../../data/models'
import { DashboardContent } from '../../components/dashboard/DashboardContent'
import { NordicMap } from '../../components/maps/NordicMap'
import { DashboardPanel } from '../../components/layout/DashboardLayout'

export function Maritime({ data }: { data: DashboardSnapshot }) {
  return <DashboardContent data={data} map={<NordicMap layers={data.mapLayers ?? []} />} details={<div className="detail-grid"><div><span>Vessel tracking</span><strong>84 active</strong></div><div><span>Port channel</span><strong>Restricted</strong></div><div><span>Safety mode</span><strong>Manual</strong></div><div><span>Beacon repair</span><strong>ETA 11:20</strong></div></div>}>
    <DashboardPanel title="Vessel route status" subtitle="Current route and safety classification"><div className="vessel-list">{[['V-204', 'Göteborg–Stockholm', 'restricted', 'CRITICAL'], ['V-118', 'Helsinki–Oslo', 'scheduled', 'LOW'], ['V-087', 'Trollhättan–København', 'scheduled', 'INFO']].map(([id, route, status, severity]) => <div key={id}><strong>{id}</strong><span>{route}</span><i className={status} /><b>{severity}</b></div>)}</div></DashboardPanel>
  </DashboardContent>
}
