import { describe, expect, it } from 'vitest'
import { createMockProvider } from './mockProvider'
import type { DashboardSnapshot } from '../models'

const snapshot: DashboardSnapshot = { status: 'OK', health: 100, headline: 'Normal', updatedAt: '09:00 UTC', source: 'Test source', freshness: 'FRESH', metrics: [], events: [], summary: 'Stable' }

describe('mock data provider', () => {
  it('returns the supplied snapshot and updates freshness on refresh', async () => {
    const provider = createMockProvider('test', snapshot)
    expect(await provider.load()).toBe(snapshot)
    const refreshed = await provider.refresh()
    expect(refreshed.freshness).toBe('FRESH')
    expect(refreshed.updatedAt).not.toBe(snapshot.updatedAt)
  })
})
