import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Rail, type RailData } from './Rail'

const data: RailData = {
  snapshot: { status: 'CRITICAL', health: 76, headline: 'Signal maintenance interruption active', updatedAt: '09:27 UTC', source: 'Rail signal network', freshness: 'FRESH', summary: 'One section is operating on reduced capacity.' },
  trains: [{ id: 'R-104', line: 'Stockholm–Uppsala', route: 'Stockholm Central → Uppsala', status: 'MAJOR DELAY', delay: 17, speed: 72, progress: 68, nextStation: 'Västerås' }],
  delayDistribution: [{ state: 'NORMAL', count: 42 }, { state: 'DELAY', count: 8 }, { state: 'MAJOR DELAY', count: 3 }, { state: 'SERVICE DISRUPTION', count: 1 }, { state: 'INFRASTRUCTURE FAILURE', count: 1 }],
  disruptions: [{ id: 'd-1', line: 'Stockholm–Uppsala', type: 'INFRASTRUCTURE FAILURE', status: 'CRITICAL', severity: 'CRITICAL', start: '09:12 UTC', end: '10:15 UTC', description: 'Signal maintenance interruption on C-14.', location: 'C-14' }],
  stations: [{ name: 'Stockholm Central', country: 'Sweden', trains: 24, arrivals: 18, status: 'WARNING' }],
  maintenance: [{ id: 'M-14', line: 'Stockholm–Uppsala', time: '09:20–10:35 UTC', type: 'Signal replacement', status: 'ACTIVE' }],
  incidents: [{ id: 'i-1', title: 'Track circuit fault', location: 'C-14', severity: 'CRITICAL', time: '09:12 UTC', detail: 'Automatic protection engaged.' }],
  providers: [{ name: 'RAIL SIGNAL NETWORK', freshness: 'FRESH', latency: '47 ms', status: 'OK' }],
  events: [{ id: 'rail-event-1', timestamp: '09:12 UTC', source: 'Rail signal network', country: 'Sweden', relatedDashboard: 'rail', category: 'Infrastructure', severity: 'CRITICAL', title: 'Signal maintenance interruption', description: 'C-14 automatic protection engaged.', latitude: 59.33, longitude: 18.07 }],
  mapLayers: [{ id: 'rail-map', label: 'Rail disruptions', color: '#e34b52', lines: [{ id: 'rail-line', label: 'Stockholm–Uppsala', points: [{ id: 'stockholm', label: 'Stockholm', latitude: 59.33, longitude: 18.07, severity: 'CRITICAL' }, { id: 'uppsala', label: 'Uppsala', latitude: 59.9, longitude: 17.93, severity: 'CRITICAL' }], color: '#e34b52', width: 1.8 }], points: [{ id: 'station', label: 'Stockholm Central', latitude: 59.33, longitude: 18.07, severity: 'CRITICAL', detail: 'Disruption' }] }],
}

describe('Rail dashboard', () => {
  it('renders service, disruption, map, events and provider sections', () => {
    render(<Rail data={data} />)
    expect(screen.getByRole('heading', { name: 'Active trains' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Delay distribution' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Major disruptions' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Nordic rail map' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Abnormal events' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Data provider status' })).toBeInTheDocument()
    expect(screen.getByText('R-104')).toBeInTheDocument()
    expect(screen.getByText('INFRASTRUCTURE FAILURE')).toBeInTheDocument()
    expect(screen.getByText('RAIL SIGNAL NETWORK')).toBeInTheDocument()
  })
})
