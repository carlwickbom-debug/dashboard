import type { CSSProperties, ReactNode } from 'react'
import type { DashboardDefinition, DashboardStatus, DataFreshness } from '../../data/models'
import { DataFreshnessIndicator } from '../status/DataFreshnessIndicator'
import { StatusIndicator } from '../status/StatusIndicator'

export function DashboardLayout({ dashboard, children }: { dashboard: DashboardDefinition; children: ReactNode }) {
  return (
    <main className="dashboard-workspace">
      <section className="dashboard-header">
        <div><span className="dashboard-kicker">{dashboard.category.toUpperCase()} / OPERATIONAL VIEW</span><h1>{dashboard.name}</h1><p>{dashboard.description}</p></div>
        <div className="dashboard-header-status"><StatusIndicator status="OK" label="SYSTEM HEALTH" description="All core services are operational" /><DataFreshnessIndicator freshness="LIVE" updatedAt="09:42:21 CET" /></div>
      </section>
      {children}
    </main>
  )
}

export function DashboardHeader({ title, subtitle, status }: { title: string; subtitle: string; status?: ReactNode }) {
  return <header className="dashboard-header dashboard-header-compact"><div><span className="dashboard-kicker">OPERATIONAL VIEW</span><h1>{title}</h1><p>{subtitle}</p></div>{status}</header>
}

export function DashboardGrid({ children, columns = 12 }: { children: ReactNode; columns?: number }) {
  return <div className="dashboard-grid" style={{ '--dashboard-columns': columns } as CSSProperties}>{children}</div>
}

export interface DashboardPanelProps {
  title: string
  subtitle?: string
  status?: DashboardStatus | string
  timestamp?: string
  toolbar?: ReactNode
  content?: ReactNode
  footer?: ReactNode
  children?: ReactNode
  className?: string
  headerClassName?: string
}

export function DashboardPanel({ title, subtitle, status, timestamp, toolbar, content, footer, children, className = '', headerClassName = '' }: DashboardPanelProps) {
  return (
    <section className={`dashboard-panel ${className}`}>
      <header className={`panel-heading ${headerClassName}`}>
        <div className="panel-title-group"><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>
        <div className="panel-header-meta">{status && <StatusIndicator status={status as DashboardStatus} compact />}{timestamp && <time>{timestamp}</time>}{toolbar && <div className="panel-toolbar">{toolbar}</div>}</div>
      </header>
      <div className="panel-content">{content ?? children}</div>
      {footer && <footer className="panel-footer">{footer}</footer>}
    </section>
  )
}

export type { DataFreshness }
