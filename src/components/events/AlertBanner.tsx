import { AlertTriangle, Info, ShieldAlert } from 'lucide-react'
import type { Severity } from '../../data/models'
import { SeverityBadge } from '../status/SeverityBadge'

const icons: Record<Severity, typeof AlertTriangle> = { INFO: Info, LOW: Info, MEDIUM: AlertTriangle, HIGH: ShieldAlert, CRITICAL: AlertTriangle }

export function AlertBanner({ severity, title, description, timestamp, action }: { severity: Severity; title: string; description: string; timestamp?: string; action?: React.ReactNode }) {
  const Icon = icons[severity]
  return <aside className={`alert-banner alert-${severity.toLowerCase()}`} role="alert"><div className="alert-icon"><Icon size={17} aria-hidden="true" /></div><div className="alert-copy"><div><SeverityBadge severity={severity} compact label={severity} /><time>{timestamp}</time></div><h3>{title}</h3><p>{description}</p></div>{action && <div className="alert-action">{action}</div>}</aside>
}
