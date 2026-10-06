import { useMemo, useState } from 'react'
import { Camera, CloudRain, Gauge, HardHat, Route, ShieldAlert, TriangleAlert } from 'lucide-react'
import type { DashboardStatus, DataFreshness, MapLayer, MapPoint, OperationalEvent, Severity } from '../../data/models'
import { AlertBanner } from '../../components/events/AlertBanner'
import { EventList } from '../../components/events/EventRow'
import { DashboardGrid, DashboardPanel } from '../../components/layout/DashboardLayout'
import { NordicMap } from '../../components/maps/NordicMap'
import { DataFreshnessIndicator } from '../../components/status/DataFreshnessIndicator'
import { HealthIndicator, SeverityBadge } from '../../components/status/SeverityBadge'
import { StatusIndicator } from '../../components/status/StatusIndicator'

export type CameraStatus = 'AVAILABLE' | 'UNAVAILABLE' | 'OFFLINE' | 'CONNECTING'
export interface TrafficCamera { id: string; country: string; name: string; latitude: number; longitude: number; road: string; direction: string; status: CameraStatus; imageUrl: string | null; lastUpdated: string }
export interface TrafficCongestion { road: string; location: string; current: number; target: number; level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'; direction: string }
export interface TrafficIncident { id: string; title: string; location: string; severity: Severity; time: string; type: string; detail: string }
export interface RoadClosure { id: string; road: string; location: string; severity: Severity; start: string; end: string; reason: string }
export interface TrafficAccident { id: string; road: string; location: string; severity: Severity; time: string; description: string }
export interface WeatherDisruption { id: string; location: string; severity: Severity; time: string; description: string }
export interface RoadWork { id: string; road: string; location: string; severity: Severity; time: string; description: string }
export interface TrafficProviderHealth { name: string; freshness: DataFreshness; latency: string; status: DashboardStatus }
export interface TrafficData {
  snapshot: { status: DashboardStatus; health: number; headline: string; updatedAt: string; source: string; freshness: DataFreshness; summary: string }
  congestion: TrafficCongestion[]
  averageSpeed: number
  incidents: TrafficIncident[]
  closures: RoadClosure[]
  accidents: TrafficAccident[]
  weatherDisruption: WeatherDisruption[]
  roadworks: RoadWork[]
  cameras: TrafficCamera[]
  events: OperationalEvent[]
  providers: TrafficProviderHealth[]
  mapLayers: import('../../data/models').MapLayer[]
}

const cameraStatusClass: Record<CameraStatus, string> = { AVAILABLE: 'available', UNAVAILABLE: 'unavailable', OFFLINE: 'offline', CONNECTING: 'connecting' }
const severityToStatus: Record<Severity, DashboardStatus> = { INFO: 'OK', LOW: 'OK', MEDIUM: 'WARNING', HIGH: 'WARNING', CRITICAL: 'CRITICAL' }

function StatusList({ items, emptyMessage }: { items: TrafficIncident[]; emptyMessage: string }) {
  return <div className="traffic-status-list traffic-incident">{items.length ? items.map((item) => <article className="traffic-status-item" key={item.id}><div className="traffic-status-icon"><SeverityBadge severity={item.severity} compact /></div><div><strong>{item.location}</strong><span>{item.detail}</span><small>{item.time}</small></div><StatusIndicator status={severityToStatus[item.severity]} compact /></article>) : <div className="empty-state"><strong>NO INCIDENTS</strong><p>{emptyMessage}</p></div>}</div>
}

export function Traffic({ data }: { data: TrafficData }) {
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null)
  const selectedCamera = useMemo(() => data.cameras.find((camera) => camera.id === selectedCameraId) ?? null, [data.cameras, selectedCameraId])
  const activeCongestion = data.congestion.filter((item) => item.level !== 'LOW').length
  const urgentEvents = data.events.filter((event) => event.severity === 'CRITICAL' || event.severity === 'HIGH')
  const camerasAvailable = data.cameras.filter((camera) => camera.status === 'AVAILABLE').length
  const cameraMapPoints = useMemo<MapPoint[]>(() => data.cameras.map((camera) => ({ id: camera.id, label: camera.name, latitude: camera.latitude, longitude: camera.longitude, severity: camera.status === 'AVAILABLE' ? 'LOW' : camera.status === 'OFFLINE' ? 'CRITICAL' : 'MEDIUM', detail: `${camera.road} · ${camera.direction}` })), [data.cameras])
  const mapLayers = useMemo<MapLayer[]>(() => data.mapLayers.map((layer) => layer.id === 'traffic-cameras' ? { ...layer, points: [...(layer.points ?? []), ...cameraMapPoints] } : layer), [cameraMapPoints, data.mapLayers])

