import type { DashboardDataProvider } from '../models'
import type { AviationData } from '../../dashboards/aviation/Aviation'
import type { CyberData } from '../../dashboards/cyber/Cyber'
import type { DataCenterData } from '../../dashboards/datacenters/DataCenters'
import type { EnergyData } from '../../dashboards/energy/Energy'
import type { MaritimeData } from '../../dashboards/maritime/Maritime'
import type { NetworksData } from '../../dashboards/networks/Networks'
import type { RailData } from '../../dashboards/rail/Rail'
import type { TrafficData } from '../../dashboards/traffic/Traffic'
import type { AviationDataProvider, CyberDataProvider, DataCenterDataProvider, DataProviderMode, EnergyDataProvider, MaritimeDataProvider, NetworkDataProvider, ProviderConfig, ProviderFactory, ProviderRegistry, RailDataProvider, TrafficDataProvider } from './contracts'
import { MockAviationProvider, MockCyberProvider, MockDataCenterProvider, MockEnergyProvider, MockMaritimeProvider, MockNetworkProvider, MockRailProvider, MockTrafficProvider, type MockStateSource } from './domainMocks'
import { adaptDashboardProvider, createProviderFactory, createUnavailableDomainProvider, providerModeFromEnvironment } from './providerFactory'

function mockFactory<T extends object, P>(Provider: new (source: DashboardDataProvider<T>) => P): ProviderFactory<T> {
  return { create: (config) => new Provider(config.source as DashboardDataProvider<T>) as P & import('./contracts').DomainDataProvider<T> }
}

function configured<T extends object, P extends import('./contracts').DomainDataProvider<T>>(
  source: MockStateSource<T>,
  factories: ProviderRegistry<T>,
  mode = providerModeFromEnvironment(),
): P & DashboardDataProvider<T> {
  const providerFactory: ProviderFactory<T> = createProviderFactory(factories)
  if (!factories[mode]) return createUnavailableDomainProvider(mode, source) as P & DashboardDataProvider<T>
  if (mode !== 'mock') return adaptDashboardProvider(providerFactory.create({ mode } as ProviderConfig)) as P & DashboardDataProvider<T>
  return adaptDashboardProvider(providerFactory.create({ mode, source } as ProviderConfig)) as P & DashboardDataProvider<T>
}

export function createEnergyProvider(source: DashboardDataProvider<EnergyData>, mode?: DataProviderMode, factories?: ProviderRegistry<EnergyData>): EnergyDataProvider {
  return configured(source, factories ?? { mock: mockFactory(MockEnergyProvider) }, mode)
}
export function createRailProvider(source: DashboardDataProvider<RailData>, mode?: DataProviderMode, factories?: ProviderRegistry<RailData>): RailDataProvider {
  return configured(source, factories ?? { mock: mockFactory(MockRailProvider) }, mode)
}
export function createTrafficProvider(source: DashboardDataProvider<TrafficData>, mode?: DataProviderMode, factories?: ProviderRegistry<TrafficData>): TrafficDataProvider {
  return configured(source, factories ?? { mock: mockFactory(MockTrafficProvider) }, mode)
}
export function createDataCenterProvider(source: DashboardDataProvider<DataCenterData>, mode?: DataProviderMode, factories?: ProviderRegistry<DataCenterData>): DataCenterDataProvider {
  return configured(source, factories ?? { mock: mockFactory(MockDataCenterProvider) }, mode)
}
export function createAviationProvider(source: DashboardDataProvider<AviationData>, mode?: DataProviderMode, factories?: ProviderRegistry<AviationData>): AviationDataProvider {
  return configured(source, factories ?? { mock: mockFactory(MockAviationProvider) }, mode)
}
export function createMaritimeProvider(source: DashboardDataProvider<MaritimeData>, mode?: DataProviderMode, factories?: ProviderRegistry<MaritimeData>): MaritimeDataProvider {
  return configured(source, factories ?? { mock: mockFactory(MockMaritimeProvider) }, mode)
}
export function createNetworkProvider(source: DashboardDataProvider<NetworksData>, mode?: DataProviderMode, factories?: ProviderRegistry<NetworksData>): NetworkDataProvider {
  return configured(source, factories ?? { mock: mockFactory(MockNetworkProvider) }, mode)
}
export function createCyberProvider(source: DashboardDataProvider<CyberData>, mode?: DataProviderMode, factories?: ProviderRegistry<CyberData>): CyberDataProvider {
  return configured(source, factories ?? { mock: mockFactory(MockCyberProvider) }, mode)
}