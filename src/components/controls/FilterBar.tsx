import type { ReactNode } from 'react'

export function FilterBar({ filters, active, onChange, label = 'Filter' }: { filters: string[]; active?: string; onChange?: (value: string) => void; label?: string }) {
  return <div className="filter-bar" role="group" aria-label={label}>{filters.map((filter) => <button key={filter} type="button" className={active === filter ? 'active' : ''} aria-pressed={active === filter} onClick={() => onChange?.(filter)}>{filter}</button>)}</div>
}

export function TabBar({ tabs, active, onChange }: { tabs: string[]; active?: string; onChange?: (value: string) => void }) {
  return <div className="tab-bar" role="tablist">{tabs.map((tab) => <button key={tab} type="button" role="tab" aria-selected={active === tab} className={active === tab ? 'active' : ''} onClick={() => onChange?.(tab)}>{tab}</button>)}</div>
}

export function Toolbar({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`toolbar ${className}`}>{children}</div>
}
