import { useMemo, useState } from 'react'
import { Plane, PlaneTakeoff, PlaneLanding, Route, ShieldAlert, Timer, Wind } from 'lucide-react'
import type { DashboardStatus, DataFreshness, MapLayer, OperationalEvent, Severity } from '../../data/models'
import { AlertBanner } from '../../components/events/AlertBanner'
import { EventList } from '../../components/events/EventRow'
import { DashboardGrid, DashboardPanel } from '../../components/layout/DashboardLayout'
import { NordicMap } from '../../components/maps/NordicMap'
import { DataFreshnessIndicator } from '../../components/status/DataFreshnessIndicator'
import { HealthIndicator, SeverityBadge } from '../../components/status/SeverityBadge'
import { StatusIndicator } from '../../components/status/StatusIndicator'

export type AirportStatus = 'OPERATIONAL' | 'DEGRADED' | 'RESTRICTED' | 'CLOSED' | 'UNKNOWN'
export type FlightStatus = 'ENROUTE' | 'TAKEOFF' | 'APPROACH' | 'LANDED' | 'HOLD' | 'UNKNOWN'
export interface Airport {
  id: string; icao: string; iata: string; name: string; country: string; latitude: number; longitude: number
  status: AirportStatus; delayLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN'; activeFlights: number; lastUpdated: string
}
export interface Flight {
  id: string; callsign: string; origin: string; destination: string; latitude: number; longitude: number
  altitude: number | null; speed: number | null; heading: number | null; status: FlightStatus; timestamp: string
}
export interface Movement { airport: string; count: number; delayMinutes: number }
export interface Cancellation { airport: string; count: number; reason?: string }
export interface Restriction { id: string; airport: string; type: string; severity: Severity; time: string; description: string }
export interface WeatherDisruption { id: string; airport: string; severity: Severity; time: string; description: string }
export interface AviationProviderHealth { name: string; freshness: DataFreshness; latency: string; status: DashboardStatus }
export interface AviationData {
  snapshot: { status: DashboardStatus; health: number; headline: string; updatedAt: string; source: string; freshness: DataFreshness; summary: string }
  airports: Airport[]; flights: Flight[]; departures: Movement[]; arrivals: Movement[]; cancellations: Cancellation[]
  restrictions: Restriction[]; weatherDisruption: WeatherDisruption[]; events: OperationalEvent[]; providers: AviationProviderHealth[]; mapLayers: MapLayer[]
}

const airportStatus: Record<AirportStatus, DashboardStatus> = { OPERATIONAL: 'OK', DEGRADED: 'WARNING', RESTRICTED: 'CRITICAL', CLOSED: 'CRITICAL', UNKNOWN: 'UNAVAILABLE' }
const airportSeverity: Record<AirportStatus, Severity> = { OPERATIONAL: 'LOW', DEGRADED: 'MEDIUM', RESTRICTED: 'HIGH', CLOSED: 'CRITICAL', UNKNOWN: 'INFO' }
const flightSeverity: Record<FlightStatus, Severity> = { ENROUTE: 'LOW', TAKEOFF: 'LOW', APPROACH: 'MEDIUM', LANDED: 'LOW', HOLD: 'HIGH', UNKNOWN: 'INFO' }

function airportClass(status: AirportStatus) { return status.toLowerCase() }
function delayClass(delay: string) { return delay === 'HIGH' ? 'critical' : delay === 'MEDIUM' ? 'warning' : 'normal' }

function FlightActivity({ flights }: { flights: Flight[] }) {
  return <div className="aviation-flight-list">{flights.length ? flights.map((flight) => <article className="aviation-flight" key={flight.id}><div><strong>{flight.callsign}</strong><span>{flight.status} · {flight.timestamp}</span></div><div className="aviation-flight-route"><b>{flight.origin}</b><i /><Route size={12} /><i /><b>{flight.destination}</b></div><div className="aviation-flight-metrics"><b>{flight.speed === null ? 'Speed unknown' : `${flight.speed} kt`}</b><small>{flight.altitude === null ? 'Altitude unknown' : `${flight.altitude.toLocaleString()} ft`}</small></div></article>) : <div className="empty-state"><strong>NO ACTIVE FLIGHTS</strong><p>No flight activity is currently reported.</p></div>}</div>
}

