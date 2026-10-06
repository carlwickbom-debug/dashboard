import type { OperationalEvent, Severity } from '../../data/models'
import { SeverityBadge } from '../status/SeverityBadge'

export function EventBadge({ event }: { event: OperationalEvent }) {
  return <span className={`event-badge event-badge-${event.severity.toLowerCase()}`}><SeverityBadge severity={event.severity as Severity} compact />{event.category}</span>
}

export function OperationalEventRow({ event }: { event: OperationalEvent }) {
  return (
    <article className="operational-event">
      <div className="event-time"><time>{event.timestamp}</time><SeverityBadge severity={event.severity} compact /></div>
      <div className="event-copy"><h4>{event.title}</h4><p>{event.description}</p><div className="event-meta"><span>{event.source}</span>{event.region && <span>{event.region}</span>}</div></div>
      {event.acknowledged && <span className="acknowledged">ACK</span>}
    </article>
  )
}
