import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Maritime, type MaritimeData } from './Maritime'

const data: MaritimeData = {
  snapshot: { status: 'WARNING', health: 78, headline: 'Port channel beacon unavailable', updatedAt: '08:41 UTC', source: 'Maritime telemetry mesh', freshness: 'OFFLINE', summary: 'Vessel traffic is restricted while the navigation beacon is restored.' },
  vessels: [{ id: 'vessel-1', mmsi: '257088290', name: 'Nordic Star', type: 'Bulk carrier', flag: 'Sweden', latitude: 57.71, longitude: 12.01, speed: 14.2, heading: 88, destination: 'Stockholm', status: 'ENROUTE', timestamp: '08:41 UTC' }],
  vesselDensity: [{ region: 'Gulf of Bothnia', value: 84, status: 'HIGH' }],
  ports: [{ id: 'port-1', name: 'Göteborg Port', country: 'Sweden', latitude: 57.71, longitude: 12.01, status: 'RESTRICTED', channel: 'Outer channel', capacity: 61, lastUpdated: '08:41 UTC' }],
  shippingLanes: [{ id: 'lane-1', name: 'Göteborg channel', from: 'Göteborg', to: 'Trollhättan', severity: 'CRITICAL', status: 'RESTRICTED', description: 'Navigation beacon unavailable.' }],
  incidents: [{ id: 'incident-1', title: 'Navigation aid unavailable', location: 'Göteborg channel', severity: 'CRITICAL', time: '08:41 UTC', type: 'Navigation', detail: 'Port channel beacon is offline.' }],
  abnormalEvents: [{ id: 'event-1', timestamp: '08:39 UTC', source: 'AIS anomaly detector', country: 'Sweden', category: 'Behavior', severity: 'HIGH', title: 'Unexpected speed change', description: 'Vessel speed changed by 8 knots over 90 seconds.', latitude: 57.71, longitude: 12.01, relatedDashboard: 'maritime' }],
  events: [{ id: 'event-2', timestamp: '08:41 UTC', source: 'Port operations', country: 'Sweden', category: 'Incident', severity: 'CRITICAL', title: 'Beacon outage', description: 'Navigation aid unavailable.', relatedDashboard: 'maritime' }],
  providers: [{ name: 'AIS FEED', freshness: 'OFFLINE', latency: 'Unavailable', status: 'UNAVAILABLE' }, { name: 'PORT TELEMETRY', freshness: 'FRESH', latency: '98 ms', status: 'OK' }],
  mapLayers: [{ id: 'maritime-routes', label: 'Shipping lanes', color: '#56c7a5', lines: [{ id: 'lane-1', label: 'Göteborg channel', points: [{ id: 'port-1', label: 'Göteborg', latitude: 57.71, longitude: 12.01, severity: 'CRITICAL' }], color: '#e34b52', width: 2 }] }],
}

describe('Maritime dashboard', () => {
  it('renders vessel, port, lane, incident, anomaly, and feed-health views', () => {
    render(<Maritime data={data} />)
    expect(screen.getByRole('heading', { name: 'Vessel positions' })).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { name: 'Vessel density' })).toHaveLength(2)
    expect(screen.getByRole('heading', { name: 'Port status' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Shipping lanes' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Maritime incidents' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Abnormal vessel behavior' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'AIS feed health' })).toBeInTheDocument()
    expect(screen.getByText('Nordic Star')).toBeInTheDocument()
    expect(screen.getByText('Göteborg Port')).toBeInTheDocument()
    expect(screen.getByText('Unexpected speed change')).toBeInTheDocument()
  })
})
