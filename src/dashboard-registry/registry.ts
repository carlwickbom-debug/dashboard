import type { DashboardDefinition } from '../data/models'
import { overviewProvider } from '../dashboards/overview/provider'
import { energyProvider } from '../dashboards/energy/provider'
import { railProvider } from '../dashboards/rail/provider'
import { trafficProvider } from '../dashboards/traffic/provider'
import { datacentersProvider } from '../dashboards/datacenters/provider'
import { aviationProvider } from '../dashboards/aviation/provider'
import { maritimeProvider } from '../dashboards/maritime/provider'
import { networksProvider } from '../dashboards/networks/provider'
import { cyberProvider } from '../dashboards/cyber/provider'

export type RegisteredDashboard = DashboardDefinition<any>

export const dashboardRegistry: RegisteredDashboard[] = [
  overviewProvider,
  energyProvider,
  railProvider,
  trafficProvider,
  datacentersProvider,
  aviationProvider,
  maritimeProvider,
  networksProvider,
  cyberProvider,
]

export const enabledDashboards = dashboardRegistry.filter((dashboard) => dashboard.enabled)

export const dashboardById = (id: string) => dashboardRegistry.find((dashboard) => dashboard.id === id)

export const dashboardNavigation = enabledDashboards.map(({ id, name, icon, category }) => ({ id, name, icon, category }))
