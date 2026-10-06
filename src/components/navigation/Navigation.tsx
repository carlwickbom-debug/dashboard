import { Activity, Boxes, Building2, CloudCog, Radar, Ship, TrainFront, Wifi, Zap } from 'lucide-react'
import type { DashboardDefinition } from '../../data/models'

const icons: Record<string, typeof Activity> = {
  overview: Activity,
  energy: Zap,
  rail: TrainFront,
  traffic: Radar,
  datacenters: Building2,
  aviation: CloudCog,
  maritime: Ship,
  networks: Wifi,
  cyber: Boxes,
}

export function Navigation({ items, activeId, onSelect }: { items: Array<Pick<DashboardDefinition, 'id' | 'name' | 'category' | 'icon'>>; activeId: string; onSelect: (id: string) => void }) {
  return (
    <aside className="sidebar">
      <div className="brand-lockup"><div className="brand-logo" aria-label="Nordic operations"><img src="/assets/nordic-shield.svg" alt="Nordic operations shield" /><span>NO</span></div><div><strong>NORDIC OPS</strong><small>OPERATIONAL INTELLIGENCE</small></div></div>
      <div className="navigation-label">COMMAND CENTER</div>
      <nav className="dashboard-navigation" aria-label="Dashboard navigation">
        {items.map((item) => {
          const Icon = icons[item.id] ?? Activity
          return <button key={item.id} className={activeId === item.id ? 'active' : ''} onClick={() => onSelect(item.id)}><Icon size={17} /><span>{item.name}</span><i>{item.id === 'overview' ? '09' : String(items.indexOf(item) + 1).padStart(2, '0')}</i></button>
        })}
      </nav>
      <div className="sidebar-footer"><div className="sidebar-system"><span>CORE SERVICE</span><strong>ONLINE</strong></div><div className="sidebar-version">FRAMEWORK / 1.0</div></div>
    </aside>
  )
}
