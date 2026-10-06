import { useMemo, useState } from 'react'
import type { DashboardSnapshot, DataFreshness, OperationalEvent } from '../../data/models'
import { DashboardGrid, DashboardPanel } from '../../components/layout/DashboardLayout'
import { AlertBanner } from '../../components/events/AlertBanner'
import { EventRow } from '../../components/events/EventRow'
import { FilterBar } from '../../components/controls/FilterBar'
import { NordicMap } from '../../components/maps/NordicMap'
import { DataFreshnessIndicator } from '../../components/status/DataFreshnessIndicator'
import { SeverityBadge } from '../../components/status/SeverityBadge'
import { StatusIndicator } from '../../components/status/StatusIndicator'

export interface OverviewEvent extends OperationalEvent { domain: string }
export interface CountryStatus { country: string; status: DashboardSnapshot['status']; activeEvents: number; criticalEvents: number; freshness: DataFreshness; affectedDomains: string[] }
export interface InfrastructureStatus { domain: string; status: DashboardSnapshot['status']; activeEvents: number; updatedAt: string; freshness: DataFreshness }
export interface ProviderHealth { name: string; freshness: DataFreshness }
export interface OverviewData { snapshot: DashboardSnapshot; countries: CountryStatus[]; infrastructure: InfrastructureStatus[]; events: OverviewEvent[]; providers: ProviderHealth[] }

const countryCoordinates: Record<string, { latitude: number; longitude: number }> = {
  Sweden: { latitude: 59.33, longitude: 18.07 }, Norway: { latitude: 59.91, longitude: 10.75 }, Denmark: { latitude: 55.68, longitude: 12.57 }, Finland: { latitude: 60.17, longitude: 24.94 }, Iceland: { latitude: 64.15, longitude: -21.94 },
}
const filterOptions = ['All', 'Energy', 'Rail', 'Road', 'Data Centers', 'Aviation', 'Maritime', 'Networks', 'Cyber']

function dominantStatus(events: OverviewEvent[]): DashboardSnapshot['status'] {
  if (events.some((event) => event.severity === 'CRITICAL')) return 'CRITICAL'
  if (events.some((event) => event.severity === 'HIGH')) return 'WARNING'
  return 'OK'
}

function providerStatus(freshness: DataFreshness): DashboardSnapshot['status'] {
  return freshness === 'OFFLINE' ? 'UNAVAILABLE' : freshness === 'STALE' || freshness === 'DEGRADED' ? 'WARNING' : 'OK'
}

