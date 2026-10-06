import type { DashboardDefinition } from '../../data/models'
import { createMockProvider } from '../../data/providers/mockProvider'
import { events } from '../../data/mock/mockData'
import { Networks, type NetworksData } from './Networks'

const data: NetworksData = {
  snapshot: { status: 'WARNING', health: 88, headline: 'Regional backbone latency elevated', updatedAt: '09:31 UTC', source: 'Network observability mesh', freshness: 'FRESH', summary: 'Core routes are healthy while one regional edge cluster is under elevated latency.' },
  nodes: [
    { id: 'node-oslo', name: 'Oslo Core', shortName: 'OSL', type: 'DATA_CENTER', country: 'Norway', latitude: 59.91, longitude: 10.75, x: 27, y: 28 },
    { id: 'node-stockholm', name: 'Stockholm Exchange', shortName: 'STO', type: 'INTERNET_EXCHANGE', country: 'Sweden', latitude: 59.33, longitude: 18.07, x: 50, y: 25 },
    { id: 'node-gothenburg', name: 'Göteborg Edge', shortName: 'GOT', type: 'EDGE_NODE', country: 'Sweden', latitude: 57.71, longitude: 12.01, x: 35, y: 42 },
    { id: 'node-helsinki', name: 'Helsinki Edge', shortName: 'HEL', type: 'EDGE_NODE', country: 'Finland', latitude: 60.17, longitude: 24.94, x: 79, y: 33 },
    { id: 'node-bergen', name: 'Bergen Transit', shortName: 'BER', type: 'SUBMARINE_CABLE', country: 'Norway', latitude: 60.39, longitude: 5.32, x: 16, y: 45 },
    { id: 'node-tallinn', name: 'Tallinn Core', shortName: 'TAL', type: 'DATA_CENTER', country: 'Estonia', latitude: 59.44, longitude: 24.75, x: 69, y: 51 },
  ],
  links: [
    { id: 'link-oslo-stockholm', sourceNode: 'node-oslo', targetNode: 'node-stockholm', provider: 'Northstar', capacityGbps: 100, utilizationGbps: 86, latencyMs: 42, packetLossPercent: 0.2, status: 'DEGRADED', lastUpdated: '09:31 UTC' },
    { id: 'link-stockholm-gothenburg', sourceNode: 'node-stockholm', targetNode: 'node-gothenburg', provider: 'Nordic Fiber', capacityGbps: 100, utilizationGbps: 94, latencyMs: 55, packetLossPercent: 0.5, status: 'UP', lastUpdated: '09:31 UTC' },
    { id: 'link-stockholm-helsinki', sourceNode: 'node-stockholm', targetNode: 'node-helsinki', provider: 'Nordic Fiber', capacityGbps: 100, utilizationGbps: 97, latencyMs: 84, packetLossPercent: 1.8, status: 'DEGRADED', lastUpdated: '09:30 UTC' },
    { id: 'link-helsinki-tallinn', sourceNode: 'node-helsinki', targetNode: 'node-tallinn', provider: 'Baltic Transit', capacityGbps: 80, utilizationGbps: 76, latencyMs: 27, packetLossPercent: 0.1, status: 'UP', lastUpdated: '09:30 UTC' },
    { id: 'link-oslo-bergen', sourceNode: 'node-oslo', targetNode: 'node-bergen', provider: 'North Sea Mesh', capacityGbps: 100, utilizationGbps: 44, latencyMs: 38, packetLossPercent: 0.1, status: 'UP', lastUpdated: '09:31 UTC' },
    { id: 'link-bergen-gothenburg', sourceNode: 'node-bergen', targetNode: 'node-gothenburg', provider: 'North Sea Mesh', capacityGbps: 120, utilizationGbps: 78, latencyMs: 65, packetLossPercent: 0.4, status: 'MAINTENANCE', lastUpdated: '09:25 UTC' },
  ],
  providers: [
    { id: 'provider-northstar', name: 'Northstar Network', country: 'Sweden', status: 'DEGRADED', uptime: 99.91, links: 8, latencyMs: 42, lastUpdated: '09:31 UTC' },
    { id: 'provider-nordic', name: 'Nordic Fiber', country: 'Finland', status: 'OPERATIONAL', uptime: 99.98, links: 12, latencyMs: 34, lastUpdated: '09:31 UTC' },
    { id: 'provider-baltic', name: 'Baltic Transit', country: 'Estonia', status: 'OPERATIONAL', uptime: 99.98, links: 5, latencyMs: 27, lastUpdated: '09:30 UTC' },
    { id: 'provider-northsea', name: 'North Sea Mesh', country: 'Norway', status: 'DEGRADED', uptime: 99.84, links: 7, latencyMs: 51, lastUpdated: '09:25 UTC' },
  ],
  incidents: [
    { id: 'incident-route', title: 'Submarine cable route change', location: 'North Sea', severity: 'HIGH', time: '09:20 UTC', type: 'Route change', detail: 'A route change was detected on the northern backbone.' },
    { id: 'incident-latency', title: 'Regional edge latency threshold exceeded', location: 'Stockholm-EU', severity: 'MEDIUM', time: '09:16 UTC', type: 'Latency', detail: 'A regional edge cluster exceeded the operating latency threshold.' },
    { id: 'incident-maintenance', title: 'Cable maintenance window', location: 'Skagerrak', severity: 'LOW', time: '09:05 UTC', type: 'Maintenance', detail: 'A protected cable segment is undergoing scheduled maintenance.' },
  ],
  abnormalEvents: [
    { id: 'abnormal-route', timestamp: '09:30 UTC', source: 'Routing analytics', country: 'Finland', category: 'Route change', severity: 'HIGH', title: 'Route change detected', description: 'Traffic shifted through a backup path from Stockholm to Helsinki.', latitude: 60.17, longitude: 24.94, relatedDashboard: 'networks' },
    { id: 'abnormal-loss', timestamp: '09:28 UTC', source: 'Packet telemetry', country: 'Sweden', category: 'Packet loss', severity: 'MEDIUM', title: 'Elevated packet loss detected', description: 'Packet loss exceeded the normal operating threshold on a regional link.', latitude: 59.33, longitude: 18.07, relatedDashboard: 'networks' },
  ],
  events: [
    { ...events.networks[0], country: 'Sweden', latitude: 59.33, longitude: 18.07, relatedDashboard: 'networks' },
    { id: 'network-event-2', timestamp: '09:30 UTC', source: 'Routing analytics', country: 'Finland', category: 'Route', severity: 'HIGH', title: 'Backup path activated', description: 'Traffic shifted from the degraded primary path.', latitude: 60.17, longitude: 24.94, relatedDashboard: 'networks' },
    { id: 'network-event-3', timestamp: '09:25 UTC', source: 'Network operations', country: 'Norway', category: 'Maintenance', severity: 'INFO', title: 'Northern cable maintenance started', description: 'Scheduled maintenance began on the Skagerrak segment.', latitude: 60.39, longitude: 5.32, relatedDashboard: 'networks' },
  ],
  providersHealth: [
    { name: 'Northstar Network', freshness: 'FRESH', latency: '42 ms', status: 'WARNING' },
    { name: 'Nordic Fiber', freshness: 'FRESH', latency: '34 ms', status: 'OK' },
    { name: 'Baltic Transit', freshness: 'FRESH', latency: '27 ms', status: 'OK' },
    { name: 'North Sea Mesh', freshness: 'STALE', latency: '51 ms', status: 'WARNING' },
  ],
  mapLayers: [{ id: 'network-routes', label: 'Network routes', color: '#5b9fec', lines: [{ id: 'route-stockholm-helsinki', label: 'Stockholm–Helsinki', points: [{ id: 'node-stockholm', label: 'Stockholm Exchange', latitude: 59.33, longitude: 18.07, severity: 'MEDIUM' }, { id: 'node-helsinki', label: 'Helsinki Edge', latitude: 60.17, longitude: 24.94, severity: 'HIGH' }], color: '#e9894a', width: 2 }, { id: 'route-oslo-bergen', label: 'Oslo–Bergen', points: [{ id: 'node-oslo', label: 'Oslo Core', latitude: 59.91, longitude: 10.75, severity: 'LOW' }, { id: 'node-bergen', label: 'Bergen Transit', latitude: 60.39, longitude: 5.32, severity: 'LOW' }], color: '#56c7a5', width: 2 }], points: [{ id: 'node-stockholm', label: 'Stockholm Exchange', latitude: 59.33, longitude: 18.07, severity: 'LOW' }, { id: 'node-helsinki', label: 'Helsinki Edge', latitude: 60.17, longitude: 24.94, severity: 'HIGH', detail: 'Elevated latency' }, { id: 'node-oslo', label: 'Oslo Core', latitude: 59.91, longitude: 10.75, severity: 'LOW' }, { id: 'node-bergen', label: 'Bergen Transit', latitude: 60.39, longitude: 5.32, severity: 'LOW' }, { id: 'node-tallinn', label: 'Tallinn Core', latitude: 59.44, longitude: 24.75, severity: 'LOW' }] }],
}

export const networksProvider: DashboardDefinition<NetworksData> = { id: 'networks', name: 'NETWORKS', description: 'Telecommunications, edge performance, routing and service availability.', icon: 'wifi', category: 'Infrastructure', component: Networks, enabled: true, provider: createMockProvider('networks', data) }
