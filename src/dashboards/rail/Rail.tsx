import { useMemo, useState } from 'react'
import { AlertTriangle, Clock3, Route, TrainFront, Wrench } from 'lucide-react'
import type { DashboardStatus, DataFreshness, OperationalEvent, Severity } from '../../data/models'
import { AlertBanner } from '../../components/events/AlertBanner'
import { EventList } from '../../components/events/EventRow'
import { DashboardGrid, DashboardPanel } from '../../components/layout/DashboardLayout'
import { NordicMap } from '../../components/maps/NordicMap'
import { DataFreshnessIndicator } from '../../components/status/DataFreshnessIndicator'
import { HealthIndicator, SeverityBadge } from '../../components/status/SeverityBadge'
import { StatusIndicator } from '../../components/status/StatusIndicator'

export type RailServiceState = 'NORMAL' | 'DELAY' | 'MAJOR DELAY' | 'SERVICE DISRUPTION' | 'INFRASTRUCTURE FAILURE'
export interface RailTrain { id: string; line: string; route: string; status: RailServiceState; delay: number; speed: number; progress: number; nextStation: string }
export interface RailDelayDistribution { state: RailServiceState; count: number }
export interface RailDisruption { id: string; line: string; type: RailServiceState; status: DashboardStatus; severity: Severity; start: string; end: string; description: string; location: string }
export interface RailStation { name: string; country: string; trains: number; arrivals: number; status: DashboardStatus }
export interface RailMaintenance { id: string; line: string; time: string; type: string; status: 'ACTIVE' | 'PLANNED' | 'COMPLETE' }
export interface RailProviderHealth { name: string; freshness: DataFreshness; latency: string; status: DashboardStatus }
export interface RailData {
  snapshot: { status: DashboardStatus; health: number; headline: string; updatedAt: string; source: string; freshness: DataFreshness; summary: string }
  trains: RailTrain[]
  delayDistribution: RailDelayDistribution[]
  disruptions: RailDisruption[]
  stations: RailStation[]
  maintenance: RailMaintenance[]
  incidents: Array<{ id: string; title: string; location: string; severity: Severity; time: string; detail: string }>
  providers: RailProviderHealth[]
  events: OperationalEvent[]
  mapLayers: import('../../data/models').MapLayer[]
}

const stateSeverity: Record<RailServiceState, Severity> = { NORMAL: 'LOW', DELAY: 'MEDIUM', 'MAJOR DELAY': 'HIGH', 'SERVICE DISRUPTION': 'CRITICAL', 'INFRASTRUCTURE FAILURE': 'CRITICAL' }
const stateClass: Record<RailServiceState, string> = { NORMAL: 'rail-state-normal', DELAY: 'rail-state-delay', 'MAJOR DELAY': 'rail-state-major-delay', 'SERVICE DISRUPTION': 'rail-state-service-disruption', 'INFRASTRUCTURE FAILURE': 'rail-state-infrastructure-failure' }

function stateStatus(state: RailServiceState): DashboardStatus { return state === 'INFRASTRUCTURE FAILURE' || state === 'SERVICE DISRUPTION' ? 'CRITICAL' : state === 'MAJOR DELAY' || state === 'DELAY' ? 'WARNING' : 'OK' }

function DelayDistribution({ data }: { data: RailData }) {
  const max = Math.max(...data.delayDistribution.map((item) => item.count), 1)
  return <div className="rail-delay-chart" role="img" aria-label="Train delay distribution"><div className="rail-delay-bars">{data.delayDistribution.map((item) => <div className="rail-delay-row" key={item.state}><span>{item.state}</span><div><i className={item.state === 'NORMAL' ? '' : item.state === 'DELAY' ? 'delay' : 'major'} style={{ width: `${(item.count / max) * 100}%` }} /></div><strong>{item.count}</strong></div>)}</div></div>
}