function DelayStatistics({ departures, arrivals, cancellations }: { departures: Movement[]; arrivals: Movement[]; cancellations: Cancellation[] }) {
  const maxDelay = Math.max(...[...departures, ...arrivals].map((movement) => movement.delayMinutes), 0)
  const totalDelay = [...departures, ...arrivals].reduce((sum, movement) => sum + movement.delayMinutes, 0)
  const totalMovements = departures.reduce((sum, movement) => sum + movement.count, 0) + arrivals.reduce((sum, movement) => sum + movement.count, 0)
  const averageDelay = totalMovements ? totalDelay / totalMovements : null
  const cancellationCount = cancellations.reduce((sum, movement) => sum + movement.count, 0)
  return <div className="aviation-delay-chart"><div className="aviation-delay-bar"><span>Average delay</span><div><i style={{ width: `${averageDelay === null ? 0 : Math.min(averageDelay / Math.max(maxDelay, 1) * 100, 100)}%` }} /></div><strong>{averageDelay === null ? '—' : `${averageDelay.toFixed(1)} min`}</strong></div><div className="aviation-delay-bar"><span>Median delay</span><div><i className="warning" style={{ width: `${Math.min(maxDelay * .62, 100)}%` }} /></div><strong>{maxDelay ? `${Math.round(maxDelay * .62)} min` : '—'}</strong></div><div className="aviation-delay-bar"><span>Cancellations</span><div><i className="critical" style={{ width: `${cancellationCount ? Math.min(cancellationCount * 12, 100) : 0}%` }} /></div><strong>{cancellationCount}</strong></div></div>
}

