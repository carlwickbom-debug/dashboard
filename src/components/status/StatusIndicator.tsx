import { AlertCircle, CheckCircle2, Circle, TriangleAlert } from 'lucide-react'
import type { DashboardStatus } from '../../data/models'

const definitions: Record<DashboardStatus, { icon: typeof Circle; label: string; description: string }> = {
  OK: { icon: CheckCircle2, label: 'NORMAL', description: 'Operating within expected parameters' },
  WARNING: { icon: TriangleAlert, label: 'WARNING', description: 'Parameters are outside the preferred range' },
  CRITICAL: { icon: AlertCircle, label: 'CRITICAL', description: 'Immediate operational intervention is required' },
  UNAVAILABLE: { icon: Circle, label: 'UNAVAILABLE', description: 'Data source is unavailable or stale' },
}

export function StatusIndicator({ status, label, description, compact = false }: { status: DashboardStatus; label?: string; description?: string; compact?: boolean }) {
  const definition = definitions[status]
  const Icon = definition.icon
  return <span className={`status-indicator status-${status.toLowerCase()}${compact ? ' compact' : ''}`} role="status" aria-label={`${definition.label}: ${description ?? definition.description}`}><Icon size={compact ? 12 : 14} aria-hidden="true" /><span className="status-copy"><strong>{label ?? definition.label}</strong>{!compact && <small>{description ?? definition.description}</small>}</span></span>
}
