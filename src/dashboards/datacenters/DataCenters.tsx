import { useMemo, useState } from 'react'
import { Building2, Cloud, Power, Server, ThermometerSun, Zap } from 'lucide-react'
import type { DashboardStatus, DataFreshness, MapLayer, MapPoint, OperationalEvent, Severity } from '../../data/models'
import { AlertBanner } from '../../components/events/AlertBanner'
import { EventList } from '../../components/events/EventRow'
import { DashboardGrid, DashboardPanel } from '../../components/layout/DashboardLayout'
import { NordicMap } from '../../components/maps/NordicMap'
import { DataFreshnessIndicator } from '../../components/status/DataFreshnessIndicator'
import { HealthIndicator, SeverityBadge } from '../../components/status/SeverityBadge'
import { StatusIndicator } from '../../components/status/StatusIndicator'

export type DataCenterStatus = 'OPERATIONAL' | 'DEGRADED' | 'PARTIAL OUTAGE' | 'MAJOR OUTAGE' | 'MAINTENANCE' | 'UNKNOWN'
export interface DataCenter {
  id: string; name: string; operator: string | null; country: string; city: string; latitude: number; longitude: number; tier: string | null
  powerCapacityMW: number | null; itLoadMW: number | null; coolingTechnology: string | null; pue: number | null; renewableEnergyPercentage: number | null
  networkConnectivity: string | null; cloudProviders: string[] | null; status: DataCenterStatus; availability: number | null; lastUpdated: string | null
}
export interface DataCenterIncident { id: string; title: string; location: string; severity: Severity; time: string; detail: string }
export interface DataCenterProviderHealth { name: string; freshness: DataFreshness; latency: string; status: DashboardStatus }
export interface DataCenterData {
  snapshot: { status: DashboardStatus; health: number; headline: string; updatedAt: string; source: string; freshness: DataFreshness; summary: string }
  centers: DataCenter[]; incidents: DataCenterIncident[]; events: OperationalEvent[]; providers: DataCenterProviderHealth[]; mapLayers: import('../../data/models').MapLayer[]
}

const statusClass: Record<DataCenterStatus, string> = { OPERATIONAL: 'operational', DEGRADED: 'degraded', 'PARTIAL OUTAGE': 'partial-outage', 'MAJOR OUTAGE': 'major-outage', MAINTENANCE: 'maintenance', UNKNOWN: 'unknown' }
const statusSeverity: Record<DataCenterStatus, Severity> = { OPERATIONAL: 'LOW', DEGRADED: 'MEDIUM', 'PARTIAL OUTAGE': 'HIGH', 'MAJOR OUTAGE': 'CRITICAL', MAINTENANCE: 'MEDIUM', UNKNOWN: 'INFO' }
const statusDashboard: Record<DataCenterStatus, DashboardStatus> = { OPERATIONAL: 'OK', DEGRADED: 'WARNING', 'PARTIAL OUTAGE': 'CRITICAL', 'MAJOR OUTAGE': 'CRITICAL', MAINTENANCE: 'WARNING', UNKNOWN: 'UNAVAILABLE' }

function MetricBar({ value, label, color = '#5b9fec' }: { value: number | null; label: string; color?: string }) {
  return <div className="dc-metric-bar"><div><span>{label}</span><strong>{value === null ? 'Not reported' : `${value.toFixed(1)}%`}</strong></div><div className="dc-meter-track"><i style={{ width: value === null ? 0 : `${Math.min(value, 100)}%`, background: color }} /></div></div>
}

function CapacityChart({ centers }: { centers: DataCenter[] }) {
  const max = Math.max(...centers.filter((center) => center.powerCapacityMW !== null).map((center) => center.powerCapacityMW as number), 1)
  return <div className="dc-capacity-chart" role="img" aria-label="Data center power capacity"><div className="dc-capacity-axis"><span>0</span><span>{max.toFixed(0)} MW</span></div>{centers.map((center) => <div className="dc-capacity-row" key={center.id}><span>{center.name}</span><div><i style={{ width: `${((center.powerCapacityMW ?? 0) / max) * 100}%` }} /></div><strong>{center.powerCapacityMW === null ? '—' : `${center.powerCapacityMW} MW`}</strong></div>)}</div>
}

