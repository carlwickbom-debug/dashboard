import type { DashboardDefinition } from '../../data/models'
import { createMockProvider } from '../../data/providers/mockProvider'
import { createAnomalyAwareProvider } from '../../data/anomalies/anomaly'
import { railAnomalyRules } from '../../data/anomalies/domainRules'
import { createRailProvider } from '../../data/providers/domainFactories'
import type { RailDataProvider } from '../../data/providers/contracts'
import { events } from '../../data/mock/mockData'
import { Rail, type RailData } from './Rail'

const data: RailData = {
  snapshot: { status: 'CRITICAL', health: 76, headline: 'Signal maintenance interruption active', updatedAt: '09:27 UTC', source: 'Nordic rail signal network', freshness: 'FRESH', summary: 'One section is operating on reduced capacity while the remainder remains serviceable.' },
  trains: [
    { id: 'R-104', line: 'Stockholm–Uppsala', route: 'Stockholm Central → Uppsala', status: 'MAJOR DELAY', delay: 17, speed: 72, progress: 68, nextStation: 'Västerås' },
    { id: 'R-218', line: 'Oslo–Bergen', route: 'Oslo S → Bergen', status: 'DELAY', delay: 8, speed: 89, progress: 43, nextStation: 'Lillestrøm' },
    { id: 'R-331', line: 'Helsinki–Tampere', route: 'Helsinki → Tampere', status: 'NORMAL', delay: 0, speed: 96, progress: 61, nextStation: 'Lahti' },
    { id: 'R-055', line: 'Copenhagen–Aarhus', route: 'Copenhagen → Aarhus', status: 'SERVICE DISRUPTION', delay: 24, speed: 54, progress: 29, nextStation: 'Roskilde' },
    { id: 'R-006', line: 'Reykjavík–København', route: 'Reykjavík → Copenhagen', status: 'NORMAL', delay: 0, speed: 101, progress: 18, nextStation: 'Bergen' },
  ],
  delayDistribution: [
    { state: 'NORMAL', count: 42 }, { state: 'DELAY', count: 8 }, { state: 'MAJOR DELAY', count: 3 }, { state: 'SERVICE DISRUPTION', count: 1 }, { state: 'INFRASTRUCTURE FAILURE', count: 1 },
  ],
  disruptions: [
    { id: 'd-1', line: 'Stockholm–Uppsala', type: 'INFRASTRUCTURE FAILURE', status: 'CRITICAL', severity: 'CRITICAL', start: '09:12 UTC', end: '10:15 UTC', description: 'Signal maintenance interruption on C-14; automatic protection is active.', location: 'C-14' },
    { id: 'd-2', line: 'Oslo–Bergen', type: 'MAJOR DELAY', status: 'WARNING', severity: 'HIGH', start: '08:41 UTC', end: '09:50 UTC', description: 'Route speed reduced to compensate for a freight train conflict.', location: 'Oslo approach' },
    { id: 'd-3', line: 'Copenhagen–Aarhus', type: 'SERVICE DISRUPTION', status: 'CRITICAL', severity: 'CRITICAL', start: '08:05 UTC', end: '09:30 UTC', description: 'Platform access temporarily restricted at Roskilde.', location: 'Roskilde platform' },
  ],
  stations: [
    { name: 'Stockholm Central', country: 'Sweden', trains: 24, arrivals: 18, status: 'WARNING' },
    { name: 'Oslo S', country: 'Norway', trains: 19, arrivals: 15, status: 'WARNING' },
    { name: 'Copenhagen H', country: 'Denmark', trains: 17, arrivals: 13, status: 'CRITICAL' },
    { name: 'Helsinki', country: 'Finland', trains: 13, arrivals: 10, status: 'OK' },
    { name: 'Reykjavík', country: 'Iceland', trains: 6, arrivals: 4, status: 'OK' },
  ],
  maintenance: [
    { id: 'M-14', line: 'Stockholm–Uppsala', time: '09:20–10:35 UTC', type: 'Signal replacement', status: 'ACTIVE' },
    { id: 'M-27', line: 'Oslo–Bergen', time: '10:40–12:15 UTC', type: 'Track inspection', status: 'PLANNED' },
    { id: 'M-08', line: 'Helsinki–Tampere', time: '11:00–13:00 UTC', type: 'Tunnel inspection', status: 'PLANNED' },
  ],
  incidents: [
    { id: 'i-1', title: 'Track circuit fault', location: 'C-14', severity: 'CRITICAL', time: '09:12 UTC', detail: 'Automatic protection engaged and the line was reduced to one track.' },
    { id: 'i-2', title: 'Signal indication mismatch', location: 'Oslo approach', severity: 'HIGH', time: '08:41 UTC', detail: 'A train entered the block under a stale indication.' },
  ],
  providers: [
    { name: 'RAIL SIGNAL NETWORK', freshness: 'FRESH', latency: '47 ms', status: 'OK' },
    { name: 'TRAIN LOCATION', freshness: 'LIVE', latency: '61 ms', status: 'OK' },
    { name: 'SCHEDULE FEED', freshness: 'DEGRADED', latency: '173 ms', status: 'WARNING' },
    { name: 'INFRASTRUCTURE SCADA', freshness: 'LIVE', latency: '55 ms', status: 'OK' },
  ],
  events: [
    { ...events.rail[0], country: 'Sweden', relatedDashboard: 'rail', latitude: 59.33, longitude: 18.07 },
    { id: 'rail-2', timestamp: '09:10 UTC', source: 'Rail control', country: 'Denmark', relatedDashboard: 'rail', category: 'Cancellation', severity: 'CRITICAL', title: 'Copenhagen platform access restricted', description: 'Route R-055 is operating from an alternate platform.', latitude: 55.68, longitude: 12.57 },
    { id: 'rail-3', timestamp: '08:41 UTC', source: 'Rail signal network', country: 'Norway', relatedDashboard: 'rail', category: 'Infrastructure', severity: 'HIGH', title: 'Signal indication mismatch', description: 'A stale signal indication required manual verification.', latitude: 59.91, longitude: 10.75 },
    { id: 'rail-4', timestamp: '08:02 UTC', source: 'Station telemetry', country: 'Finland', relatedDashboard: 'rail', category: 'Delay', severity: 'MEDIUM', title: 'Platform dwell time elevated', description: 'Passenger transfer time exceeded the normal operating threshold.', latitude: 60.17, longitude: 24.94 },
  ],
  mapLayers: [
    { id: 'rail-disruptions', label: 'Railway disruptions', color: '#e34b52', lines: [{ id: 'stockholm-uppsala', label: 'Stockholm–Uppsala', points: [{ id: 'stockholm', label: 'Stockholm', latitude: 59.33, longitude: 18.07, severity: 'CRITICAL' }, { id: 'uppsala', label: 'Uppsala', latitude: 59.9, longitude: 17.93, severity: 'CRITICAL' }], color: '#e34b52', width: 1.8 }, { id: 'oslo-bergen', label: 'Oslo–Bergen', points: [{ id: 'oslo', label: 'Oslo', latitude: 59.91, longitude: 10.75, severity: 'HIGH' }, { id: 'bergen', label: 'Bergen', latitude: 60.39, longitude: 5.32, severity: 'HIGH' }], color: '#e9894a', width: 1.4 }], points: [{ id: 'station-stockholm', label: 'Stockholm Central', latitude: 59.33, longitude: 18.07, severity: 'CRITICAL', detail: 'Infrastructure failure' }, { id: 'station-oslo', label: 'Oslo S', latitude: 59.91, longitude: 10.75, severity: 'HIGH', detail: 'Signal mismatch' }, { id: 'station-copenhagen', label: 'Copenhagen H', latitude: 55.68, longitude: 12.57, severity: 'CRITICAL', detail: 'Platform restriction' }] },
  ],
}

export const railProvider: DashboardDefinition<RailData, RailDataProvider> = { id: 'rail', name: 'RAIL', description: 'Train traffic, schedule adherence, infrastructure and service continuity.', icon: 'train', category: 'Mobility', component: Rail, enabled: true, provider: createRailProvider(createAnomalyAwareProvider({ id: 'rail', provider: createMockProvider('rail', data), rules: railAnomalyRules, thresholds: { delayMinutes: 10 } })) }
