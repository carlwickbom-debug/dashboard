import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Overview, type OverviewData } from './Overview'

const data: OverviewData = {
  snapshot: { status: 'WARNING', health: 93, headline: 'Northern Europe operations within tolerance', updatedAt: '09:42 UTC', source: 'Regional intelligence mesh', freshness: 'FRESH', metrics: [], events: [], summary: 'Stable' },
  countries: [
    { country: 'Sweden', status: 'WARNING', activeEvents: 2, criticalEvents: 1, freshness: 'FRESH', affectedDomains: ['Rail', 'Energy'] },
    { country: 'Norway', status: 'CRITICAL', activeEvents: 1, criticalEvents: 1, freshness: 'STALE', affectedDomains: ['Data Centers'] },
    { country: 'Denmark', status: 'OK', activeEvents: 0, criticalEvents: 0, freshness: 'LIVE', affectedDomains: [] },
    { country: 'Finland', status: 'OK', activeEvents: 1, criticalEvents: 0, freshness: 'FRESH', affectedDomains: ['Networks'] },
    { country: 'Iceland', status: 'OK', activeEvents: 0, criticalEvents: 0, freshness: 'DEGRADED', affectedDomains: [] },
  ],
  infrastructure: [
    { domain: 'Energy', status: 'WARNING', activeEvents: 1, updatedAt: '09:42 UTC', freshness: 'FRESH' },
    { domain: 'Rail', status: 'CRITICAL', activeEvents: 1, updatedAt: '09:27 UTC', freshness: 'STALE' },
    { domain: 'Road Traffic', status: 'WARNING', activeEvents: 1, updatedAt: '09:18 UTC', freshness: 'DEGRADED' },
    { domain: 'Data Centers', status: 'WARNING', activeEvents: 1, updatedAt: '08:54 UTC', freshness: 'FRESH' },
    { domain: 'Aviation', status: 'WARNING', activeEvents: 1, updatedAt: '09:05 UTC', freshness: 'FRESH' },
    { domain: 'Maritime', status: 'CRITICAL', activeEvents: 1, updatedAt: '08:41 UTC', freshness: 'STALE' },
    { domain: 'Networks', status: 'WARNING', activeEvents: 1, updatedAt: '09:31 UTC', freshness: 'OFFLINE' },
    { domain: 'Cyber Security', status: 'CRITICAL', activeEvents: 1, updatedAt: '09:36 UTC', freshness: 'LIVE' },
  ],
  events: [
    { id: 'newer', timestamp: '09:42 UTC', source: 'Grid control', country: 'Denmark', domain: 'Energy', category: 'Infrastructure', severity: 'HIGH', title: 'Newer event', description: 'Newer description' },
    { id: 'older', timestamp: '08:00 UTC', source: 'Rail', country: 'Sweden', domain: 'Rail', category: 'Infrastructure', severity: 'CRITICAL', title: 'Older event', description: 'Older description' },
  ],
  providers: [
    { name: 'ENERGY API', status: 'OK', freshness: 'LIVE', updatedAt: '09:42 UTC', mode: 'mock' },
    { name: 'RAIL API', status: 'WARNING', freshness: 'STALE', updatedAt: '09:27 UTC', mode: 'mock' },
  ],
}

describe('Overview command center', () => {
  it('renders the command-center sections and filters map events by domain', () => {
    render(<Overview data={data} />)
    expect(screen.getByRole('heading', { name: 'Nordic overall status' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Country status' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Infrastructure status' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Active critical events' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Nordic map' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Cross-domain events' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Data source health' })).toBeInTheDocument()
    for (const country of ['Sweden', 'Norway', 'Denmark', 'Finland', 'Iceland']) expect(screen.getAllByText(country).length).toBeGreaterThan(0)
    for (const domain of ['Energy', 'Rail', 'Road Traffic', 'Data Centers', 'Aviation', 'Maritime', 'Networks', 'Cyber Security']) expect(screen.getAllByText(domain).length).toBeGreaterThan(0)
    expect(screen.getByText('ENERGY API')).toBeInTheDocument()
    expect(screen.getByText('RAIL API')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Rail' }))
    const map = screen.getByLabelText('Nordic operational map')
    expect(within(map).getByRole('button', { name: /Older event: CRITICAL/i })).toBeInTheDocument()
    expect(screen.queryByText('Newer event')).not.toBeInTheDocument()
  })
})
