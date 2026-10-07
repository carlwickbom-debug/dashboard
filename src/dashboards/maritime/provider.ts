import type { DashboardDefinition } from '../../data/models'
import { createMockProvider } from '../../data/providers/mockProvider'
import { createAnomalyAwareProvider } from '../../data/anomalies/anomaly'
import { maritimeAnomalyRules } from '../../data/anomalies/domainRules'
import { createMaritimeProvider } from '../../data/providers/domainFactories'
import type { MaritimeDataProvider } from '../../data/providers/contracts'
import { events } from '../../data/mock/mockData'
import { Maritime, type MaritimeData } from './Maritime'

const data: MaritimeData = {
  snapshot: { status: 'CRITICAL', health: 73, headline: 'Navigation aid unavailable on port channel', updatedAt: '08:41 UTC', source: 'Port and vessel telemetry', freshness: 'OFFLINE', summary: 'Vessel traffic is restricted while the affected navigation beacon is restored.' },
  vessels: [
    { id: 'vessel-1', mmsi: '257088290', name: 'Nordic Star', type: 'Bulk carrier', flag: 'Sweden', latitude: 57.71, longitude: 12.01, speed: 14.2, heading: 88, destination: 'Stockholm', status: 'ENROUTE', timestamp: '08:41 UTC' },
    { id: 'vessel-2', mmsi: '257088291', name: 'Helsinki Grace', type: 'Container ship', flag: 'Finland', latitude: 60.17, longitude: 24.94, speed: 18.5, heading: 205, destination: 'Oslo', status: 'AT PORT', timestamp: '08:39 UTC' },
    { id: 'vessel-3', mmsi: '257088292', name: 'Northwind', type: 'Fishing vessel', flag: 'Norway', latitude: 65.08, longitude: 12.66, speed: 9.4, heading: 134, destination: 'Bergen', status: 'ANCHORING', timestamp: '08:37 UTC' },
  ],
  vesselDensity: [{ region: 'Gulf of Bothnia', value: 84, status: 'HIGH' }, { region: 'North Sea', value: 67, status: 'HIGH' }, { region: 'Skagerrak', value: 31, status: 'NORMAL' }, { region: 'Kattegat', value: 19, status: 'LOW' }, { region: 'Baltic Sea', value: 46, status: 'NORMAL' }],
  ports: [
    { id: 'port-gothenburg', name: 'Göteborg Port', country: 'Sweden', latitude: 57.71, longitude: 12.01, status: 'RESTRICTED', channel: 'Outer channel', capacity: 61, lastUpdated: '08:41 UTC' },
    { id: 'port-oslo', name: 'Oslo Port', country: 'Norway', latitude: 59.91, longitude: 10.75, status: 'OPERATIONAL', channel: 'East basin', capacity: 82, lastUpdated: '08:38 UTC' },
    { id: 'port-helsinki', name: 'Helsinki Port', country: 'Finland', latitude: 60.17, longitude: 24.94, status: 'DEGRADED', channel: 'North terminal', capacity: 73, lastUpdated: '08:35 UTC' },
  ],
  shippingLanes: [
    { id: 'lane-gothenburg', name: 'Göteborg channel', from: 'Göteborg', to: 'Trollhättan', severity: 'CRITICAL', status: 'RESTRICTED', description: 'Navigation beacon unavailable.' },
    { id: 'lane-north-sea', name: 'North Sea route', from: 'Oslo', to: 'Skagerrak', severity: 'LOW', status: 'OPEN', description: 'Standard traffic corridor.' },
    { id: 'lane-baltic', name: 'Baltic route', from: 'Helsinki', to: 'Stockholm', severity: 'MEDIUM', status: 'RESTRICTED', description: 'Temporary traffic speed limit.' },
  ],
  incidents: [{ id: 'incident-1', title: 'Navigation aid unavailable', location: 'Göteborg channel', severity: 'CRITICAL', time: '08:41 UTC', type: 'Navigation', detail: 'Port channel beacon is offline.' }, { id: 'incident-2', title: 'Terminal traffic queue', location: 'Helsinki Port', severity: 'MEDIUM', time: '08:35 UTC', type: 'Port congestion', detail: 'Container traffic is operating above the normal queue threshold.' }],
  abnormalEvents: [{ id: 'abnormal-1', timestamp: '08:39 UTC', source: 'AIS anomaly detector', country: 'Sweden', category: 'Behavior', severity: 'HIGH', title: 'Unexpected speed change', description: 'Vessel speed changed by 8 knots over 90 seconds.', latitude: 57.71, longitude: 12.01, relatedDashboard: 'maritime' }],
  events: [{ ...events.maritime[0], country: 'Sweden', latitude: 57.71, longitude: 12.01, relatedDashboard: 'maritime' }, { id: 'maritime-event-2', timestamp: '08:35 UTC', source: 'Port operations', country: 'Finland', category: 'Port', severity: 'MEDIUM', title: 'Terminal queue threshold exceeded', description: 'Helsinki Port traffic queue is above baseline.', latitude: 60.17, longitude: 24.94, relatedDashboard: 'maritime' }],
  providers: [{ name: 'AIS FEED', freshness: 'OFFLINE', latency: 'Unavailable', status: 'UNAVAILABLE' }, { name: 'PORT TELEMETRY', freshness: 'FRESH', latency: '98 ms', status: 'OK' }, { name: 'NAVIGATION STATUS', freshness: 'STALE', latency: '184 ms', status: 'WARNING' }],
  mapLayers: [{ id: 'maritime-routes', label: 'Shipping lanes', color: '#56c7a5', lines: [{ id: 'lane-gothenburg', label: 'Göteborg channel', points: [{ id: 'port-gothenburg', label: 'Göteborg Port', latitude: 57.71, longitude: 12.01, severity: 'CRITICAL' }, { id: 'port-stockholm', label: 'Stockholm Harbor', latitude: 59.33, longitude: 18.07, severity: 'LOW' }], color: '#e34b52', width: 2 }], points: [{ id: 'port-gothenburg', label: 'Göteborg Port', latitude: 57.71, longitude: 12.01, severity: 'CRITICAL', detail: 'Navigation aid offline' }, { id: 'port-oslo', label: 'Oslo Port', latitude: 59.91, longitude: 10.75, severity: 'LOW' }] }],
}

export const maritimeProvider: DashboardDefinition<MaritimeData, MaritimeDataProvider> = { id: 'maritime', name: 'MARITIME', description: 'Vessel traffic, port access, navigation, waterway safety and AIS feed health.', icon: 'ship', category: 'Mobility', component: Maritime, enabled: true, provider: createMaritimeProvider(createAnomalyAwareProvider({ id: 'maritime', provider: createMockProvider('maritime', data), rules: maritimeAnomalyRules })) }
