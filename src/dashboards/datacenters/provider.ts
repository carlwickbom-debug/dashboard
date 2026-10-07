import type { DashboardDefinition } from '../../data/models'
import { createMockProvider } from '../../data/providers/mockProvider'
import { createAnomalyAwareProvider } from '../../data/anomalies/anomaly'
import { datacenterAnomalyRules, dataCenterHistory } from '../../data/anomalies/domainRules'
import { createDataCenterProvider } from '../../data/providers/domainFactories'
import type { DataCenterDataProvider } from '../../data/providers/contracts'
import { events } from '../../data/mock/mockData'
import { DataCenters, type DataCenterData } from './DataCenters'

const data: DataCenterData = {
  snapshot: { status: 'WARNING', health: 84, headline: 'Cooling load elevated at one facility', updatedAt: '08:54 UTC', source: 'Nordic facility telemetry mesh', freshness: 'STALE', summary: 'All critical workloads are operating, but one facility is outside its cooling tolerance.' },
  centers: [
    { id: 'dc-oslo', name: 'Oslo Core', operator: 'Nordic Cloud Systems', country: 'Norway', city: 'Oslo', latitude: 59.91, longitude: 10.75, tier: 'TIER 1', powerCapacityMW: 42, itLoadMW: 31, coolingTechnology: 'Liquid cooling', pue: 1.7, renewableEnergyPercentage: 88, networkConnectivity: 'Dual redundant', cloudProviders: ['AWS', 'Azure'], status: 'DEGRADED', availability: 99.8, lastUpdated: '08:54 UTC' },
    { id: 'dc-stockholm', name: 'Stockholm Edge', operator: 'Northstar Systems', country: 'Sweden', city: 'Stockholm', latitude: 59.33, longitude: 18.07, tier: 'TIER 2', powerCapacityMW: 28, itLoadMW: 24, coolingTechnology: 'Free cooling', pue: 1.8, renewableEnergyPercentage: 72, networkConnectivity: 'Primary', cloudProviders: ['Google Cloud'], status: 'OPERATIONAL', availability: 99.9, lastUpdated: '08:52 UTC' },
    { id: 'dc-copenhagen', name: 'Copenhagen Relay', operator: 'Cloud Nordic AB', country: 'Denmark', city: 'Copenhagen', latitude: 55.68, longitude: 12.57, tier: 'TIER 3', powerCapacityMW: 18, itLoadMW: 11, coolingTechnology: 'Hybrid cooling', pue: 1.9, renewableEnergyPercentage: 64, networkConnectivity: 'Primary', cloudProviders: ['AWS'], status: 'OPERATIONAL', availability: 99.95, lastUpdated: '08:53 UTC' },
    { id: 'dc-helsinki', name: 'Helsinki Relay', operator: null, country: 'Finland', city: 'Helsinki', latitude: 60.17, longitude: 24.94, tier: null, powerCapacityMW: null, itLoadMW: 18, coolingTechnology: null, pue: null, renewableEnergyPercentage: null, networkConnectivity: null, cloudProviders: null, status: 'UNKNOWN', availability: null, lastUpdated: null },
    { id: 'dc-reykjavik', name: 'Reykjavík Regional', operator: 'North Atlantic Hosting', country: 'Iceland', city: 'Reykjavík', latitude: 64.15, longitude: -21.94, tier: 'TIER 2', powerCapacityMW: 14, itLoadMW: 9, coolingTechnology: 'Air cooling', pue: 2.1, renewableEnergyPercentage: 96, networkConnectivity: 'Single provider', cloudProviders: ['Azure'], status: 'MAINTENANCE', availability: 99.1, lastUpdated: '08:43 UTC' },
    { id: 'dc-gothenburg', name: 'Gothenburg Transit', operator: 'Northstar Systems', country: 'Sweden', city: 'Gothenburg', latitude: 57.71, longitude: 12.0, tier: 'TIER 1', powerCapacityMW: 34, itLoadMW: 30, coolingTechnology: 'Liquid cooling', pue: 1.6, renewableEnergyPercentage: 81, networkConnectivity: 'Dual redundant', cloudProviders: ['AWS', 'Google Cloud'], status: 'PARTIAL OUTAGE', availability: 98.4, lastUpdated: '08:50 UTC' },
  ],
  incidents: [
    { id: 'dc-inc-1', title: 'Cooling delta outside tolerance', location: 'Oslo Core', severity: 'HIGH', time: '08:54 UTC', detail: 'Primary cooling load is 12% above forecast. Backup cooling is active.' },
    { id: 'dc-inc-2', title: 'Northwest network isolation', location: 'Gothenburg Transit', severity: 'HIGH', time: '08:50 UTC', detail: 'One network path is unavailable while the redundant path remains active.' },
    { id: 'dc-inc-3', title: 'Scheduled maintenance window', location: 'Reykjavík Regional', severity: 'MEDIUM', time: '08:43 UTC', detail: 'Power module replacement is scheduled for the next operating window.' },
  ],
  events: [
    { ...events.datacenters[0], country: 'Norway', latitude: 59.91, longitude: 10.75, relatedDashboard: 'datacenters' },
    { id: 'dc-event-2', timestamp: '08:50 UTC', source: 'Facility network', country: 'Sweden', category: 'Network', severity: 'HIGH', title: 'Network path isolation detected', description: 'Primary path unavailable at Gothenburg Transit.', latitude: 57.71, longitude: 12.0, relatedDashboard: 'datacenters' },
    { id: 'dc-event-3', timestamp: '08:43 UTC', source: 'Facility operations', country: 'Iceland', category: 'Maintenance', severity: 'MEDIUM', title: 'Power module maintenance started', description: 'Reykjavík Regional entered a planned maintenance window.', latitude: 64.15, longitude: -21.94, relatedDashboard: 'datacenters' },
    { id: 'dc-event-4', timestamp: '08:34 UTC', source: 'Power telemetry', country: 'Finland', category: 'Power', severity: 'LOW', title: 'Load increased unexpectedly', description: 'Helsinki Relay load increased 4% above the previous hourly baseline.', latitude: 60.17, longitude: 24.94, relatedDashboard: 'datacenters' },
  ],
  providers: [
    { name: 'FACILITY TELEMETRY', freshness: 'STALE', latency: '184 ms', status: 'WARNING' },
    { name: 'POWER MONITORING', freshness: 'FRESH', latency: '72 ms', status: 'OK' },
    { name: 'COOLING SYSTEMS', freshness: 'DEGRADED', latency: '213 ms', status: 'WARNING' },
    { name: 'NETWORK OBSERVABILITY', freshness: 'LIVE', latency: '59 ms', status: 'OK' },
  ],
  mapLayers: [{ id: 'dc-capacity', label: 'Facility capacity', color: '#5b9fec', points: [{ id: 'dc-oslo', label: 'Oslo Core', latitude: 59.91, longitude: 10.75, severity: 'HIGH', detail: '42 MW · Degraded' }, { id: 'dc-stockholm', label: 'Stockholm Edge', latitude: 59.33, longitude: 18.07, severity: 'LOW', detail: '28 MW · Operational' }, { id: 'dc-gothenburg', label: 'Gothenburg Transit', latitude: 57.71, longitude: 12.0, severity: 'HIGH', detail: '34 MW · Partial outage' }, { id: 'dc-helsinki', label: 'Helsinki Relay', latitude: 60.17, longitude: 24.94, severity: 'INFO', detail: 'Capacity unknown' }, { id: 'dc-copenhagen', label: 'Copenhagen Relay', latitude: 55.68, longitude: 12.57, severity: 'LOW', detail: '18 MW · Operational' }, { id: 'dc-reykjavik', label: 'Reykjavík Regional', latitude: 64.15, longitude: -21.94, severity: 'MEDIUM', detail: '14 MW · Maintenance' }] }],
}

export const datacentersProvider: DashboardDefinition<DataCenterData, DataCenterDataProvider> = { id: 'datacenters', name: 'DATA CENTERS', description: 'Facility capacity, power, cooling, network, energy and service availability across Nordic countries.', icon: 'building', category: 'Infrastructure', component: DataCenters, enabled: true, provider: createDataCenterProvider(createAnomalyAwareProvider({ id: 'datacenters', provider: createMockProvider('datacenters', data), rules: datacenterAnomalyRules, thresholds: { loadChangeMW: 5 }, historicalValues: dataCenterHistory })) }
