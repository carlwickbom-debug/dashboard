import { Activity, Clock3, Radio, ScanLine, WifiOff } from 'lucide-react'
import type { DataFreshness } from '../../data/models'

const definitions: Record<DataFreshness, { icon: typeof Activity; label: string; description: string }> = {
  LIVE: { icon: Radio, label: 'LIVE', description: 'Data source is actively updating' },
  FRESH: { icon: Activity, label: 'FRESH', description: 'Data was updated within the operating window' },
  STALE: { icon: Clock3, label: 'STALE', description: 'Data is outside the preferred update window' },
  DEGRADED: { icon: ScanLine, label: 'DEGRADED', description: 'Data quality is reduced or incomplete' },
  OFFLINE: { icon: WifiOff, label: 'OFFLINE', description: 'Data source is not currently reachable' },
}

export function DataFreshnessIndicator({ freshness, updatedAt, compact = false }: { freshness: DataFreshness; updatedAt: string; compact?: boolean }) {
  const definition = definitions[freshness]
  const Icon = definition.icon
  return <span className={`freshness freshness-${freshness.toLowerCase()}${compact ? ' compact' : ''}`} role="status" aria-label={`${definition.label}: ${definition.description}`}><Icon size={compact ? 12 : 14} aria-hidden="true" /><span><strong>{definition.label}</strong>{!compact && <small>{definition.description}</small>}</span>{!compact && <time>{updatedAt}</time>}</span>
}

export function DataSourceIndicator({ source, timestamp, status = 'OK' }: { source: string; timestamp?: string; status?: 'OK' | 'WARNING' | 'CRITICAL' | 'UNAVAILABLE' }) {
  return <span className={`data-source-indicator data-source-${status.toLowerCase()}`}><span className="data-source-label">SOURCE</span><strong>{source}</strong>{timestamp && <time>{timestamp}</time>}</span>
}