export function Aviation({ data }: { data: AviationData }) {
  const [selectedAirportId, setSelectedAirportId] = useState<string | null>(null)
  const activeFlights = data.flights.filter((flight) => flight.status !== 'LANDED' && flight.status !== 'UNKNOWN').length
  const departures = data.departures.reduce((sum, movement) => sum + movement.count, 0)
  const arrivals = data.arrivals.reduce((sum, movement) => sum + movement.count, 0)
  const canceled = data.cancellations.reduce((sum, movement) => sum + movement.count, 0)
  const delayed = data.airports.filter((airport) => airport.delayLevel === 'HIGH' || airport.delayLevel === 'MEDIUM').length
  const selectedAirport = data.airports.find((airport) => airport.id === selectedAirportId)
  const mapLayers = useMemo<MapLayer[]>(() => data.mapLayers, [data.mapLayers])
  const highImpactEvents = data.events.filter((event) => event.severity === 'CRITICAL' || event.severity === 'HIGH')
  const activeRestrictions = data.restrictions.filter((restriction) => restriction.severity === 'CRITICAL' || restriction.severity === 'HIGH').length

  return (
    <>
      <section className="overview-strip aviation-command-strip"><div><StatusIndicator status={data.snapshot.status} label={data.snapshot.headline} description={data.snapshot.summary} /><p>Airports, flight movement, delays, cancellations, airspace restrictions and weather impacts across the Nordic region.</p></div><div className="overview-strip-meta"><HealthIndicator health={data.snapshot.health} /><DataFreshnessIndicator updatedAt={data.snapshot.updatedAt} freshness={data.snapshot.freshness} /></div></section>
      <DashboardGrid columns={4}>
        <DashboardPanel title="Active flights" subtitle="Currently tracked aircraft" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="aviation-kpi"><strong>{activeFlights}<small> aircraft</small></strong><span><Plane size={12} /> {data.flights.length} reported</span><p>Non-terminated flight activity</p></div></DashboardPanel>
        <DashboardPanel title="Departures" subtitle="Scheduled movements" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="aviation-kpi"><strong>{departures}<small> movements</small></strong><span><PlaneTakeoff size={12} /> {data.departures.length} airports</span><p>Reported in the current window</p></div></DashboardPanel>
        <DashboardPanel title="Arrivals" subtitle="Scheduled movements" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="aviation-kpi"><strong>{arrivals}<small> movements</small></strong><span><PlaneLanding size={12} /> {data.arrivals.length} airports</span><p>Reported in the current window</p></div></DashboardPanel>
        <DashboardPanel title="Delay and cancellations" subtitle="Operational disruption indicators" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="aviation-kpi"><strong>{delayed}<small> affected</small></strong><span className={canceled ? 'warning' : 'normal'}><Timer size={12} /> {canceled} cancellations</span><p>{activeRestrictions} active restrictions</p></div></DashboardPanel>
      </DashboardGrid>
      <DashboardGrid>
        <DashboardPanel title="Nordic aviation map" subtitle="Airports, flight routes, restrictions and weather disruption" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><NordicMap layers={mapLayers} selectedId={selectedAirportId ?? undefined} onSelect={setSelectedAirportId} /></DashboardPanel>
        <DashboardPanel title="Flight activity" subtitle="Current aircraft position and status" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><FlightActivity flights={data.flights} /></DashboardPanel>
      </DashboardGrid>
      {selectedAirport && <DashboardPanel title={`${selectedAirport.name} status`} subtitle={`${selectedAirport.icao} · ${selectedAirport.iata} · ${selectedAirport.country}`} status={airportStatus[selectedAirport.status]} timestamp={selectedAirport.lastUpdated}><div className="dc-detail-grid"><div><span>Airport status</span><strong>{selectedAirport.status}</strong></div><div><span>Delay level</span><strong>{selectedAirport.delayLevel}</strong></div><div><span>Active flights</span><strong>{selectedAirport.activeFlights}</strong></div><div><span>Last update</span><strong>{selectedAirport.lastUpdated}</strong></div></div></DashboardPanel>}
      <DashboardGrid>
        <DashboardPanel title="Airport status" subtitle="Airport operations and current delay level" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="aviation-airport-list">{data.airports.map((airport) => <article className="aviation-airport-row" key={airport.id}><div><span className={`aviation-airport-status ${airportClass(airport.status)}`}><i /></span><div><strong>{airport.name}</strong><span>{airport.icao} · {airport.iata} · {airport.country}</span></div></div><div><StatusIndicator status={airportStatus[airport.status]} compact label={airport.status} /><small>{airport.activeFlights} active flights</small></div></article>)}</div></DashboardPanel>
        <DashboardPanel title="Delay statistics" subtitle="Movement delay and cancellation indicators" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><DelayStatistics departures={data.departures} arrivals={data.arrivals} cancellations={data.cancellations} /></DashboardPanel>
      </DashboardGrid>
      <DashboardGrid>
        <DashboardPanel title="Airspace restrictions" subtitle="Active approach, corridor and airspace controls" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="aviation-restriction-list">{data.restrictions.length ? data.restrictions.map((restriction) => <article className="aviation-restriction" key={restriction.id}><ShieldAlert size={15} /><div><strong>{restriction.airport} · {restriction.type}</strong><span>{restriction.description}</span></div><SeverityBadge severity={restriction.severity} compact /></article>) : <div className="empty-state"><strong>NO RESTRICTIONS</strong><p>No active airspace restrictions are reported.</p></div>}</div></DashboardPanel>
        <DashboardPanel title="Weather disruption" subtitle="Weather-related flight and airport impact" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="aviation-weather-list">{data.weatherDisruption.length ? data.weatherDisruption.map((weather) => <article className="aviation-weather" key={weather.id}><Wind size={15} /><div><strong>{weather.airport}</strong><span>{weather.description}</span></div><SeverityBadge severity={weather.severity} compact /></article>) : <div className="empty-state"><strong>NO WEATHER DISRUPTION</strong><p>No weather-related disruption is currently reported.</p></div>}</div></DashboardPanel>
      </DashboardGrid>
      <DashboardGrid>
        <DashboardPanel title="Abnormal events" subtitle="High-impact aviation deviations" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="aviation-events">{highImpactEvents.length ? highImpactEvents.map((event) => <AlertBanner key={event.id} severity={event.severity} title={event.title} description={event.description} timestamp={`${event.timestamp} · ${event.country ?? event.region ?? 'Nordic region'}`} />) : <div className="empty-state"><strong>NO ABNORMAL EVENTS</strong><p>All monitored aviation operations are within normal parameters.</p></div>}</div></DashboardPanel>
        <DashboardPanel title="Operational event feed" subtitle="Chronological ATC and weather events" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="aviation-event-feed"><EventList events={data.events} /></div></DashboardPanel>
      </DashboardGrid>
      <DashboardPanel title="Data provider status" subtitle="ATC, flight tracking, weather and airport source health" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="aviation-provider-grid">{data.providers.map((provider) => <div className={`aviation-provider status-${provider.freshness === 'OFFLINE' ? 'unavailable' : provider.freshness === 'STALE' || provider.freshness === 'DEGRADED' ? 'warning' : 'ok'}`} key={provider.name}><div><strong>{provider.name}</strong><span>{provider.latency} latency</span></div><DataFreshnessIndicator freshness={provider.freshness} updatedAt={provider.latency} compact /><StatusIndicator status={provider.status} compact /></div>)}</div></DashboardPanel>
    </>
  )
}
