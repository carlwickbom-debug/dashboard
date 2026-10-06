import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Energy, type EnergyData } from './Energy'

const data: EnergyData = {
  snapshot: { status: 'WARNING', health: 92, headline: 'Generation reserve below forecast margin', updatedAt: '09:42 UTC', source: 'Grid telemetry', freshness: 'FRESH', summary: 'Stable with reserve pressure.' },
  countries: [{ country: 'Sweden', production: 18.4, consumption: 16.7, share: 26.9, status: 'WARNING', delta: -2.4 }],
  generation: [{ type: 'Wind', value: 28.6, share: 41.8, status: 'WARNING', detail: 'North Sea' }, { type: 'Hydro', value: 19.4, share: 28.4, status: 'OK', detail: 'Reservoir' }],
  production: [{ label: '00:00', value: 57.2 }, { label: '02:00', value: 58.7 }],
  consumption: [{ label: '00:00', value: 53.8 }, { label: '02:00', value: 55.4 }],
  imports: [{ country: 'Denmark', value: 4.2 }],
  exports: [{ country: 'Sweden', value: 5.8 }],
  constraints: [{ id: 'line-1', name: 'Danish corridor', flow: 11.8, limit: 12, status: 'WARNING', direction: 'Southbound', detail: 'Congestion.' }],
  events: [{ id: 'event-1', timestamp: '09:42 UTC', source: 'Grid control', country: 'Denmark', category: 'Transmission', severity: 'CRITICAL', title: 'Congestion', description: 'Flow limit exceeded.' }],
  providers: [{ name: 'GRID TELEMETRY', freshness: 'LIVE', latency: '42 ms', status: 'OK' }],
  mapLayers: [{ id: 'map', label: 'Grid', color: '#e34b52', points: [{ id: 'point', label: 'Denmark', latitude: 55.68, longitude: 12.57, severity: 'CRITICAL' }] }],
}

describe('Energy dashboard', () => {
  it('renders the operational sections and source health', () => {
    render(<Energy data={data} />)
    expect(screen.getByRole('heading', { name: 'Total production' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Nordic production' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Generation mix' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Transmission overview' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Nordic grid map' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Abnormal events' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Data source health' })).toBeInTheDocument()
    expect(screen.getByText('GRID TELEMETRY')).toBeInTheDocument()
    expect(screen.getAllByText('Congestion')).toHaveLength(2)
  })
})
