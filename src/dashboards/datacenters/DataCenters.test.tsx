import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DataCenters, type DataCenterData } from './DataCenters'

const data: DataCenterData = {
  snapshot: { status: 'WARNING', health: 84, headline: 'Cooling load elevated at one facility', updatedAt: '08:54 UTC', source: 'Facility telemetry', freshness: 'STALE', summary: 'One facility is outside its cooling tolerance.' },
  centers: [
    { id: 'dc-oslo', name: 'Oslo Core', operator: 'Nordic Cloud Systems', country: 'Norway', city: 'Oslo', latitude: 59.91, longitude: 10.75, tier: 'TIER 1', powerCapacityMW: 42, itLoadMW: 31, coolingTechnology: 'Liquid cooling', pue: 1.7, renewableEnergyPercentage: 88, networkConnectivity: 'Dual redundant', cloudProviders: ['AWS', 'Azure'], status: 'OPERATIONAL', availability: 99.9, lastUpdated: '08:54 UTC' },
    { id: 'dc-stockholm', name: 'Stockholm Edge', operator: 'Northstar Systems', country: 'Sweden', city: 'Stockholm', latitude: 59.33, longitude: 18.07, tier: 'TIER 2', powerCapacityMW: 28, itLoadMW: 24, coolingTechnology: 'Free cooling', pue: 1.9, renewableEnergyPercentage: 72, networkConnectivity: 'Primary', cloudProviders: ['Google Cloud'], status: 'DEGRADED', availability: 98.7, lastUpdated: '08:51 UTC' },
    { id: 'dc-helsinki', name: 'Helsinki Relay', operator: 'Unknown', country: 'Finland', city: 'Helsinki', latitude: 60.17, longitude: 24.94, tier: null, powerCapacityMW: null, itLoadMW: 18, coolingTechnology: null, pue: null, renewableEnergyPercentage: null, networkConnectivity: null, cloudProviders: null, status: 'UNKNOWN', availability: null, lastUpdated: null },
  ],
  incidents: [{ id: 'inc-1', title: 'Cooling delta outside tolerance', location: 'Oslo Core', severity: 'HIGH', time: '08:54 UTC', detail: 'Primary cooling load is 12% above forecast.' }],
  events: [{ id: 'evt-1', timestamp: '08:54 UTC', source: 'Facility telemetry', country: 'Norway', category: 'Cooling', severity: 'HIGH', title: 'Cooling load elevated', description: 'Primary cooling load is 12% above forecast.', relatedDashboard: 'datacenters' }],
  providers: [{ name: 'FACILITY TELEMETRY', freshness: 'STALE', latency: '184 ms', status: 'WARNING' }],
  mapLayers: [{ id: 'datacenter-locations', label: 'Data centers', color: '#5b9fec', points: [{ id: 'dc-oslo', label: 'Oslo Core', latitude: 59.91, longitude: 10.75, severity: 'HIGH', detail: 'Degraded' }] }],
}

describe('Data centers dashboard', () => {
  it('renders all requested operational views and preserves unavailable values', () => {
    render(<DataCenters data={data} />)
    expect(screen.getByRole('heading', { name: 'Total data centers' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Total estimated capacity' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Operational status' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Nordic data center map' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Data center list' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Capacity chart' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Utilization chart' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Operator and cloud providers' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Abnormal events' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Infrastructure health' })).toBeInTheDocument()
    expect(screen.getAllByText('Helsinki Relay').length).toBeGreaterThan(0)
    expect(screen.getAllByText('UNKNOWN').length).toBeGreaterThan(0)

    fireEvent.click(screen.getByRole('button', { name: /Helsinki Relay/i }))
    expect(screen.getByRole('heading', { name: 'Helsinki Relay infrastructure' })).toBeInTheDocument()
    expect(screen.getAllByText('Not reported').length).toBeGreaterThan(0)
  })
})
