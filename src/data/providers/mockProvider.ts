import type { DashboardDataProvider } from '../models'

export function createMockProvider<T>(id: string, snapshot: T): DashboardDataProvider<T> {
  let current = snapshot
  return {
    async load() { return current },
    async refresh() {
      current = { ...current, updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '), freshness: 'FRESH' }
      return current
    },
  }
}