export function Overview({ data }: { data: OverviewData }) {
  const [activeFilter, setActiveFilter] = useState('All')
  const criticalEvents = useMemo(() => data.events.filter((event) => event.severity === 'CRITICAL').sort((left, right) => left.timestamp.localeCompare(right.timestamp)), [data.events])
  const filteredEvents = useMemo(() => data.events.filter((event) => activeFilter === 'All' || event.domain === activeFilter || (activeFilter === 'Road' && event.domain === 'Road Traffic')), [activeFilter, data.events])
  const mapEvents = useMemo(() => filteredEvents.map((event) => ({ id: event.id, label: event.title, latitude: countryCoordinates[event.country ?? 'Sweden'].latitude, longitude: countryCoordinates[event.country ?? 'Sweden'].longitude, severity: event.severity, detail: `${event.domain} · ${event.country}` })), [filteredEvents])
  const totalActive = data.events.length
  const overallStatus = dominantStatus(data.events)

  return (
    <>
      <section className="overview-strip overview-command-strip"><div><StatusIndicator status={overallStatus} label="Nordic overall status" description={data.snapshot.summary} /><p>Targeted operational conditions across five Nordic countries and eight infrastructure domains.</p></div><div className="overview-strip-meta"><span className="overview-event-count"><strong>{totalActive}</strong> ACTIVE EVENTS</span><DataFreshnessIndicator updatedAt={data.snapshot.updatedAt} freshness={data.snapshot.freshness} /></div></section>
      <DashboardGrid>
        <DashboardPanel title="Nordic overall status" subtitle="Regional command posture" status={overallStatus} timestamp={data.snapshot.updatedAt}>
          <div className="country-overview-grid">{data.countries.map((country) => <article className={`country-overview-card status-${country.status.toLowerCase()}`} key={country.country}><div><span>{country.country}</span><StatusIndicator status={country.status} compact /></div><strong>{country.activeEvents}<small> active events</small></strong><p>{country.criticalEvents} critical · {country.affectedDomains.length} domains affected</p><DataFreshnessIndicator freshness={country.freshness} updatedAt={country.freshness === 'LIVE' ? 'Live' : country.freshness} compact /></article>)}</div>
        </DashboardPanel>
        <DashboardPanel title="Infrastructure status" subtitle="Domain readiness and latest telemetry" status={overallStatus} timestamp={data.snapshot.updatedAt}>
          <div className="infrastructure-grid">{data.infrastructure.map((item) => <article className={`infrastructure-tile status-${item.status.toLowerCase()}`} key={item.domain}><div><strong>{item.domain}</strong><SeverityBadge severity={item.status === 'CRITICAL' ? 'CRITICAL' : item.status === 'WARNING' ? 'HIGH' : 'LOW'} compact /></div><span>{item.activeEvents} active events</span><time>{item.updatedAt}</time><DataFreshnessIndicator freshness={item.freshness} updatedAt={item.updatedAt} compact /></article>)}</div>
        </DashboardPanel>
      </DashboardGrid>

      <DashboardGrid>
        <DashboardPanel title="Nordic map" subtitle="Abnormal events by severity" status={overallStatus} timestamp={data.snapshot.updatedAt} toolbar={<FilterBar filters={filterOptions} active={activeFilter} onChange={setActiveFilter} />}>
          <NordicMap layers={[{ id: 'overview-events', label: 'Abnormal events', color: '#e34b52', points: mapEvents }]} />
        </DashboardPanel>
        <DashboardPanel title="Active critical events" subtitle="Immediate command attention" status="CRITICAL" timestamp={data.snapshot.updatedAt}>
          <div className="critical-event-list">{criticalEvents.length ? criticalEvents.map((event) => <AlertBanner key={event.id} severity={event.severity} title={event.title} description={event.description} timestamp={`${event.timestamp} · ${event.country ?? 'Nordic region'} · ${event.domain}`} />) : <div className="empty-state"><strong>NO CRITICAL EVENTS</strong><p>All monitored conditions are within normal operating parameters.</p></div>}</div>
        </DashboardPanel>
      </DashboardGrid>

      <DashboardGrid>
        <DashboardPanel title="Country status" subtitle="Five-country operational posture" status={overallStatus} timestamp={data.snapshot.updatedAt}>
          <div className="country-status-list">{data.countries.map((country) => <div className="country-status-row" key={country.country}><div className="country-name"><span>{country.country}</span><small>{country.affectedDomains.join(', ') || 'No domains affected'}</small></div><div className="country-counts"><span><strong>{country.activeEvents}</strong> active</span><span><strong>{country.criticalEvents}</strong> critical</span></div><DataFreshnessIndicator freshness={country.freshness} updatedAt={country.freshness === 'LIVE' ? 'Live' : country.freshness} compact /><StatusIndicator status={country.status} compact /></div>)}</div>
        </DashboardPanel>
        <DashboardPanel title="Cross-domain events" subtitle="Newest first · chronological operating feed" status={overallStatus} timestamp={data.snapshot.updatedAt}>
          <div className="overview-event-feed">{filteredEvents.length ? filteredEvents.map((event) => <EventRow key={event.id} event={event} />) : <div className="empty-state"><strong>NO EVENTS IN RANGE</strong><p>No abnormal conditions match the selected domain.</p></div>}</div>
        </DashboardPanel>
      </DashboardGrid>

      <DashboardPanel title="Data source health" subtitle="Underlying provider availability and freshness" status={overallStatus} timestamp={data.snapshot.updatedAt}>
        <div className="provider-health-grid">{data.providers.map((provider) => <div className={`provider-health-row status-${providerStatus(provider.freshness).toLowerCase()}`} key={provider.name}><span className="provider-name">{provider.name}</span><DataFreshnessIndicator freshness={provider.freshness} updatedAt={provider.freshness} compact /><StatusIndicator status={providerStatus(provider.freshness)} compact /></div>)}</div>
      </DashboardPanel>
    </>
  )
}
