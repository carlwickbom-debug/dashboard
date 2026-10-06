import type { DashboardDefinition } from '../../data/models'
import { createMockProvider } from '../../data/providers/mockProvider'
import { createAnomalyAwareProvider } from '../../data/anomalies/anomaly'
import { energyAnomalyRules } from '../../data/anomalies/domainRules'
import { events } from '../../data/mock/mockData'
import { Energy, type EnergyData } from './Energy'

const countries = [
  { country: 'Sweden', production: 18.4, consumption: 16.7, share: 26.9, status: 'WARNING' as const, delta: -2.4 },
  { country: 'Norway', production: 17.6, consumption: 14.8, share: 25.7, status: 'OK' as const, delta: 1.1 },
  { country: 'Denmark', production: 12.8, consumption: 13.1, share: 18.7, status: 'WARNING' as const, delta: -2.6 },
  { country: 'Finland', production: 11.3, consumption: 10.9, share: 16.5, status: 'OK' as const, delta: 0.4 },
  { country: 'Iceland', production: 7.6, consumption: 4.3, share: 11.1, status: 'OK' as const, delta: 3.2 },
]

const data: EnergyData = {
  snapshot: { status: 'WARNING', health: 92, headline: 'Generation reserve below forecast margin', updatedAt: '09:42 UTC', source: 'Nordic grid telemetry mesh', freshness: 'FRESH', summary: 'Generation is stable with reserve pressure in the northern corridor and a Denmark transmission constraint.' },
  countries,
  generation: [
    { type: 'Hydro', value: 19.4, share: 28.4, status: 'OK', detail: 'Reservoir and run-of-river' },
    { type: 'Wind', value: 28.6, share: 41.8, status: 'WARNING', detail: 'North Sea and Baltic capacity' },
    { type: 'Nuclear', value: 13.1, share: 19.2, status: 'OK', detail: 'Steady output' },
    { type: 'Solar', value: 4.8, share: 7.0, status: 'WARNING', detail: 'Daylight profile active' },
    { type: 'Thermal / Other', value: 2.8, share: 4.1, status: 'CRITICAL', detail: 'One regional unit unavailable' },
  ],
  production: [{ label: '00:00', value: 57.2 }, { label: '02:00', value: 58.7 }, { label: '04:00', value: 61.1 }, { label: '06:00', value: 63.8 }, { label: '08:00', value: 68.4 }, { label: '10:00', value: 69.1 }],
  consumption: [{ label: '00:00', value: 53.8 }, { label: '02:00', value: 55.4 }, { label: '04:00', value: 56.9 }, { label: '06:00', value: 60.6 }, { label: '08:00', value: 64.8 }, { label: '10:00', value: 67.2 }],
  imports: [{ country: 'Denmark', value: 4.2 }, { country: 'Finland', value: 2.1 }, { country: 'Iceland', value: 1.4 }],
  exports: [{ country: 'Sweden', value: 5.8 }, { country: 'Norway', value: 3.7 }],
  constraints: [
    { id: 'dc-1', name: 'Danish North-South corridor', flow: 11.8, limit: 12.0, status: 'WARNING', direction: 'Southbound', detail: 'Congestion at 98% of the operating limit.' },
    { id: 'dc-2', name: 'Sweden–Finland bridge', flow: 8.4, limit: 10.0, status: 'OK', direction: 'Northbound', detail: 'Within forecast operating envelope.' },
    { id: 'dc-3', name: 'Norwegian coastal transfer', flow: 9.7, limit: 9.5, status: 'CRITICAL', direction: 'Westbound', detail: 'Flow exceeds the approved transfer limit by 2.1 GW.' },
  ],
  events: [
    { ...events.energy[0], country: 'Norway', latitude: 59.91, longitude: 10.75 },
    { id: 'energy-2', timestamp: '09:10 UTC', source: 'System operator', country: 'Denmark', category: 'Transmission', severity: 'CRITICAL', title: 'North–South corridor congestion', description: 'Power flow exceeded the operating limit for six minutes.', latitude: 55.68, longitude: 12.57 },
    { id: 'energy-3', timestamp: '08:40 UTC', source: 'Generation control', country: 'Sweden', category: 'Generation', severity: 'HIGH', title: 'Wind output below expected', description: 'A 1.7 GW wind unit is unavailable due to a local outage.', latitude: 59.33, longitude: 18.07 },
    { id: 'energy-4', timestamp: '08:05 UTC', source: 'Frequency monitor', country: 'Finland', category: 'Stability', severity: 'MEDIUM', title: 'Frequency deviation detected', description: 'Frequency briefly reached 50.18 Hz before automatic response.', latitude: 60.17, longitude: 24.94 },
  ],
  providers: [
    { name: 'GRID TELEMETRY', freshness: 'LIVE', latency: '42 ms', status: 'OK' },
    { name: 'GENERATION CONTROL', freshness: 'FRESH', latency: '71 ms', status: 'OK' },
    { name: 'TRANSMISSION SCADA', freshness: 'DEGRADED', latency: '184 ms', status: 'WARNING' },
    { name: 'FREQUENCY MONITOR', freshness: 'LIVE', latency: '58 ms', status: 'OK' },
  ],
  mapLayers: [
    { id: 'energy-constraints', label: 'Transmission constraints', color: '#e34b52', points: [{ id: 'energy-constraint-1', label: 'Danish corridor', latitude: 55.68, longitude: 12.57, severity: 'HIGH', detail: '98% capacity' }, { id: 'energy-constraint-2', label: 'Norwegian coastal transfer', latitude: 59.91, longitude: 10.75, severity: 'CRITICAL', detail: 'Above approved limit' }], lines: [{ id: 'energy-line-1', label: 'North–South', points: [{ id: 'north', label: 'Norway', latitude: 59.91, longitude: 10.75, severity: 'LOW' }, { id: 'denmark', label: 'Denmark', latitude: 55.68, longitude: 12.57, severity: 'HIGH' }], color: '#e34b52', width: 1.4 }] },
    { id: 'energy-sites', label: 'Major generation sites', color: '#65d9c7', points: [{ id: 'hydro', label: 'Hydro station', latitude: 59.33, longitude: 18.07, severity: 'LOW', detail: '19.4 GW available' }, { id: 'wind', label: 'North Sea wind', latitude: 56.2, longitude: 10.5, severity: 'HIGH', detail: '1.7 GW outage' }, { id: 'nuclear', label: 'Nuclear site', latitude: 60.17, longitude: 24.94, severity: 'LOW', detail: '13.1 GW online' }, { id: 'solar', label: 'Northern solar array', latitude: 64.15, longitude: -21.94, severity: 'LOW', detail: '4.8 GW available' }] },
    { id: 'energy-events', label: 'Abnormal production', color: '#e4b94d', points: [{ id: 'energy-event-1', label: 'Wind output below expected', latitude: 59.33, longitude: 18.07, severity: 'HIGH', detail: 'Generation outage · Sweden' }, { id: 'energy-event-2', label: 'Frequency deviation', latitude: 60.17, longitude: 24.94, severity: 'MEDIUM', detail: '50.18 Hz · Finland' }, { id: 'energy-event-3', label: 'Transmission congestion', latitude: 55.68, longitude: 12.57, severity: 'CRITICAL', detail: 'North–South corridor' }] },
  ],
}

export const energyProvider: DashboardDefinition<EnergyData> = { id: 'energy', name: 'ENERGY', description: 'Generation, storage, grid stability and renewable capacity.', icon: 'zap', category: 'Infrastructure', component: Energy, enabled: true, provider: createAnomalyAwareProvider({ id: 'energy', provider: createMockProvider('energy', data), rules: energyAnomalyRules }) }
