import { describe, expect, it } from 'vitest'
import { dashboardById, dashboardNavigation, enabledDashboards } from './registry'

describe('dashboard registry', () => {
  it('registers all eight operational dashboards', () => expect(enabledDashboards).toHaveLength(9))
  it('exposes a stable navigation contract', () => expect(dashboardNavigation.map((item) => item.id)).toEqual(['overview', 'energy', 'rail', 'traffic', 'datacenters', 'aviation', 'maritime', 'networks', 'cyber']))
  it('finds dashboards by stable identifier', () => expect(dashboardById('cyber')?.name).toBe('CYBER SECURITY'))
})
