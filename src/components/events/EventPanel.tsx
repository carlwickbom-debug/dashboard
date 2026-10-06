import type { OperationalEvent } from '../../data/models'
import { EventRow, EventList } from './EventRow'

export function EventPanel({ events, title = 'Events outside normal operating conditions', compact = false }: { events: OperationalEvent[]; title?: string; compact?: boolean }) {
  return <section className={`dashboard-panel event-panel${compact ? ' compact' : ''}`}><header className="panel-heading"><div><h2>{title}</h2><p>{events.length} active condition{events.length === 1 ? '' : 's'}</p></div>{events[0] && <span className={`event-badge event-badge-${events[0].severity.toLowerCase()}`}>{events[0].category}</span>}</header><EventList events={events} /></section>
}

export function MapPanel({ title, subtitle, children, selectedId, onSelect }: { title: string; subtitle: string; children: React.ReactNode; selectedId?: string; onSelect?: (id: string) => void }) {
  return <section className="dashboard-panel map-panel"><header className="panel-heading"><div><h2>{title}</h2><p>{subtitle}</p></div><span className="map-mode">LIVE / VECTOR</span></header>{children}</section>
}
