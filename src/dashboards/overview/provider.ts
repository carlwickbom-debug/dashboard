import type { DashboardDefinition } from '../../data/models'
import { createMockProvider } from '../../data/providers/mockProvider'
import { events } from '../../data/mock/mockData'
import { Overview, type OverviewData, type OverviewEvent } from './Overview'

const overviewEvents: OverviewEvent[] = [
  { ...events.energy[0], domain: 'Energy' }, { ...events.rail[0], domain: 'Rail' }, { ...events.traffic[0], domain: 'Road Traffic' },
  { ...events.datacenters[0], domain: 'Data Centers' }, { ...events.aviation[0], domain: 'Aviation' }, { ...events.maritime[0], domain: 'Maritime' },
  { ...events.networks[0], domain: 'Networks' }, { ...events.cyber[0], domain: 'Cyber Security' },
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
  snapshot: { status: 'WARNING', health: 93, headline: 'Northern Europe operations within tolerance', updatedAt: '09:42 UTC', source: 'Regional intelligence mesh', freshness: 'FRESH', metrics: [{ label: 'Active systems', value: '1,284', change: '+18', trend: 'up', detail: 'Across eight domains' }, { label: 'Critical conditions', value: '03', change: '-2', trend: 'down', detail: 'Requires command review' }, { label: 'Data latency', value: '84 ms', change: '+6 ms', trend: 'up', detail: 'P95 across edge nodes' }, { label: 'Coverage', value: '99.8%', change: 'steady', trend: 'steady', detail: 'Five Nordic regions' }], events: overviewEvents, summary: 'Three active conditions require command attention across the Nordic region.' },
  countries,
  infrastructure,
  events: overviewEvents,
  providers: [
    { name: 'ENERGY API', freshness: 'LIVE' }, { name: 'RAIL API', freshness: 'LIVE' }, { name: 'TRAFFIC API', freshness: 'DEGRADED' },
    { name: 'DATACENTER FEED', freshness: 'LIVE' }, { name: 'AVIATION FEED', freshness: 'LIVE' }, { name: 'MARITIME FEED', freshness: 'STALE' },
    { name: 'NETWORK TELEMETRY', freshness: 'OFFLINE' }, { name: 'CYBER FEED', freshness: 'LIVE' },
  ],
}

export const overviewProvider: DashboardDefinition<OverviewData> = { id: 'overview', name: 'OVERVIEW', description: 'Consolidated operational posture across all monitored systems.', icon: 'activity', category: 'Mission control', component: Overview, enabled: true, provider: createMockProvider<OverviewData>('overview', data) }
