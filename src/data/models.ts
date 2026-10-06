import type { ComponentType } from 'react'

export type Severity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type DataFreshness = 'LIVE' | 'FRESH' | 'STALE' | 'DEGRADED' | 'OFFLINE'
export type DashboardStatus = 'OK' | 'WARNING' | 'CRITICAL' | 'UNAVAILABLE'

export interface OperationalEvent {
  id: string
  timestamp: string
  source: string
  country?: string
  region?: string
  category: string
  severity: Severity
  title: string
  description: string
  latitude?: number
  longitude?: number
  relatedDashboard?: string
  acknowledged?: boolean
}

export interface DashboardSnapshot {
  status: DashboardStatus
  health: number
  headline: string
  updatedAt: string
  source: string
  freshness: DataFreshness
  metrics: Array<{ label: string; value: string; change?: string; trend?: 'up' | 'down' | 'steady'; detail: string }>
  events: OperationalEvent[]
  summary: string
  mapLayers?: MapLayer[]
  details?: Array<{ label: string; value: string; status?: 'OK' | 'WARNING' | 'CRITICAL' | 'UNAVAILABLE' }>
}

export interface DashboardDataProvider<T> {
  load(): Promise<T>
  refresh(): Promise<T>
}

export interface MapPoint {
  id: string
  label: string
  latitude: number
  longitude: number
  severity: Severity
  detail?: string
}

export interface MapLayer {
  id: string
  label: string
  color: string
  points?: MapPoint[]
  lines?: Array<{ id: string; label: string; points: MapPoint[]; color: string; width?: number }>
  regions?: Array<{ id: string; label: string; points: MapPoint[]; color: string }>
}

export interface DashboardDefinition<T = DashboardSnapshot> {
  id: string
  name: string
  description: string
  icon: string
  category: string
  component: ComponentType<{ data: T }>
  enabled: boolean
  provider: DashboardDataProvider<T>
}
