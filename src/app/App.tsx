import { useEffect, useMemo, useState } from 'react'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { Navigation } from '../components/navigation/Navigation'
import { TopBar } from '../components/layout/TopBar'
import { dashboardById, dashboardNavigation, enabledDashboards } from '../dashboard-registry/registry'
import { useDashboardData } from '../hooks/useDashboardData'
import { LoadingPanel } from '../components/status/LoadingPanel'

export function App() {
  const [activeId, setActiveId] = useState('overview')
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const activeDashboard = useMemo(() => dashboardById(activeId) ?? enabledDashboards[0], [activeId])
  const { data, loading, error, refreshing, refresh } = useDashboardData(activeDashboard.provider)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    const current = window.location.hash.slice(1)
    if (dashboardById(current)) setActiveId(current)
  }, [])

  const selectDashboard = (id: string) => {
    setActiveId(id)
    window.history.replaceState(null, '', `#${id}`)
  }

  const Dashboard = activeDashboard.component
  return (
    <div className="app-shell">
      <Navigation items={dashboardNavigation} activeId={activeId} onSelect={selectDashboard} />
      <div className="app-main">
        <TopBar theme={theme} onThemeChange={setTheme} />
        <DashboardLayout dashboard={activeDashboard}>
          {loading ? <LoadingPanel /> : error || !data ? <div className="dashboard-panel error-panel"><h2>DATA SOURCE UNAVAILABLE</h2><p>{error ?? 'The dashboard returned no data.'}</p><button onClick={() => void refresh()}>RETRY</button></div> : <Dashboard data={data} />}
        </DashboardLayout>
      </div>
    </div>
  )
}
