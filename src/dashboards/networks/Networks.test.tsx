import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Networks, type NetworksData } from './Networks'

const data: NetworksData = {
  snapshot: { status: 'WARNING', health: 88, headline: 'Regional backbone latency elevated', updatedAt: '09:31 UTC', source: 'Network observability mesh', freshness: 'FRESH', summary: 'Core routes are healthy while one regional edge cluster is under elevated latency.' },
  nodes: [
    { id: 'node-oslo', name: 'Oslo Core', shortName: 'OSL', type: 'DATA_CENTER', country: 'Norway', latitude: 59.91, longitude: 10.75, x: 27, y: 28 },
    { id: 'node-stockholm', name: 'Stockholm Exchange', shortName: 'STO', type: 'INTERNET_EXCHANGE', country: 'Sweden', latitude: 59.33, longitude: 18.07, x: 50, y: 25 },
    { id: 'node-helsinki', name: 'Helsinki Edge', shortName: 'HEL', type: 'EDGE_NODE', country: 'Finland', latitude: 60.17, longitude: 24.94, x: 79, y: 33 },
  ],
  links: [
    { id: 'link-1', sourceNode: 'node-oslo', targetNode: 'node-stockholm', provider: 'Northstar', capacityGbps: 100, utilizationGbps: 86, latencyMs: 42, packetLossPercent: 0.2, status: 'DEGRADED', lastUpdated: '09:31 UTC' },
    { id: 'link-2', sourceNode: 'node-stockholm', targetNode: 'node-helsinki', provider: 'Nordic Fiber', capacityGbps: 100, utilizationGbps: 97, latencyMs: 84, packetLossPercent: 1.8, status: 'DEGRADED', lastUpdated: '09:30 UTC' },
  ],
  providers: [{ id: 'provider-1', name: 'Northstar Network', country: 'Sweden', status: 'OPERATIONAL', uptime: 99.99, links: 8, latencyMs: 42, lastUpdated: '09:31 UTC' }],
  incidents: [{ id: 'incident-1', title: 'Submarine cable route change', location: 'North Sea', severity: 'HIGH', time: '09:20 UTC', type: 'Routing anomaly', detail: 'A route change was detected on the northern backbone.' }],
  abnormalEvents: [{ id: 'event-1', timestamp: '09:30 UTC', source: 'Routing analytics', country: 'Finland', category: 'Route change', severity: 'HIGH', title: 'Route change detected', description: 'Traffic shifted through a backup path.', latitude: 60.17, longitude: 24.94, relatedDashboard: 'networks' }],
  events: [{ id: 'event-2', timestamp: '09:31 UTC', source: 'Network observability', country: 'Sweden', category: 'Latency', severity: 'MEDIUM', title: 'Elevated latency detected', description: 'Regional edge latency is above target.', relatedDashboard: 'networks' }],
  providersHealth: [{ name: 'Northstar Network', freshness: 'FRESH', latency: '42 ms', status: 'WARNING' }],
  mapLayers: [{ id: 'network-routes', label: 'Network routes', color: '#5b9fec', lines: [{ id: 'route-1', label: 'Stockholm–Helsinki', points: [{ id: 'node-stockholm', label: 'Stockholm Exchange', latitude: 59.33, longitude: 18.07, severity: 'MEDIUM' }, { id: 'node-helsinki', label: 'Helsinki Edge', latitude: 60.17, longitude: 24.94, severity: 'HIGH' }], color: '#e9894a', width: 2 }] }],
}

describe('Networks dashboard', () => {
  it('renders topology, KPIs, providers, incidents, and abnormal events', () => {
    render(<Networks data={data} />)
    expect(screen.getByRole('heading', { name: 'Network topology' })).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { name: 'Link utilization' })).toHaveLength(2)
    expect(screen.getByRole('heading', { name: 'Provider overview' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Network incidents' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Abnormal events' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Network topology visualization' })).toBeInTheDocument()
    expect(screen.getAllByText('Northstar Network')).toHaveLength(2)
    expect(screen.getByText('Route change detected')).toBeInTheDocument()
  })
})