  return (
    <>
      <section className="overview-strip traffic-command-strip"><div><StatusIndicator status={data.snapshot.status} label={data.snapshot.headline} description={data.snapshot.summary} /><p>Road flow, congestion, incidents, closures, weather, roadworks and camera availability across the Nordic network.</p></div><div className="overview-strip-meta"><HealthIndicator health={data.snapshot.health} /><DataFreshnessIndicator updatedAt={data.snapshot.updatedAt} freshness={data.snapshot.freshness} /></div></section>
      <DashboardGrid columns={4}>
        <DashboardPanel title="Congestion" subtitle="Roads above target flow" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="traffic-kpi"><strong>{activeCongestion}<small> corridors</small></strong><span><TriangleAlert size={12} /> {activeCongestion ? 'Queue pressure' : 'No congestion'}</span><p>Across monitored roads</p></div></DashboardPanel>
        <DashboardPanel title="Average speed" subtitle="Network speed indicator" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="traffic-kpi"><strong>{data.averageSpeed}<small> km/h</small></strong><span><Gauge size={12} /> {data.averageSpeed >= 55 ? 'Above target' : 'Below target'}</span><p>Weighted network average</p></div></DashboardPanel>
        <DashboardPanel title="Incidents" subtitle="Active traffic events" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="traffic-kpi"><strong>{data.incidents.length}<small> events</small></strong><span><ShieldAlert size={12} /> {data.incidents.filter((item) => item.severity === 'CRITICAL').length} critical</span><p>Sensor and operator reports</p></div></DashboardPanel>
        <DashboardPanel title="Camera availability" subtitle="Live observation coverage" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="traffic-kpi"><strong>{camerasAvailable}<small> of {data.cameras.length}</small></strong><span><Camera size={12} /> {data.cameras.length - camerasAvailable} unavailable</span><p>Provider-backed cameras</p></div></DashboardPanel>
      </DashboardGrid>
      <DashboardGrid>
        <DashboardPanel title="Nordic traffic map" subtitle="Congestion, incidents, closures, cameras and weather" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><NordicMap layers={mapLayers} selectedId={selectedCameraId ?? undefined} onSelect={setSelectedCameraId} /></DashboardPanel>
        <DashboardPanel title="Traffic cameras" subtitle="Select a camera to view its latest image" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="traffic-camera-list">{data.cameras.map((camera) => <button type="button" key={camera.id} className={`traffic-camera-row ${selectedCameraId === camera.id ? 'selected' : ''}`} onClick={() => setSelectedCameraId(camera.id)} aria-label={`${camera.name}, ${camera.road}, ${camera.direction}`}><span className={`camera-status-dot ${cameraStatusClass[camera.status]}`} /><div><strong>{camera.name}</strong><span>{camera.country} · {camera.road} · {camera.direction}</span></div><em>{camera.status}</em><small>{camera.lastUpdated}</small></button>)}</div></DashboardPanel>
      </DashboardGrid>
      {selectedCamera && <DashboardPanel title={`${selectedCamera.name} camera`} subtitle={`${selectedCamera.country} · ${selectedCamera.road} · ${selectedCamera.direction}`} status={selectedCamera.status === 'AVAILABLE' ? 'OK' : 'CRITICAL'} timestamp={selectedCamera.lastUpdated}><div className="traffic-camera-detail"><div className="traffic-camera-frame">{selectedCamera.imageUrl ? <img src={selectedCamera.imageUrl} alt={`${selectedCamera.name} traffic camera`} /> : <div className="camera-unavailable"><Camera size={28} /><strong>IMAGE UNAVAILABLE</strong><span>{selectedCamera.status === 'OFFLINE' ? 'Camera stream offline' : 'No image URL supplied'}</span></div>}</div><div className="traffic-camera-meta"><div><span>Road</span><strong>{selectedCamera.road}</strong></div><div><span>Direction</span><strong>{selectedCamera.direction}</strong></div><div><span>Status</span><StatusIndicator status={selectedCamera.status === 'AVAILABLE' ? 'OK' : selectedCamera.status === 'OFFLINE' ? 'CRITICAL' : 'WARNING'} compact /></div><div><span>Updated</span><strong>{selectedCamera.lastUpdated}</strong></div></div></div></DashboardPanel>}
      <DashboardGrid>
        <DashboardPanel title="Congestion" subtitle="Current corridor queue and estimated speed" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="traffic-congestion-list">{data.congestion.map((item) => <article className="traffic-congestion-row" key={`${item.road}-${item.direction}`}><div><strong>{item.road}</strong><span>{item.location} · {item.direction}</span></div><div className="traffic-congestion-meter"><i style={{ width: `${Math.min((item.current / item.target) * 100, 100)}%` }} /><span>{item.current} km/h</span></div><div className="traffic-congestion-target"><small>Target</small><b>{item.target} km/h</b></div><SeverityBadge severity={item.level === 'CRITICAL' ? 'CRITICAL' : item.level === 'HIGH' ? 'HIGH' : item.level === 'MODERATE' ? 'MEDIUM' : 'LOW'} compact /></article>)}</div></DashboardPanel>
        <DashboardPanel title="Incidents" subtitle="Traffic incidents and sensor reports" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><StatusList items={data.incidents} emptyMessage="No incidents are currently reported." /></DashboardPanel>
      </DashboardGrid>
      <DashboardGrid>
        <DashboardPanel title="Road closures" subtitle="Closed roads and operating restrictions" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="traffic-closure-list">{data.closures.map((closure) => <article className="traffic-closure" key={closure.id}><div className="traffic-closure-icon"><Route size={15} /></div><div><strong>{closure.road} · {closure.location}</strong><span>{closure.reason}</span><small>{closure.start}–{closure.end}</small></div><SeverityBadge severity={closure.severity} compact /></article>)}</div></DashboardPanel>
        <DashboardPanel title="Accidents" subtitle="Crashes and injury risk reporting" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="traffic-accident-list">{data.accidents.map((accident) => <article className="traffic-accident" key={accident.id}><div className="traffic-accident-icon"><ShieldAlert size={15} /></div><div><strong>{accident.road} · {accident.location}</strong><span>{accident.description}</span><small>{accident.time}</small></div><SeverityBadge severity={accident.severity} compact /></article>)}</div></DashboardPanel>
      </DashboardGrid>
      <DashboardGrid>
        <DashboardPanel title="Weather disruption" subtitle="Weather effects on road safety and flow" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="traffic-weather-list">{data.weatherDisruption.map((item) => <article className="traffic-weather" key={item.id}><CloudRain size={18} /><div><strong>{item.location}</strong><span>{item.description}</span><small>{item.time}</small></div><SeverityBadge severity={item.severity} compact /></article>)}</div></DashboardPanel>
        <DashboardPanel title="Roadworks" subtitle="Scheduled and active road maintenance" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="traffic-roadwork-list">{data.roadworks.map((item) => <article className="traffic-roadwork" key={item.id}><HardHat size={18} /><div><strong>{item.road} · {item.location}</strong><span>{item.description}</span><small>{item.time}</small></div><SeverityBadge severity={item.severity} compact /></article>)}</div></DashboardPanel>
      </DashboardGrid>
      <DashboardGrid>
        <DashboardPanel title="Abnormal traffic events" subtitle="High-impact deviations from normal flow" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="traffic-events">{urgentEvents.length ? urgentEvents.map((event) => <AlertBanner key={event.id} severity={event.severity} title={event.title} description={event.description} timestamp={`${event.timestamp} · ${event.country ?? event.region ?? 'Nordic region'}`} />) : <div className="empty-state"><strong>NO ABNORMAL EVENTS</strong><p>All monitored traffic conditions are operating normally.</p></div>}</div></DashboardPanel>
        <DashboardPanel title="Abnormal traffic event feed" subtitle="Chronological operational events" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="traffic-event-feed"><EventList events={data.events} /></div></DashboardPanel>
      </DashboardGrid>
      <DashboardPanel title="Data provider status" subtitle="Traffic sensor, camera and weather source health" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="traffic-provider-grid">{data.providers.map((provider) => <div className={`traffic-provider-row status-${provider.freshness === 'OFFLINE' ? 'unavailable' : provider.freshness === 'STALE' || provider.freshness === 'DEGRADED' ? 'warning' : 'ok'}`} key={provider.name}><div><strong>{provider.name}</strong><span>{provider.latency} latency</span></div><DataFreshnessIndicator freshness={provider.freshness} updatedAt={provider.latency} compact /><StatusIndicator status={provider.status} compact /></div>)}</div></DashboardPanel>
    </>
  )
}
