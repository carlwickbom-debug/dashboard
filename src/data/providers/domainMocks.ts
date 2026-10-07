import type { DashboardDataProvider, OperationalEvent } from '../models'
import type { DomainDataProvider, ProviderHealth } from './contracts'
import type { AviationDataProvider, CyberDataProvider, DataCenterDataProvider, EnergyDataProvider, MaritimeDataProvider, NetworkDataProvider, RailDataProvider, TrafficDataProvider } from './contracts'
import type { AviationData } from '../../dashboards/aviation/Aviation'
import type { CyberData } from '../../dashboards/cyber/Cyber'
import type { DataCenterData } from '../../dashboards/datacenters/DataCenters'
import type { EnergyData } from '../../dashboards/energy/Energy'
import type { MaritimeData } from '../../dashboards/maritime/Maritime'
import type { NetworksData } from '../../dashboards/networks/Networks'
import type { RailData } from '../../dashboards/rail/Rail'
import type { TrafficData } from '../../dashboards/traffic/Traffic'

export type MockStateSource<T> = DashboardDataProvider<T>

abstract class MockDomainProvider<T extends object> implements DomainDataProvider<T> {
  private current: T | undefined

  constructor(private readonly source: MockStateSource<T>) {}

  private async state() {
    this.current ??= await this.source.load()
    return this.current
  }

  async getCurrentState() { return this.state() }
  async refresh() { this.current = await this.source.refresh(); return this.current }
  load() { return this.getCurrentState() }
  async getEvents() { return ((await this.state()) as T & { events?: OperationalEvent[] }).events ?? [] }
  async getLastUpdated() {
    const state = await this.state() as T & { updatedAt?: string; snapshot?: { updatedAt?: string } }
    return state.snapshot?.updatedAt ?? state.updatedAt ?? null
  }
  async getHealth() {
    const state = await this.state() as T & { status?: ProviderHealth['status']; freshness?: ProviderHealth['freshness']; snapshot?: { status?: ProviderHealth['status']; freshness?: ProviderHealth['freshness'] } }
    return {
      status: state.snapshot?.status ?? state.status ?? 'UNAVAILABLE',
      freshness: state.snapshot?.freshness ?? state.freshness ?? 'OFFLINE',
    }
  }
  getCapabilities() { return { mode: 'mock' as const, readOnly: true, supportsRefresh: true, supportsHistoricalData: false } }
}

export class MockEnergyProvider extends MockDomainProvider<EnergyData> implements EnergyDataProvider {}
export class MockRailProvider extends MockDomainProvider<RailData> implements RailDataProvider {}
export class MockTrafficProvider extends MockDomainProvider<TrafficData> implements TrafficDataProvider {}
export class MockDataCenterProvider extends MockDomainProvider<DataCenterData> implements DataCenterDataProvider {}
export class MockAviationProvider extends MockDomainProvider<AviationData> implements AviationDataProvider {}
export class MockMaritimeProvider extends MockDomainProvider<MaritimeData> implements MaritimeDataProvider {}
export class MockNetworkProvider extends MockDomainProvider<NetworksData> implements NetworkDataProvider {}
export class MockCyberProvider extends MockDomainProvider<CyberData> implements CyberDataProvider {}