function UtilizationChart({ centers }: { centers: DataCenter[] }) {
  const values = centers.filter((center) => center.itLoadMW !== null && center.powerCapacityMW !== null && center.powerCapacityMW! > 0).map((center) => center.itLoadMW! / center.powerCapacityMW! * 100)
  const max = Math.max(...values, 100)
  return <div className="dc-utilization-chart" role="img" aria-label="Data center utilization"><div className="dc-utilization-grid"><span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span></div>{centers.map((center) => { const utilization = center.itLoadMW !== null && center.powerCapacityMW !== null && center.powerCapacityMW! > 0 ? Math.min(center.itLoadMW! / center.powerCapacityMW! * 100, 100) : null; return <div className="dc-utilization-row" key={center.id}><span>{center.name}</span><div><i style={{ height: `${utilization ?? 0}%` }} className={utilization !== null && utilization >= 85 ? 'critical' : utilization !== null && utilization >= 70 ? 'warning' : 'normal'} /></div><strong>{utilization === null ? '—' : `${utilization.toFixed(0)}%`}</strong></div> })}</div>
}

export function DataCenters({ data }: { data: DataCenterData }) {
  const [selectedCenterId, setSelectedCenterId] = useState<string | null>(null)
  const totalCapacity = useMemo(() => data.centers.reduce((sum, center) => sum + (center.powerCapacityMW ?? 0), 0), [data.centers])
  const totalITLoad = useMemo(() => data.centers.reduce((sum, center) => sum + (center.itLoadMW ?? 0), 0), [data.centers])
  const knownCapacity = data.centers.filter((center) => center.powerCapacityMW !== null).length
  const operational = data.centers.filter((center) => center.status === 'OPERATIONAL').length
  const degraded = data.centers.filter((center) => ['DEGRADED', 'PARTIAL OUTAGE', 'MAJOR OUTAGE', 'MAINTENANCE'].includes(center.status)).length
  const mapPoints: MapPoint[] = data.centers.map((center) => ({ id: center.id, label: center.name, latitude: center.latitude, longitude: center.longitude, severity: center.status === 'OPERATIONAL' ? 'LOW' : center.status === 'UNKNOWN' ? 'INFO' : center.status === 'MAJOR OUTAGE' ? 'CRITICAL' : 'HIGH', detail: `${center.country} · ${center.status}` }))
  const selectedCenter = data.centers.find((center) => center.id === selectedCenterId)
  const abnormalEvents = data.events.filter((event) => event.severity === 'CRITICAL' || event.severity === 'HIGH')
  const providers = useMemo(() => Array.from(new Set(data.centers.flatMap((center) => center.cloudProviders ?? []))), [data.centers])
  const operators = useMemo(() => Array.from(new Set(data.centers.map((center) => center.operator ?? 'Unknown'))), [data.centers])
  const efficiency = useMemo(() => { const values = data.centers.map((center) => center.pue).filter((value): value is number => value !== null); return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null }, [data.centers])
  const utilization = totalCapacity ? totalITLoad / totalCapacity * 100 : null
  const mapLayers = useMemo<MapLayer[]>(() => data.mapLayers.length ? data.mapLayers : [{ id: 'dc-coverage', label: 'Data centers', color: '#5b9fec', points: mapPoints }], [data.mapLayers, mapPoints])

  return (
    <>
      <section className="overview-strip dc-command-strip"><div><StatusIndicator status={data.snapshot.status} label={data.snapshot.headline} description={data.snapshot.summary} /><p>Facility capacity, power, cooling, network, energy and service health across five Nordic countries.</p></div><div className="overview-strip-meta"><HealthIndicator health={data.snapshot.health} /><DataFreshnessIndicator updatedAt={data.snapshot.updatedAt} freshness={data.snapshot.freshness} /></div></section>
      <DashboardGrid columns={4}>
        <DashboardPanel title="Total data centers" subtitle="Tracked facilities" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="dc-kpi"><strong>{data.centers.length}<small> sites</small></strong><span><Building2 size={12} /> {knownCapacity} capacity records</span><p>Across five Nordic countries</p></div></DashboardPanel>
        <DashboardPanel title="Total estimated capacity" subtitle="Known power capacity" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="dc-kpi"><strong>{totalCapacity.toFixed(0)}<small> MW</small></strong><span><Zap size={12} /> {data.centers.length - knownCapacity} unknown</span><p>Sum of reported capacity</p></div></DashboardPanel>
        <DashboardPanel title="Operational status" subtitle="Current facility health" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="dc-kpi"><strong>{operational}<small> / {data.centers.length}</small></strong><span className={degraded ? 'dc-degraded' : 'dc-normal'}><Server size={12} /> {degraded} requiring attention</span><p>Operational facilities</p></div></DashboardPanel>
        <DashboardPanel title="Power utilization" subtitle="IT load against capacity" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="dc-kpi"><strong>{utilization === null ? '—' : utilization.toFixed(0)}<small> %</small></strong><span><Power size={12} /> {totalITLoad.toFixed(0)} MW load</span><p>Weighted fleet average</p></div></DashboardPanel>
      </DashboardGrid>
      <DashboardGrid>
        <DashboardPanel title="Nordic data center map" subtitle="Facility locations and operating condition" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><NordicMap layers={mapLayers} /></DashboardPanel>
        <DashboardPanel title="Data center list" subtitle="Facility status and core measurements" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="dc-list">{data.centers.map((center) => <button type="button" key={center.id} className={`dc-row ${selectedCenterId === center.id ? 'selected' : ''}`} onClick={() => setSelectedCenterId(center.id)}><span className={`dc-status-dot ${statusClass[center.status]}`} /><div><strong>{center.name}</strong><span>{center.city}, {center.country} · {center.operator ?? 'Unknown operator'}</span></div><div className="dc-row-values"><b>{center.powerCapacityMW === null ? 'Capacity unknown' : `${center.powerCapacityMW} MW`}</b><em>{center.itLoadMW === null ? 'Load unknown' : `${center.itLoadMW} MW`}</em></div><StatusIndicator status={statusDashboard[center.status]} compact label={center.status === 'UNKNOWN' ? 'UNKNOWN' : undefined} /></button>)}</div></DashboardPanel>
      </DashboardGrid>
      {selectedCenter && <DashboardPanel title={`${selectedCenter.name} infrastructure`} subtitle={`${selectedCenter.city}, ${selectedCenter.country}`} status={statusDashboard[selectedCenter.status]} timestamp={selectedCenter.lastUpdated ?? 'Not reported'}><div className="dc-detail-grid"><div><span>Tier</span><strong>{selectedCenter.tier ?? 'Not reported'}</strong></div><div><span>Power capacity</span><strong>{selectedCenter.powerCapacityMW === null ? 'Not reported' : `${selectedCenter.powerCapacityMW} MW`}</strong></div><div><span>IT load</span><strong>{selectedCenter.itLoadMW === null ? 'Not reported' : `${selectedCenter.itLoadMW} MW`}</strong></div><div><span>Cooling</span><strong>{selectedCenter.coolingTechnology ?? 'Not reported'}</strong></div><div><span>PUE</span><strong>{selectedCenter.pue === null ? 'Not reported' : selectedCenter.pue.toFixed(2)}</strong></div><div><span>Renewable energy</span><strong>{selectedCenter.renewableEnergyPercentage === null ? 'Not reported' : `${selectedCenter.renewableEnergyPercentage}%`}</strong></div><div><span>Network connectivity</span><strong>{selectedCenter.networkConnectivity ?? 'Not reported'}</strong></div><div><span>Cloud providers</span><strong>{selectedCenter.cloudProviders?.length ? selectedCenter.cloudProviders.join(', ') : 'Not reported'}</strong></div><div><span>Status</span><StatusIndicator status={statusDashboard[selectedCenter.status]} compact /></div><div><span>Availability</span><strong>{selectedCenter.availability === null ? 'Not reported' : `${selectedCenter.availability}%`}</strong></div></div></DashboardPanel>}
      <DashboardGrid>
        <DashboardPanel title="Capacity chart" subtitle="Reported power capacity by facility" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><CapacityChart centers={data.centers} /></DashboardPanel>
        <DashboardPanel title="Utilization chart" subtitle="IT load as a percentage of capacity" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><UtilizationChart centers={data.centers} /></DashboardPanel>
      </DashboardGrid>
      <DashboardGrid>
        <DashboardPanel title="Operator and cloud providers" subtitle="Facility ownership and hosted cloud ecosystem" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="dc-operator-section"><div><h3>Operators</h3><div className="dc-operator-list">{operators.map((operator) => <span key={operator}><Building2 size={9} />{operator}</span>)}</div></div><div><h3>Cloud providers</h3><div className="dc-provider-list">{providers.map((provider) => <span key={provider}><Cloud size={9} />{provider}</span>)}</div></div></div></DashboardPanel>
        <DashboardPanel title="Energy efficiency" subtitle="Power usage effectiveness" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="dc-efficiency"><div className="dc-efficiency-value"><ThermometerSun size={22} /><div><span>AVERAGE PUE</span><strong>{efficiency === null ? 'Not reported' : efficiency.toFixed(2)}</strong></div></div><MetricBar value={efficiency} label="Reported facilities" color="#65d9c7" /><p>PUE lower than 1.5 indicates more efficient cooling. Missing values are not estimated.</p></div></DashboardPanel>
      </DashboardGrid>
      <DashboardGrid>
        <DashboardPanel title="Abnormal events" subtitle="Sudden load, power, cooling, network and outage signals" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="dc-events">{abnormalEvents.length ? abnormalEvents.map((event) => <AlertBanner key={event.id} severity={event.severity} title={event.title} description={event.description} timestamp={`${event.timestamp} · ${event.country ?? event.region ?? 'Nordic region'}`} />) : <div className="empty-state"><strong>NO ABNORMAL EVENTS</strong><p>All monitored facilities are operating normally.</p></div>}</div></DashboardPanel>
        <DashboardPanel title="Infrastructure health" subtitle="Facility availability, monitoring and provider health" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="dc-health-list">{data.centers.map((center) => <article className="dc-health-row" key={center.id}><div><strong>{center.name}</strong><span>{center.country} · {center.city}</span></div><div className="dc-health-score"><strong>{center.availability === null ? '—' : `${center.availability}%`}</strong><span>Availability</span></div><div className="dc-health-status"><StatusIndicator status={statusDashboard[center.status]} compact /><small>{center.lastUpdated ?? 'Last update unknown'}</small></div></article>)}</div></DashboardPanel>
      </DashboardGrid>
      <DashboardPanel title="Data provider status" subtitle="Facility telemetry and monitoring source health" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="dc-provider-grid">{data.providers.map((provider) => <div className={`dc-provider-row status-${provider.freshness === 'OFFLINE' ? 'unavailable' : provider.freshness === 'STALE' || provider.freshness === 'DEGRADED' ? 'warning' : 'ok'}`} key={provider.name}><div><strong>{provider.name}</strong><span>{provider.latency} latency</span></div><DataFreshnessIndicator freshness={provider.freshness} updatedAt={provider.latency} compact /><StatusIndicator status={provider.status} compact /></div>)}</div></DashboardPanel>
      <DashboardPanel title="Infrastructure event feed" subtitle="Chronological facility and network events" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="dc-event-feed"><EventList events={data.events} /></div></DashboardPanel>
    </>
  )
}
