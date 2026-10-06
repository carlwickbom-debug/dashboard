import type { DashboardSnapshot, OperationalEvent, Severity } from './models'

export const severityOrder: Severity[] = ['INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

export function normalizeSeverity(value: string): Severity {
  return severityOrder.includes(value.toUpperCase() as Severity) ? value.toUpperCase() as Severity : 'INFO'
}

export function severityRank(severity: Severity): number {
  return severityOrder.indexOf(severity)
}

export function mostSevereEvent(events: OperationalEvent[]): OperationalEvent | undefined {
  return [...events].sort((left, right) => severityRank(right.severity) - severityRank(left.severity))[0]
}

export function dashboardStatus(snapshot: DashboardSnapshot): DashboardSnapshot['status'] {
  if (snapshot.freshness === 'OFFLINE') return 'UNAVAILABLE'
  if (snapshot.events.some((event) => event.severity === 'CRITICAL')) return 'CRITICAL'
  if (snapshot.events.some((event) => event.severity === 'HIGH')) return 'WARNING'
  return snapshot.status
}
