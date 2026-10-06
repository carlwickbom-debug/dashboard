import type { DashboardDefinition, DashboardStatus, OperationalEvent } from '../../data/models'
import { aviationProvider } from '../aviation/provider'
import { cyberProvider } from '../cyber/provider'
import { datacentersProvider } from '../datacenters/provider'
import { energyProvider } from '../energy/provider'
import { maritimeProvider } from '../maritime/provider'
import { networksProvider } from '../networks/provider'
import { railProvider } from '../rail/provider'
import { trafficProvider } from '../traffic/provider'
import { Overview, type OverviewData, type OverviewEvent } from './Overview'

const domainProviders = [
  { id: 'energy', name: 'Energy', provider: energyProvider.provider },
  { id: 'rail', name: 'Rail', provider: railProvider.provider },
  { id: 'traffic', name: 'Road Traffic', provider: trafficProvider.provider },
  { id: 'datacenters', name: 'Data Centers', provider: datacentersProvider.provider },
  { id: 'aviation', name: 'Aviation', provider: aviationProvider.provider },
  { id: 'maritime', name: 'Maritime', provider: maritimeProvider.provider },
  { id: 'networks', name: 'Networks', provider: networksProvider.provider },
  { id: 'cyber', name: 'Cyber Security', provider: cyberProvider.provider },
]

const countries = [
  { country: 'Sweden', status: 'WARNING' as const, activeEvents: 2, criticalEvents: 1, freshness: 'FRESH' as const, affectedDomains: ['Rail', 'Energy'] },
  { country: 'Norway', status: 'CRITICAL' as const, activeEvents: 1, criticalEvents: 1, freshness: 'STALE' as const, affectedDomains: ['Data Centers'] },
  { country: 'Denmark', status: 'OK' as const, activeEvents: 1, criticalEvents: 0, freshness: 'LIVE' as const, affectedDomains: ['Energy'] },
  { country: 'Finland', status: 'OK' as const, activeEvents: 1, criticalEvents: 0, freshness: 'FRESH' as const, affectedDomains: ['Networks'] },
  { country: 'Iceland', status: 'OK' as const, activeEvents: 0, criticalEvents: 0, freshness: 'DEGRADED' as const, affectedDomains: [] },
]

const infrastructure = [
  { domain: 'Energy', status: 'WARNING' as const, activeEvents: 1, updatedAt: '09:42 UTC', freshness: 'FRESH' as const },
  { domain: 'Rail', status: 'CRITICAL' as const, activeEvents: 1, updatedAt: '09:27 UTC', freshness: 'STALE' as const },
  { domain: 'Road Traffic', status: 'WARNING' as const, activeEvents: 1, updatedAt: '09:18 UTC', freshness: 'DEGRADED' as const },
  { domain: 'Data Centers', status: 'WARNING' as const, activeEvents: 1, updatedAt: '08:54 UTC', freshness: 'FRESH' as const },
  { domain: 'Aviation', status: 'WARNING' as const, activeEvents: 1, updatedAt: '09:05 UTC', freshness: 'FRESH' as const },
  { domain: 'Maritime', status: 'CRITICAL' as const, activeEvents: 1, updatedAt: '08:41 UTC', freshness: 'STALE' as const },
  { domain: 'Networks', status: 'WARNING' as const, activeEvents: 1, updatedAt: '09:31 UTC', freshness: 'OFFLINE' as const },
  { domain: 'Cyber Security', status: 'CRITICAL' as const, activeEvents: 1, updatedAt: '09:36 UTC', freshness: 'LIVE' as const },
]

const data: OverviewData = {
  snapshot: { status: 'WARNING', health: 93, headline: 'Northern Europe operations within tolerance', updatedAt: '09:42 UTC', source: 'Regional intelligence mesh', freshness: 'FRESH', metrics: [{ label: 'Active systems', value: '1,284', change: '+18', trend: 'up', detail: 'Across eight domains' }, { label: 'Critical conditions', value: '03', change: '-2', trend: 'down', detail: 'Requires command review' }, { label: 'Data latency', value: '84 ms', change: '+6 ms', trend: 'up', detail: 'P95 across edge nodes' }, { label: 'Coverage', value: '99.8%', change: 'steady', trend: 'steady', detail: 'Five Nordic regions' }], events: [], summary: 'Three active conditions require command attention across the Nordic region.' },
  countries,
  infrastructure,
  events: [],
  providers: [
    { name: 'ENERGY API', freshness: 'LIVE' }, { name: 'RAIL API', freshness: 'LIVE' }, { name: 'TRAFFIC API', freshness: 'DEGRADED' },
    { name: 'DATACENTER FEED', freshness: 'LIVE' }, { name: 'AVIATION FEED', freshness: 'LIVE' }, { name: 'MARITIME FEED', freshness: 'STALE' },
    { name: 'NETWORK TELEMETRY', freshness: 'OFFLINE' }, { name: 'CYBER FEED', freshness: 'LIVE' },
  ],
}

async function aggregateEvents(load: 'load' | 'refresh'): Promise<OverviewData> {
  const domainData = await Promise.all(domainProviders.map(async (entry) => ({
    entry,
    data: await entry.provider[load]() as { events?: OperationalEvent[] },
  })))
  const events: OverviewEvent[] = domainData.flatMap(({ entry, data: domain }) => (domain.events ?? []).map((event) => ({
    ...event,
    relatedDashboard: event.relatedDashboard ?? entry.id,
    domain: entry.name,
  })))
  const uniqueEvents = [...new Map(events.map((event) => [event.id, event])).values()]
  const countries = data.countries.map((country) => {
    const related = uniqueEvents.filter((event) => event.country === country.country)
    return { ...country, activeEvents: related.length, criticalEvents: related.filter((event) => event.severity === 'CRITICAL').length, affectedDomains: [...new Set(related.map((event) => event.domain))] }
  })
  const infrastructure = data.infrastructure.map((item) => {
    const dashboardId = domainProviders.find((entry) => entry.name === item.domain)?.id
    const related = uniqueEvents.filter((event) => event.relatedDashboard === dashboardId)
    const status: DashboardStatus = related.some((event) => event.severity === 'CRITICAL') ? 'CRITICAL' : related.some((event) => event.severity === 'HIGH') ? 'WARNING' : 'OK'
    return { ...item, activeEvents: related.length, status }
  })
  return { ...data, snapshot: { ...data.snapshot, events: uniqueEvents, updatedAt: new Date().toISOString(), summary: `${uniqueEvents.length} normalized operational events across ${domainProviders.length} domains.` }, countries, infrastructure, events: uniqueEvents }
}

export const overviewProvider: DashboardDefinition<OverviewData> = {
  id: 'overview', name: 'OVERVIEW', description: 'Consolidated operational posture across all monitored systems.', icon: 'activity', category: 'Mission control', component: Overview, enabled: true,
  provider: { load: () => aggregateEvents('load'), refresh: () => aggregateEvents('refresh') },
}
