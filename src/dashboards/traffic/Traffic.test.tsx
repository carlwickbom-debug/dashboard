import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Traffic, type TrafficData } from './Traffic'

const data: TrafficData = {
  snapshot: { status: 'WARNING', health: 91, headline: 'Road corridor queue above baseline', updatedAt: '09:18 UTC', source: 'Road telemetry', freshness: 'FRESH', summary: 'Traffic remains stable outside the central corridor.' },
  congestion: [{ road: 'E18', location: 'Stockholm', current: 48, target: 58, level: 'HIGH', direction: 'Southbound' }],
  averageSpeed: 49,
  incidents: [{ id: 'i-1', title: 'Tunnel queue threshold exceeded', location: 'Greater Stockholm', severity: 'MEDIUM', time: '09:18 UTC', type: 'Congestion', detail: 'Queue time is 7 minutes above baseline.' }],
  closures: [{ id: 'c-1', road: 'E4', location: 'Gothenburg', severity: 'HIGH', start: '08:20 UTC', end: '10:10 UTC', reason: 'Emergency repair' }],
  accidents: [{ id: 'a-1', road: 'E6', location: 'Oslo', severity: 'CRITICAL', time: '08:46 UTC', description: 'Multi-vehicle collision; one lane closed.' }],
  weatherDisruption: [{ id: 'w-1', location: 'Nordland', severity: 'HIGH', time: '08:35 UTC', description: 'Heavy rain reduced visibility on E6.' }],
  roadworks: [{ id: 'r-1', road: 'E4', location: ' Gothenburg', severity: 'MEDIUM', time: '09:00 UTC', description: 'Lane reduction on the westbound carriageway.' }],
  cameras: [{ id: 'cam-1', country: 'Sweden', name: 'Stockholm Central', latitude: 59.29, longitude: 18.08, road: 'E18', direction: 'Southbound', status: 'AVAILABLE', imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=75', lastUpdated: '09:16 UTC' }],
  events: [{ id: 't-1', timestamp: '09:18 UTC', source: 'Traffic sensors', country: 'Sweden', category: 'Congestion', severity: 'MEDIUM', title: 'Tunnel queue threshold exceeded', description: 'Queue time is 7 minutes above baseline.', relatedDashboard: 'traffic' }],
  providers: [{ name: 'TRAFFIC SENSORS', freshness: 'FRESH', latency: '42 ms', status: 'OK' }],
  mapLayers: [{ id: 'traffic-congestion', label: 'Congestion', color: '#e9894a', points: [{ id: 'cam-1', label: 'Stockholm Central', latitude: 59.29, longitude: 18.08, severity: 'HIGH', detail: 'E18 · Southbound' }] }],
}

describe('Road traffic dashboard', () => {
  it('renders all requested traffic views and opens a selected camera image', () => {
    render(<Traffic data={data} />)
    expect(screen.getAllByRole('heading', { name: 'Congestion' })).toHaveLength(2)
    expect(screen.getByRole('heading', { name: 'Average speed' })).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { name: 'Incidents' })).toHaveLength(2)
    expect(screen.getByRole('heading', { name: 'Road closures' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Accidents' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Weather disruption' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Roadworks' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Traffic cameras' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Nordic traffic map' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Abnormal traffic events' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Stockholm Central, E18, Southbound' }))
    expect(screen.getByRole('img', { name: /Stockholm Central traffic camera/i })).toBeInTheDocument()
  })
})
