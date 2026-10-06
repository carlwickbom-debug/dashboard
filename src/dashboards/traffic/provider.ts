import type { DashboardDefinition } from '../../data/models'
import { createMockProvider } from '../../data/providers/mockProvider'
import { createAnomalyAwareProvider } from '../../data/anomalies/anomaly'
import { trafficAnomalyRules } from '../../data/anomalies/domainRules'
import { events } from '../../data/mock/mockData'
import { Traffic, type TrafficData } from './Traffic'

const data: TrafficData = {
  snapshot: { status: 'WARNING', health: 91, headline: 'Road corridor queue above baseline', updatedAt: '09:18 UTC', source: 'Nordic road telemetry mesh', freshness: 'FRESH', summary: 'Traffic remains stable outside the central corridor, where queue time is elevated.' },
  congestion: [{ road: 'E18', location: 'Stockholm', current: 48, target: 58, level: 'HIGH', direction: 'Southbound' }, { road: 'E4', location: 'Gothenburg', current: 57, target: 62, level: 'MODERATE', direction: 'Westbound' }, { road: 'E6', location: 'Oslo', current: 61, target: 60, level: 'LOW', direction: 'Northbound' }, { road: 'E75', location: 'Helsinki', current: 52, target: 57, level: 'MODERATE', direction: 'Southbound' }],
  averageSpeed: 49,
  incidents: [{ id: 'traffic-i-1', title: 'Tunnel queue threshold exceeded', location: 'Greater Stockholm', severity: 'MEDIUM', time: '09:18 UTC', type: 'Congestion', detail: 'Queue time is 7 minutes above the operating baseline.' }, { id: 'traffic-i-2', title: 'Sensor gap detected', location: 'Oslo ring road', severity: 'LOW', time: '08:52 UTC', type: 'Telemetry', detail: 'One speed sensor was unavailable for 18 minutes.' }],
  closures: [{ id: 'traffic-c-1', road: 'E4', location: 'Gothenburg', severity: 'HIGH', start: '08:20 UTC', end: '10:10 UTC', reason: 'Emergency road repair' }, { id: 'traffic-c-2', road: 'E75', location: 'Helsinki', severity: 'MEDIUM', start: '09:00 UTC', end: '11:00 UTC', reason: 'Temporary lane reduction' }],
  accidents: [{ id: 'traffic-a-1', road: 'E6', location: 'Oslo', severity: 'CRITICAL', time: '08:46 UTC', description: 'Multi-vehicle collision; one lane is closed and emergency services are active.' }, { id: 'traffic-a-2', road: 'E18', location: 'Stockholm', severity: 'MEDIUM', time: '08:12 UTC', description: 'Minor rear-end collision with no report of injuries.' }],
  weatherDisruption: [{ id: 'traffic-w-1', location: 'Nordland, Norway', severity: 'HIGH', time: '08:35 UTC', description: 'Heavy rain reduced visibility on E6 and triggered a temporary speed limit.' }, { id: 'traffic-w-2', location: 'South Iceland', severity: 'MEDIUM', time: '07:48 UTC', description: 'Strong crosswind affected high-speed sections near the coast.' }],
  roadworks: [{ id: 'traffic-r-1', road: 'E4', location: 'Gothenburg', severity: 'MEDIUM', time: '09:00 UTC', description: 'Westbound carriageway lane reduction for bridge inspection.' }, { id: 'traffic-r-2', road: 'E75', location: 'Helsinki', severity: 'LOW', time: '10:15 UTC', description: 'Scheduled shoulder restoration.' }],
  cameras: [
    { id: 'cam-stockholm', country: 'Sweden', name: 'Stockholm Central', latitude: 59.29, longitude: 18.08, road: 'E18', direction: 'Southbound', status: 'AVAILABLE', imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=75', lastUpdated: '09:16 UTC' },
    { id: 'cam-oslo', country: 'Norway', name: 'Oslo Ring Road', latitude: 59.91, longitude: 10.75, road: 'E6', direction: 'Northbound', status: 'OFFLINE', imageUrl: null, lastUpdated: '08:51 UTC' },
    { id: 'cam-copenhagen', country: 'Denmark', name: 'Copenhagen Crossing', latitude: 55.68, longitude: 12.57, road: 'E45', direction: 'Southbound', status: 'AVAILABLE', imageUrl: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1200&q=75', lastUpdated: '09:14 UTC' },
    { id: 'cam-helsinki', country: 'Finland', name: 'Helsinki Approach', latitude: 60.17, longitude: 24.94, road: 'E75', direction: 'Southbound', status: 'CONNECTING', imageUrl: null, lastUpdated: '08:44 UTC' },
    { id: 'cam-reykjavik', country: 'Iceland', name: 'Reykjavík Ring Road', latitude: 64.15, longitude: -21.94, road: 'Route 1', direction: 'Westbound', status: 'AVAILABLE', imageUrl: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=75', lastUpdated: '09:11 UTC' },
  ],
  events: [
    { ...events.traffic[0], country: 'Sweden', latitude: 59.29, longitude: 18.08, relatedDashboard: 'traffic' },
    { id: 'traffic-event-2', timestamp: '08:46 UTC', source: 'Traffic control', country: 'Norway', category: 'Accident', severity: 'CRITICAL', title: 'Multi-vehicle collision', description: 'E6 lane closure active near Oslo.', latitude: 59.91, longitude: 10.75, relatedDashboard: 'traffic' },
    { id: 'traffic-event-3', timestamp: '08:35 UTC', source: 'Weather sensor', country: 'Norway', category: 'Weather', severity: 'HIGH', title: 'Heavy rain visibility reduction', description: 'Temporary speed restriction applied on E6.', latitude: 65.08, longitude: 12.66, relatedDashboard: 'traffic' },
    { id: 'traffic-event-4', timestamp: '08:20 UTC', source: 'Road operations', country: 'Sweden', category: 'Closure', severity: 'HIGH', title: 'Emergency road repair', description: 'E4 westbound lane closed for emergency work.', latitude: 57.71, longitude: 12.0, relatedDashboard: 'traffic' },
  ],
  providers: [{ name: 'TRAFFIC SENSORS', freshness: 'FRESH', latency: '42 ms', status: 'OK' }, { name: 'ROAD CAMERA NETWORK', freshness: 'DEGRADED', latency: '184 ms', status: 'WARNING' }, { name: 'WEATHER IMPACT MODEL', freshness: 'LIVE', latency: '61 ms', status: 'OK' }, { name: 'ROAD OPERATIONS', freshness: 'FRESH', latency: '73 ms', status: 'OK' }],
  mapLayers: [
    { id: 'traffic-congestion', label: 'Congestion', color: '#e9894a', points: [{ id: 'traffic-congestion-1', label: 'Stockholm tunnel', latitude: 59.29, longitude: 18.08, severity: 'HIGH', detail: 'E18 · 48 km/h' }, { id: 'traffic-congestion-2', label: 'Gothenburg corridor', latitude: 57.71, longitude: 12.0, severity: 'MEDIUM', detail: 'E4 · 57 km/h' }, { id: 'traffic-congestion-3', label: 'Helsinki approach', latitude: 60.17, longitude: 24.94, severity: 'MEDIUM', detail: 'E75 · 52 km/h' }] },
    { id: 'traffic-incidents', label: 'Traffic incidents', color: '#e34b52', points: [{ id: 'traffic-incident-1', label: 'Oslo collision', latitude: 59.91, longitude: 10.75, severity: 'CRITICAL', detail: 'E6 · Accident' }, { id: 'traffic-incident-2', label: 'Stockholm queue', latitude: 59.29, longitude: 18.08, severity: 'MEDIUM', detail: 'E18 · Congestion' }] },
    { id: 'traffic-weather', label: 'Weather disruption', color: '#5b9fec', points: [{ id: 'traffic-weather-1', label: 'Nordland rain', latitude: 65.08, longitude: 12.66, severity: 'HIGH', detail: 'Visibility reduced' }, { id: 'traffic-weather-2', label: 'South Iceland winds', latitude: 63.42, longitude: -19.0, severity: 'MEDIUM', detail: 'Crosswind advisory' }] },
    { id: 'traffic-cameras', label: 'Traffic cameras', color: '#59bc8e', points: [] },
  ],
}

export const trafficProvider: DashboardDefinition<TrafficData> = { id: 'traffic', name: 'ROAD TRAFFIC', description: 'Road flow, congestion, incidents, closures, accidents, weather and camera availability.', icon: 'radar', category: 'Mobility', component: Traffic, enabled: true, provider: createAnomalyAwareProvider({ id: 'traffic', provider: createMockProvider('traffic', data), rules: trafficAnomalyRules }) }
