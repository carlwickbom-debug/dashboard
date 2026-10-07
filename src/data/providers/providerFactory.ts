import type { DashboardDataProvider, OperationalEvent } from '../models'
import type { DataProviderMode, DomainDataProvider, ProviderConfig, ProviderFactory, ProviderHealth, ProviderRegistry } from './contracts'

export type DashboardProvider<T> = DomainDataProvider<T> & DashboardDataProvider<T>

export class UnconfiguredProviderError extends Error {
  constructor(mode: string) {
    super(`No provider is registered for mode "${mode}". Configure a server-side ${mode} provider before enabling this mode.`)
    this.name = 'UnconfiguredProviderError'
  }
}

export function createUnavailableDomainProvider<T extends object>(mode: string, source: DashboardDataProvider<T>): DomainDataProvider<T> {
  let state: T | undefined
  const getUnavailableState = async () => {
    state ??= await source.load()
    const current = state as T & {
      events?: OperationalEvent[]
      snapshot?: { status?: string; freshness?: string; source?: string; updatedAt?: string; summary?: string }
      status?: string
      freshness?: string
    }
    if (current.snapshot) {
      return {
        ...current,
        events: [],
        snapshot: {
          ...current.snapshot,
          status: 'UNAVAILABLE',
          freshness: 'OFFLINE',
          source: `${mode} provider not configured`,
          summary: `No ${mode} provider adapter is registered. Mock data is suppressed until a provider is configured.`,
        },
      } as T
    }
    return { ...current, events: [], status: 'UNAVAILABLE', freshness: 'OFFLINE' } as T
  }
  const errorMessage = `No provider is registered for mode "${mode}".`
  return {
    load: getUnavailableState,
    refresh: getUnavailableState,
    getCurrentState: getUnavailableState,
    async getEvents() { return [] },
    async getLastUpdated() { return null },
    async getHealth() { return { status: 'UNAVAILABLE', freshness: 'OFFLINE', message: errorMessage } },
    getCapabilities() { return { mode, readOnly: true, supportsRefresh: false, supportsHistoricalData: false } },
  }
}

export function adaptDashboardProvider<T>(provider: DomainDataProvider<T>): DashboardProvider<T> {
  return {
    getCurrentState: () => provider.getCurrentState(),
    getEvents: () => provider.getEvents(),
    getLastUpdated: () => provider.getLastUpdated(),
    getHealth: () => provider.getHealth(),
    getCapabilities: () => provider.getCapabilities(),
    load: () => provider.getCurrentState(),
    refresh: () => provider.refresh ? provider.refresh() : provider.getCurrentState(),
  }
}

export function createProviderFactory<T>(registry: ProviderRegistry<T>): ProviderFactory<T> {
  return {
    create(config: ProviderConfig) {
      const factory = registry[config.mode as DataProviderMode]
      if (!factory) throw new UnconfiguredProviderError(config.mode)
      return factory.create(config)
    },
  }
}

export function createMockDomainProvider<T extends object>(options: {
  state: T
  events(state: T): OperationalEvent[]
  updatedAt(state: T): string | null
  health(state: T): ProviderHealth
}): DomainDataProvider<T> {
  let state = options.state
  return {
    async load() { return state },
    async refresh() { return state },
    async getCurrentState() { return state },
    async getEvents() { return options.events(state) },
    async getLastUpdated() { return options.updatedAt(state) },
    async getHealth() { return options.health(state) },
    getCapabilities() { return { mode: 'mock', readOnly: true, supportsRefresh: true, supportsHistoricalData: false } },
  }
}

export function providerModeFromEnvironment(environment: { VITE_DATA_PROVIDER_MODE?: string; VITE_OPS_DATA_SOURCE?: string } = import.meta.env): DataProviderMode {
  const runtimeMode = typeof window !== 'undefined' ? window.__NORDIC_OPS_CONFIG__?.dataProviderMode : undefined
  const configured = runtimeMode ?? environment.VITE_DATA_PROVIDER_MODE ?? environment.VITE_OPS_DATA_SOURCE ?? 'mock'
  return configured.trim().toLowerCase() || 'mock'
}