import type { DashboardDefinition } from '../../data/models'
import { createMockProvider } from '../../data/providers/mockProvider'
import { createAnomalyAwareProvider } from '../../data/anomalies/anomaly'
import { aviationAnomalyRules } from '../../data/anomalies/domainRules'
import { events } from '../../data/mock/mockData'
import { Aviation, type AviationData } from './Aviation'

const data: AviationData = {
  snapshot: { status: 'WARNING', health: 82, headline: 'Weather corridor restriction active', updatedAt: '09:05 UTC', source: 'Nordic air traffic control', freshness: 'FRESH', summary: 'Approach operations are operating under a temporary weather corridor restriction.' },
  airports: [
    { id: 'apt-oslo', icao: 'ENGM', iata: 'OSL', name: 'Oslo International', country: 'Norway', latitude: 59.91, longitude: 10.75, status: 'RESTRICTED', delayLevel: 'HIGH', activeFlights: 24, lastUpdated: '09:05 UTC' },
    { id: 'apt-stockholm', icao: 'ESSA', iata: 'STO', name: 'Stockholm Arlanda', country: 'Sweden', latitude: 59.29, longitude: 18.08, status: 'OPERATIONAL', delayLevel: 'LOW', activeFlights: 31, lastUpdated: '09:04 UTC' },
    { id: 'apt-helsinki', icao: 'EFHK', iata: 'HEL', name: 'Helsinki Airport', country: 'Finland', latitude: 60.17, longitude: 24.94, status: 'DEGRADED', delayLevel: 'MEDIUM', activeFlights: 18, lastUpdated: '08:58 UTC' },
    { id: 'apt-copenhagen', icao: 'EKCH', iata: 'CPH', name: 'Copenhagen Airport', country: 'Denmark', latitude: 55.62, longitude: 12.57, status: 'OPERATIONAL', delayLevel: 'LOW', activeFlights: 16, lastUpdated: '09:03 UTC' },
    { id: 'apt-reykjavik', icao: 'BIKF', iata: 'KEF', name: 'Keflavík Airport', country: 'Iceland', latitude: 64.15, longitude: -21.94, status: 'OPERATIONAL', delayLevel: 'LOW', activeFlights: 7, lastUpdated: '08:58 UTC' },
  ],
  flights: [
    { id: 'flight-1', callsign: 'NFC102', origin: 'OSL', destination: 'STO', latitude: 59.8, longitude: 12.2, altitude: 34000, speed: 480, heading: 135, status: 'ENROUTE', timestamp: '09:05 UTC' },
    { id: 'flight-2', callsign: 'SAS221', origin: 'STO', destination: 'CPH', latitude: 58.8, longitude: 17.5, altitude: 28000, speed: 440, heading: 80, status: 'APPROACH', timestamp: '09:04 UTC' },
    { id: 'flight-3', callsign: 'FIN401', origin: 'HEL', destination: 'KEF', latitude: 60.9, longitude: 22.4, altitude: 21000, speed: 410, heading: 200, status: 'TAKEOFF', timestamp: '09:03 UTC' },
  ],
  departures: [{ airport: 'OSL', count: 12, delayMinutes: 8 }, { airport: 'HEL', count: 8, delayMinutes: 5 }],
  arrivals: [{ airport: 'STO', count: 11, delayMinutes: 4 }, { airport: 'CPH', count: 9, delayMinutes: 2 }],
  cancellations: [{ airport: 'OSL', count: 2, reason: 'Weather' }, { airport: 'HEL', count: 1, reason: 'Operational' }],
  restrictions: [{ id: 'restriction-1', airport: 'OSL', type: 'APPROACH', severity: 'HIGH', time: '09:05 UTC', description: 'Weather corridor restricted to arrivals.' }],
  weatherDisruption: [{ id: 'weather-1', airport: 'OSL', severity: 'HIGH', time: '09:05 UTC', description: 'Convective weather cell affects the final approach.' }],
  events: [
    { ...events.aviation[0], country: 'Norway', latitude: 59.91, longitude: 10.75, relatedDashboard: 'aviation' },
    { id: 'a-2', timestamp: '08:52 UTC', source: 'Airport operations', country: 'Sweden', category: 'Delay', severity: 'MEDIUM', title: 'Runway reduced speed limit', description: 'Stockholm Arlanda movement has increased break spacing.', latitude: 59.29, longitude: 18.08, relatedDashboard: 'aviation' },
  ],
  providers: [{ name: 'AIR TRAFFIC DATA', freshness: 'FRESH', latency: '48 ms', status: 'OK' }, { name: 'FLIGHT TRACKING', freshness: 'LIVE', latency: '31 ms', status: 'OK' }, { name: 'WEATHER IMPACT', freshness: 'STALE', latency: '184 ms', status: 'WARNING' }],
  mapLayers: [{ id: 'airport-markers', label: 'Airports', color: '#5b9fec', points: [{ id: 'apt-oslo', label: 'Oslo International', latitude: 59.91, longitude: 10.75, severity: 'HIGH', detail: 'Restricted' }, { id: 'apt-stockholm', label: 'Stockholm Arlanda', latitude: 59.29, longitude: 18.08, severity: 'LOW', detail: 'Operational' }, { id: 'apt-helsinki', label: 'Helsinki Airport', latitude: 60.17, longitude: 24.94, severity: 'MEDIUM', detail: 'Degraded' }] }],
}

export const aviationProvider: DashboardDefinition<AviationData> = { id: 'aviation', name: 'AVIATION', description: 'Air traffic, weather, runway availability and flight corridor status.', icon: 'cloud', category: 'Mobility', component: Aviation, enabled: true, provider: createAnomalyAwareProvider({ id: 'aviation', provider: createMockProvider('aviation', data), rules: aviationAnomalyRules }) }