export function Rail({ data }: { data: RailData }) {
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null)
  const activeTrains = useMemo(() => data.trains.filter((train) => train.status !== 'NORMAL').length, [data.trains])
  const delayedTrains = useMemo(() => data.trains.filter((train) => train.delay > 0).length, [data.trains])
  const cancellations = useMemo(() => data.events.filter((event) => event.category === 'Cancellation').length, [data.events])
  const majorDisruptions = data.disruptions.filter((item) => item.severity === 'CRITICAL' || item.severity === 'HIGH')
  const criticalIncidents = data.incidents.filter((item) => item.severity === 'CRITICAL')

  return (
    <>
      <section className="overview-strip rail-command-strip"><div><StatusIndicator status={data.snapshot.status} label={data.snapshot.headline} description={data.snapshot.summary} /><p>Train activity, schedule adherence, infrastructure condition and maintenance across the Nordic rail network.</p></div><div className="overview-strip-meta"><HealthIndicator health={data.snapshot.health} /><DataFreshnessIndicator updatedAt={data.snapshot.updatedAt} freshness={data.snapshot.freshness} /></div></section>
      <DashboardGrid columns={4}>
        <DashboardPanel title="Active trains" subtitle="Current movements" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="rail-kpi"><strong>{data.trains.length}<small> trains</small></strong><span className="rail-normal"><TrainFront size={12} /> {activeTrains} require attention</span><p>On monitored routes</p></div></DashboardPanel>
        <DashboardPanel title="Delay" subtitle="Network average" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="rail-kpi"><strong>{(data.trains.reduce((sum, train) => sum + train.delay, 0) / Math.max(data.trains.length, 1)).toFixed(1)}<small> min</small></strong><span><Clock3 size={12} /> {delayedTrains} trains delayed</span><p>Across active services</p></div></DashboardPanel>
        <DashboardPanel title="Cancellations" subtitle="Current service changes" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="rail-kpi"><strong>{cancellations}<small> events</small></strong><span className={cancellations ? 'rail-state-service-disruption' : 'rail-normal'}><AlertTriangle size={12} /> {cancellations ? 'Action required' : 'No cancellations'}</span><p>Within the operating window</p></div></DashboardPanel>
        <DashboardPanel title="Track availability" subtitle="Infrastructure readiness" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="rail-kpi"><strong>96.1<small> %</small></strong><span className="rail-normal"><Route size={12} /> 2 sections monitored</span><p>Current network coverage</p></div></DashboardPanel>
      </DashboardGrid>
      <DashboardGrid>
        <DashboardPanel title="Nordic rail map" subtitle="Disruptions, stations and railway corridors" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><NordicMap layers={data.mapLayers} selectedId={selectedEvent ?? undefined} onSelect={setSelectedEvent} /></DashboardPanel>
        <DashboardPanel title="Live train activity" subtitle="Current route and service state" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="rail-activity"><div className="rail-activity-summary"><span>ACTIVE MOVEMENTS</span><strong>{data.trains.length} trains</strong></div><div className="rail-train-list">{data.trains.map((train) => <article className="rail-train" key={train.id}><span className="rail-train-number">{train.id}</span><div className="rail-train-route"><strong>{train.route}</strong><span>{train.nextStation} · {train.speed} km/h · {train.progress}% complete</span></div><div className={`rail-train-state ${stateClass[train.status]}`}><strong>{train.status}</strong><small>{train.delay > 0 ? `+${train.delay} min` : 'On time'}</small></div></article>)}</div></div></DashboardPanel>
      </DashboardGrid>
      <DashboardGrid>
        <DashboardPanel title="Delay distribution" subtitle="Current service-state distribution" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><DelayDistribution data={data} /></DashboardPanel>
        <DashboardPanel title="Major disruptions" subtitle="Priority line interruptions" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="rail-disruption-list">{majorDisruptions.length ? majorDisruptions.map((item) => <article className={`rail-disruption ${stateClass[item.type]}`} key={item.id}><div><span>{item.line} · {item.type}</span><strong>{item.description}</strong></div><div className="rail-disruption-time"><b>{item.start}</b><small>to {item.end}</small><SeverityBadge severity={item.severity} compact /></div><p>{item.location ?? 'Route disruption'}</p></article>) : <div className="empty-state"><strong>NO MAJOR DISRUPTIONS</strong><p>All monitored routes are operating within normal parameters.</p></div>}</div></DashboardPanel>
      </DashboardGrid>
      <DashboardGrid>
        <DashboardPanel title="Major stations" subtitle="Station activity and operating status" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="rail-station-list">{data.stations.map((station) => <article className="rail-station" key={station.name}><div><strong>{station.name}</strong><span>{station.country} · {station.arrivals} arrivals</span></div><b>{station.trains} trains</b><em className={station.status === 'OK' ? 'rail-state-normal' : 'rail-state-service-disruption'}>{station.status}</em></article>)}</div></DashboardPanel>
        <DashboardPanel title="Maintenance" subtitle="Scheduled and active infrastructure work" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="rail-maintenance-list">{data.maintenance.map((item) => <article className="rail-maintenance" key={item.id}><i><Wrench size={11} /></i><div><strong>{item.line}</strong><span>{item.type} · {item.time}</span></div><b className={item.status === 'ACTIVE' ? 'rail-state-service-disruption' : 'rail-state-normal'}>{item.status}</b></article>)}</div></DashboardPanel>
      </DashboardGrid>
      <DashboardGrid>
        <DashboardPanel title="Infrastructure incidents" subtitle="Track, signal and station failures" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="rail-disruption-list">{criticalIncidents.length ? criticalIncidents.map((incident) => <AlertBanner key={incident.id} severity={incident.severity} title={incident.title} description={incident.detail} timestamp={`${incident.time} · ${incident.location}`} />) : <div className="empty-state"><strong>NO INFRASTRUCTURE INCIDENTS</strong><p>All monitored infrastructure is operating normally.</p></div>}</div></DashboardPanel>
        <DashboardPanel title="Abnormal events" subtitle="Chronological rail deviations" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="rail-event-feed"><EventList events={data.events} /></div></DashboardPanel>
      </DashboardGrid>
      <DashboardPanel title="Data provider status" subtitle="Rail telemetry, signal and schedule source health" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="rail-provider-grid">{data.providers.map((provider) => <div className={`rail-provider-row status-${provider.freshness === 'OFFLINE' ? 'critical' : provider.freshness === 'STALE' || provider.freshness === 'DEGRADED' ? 'warning' : 'ok'}`} key={provider.name}><div><strong>{provider.name}</strong><span>{provider.latency} latency</span></div><DataFreshnessIndicator freshness={provider.freshness} updatedAt={provider.latency} compact /><StatusIndicator status={provider.status} compact /></div>)}</div></DashboardPanel>
    </>
  )
}
