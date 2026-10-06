import { describe, expect, it } from 'vitest'
import { overviewProvider } from './provider'

describe('Overview event stream', () => {
  it('aggregates normalized events from domain providers with dashboard identity', async () => {
    const data = await overviewProvider.provider.load()
    expect(data.events.length).toBeGreaterThan(8)
    expect(new Set(data.events.map((event) => event.relatedDashboard)).size).toBeGreaterThan(1)
    expect(data.snapshot.events).toEqual(data.events)
    expect(data.infrastructure.every((domain) => domain.activeEvents >= 0)).toBe(true)
  })
})