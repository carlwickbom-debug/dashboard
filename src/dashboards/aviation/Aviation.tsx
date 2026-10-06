import type { DashboardSnapshot } from '../../data/models'
import { DashboardContent } from '../../components/dashboard/DashboardContent'
import { NordicMap } from '../../components/maps/NordicMap'
import { DashboardPanel } from '../../components/layout/DashboardLayout'

export function Aviation({ data }: { data: DashboardSnapshot }) {
  return <DashboardContent data={data} map={<NordicMap layers={data.mapLayers ?? []} />} details={<div className="detail-grid"><div><span>Aircraft in air</span><strong>147</strong></div><div><span>Weather cell</span><strong>Active</strong></div><div><span>Approach state</span><strong>Restricted</strong></div><div><span>ATC cadence</span><strong>2.4 sec</strong></div></div>}>
    <DashboardPanel title="Airport operations" subtitle="Movement and runway status"><div className="airport-list">{[['Oslo', 'Runway 10R', 'weather', 'HIGH'], ['Stockholm', 'Runway 01', 'operational', 'LOW'], ['Helsinki', 'Runway 15', 'operational', 'INFO']].map(([airport, runway, state, severity]) => <div key={airport}><strong>{airport}</strong><span>{runway}</span><i className={state} /><em>{state}</em><b>{severity}</b></div>)}</div></DashboardPanel>
  </DashboardContent>
}
