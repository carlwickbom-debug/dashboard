import { useMemo, useState } from 'react'
import { Anchor, Compass, Gauge, MapPinned, Navigation, Radio, Route, Ship, ShipWheel, ShieldAlert, Waves } from 'lucide-react'
import type { DashboardStatus, DataFreshness, MapLayer, MapPoint, OperationalEvent, Severity } from '../../data/models'
import { AlertBanner } from '../../components/events/AlertBanner'
import { EventList } from '../../components/events/EventRow'
import { DashboardGrid, DashboardPanel } from '../../components/layout/DashboardLayout'
import { NordicMap } from '../../components/maps/NordicMap'
import { DataFreshnessIndicator } from '../../components/status/DataFreshnessIndicator'
import { HealthIndicator, SeverityBadge } from '../../components/status/SeverityBadge'
import { StatusIndicator } from '../../components/status/StatusIndicator'

export type VesselStatus = 'ENROUTE' | 'AT PORT' | 'DEPARTED' | 'ANCHORING' | 'DANGER' | 'UNKNOWN'
export type PortStatus = 'OPERATIONAL' | 'RESTRICTED' | 'CLOSED' | 'DEGRADED' | 'UNKNOWN'
export interface Vessel { id: string; mmsi: string; name: string; type: string; flag: string; latitude: number; longitude: number; speed: number | null; heading: number | null; destination: string | null; status: VesselStatus; timestamp: string }
export interface VesselDensity { region: string; value: number; status: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL' }
export interface Port { id: string; name: string; country: string; latitude: number; longitude: number; status: PortStatus; channel: string; capacity: number | null; lastUpdated: string | null }
export interface ShippingLane { id: string; name: string; from: string; to: string; severity: Severity; status: 'OPEN' | 'RESTRICTED' | 'CLOSED' | 'UNKNOWN'; description: string }
export interface MaritimeIncident { id: string; title: string; location: string; severity: Severity; time: string; type: string; detail: string }
export interface MaritimeProviderHealth { name: string; freshness: DataFreshness; latency: string; status: DashboardStatus }
export interface MaritimeData {
  snapshot: { status: DashboardStatus; health: number; headline: string; updatedAt: string; source: string; freshness: DataFreshness; summary: string }
  vessels: Vessel[]; vesselDensity: VesselDensity[]; ports: Port[]; shippingLanes: ShippingLane[]; incidents: MaritimeIncident[]; abnormalEvents: OperationalEvent[]
  events: OperationalEvent[]; providers: MaritimeProviderHealth[]; mapLayers: MapLayer[]
}

const statusToDashboard: Record<VesselStatus | PortStatus, DashboardStatus> = { ENROUTE: 'OK', 'AT PORT': 'OK', DEPARTED: 'OK', ANCHORING: 'WARNING', DANGER: 'CRITICAL', OPERATIONAL: 'OK', RESTRICTED: 'WARNING', CLOSED: 'CRITICAL', DEGRADED: 'WARNING', UNKNOWN: 'UNAVAILABLE' }
const statusToSeverity: Record<VesselStatus | PortStatus, Severity> = { ENROUTE: 'LOW', 'AT PORT': 'LOW', DEPARTED: 'LOW', ANCHORING: 'MEDIUM', DANGER: 'CRITICAL', OPERATIONAL: 'LOW', RESTRICTED: 'MEDIUM', CLOSED: 'CRITICAL', DEGRADED: 'MEDIUM', UNKNOWN: 'INFO' }
const densityClass: Record<VesselDensity['status'], string> = { LOW: 'low', NORMAL: 'normal', HIGH: 'high', CRITICAL: 'critical' }

function VesselList({ vessels }: { vessels: Vessel[] }) {
  return <div className="maritime-vessel-list">{vessels.length ? vessels.map((vessel) => <article className="maritime-vessel" key={vessel.id}><div className="maritime-vessel-icon"><Ship size={15} /></div><div><strong>{vessel.name}</strong><span>{vessel.mmsi} · {vessel.type} · {vessel.flag}</span><small>{vessel.destination ?? 'Destination unknown'} · {vessel.timestamp}</small></div><div className="maritime-vessel-metrics"><b>{vessel.speed === null ? 'Speed unknown' : `${vessel.speed.toFixed(1)} kn`}</b><SeverityBadge severity={statusToSeverity[vessel.status]} compact /></div></article>) : <div className="empty-state"><strong>NO VESSELS</strong><p>No vessel positions are currently reported.</p></div>}</div>
}

function PortList({ ports }: { ports: Port[] }) {
  return <div className="maritime-port-list">{ports.length ? ports.map((port) => <article className="maritime-port" key={port.id}><div className="maritime-port-icon"><MapPinned size={15} /></div><div><strong>{port.name}</strong><span>{port.country} · {port.channel}</span><small>{port.lastUpdated ?? 'Last update unknown'}</small></div><div><SeverityBadge severity={statusToSeverity[port.status]} compact /><small>{port.capacity === null ? 'Capacity unknown' : `${port.capacity}% capacity`}</small></div></article>) : <div className="empty-state"><strong>NO PORTS</strong><p>No ports are currently reported.</p></div>}</div>
}

function Density({ density }: { density: VesselDensity[] }) {
  return <div className="maritime-density-list">{density.length ? density.map((item) => <div className="maritime-density-row" key={item.region}><span>{item.region}</span><strong>{item.value} vessels</strong><div className="maritime-density-meter"><i className={densityClass[item.status]} style={{ width: `${Math.min(item.value, 100)}%` }} /></div></div>) : <div className="empty-state"><strong>NO DENSITY DATA</strong><p>No vessel density is currently reported.</p></div>}</div>
}

export function Maritime({ data }: { data: MaritimeData }) {
  const [selectedVesselId, setSelectedVesselId] = useState<string | null>(null)
  const selectedVessel = data.vessels.find((vessel) => vessel.id === selectedVesselId)
  const activeVessels = data.vessels.filter((vessel) => vessel.status !== 'UNKNOWN').length
  const highRiskVessels = data.vessels.filter((vessel) => vessel.status === 'DANGER' || vessel.status === 'ANCHORING').length
  const restrictedPorts = data.ports.filter((port) => port.status === 'RESTRICTED' || port.status === 'CLOSED').length
  const restrictedLanes = data.shippingLanes.filter((lane) => lane.status !== 'OPEN').length
  const vesselPoints: MapPoint[] = data.vessels.map((vessel) => ({ id: vessel.id, label: vessel.name, latitude: vessel.latitude, longitude: vessel.longitude, severity: statusToSeverity[vessel.status], detail: `${vessel.mmsi} · ${vessel.type} · ${vessel.status}` }))
  const portPoints: MapPoint[] = data.ports.map((port) => ({ id: port.id, label: port.name, latitude: port.latitude, longitude: port.longitude, severity: statusToSeverity[port.status], detail: `${port.country} · ${port.channel}` }))
  const mapLayers = useMemo<MapLayer[]>(() => [...data.mapLayers, { id: 'maritime-vessels', label: 'Vessel positions', color: '#56c7a5', points: vesselPoints }, { id: 'maritime-ports', label: 'Ports', color: '#5b9fec', points: portPoints }], [data.mapLayers, portPoints, vesselPoints])
  const urgentEvents = data.abnormalEvents.filter((event) => event.severity === 'CRITICAL' || event.severity === 'HIGH')
  const feedStatus = data.providers.some((provider) => provider.freshness === 'OFFLINE' || provider.status === 'UNAVAILABLE') ? 'CRITICAL' : data.providers.some((provider) => provider.freshness === 'STALE' || provider.freshness === 'DEGRADED') ? 'WARNING' : 'OK'

  return (
    <>
      <section className="overview-strip maritime-command-strip"><div><StatusIndicator status={data.snapshot.status} label={data.snapshot.headline} description={data.snapshot.summary} /><p>Vessel positions, density, ports, shipping lanes, incidents, abnormal behavior and AIS feed health across the Nordic region and surrounding seas.</p></div><div className="overview-strip-meta"><HealthIndicator health={data.snapshot.health} /><DataFreshnessIndicator updatedAt={data.snapshot.updatedAt} freshness={data.snapshot.freshness} /></div></section>
      <DashboardGrid columns={4}>
        <DashboardPanel title="Vessels tracked" subtitle="Reported vessel positions" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="maritime-kpi"><strong>{activeVessels}<small> vessels</small></strong><span><Ship size={12} /> {data.vessels.length} reported</span><p>Non-unknown vessel status</p></div></DashboardPanel>
        <DashboardPanel title="Vessel density" subtitle="Regional traffic concentration" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="maritime-kpi"><strong>{data.vesselDensity.reduce((sum, item) => sum + item.value, 0)}<small> total</small></strong><span><Waves size={12} /> {data.vesselDensity.length} regions</span><p>Current density model</p></div></DashboardPanel>
        <DashboardPanel title="Port restrictions" subtitle="Port channel and capacity status" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="maritime-kpi"><strong>{restrictedPorts}<small> restricted</small></strong><span className={restrictedPorts ? 'critical' : 'normal'}><Anchor size={12} /> {data.ports.length} ports</span><p>Current operating state</p></div></DashboardPanel>
        <DashboardPanel title="Shipping lane status" subtitle="Route availability and severity" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="maritime-kpi"><strong>{restrictedLanes}<small> restricted</small></strong><span className={restrictedLanes ? 'warning' : 'normal'}><Route size={12} /> {data.shippingLanes.length} lanes</span><p>Current route controls</p></div></DashboardPanel>
      </DashboardGrid>
      <DashboardGrid>
        <DashboardPanel title="Nordic maritime map" subtitle="Vessels, ports, shipping lanes and regional density" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><NordicMap layers={mapLayers} selectedId={selectedVesselId ?? undefined} onSelect={setSelectedVesselId} /></DashboardPanel>
        <DashboardPanel title="Vessel positions" subtitle="Select a vessel to inspect its operational details" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><VesselList vessels={data.vessels} /></DashboardPanel>
      </DashboardGrid>
      {selectedVessel && <DashboardPanel title={`${selectedVessel.name} vessel`} subtitle={`${selectedVessel.mmsi} · ${selectedVessel.flag} · ${selectedVessel.type}`} status={statusToDashboard[selectedVessel.status]} timestamp={selectedVessel.timestamp}><div className="dc-detail-grid"><div><span>Position</span><strong>{selectedVessel.latitude.toFixed(2)}, {selectedVessel.longitude.toFixed(2)}</strong></div><div><span>Speed</span><strong>{selectedVessel.speed === null ? 'Unknown' : `${selectedVessel.speed.toFixed(1)} kn`}</strong></div><div><span>Heading</span><strong>{selectedVessel.heading === null ? 'Unknown' : `${selectedVessel.heading}°`}</strong></div><div><span>Destination</span><strong>{selectedVessel.destination ?? 'Unknown'}</strong></div><div><span>Status</span><StatusIndicator status={statusToDashboard[selectedVessel.status]} compact /></div><div><span>Updated</span><strong>{selectedVessel.timestamp}</strong></div></div></DashboardPanel>}
      <DashboardGrid>
        <DashboardPanel title="Vessel density" subtitle="Traffic concentration by operating region" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><Density density={data.vesselDensity} /></DashboardPanel>
        <DashboardPanel title="Port status" subtitle="Port availability, channel and capacity" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><PortList ports={data.ports} /></DashboardPanel>
      </DashboardGrid>
      <DashboardGrid>
        <DashboardPanel title="Shipping lanes" subtitle="Routes, restrictions and operating status" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="maritime-lane-list">{data.shippingLanes.length ? data.shippingLanes.map((lane) => <article className="maritime-lane" key={lane.id}><div className="maritime-lane-icon"><Navigation size={15} /></div><div><strong>{lane.name}</strong><span>{lane.from} → {lane.to}</span><small>{lane.description}</small></div><SeverityBadge severity={lane.severity} compact /></article>) : <div className="empty-state"><strong>NO SHIPPING LANES</strong><p>No shipping lanes are currently reported.</p></div>}</div></DashboardPanel>
        <DashboardPanel title="Maritime incidents" subtitle="Navigation, safety and operational reports" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="maritime-incident-list">{data.incidents.length ? data.incidents.map((incident) => <article className="maritime-incident" key={incident.id}><div className="maritime-incident-icon"><ShieldAlert size={15} /></div><div><strong>{incident.title}</strong><span>{incident.location} · {incident.type}</span><small>{incident.detail} · {incident.time}</small></div><SeverityBadge severity={incident.severity} compact /></article>) : <div className="empty-state"><strong>NO INCIDENTS</strong><p>No maritime incidents are currently reported.</p></div>}</div></DashboardPanel>
      </DashboardGrid>
      <DashboardGrid>
        <DashboardPanel title="Abnormal vessel behavior" subtitle="AIS anomaly and behavior deviations" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="maritime-anomaly-list">{urgentEvents.length ? urgentEvents.map((event) => <AlertBanner key={event.id} severity={event.severity} title={event.title} description={event.description} timestamp={`${event.timestamp} · ${event.country ?? event.region ?? 'Nordic region'}`} />) : <div className="empty-state"><strong>NO ABNORMAL BEHAVIOR</strong><p>No abnormal vessel behavior is currently reported.</p></div>}</div></DashboardPanel>
        <DashboardPanel title="AIS feed health" subtitle="Provider data freshness and availability" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="maritime-feed-list">{data.providers.length ? data.providers.map((provider) => <article className={`maritime-feed status-${provider.freshness === 'OFFLINE' || provider.status === 'UNAVAILABLE' ? 'unavailable' : provider.freshness === 'STALE' || provider.freshness === 'DEGRADED' ? 'warning' : 'ok'}`} key={provider.name}><div className="maritime-feed-icon"><Radio size={15} /></div><div><strong>{provider.name}</strong><span>{provider.latency} latency</span></div><DataFreshnessIndicator freshness={provider.freshness} updatedAt={provider.latency} compact /><StatusIndicator status={provider.status} compact /></article>) : <div className="empty-state"><strong>NO FEED HEALTH</strong><p>No AIS or maritime feed health is currently reported.</p></div>}</div></DashboardPanel>
      </DashboardGrid>
      <DashboardPanel title="Operational event feed" subtitle="Chronological maritime incident and anomaly events" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="maritime-incident-feed"><EventList events={data.events} /></div></DashboardPanel>
      {highRiskVessels > 0 && <DashboardPanel title="High-risk vessel status" subtitle="Vessels requiring operational attention" status={feedStatus} timestamp={data.snapshot.updatedAt}><div className="maritime-anomaly-list">{data.vessels.filter((vessel) => vessel.status === 'DANGER' || vessel.status === 'ANCHORING').map((vessel) => <article className="maritime-anomaly" key={vessel.id}><div className="maritime-anomaly-icon"><ShipWheel size={15} /></div><div><strong>{vessel.name}</strong><span>{vessel.type} · {vessel.flag}</span><small>{vessel.destination ?? 'Destination unknown'} · {vessel.timestamp}</small></div><SeverityBadge severity={statusToSeverity[vessel.status]} compact /></article>)}</div></DashboardPanel>}
    </>
  )
}
