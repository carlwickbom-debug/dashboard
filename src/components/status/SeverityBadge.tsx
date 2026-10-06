import { AlertCircle, Circle, Info, ShieldAlert, TriangleAlert } from 'lucide-react'
import type { Severity } from '../../data/models'

const definitions: Record<Severity, { icon: typeof Circle; label: string; description: string }> = {
  INFO: { icon: Info, label: 'INFORMATION', description: 'Operational information with no immediate action required' },
  LOW: { icon: Circle, label: 'LOW', description: 'Minor deviation within operating tolerance' },
  MEDIUM: { icon: TriangleAlert, label: 'MEDIUM', description: 'Operating condition requires monitoring' },
  HIGH: { icon: ShieldAlert, label: 'HIGH', description: 'Condition may affect service performance' },
  CRITICAL: { icon: AlertCircle, label: 'CRITICAL', description: 'Immediate operational intervention is required' },
}

export function SeverityBadge({ severity, compact = false, label, description }: { severity: Severity; compact?: boolean; label?: string; description?: string }) {
  const definition = definitions[severity]
  const Icon = definition.icon
  return <span className={`severity severity-${severity.toLowerCase()}${compact ? ' compact' : ''}`} role="status" aria-label={`${definition.label}: ${description ?? definition.description}`}><Icon size={compact ? 10 : 12} aria-hidden="true" /><span className="severity-copy"><strong>{label ?? definition.label}</strong>{!compact && <small>{description ?? definition.description}</small>}</span></span>
}

export function HealthIndicator({ health, label = 'System health' }: { health: number; label?: string }) {
  const status = health >= 95 ? 'OK' : health >= 80 ? 'WARNING' : 'CRITICAL'
  return <div className="health-indicator"><span className={`status-indicator status-${status.toLowerCase()}`} role="status"><strong>{label}</strong><span>{health}%</span></span></div>
}

export { StatusIndicator } from './StatusIndicator'
export { DataFreshnessIndicator as DataFreshness } from './DataFreshnessIndicator'
