import type { OperationalEvent } from '../../data/models'
import { SeverityBadge } from '../status/SeverityBadge'

export interface EventRowEvent extends OperationalEvent { domain?: string }

export function EventRow({ event, compact = false }: { event: EventRowEvent; compact?: boolean }) {
  return (
    <article className={`operational-event${compact ? ' compact' : ''}`}>
      <div className="event-time"><time dateTime={event.timestamp}>{event.timestamp}</time><SeverityBadge severity={event.severity} compact label={event.severity} /></div>
      <div className="event-copy"><div className="event-title-row"><h4>{event.title}</h4>{event.acknowledged && <span className="acknowledged">ACKNOWLEDGED</span>}</div><p>{event.description}</p><div className="event-meta"><span>{event.domain ?? event.source}</span><span>{event.source}</span>{event.region && <span>{event.region}</span>}{event.country && <span>{event.country}</span>}</div></div>
    </article>
  )
}

export function EventList({ events, emptyTitle = 'NO ANOMALIES DETECTED', emptyDescription = 'All monitored systems are within normal operating conditions.' }: { events: OperationalEvent[]; emptyTitle?: string; emptyDescription?: string }) {
  if (!events.length) return <div className="empty-state"><span>{emptyTitle}</span><p>{emptyDescription}</p></div>
  return <div className="event-list">{events.map((event) => <EventRow key={event.id} event={event} />)}</div>
}
