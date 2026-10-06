import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Aviation, type AviationData } from './Aviation'

const data: AviationData = {
  snapshot: { status: 'WARNING', health: 82, headline: 'Weather corridor restriction active', updatedAt: '09:05 UTC', source: 'Nordic air traffic control', freshness: 'FRESH', summary: 'Approach operations are operating under a temporary weather corridor restriction.' },
  airports: [
    { id: 'apt-oslo', icao: 'ENGM', iata: 'OSL', name: 'Oslo International', country: 'Norway', latitude: 59.91, longitude: 10.75, status: 'RESTRICTED', delayLevel: 'HIGH', activeFlights: 24, lastUpdated: '09:05 UTC' },
    { id: 'apt-stockholm', icao: 'ESSA', iata: 'STO', name: 'Stockholm Arlanda', country: 'Sweden', latitude: 59.29, longitude: 18.08, status: 'OPERATIONAL', delayLevel: 'LOW', activeFlights: 31, lastUpdated: '09:04 UTC' },
    { id: 'apt-helsinki', icao: 'EFHK', iata: 'HEL', name: 'Helsinki Airport', country: 'Finland', latitude: 60.17, longitude: 24.94, status: 'DEGRADED', delayLevel: 'MEDIUM', activeFlights: 18, lastUpdated: '08:58 UTC' },
  ],
  flights: [{ id: 'flight-1', callsign: 'NFC102', origin: 'OSL', destination: 'STO', latitude: 59.8, longitude: 12.2, altitude: 34000, speed: 480, heading: 135, status: 'ENROUTE', timestamp: '09:05 UTC' }],
  departures: [{ airport: 'OSL', count: 12, delayMinutes: 8 }],
  arrivals: [{ airport: 'STO', count: 11, delayMinutes: 4 }],
  cancellations: [{ airport: 'HEL', count: 2, reason: 'Weather' }],
  restrictions: [{ id: 'restriction-1', airport: 'OSL', type: 'APPROACH', severity: 'HIGH', time: '09:05 UTC', description: 'Weather corridor restricted to arrivals.' }],
  weatherDisruption: [{ id: 'weather-1', airport: 'OSL', severity: 'HIGH', time: '09:05 UTC', description: 'Convective weather cell affects the final approach.' }],
  events: [{ id: 'event-1', timestamp: '09:05 UTC', source: 'ATC', country: 'Norway', category: 'Weather', severity: 'HIGH', title: 'Weather corridor restricted', description: 'Approach corridor is temporarily restricted.', latitude: 59.91, longitude: 10.75, relatedDashboard: 'aviation' }],
  providers: [{ name: 'AIR TRAFFIC DATA', freshness: 'FRESH', latency: '48 ms', status: 'OK' }],
  mapLayers: [{ id: 'airport-markers', label: 'Airports', color: '#5b9fec', points: [{ id: 'apt-oslo', label: 'Oslo International', latitude: 59.91, longitude: 10.75, severity: 'HIGH', detail: 'Restricted' }] }],
}

describe('Aviation dashboard', () => {
  it('renders operational aviation views and preserves availability data', () => {
    render(<Aviation data={data} />)
    expect(screen.getByRole('heading', { name: 'Active flights' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Airport status' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Delay statistics' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Airspace restrictions' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Weather disruption' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Abnormal events' })).toBeInTheDocument()
    expect(screen.getByText('NFC102')).toBeInTheDocument()
    expect(screen.getAllByText('OSL').length).toBeGreaterThan(0)
  })
})
