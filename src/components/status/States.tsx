import { AlertTriangle, LoaderCircle, SearchX } from 'lucide-react'
import type { ReactNode } from 'react'

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="empty-state"><SearchX size={20} aria-hidden="true" /><strong>{title}</strong><p>{description}</p>{action}</div>
}

export function LoadingState({ label = 'Loading operational data' }: { label?: string }) {
  return <div className="loading-state" role="status"><LoaderCircle className="spin" size={22} aria-hidden="true" /><strong>{label}</strong><span>Synchronizing source telemetry</span></div>
}

export function ErrorState({ title = 'Data source unavailable', description, action }: { title?: string; description: string; action?: ReactNode }) {
  return <div className="error-state" role="alert"><AlertTriangle size={21} aria-hidden="true" /><strong>{title}</strong><p>{description}</p>{action}</div>
}
