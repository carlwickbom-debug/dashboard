import { Bell, Clock3, Radio, Search, Settings2 } from 'lucide-react'

export function TopBar({ theme, onThemeChange }: { theme: 'dark' | 'light'; onThemeChange: (theme: 'dark' | 'light') => void }) {
  const now = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'UTC' })
  return (
    <header className="topbar">
      <div className="topbar-context"><span className="system-code">NORDIC / OPS</span><span className="system-status"><i />ALL SYSTEMS NOMINAL</span></div>
      <div className="topbar-tools">
        <div className="topbar-time"><Clock3 size={14} /><span>{now} UTC</span><small>LOCAL +01:00</small></div>
        <div className="topbar-data"><Radio size={14} /><span>DATA FRESH</span><strong>00:15</strong></div>
        <div className="global-events"><span>EVENTS</span><strong>03</strong><i className="critical" /></div>
        <button className="topbar-icon" aria-label="Search"><Search size={16} /></button>
        <button className="topbar-icon" aria-label="Notifications"><Bell size={16} /><i /></button>
        <button className="topbar-icon" aria-label="Settings"><Settings2 size={16} /></button>
        <button className="theme-toggle" onClick={() => onThemeChange(theme === 'dark' ? 'light' : 'dark')} aria-label="Toggle theme"><span className={theme === 'dark' ? 'active' : ''}>DARK</span><span className={theme === 'light' ? 'active' : ''}>LIGHT</span></button>
      </div>
    </header>
  )
}
