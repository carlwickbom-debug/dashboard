import type { DashboardDataProvider, DataFreshness, DashboardStatus, OperationalEvent } from '../models'
import type { AviationData } from '../../dashboards/aviation/Aviation'
import type { CyberData } from '../../dashboards/cyber/Cyber'
import type { DataCenterData } from '../../dashboards/datacenters/DataCenters'
import type { EnergyData } from '../../dashboards/energy/Energy'
import type { MaritimeData } from '../../dashboards/maritime/Maritime'
import type { NetworksData } from '../../dashboards/networks/Networks'
import type { RailData } from '../../dashboards/rail/Rail'
import type { TrafficData } from '../../dashboards/traffic/Traffic'

export type DataProviderMode = 'mock' | 'api' | 'firestore' | (string & {})

export interface ProviderHealth {
  status: DashboardStatus
  freshness: DataFreshness
  message?: string
}

export interface ProviderCapabilities {
  mode: DataProviderMode
  readOnly: boolean
  supportsRefresh: boolean
  supportsHistoricalData: boolean
}

export interface DomainDataProvider<T> extends DashboardDataProvider<T> {
  getCurrentState(): Promise<T>
  refresh(): Promise<T>
  getEvents(): Promise<OperationalEvent[]>
  getLastUpdated(): Promise<string | null>
  getHealth(): Promise<ProviderHealth>
  getCapabilities(): ProviderCapabilities
}

export interface EnergyDataProvider extends DomainDataProvider<EnergyData> {}
export interface RailDataProvider extends DomainDataProvider<RailData> {}
export interface TrafficDataProvider extends DomainDataProvider<TrafficData> {}
export interface DataCenterDataProvider extends DomainDataProvider<DataCenterData> {}
export interface AviationDataProvider extends DomainDataProvider<AviationData> {}
export interface MaritimeDataProvider extends DomainDataProvider<MaritimeData> {}
export interface NetworkDataProvider extends DomainDataProvider<NetworksData> {}
export interface CyberDataProvider extends DomainDataProvider<CyberData> {}

export interface ProviderConfig {
  mode: DataProviderMode
  source?: unknown
}

export interface ProviderFactory<T> {
  create(config: ProviderConfig): DomainDataProvider<T>
}

export interface ProviderRegistry<T> {
  mock: ProviderFactory<T>
  [mode: string]: ProviderFactory<T>
}