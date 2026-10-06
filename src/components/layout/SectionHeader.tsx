import type { ReactNode } from 'react'

export function SectionHeader({ eyebrow, title, description, action, className = '' }: { eyebrow?: string; title: string; description?: string; action?: ReactNode; className?: string }) {
  return <header className={`section-header ${className}`}><div><span className="section-eyebrow">{eyebrow}</span><h2>{title}</h2>{description && <p>{description}</p>}</div>{action && <div className="section-action">{action}</div>}</header>
}
