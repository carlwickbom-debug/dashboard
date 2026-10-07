import { describe, expect, it } from 'vitest'
import { MockEnergyProvider } from './domainMocks'
import { createEnergyProvider } from './domainFactories'
import { createProviderFactory, providerModeFromEnvironment, UnconfiguredProviderError } from './providerFactory'
import { energyProvider } from '../../dashboards/energy/provider'

describe('domain data provider architecture', () => {
  it('exposes current state, events, timestamps, health, and mock capabilities', async () => {
    const provider = new MockEnergyProvider(energyProvider.provider)
    const state = await provider.getCurrentState()
    expect(state).toHaveProperty('countries')
    expect(await provider.getEvents()).toEqual(state.events)
    expect(await provider.getLastUpdated()).toBe(state.snapshot.updatedAt)
    expect(await provider.getHealth()).toMatchObject({ status: state.snapshot.status, freshness: state.snapshot.freshness })
    expect(provider.getCapabilities()).toMatchObject({ mode: 'mock', readOnly: true, supportsRefresh: true })
  })

  it('selects mode from configuration and accepts legacy selector fallback', () => {
    expect(providerModeFromEnvironment({ VITE_DATA_PROVIDER_MODE: 'api' })).toBe('api')
    expect(providerModeFromEnvironment({ VITE_OPS_DATA_SOURCE: 'firestore' })).toBe('firestore')
    expect(providerModeFromEnvironment({})).toBe('mock')
  })

  it('supports injected implementations and marks unregistered modes offline', async () => {
    const apiFactory = { create: () => new MockEnergyProvider(energyProvider.provider) }
    const factory = createProviderFactory({ mock: apiFactory, api: apiFactory })
    expect(await factory.create({ mode: 'api' }).getCurrentState()).toHaveProperty('countries')
    const unavailable = createEnergyProvider(energyProvider.provider, 'firestore')
    expect(await unavailable.getHealth()).toMatchObject({ status: 'UNAVAILABLE', freshness: 'OFFLINE' })
    expect(unavailable.getCapabilities().mode).toBe('firestore')
  })

  it('adapts configured domain interfaces for existing dashboard load and refresh hooks', async () => {
    const provider = createEnergyProvider(energyProvider.provider, 'mock')
    expect(await provider.load()).toHaveProperty('countries')
    expect(await provider.refresh()).toHaveProperty('countries')
  })
})