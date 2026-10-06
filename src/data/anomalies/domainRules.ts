import type { AnomalyRule, AnomalyContext } from './anomaly'
import { createCapacityRule, createGeographicRule, createMissingDataRule, createRateOfChangeRule, createServiceStateRule, createThresholdRule, operationalEvent } from './anomaly'
import type { CyberData } from '../../dashboards/cyber/Cyber'
import type { DataCenterData } from '../../dashboards/datacenters/DataCenters'
import type { EnergyData } from '../../dashboards/energy/Energy'
import type { AviationData } from '../../dashboards/aviation/Aviation'
import type { MaritimeData } from '../../dashboards/maritime/Maritime'
import type { NetworksData } from '../../dashboards/networks/Networks'
import type { RailData } from '../../dashboards/rail/Rail'
import type { TrafficData } from '../../dashboards/traffic/Traffic'

export const energyAnomalyRules: AnomalyRule<EnergyData>[] = [
  createGeographicRule({
    id: 'consumption-above-country-baseline', name: 'Consumption above expected', dashboard: 'energy', source: 'Grid anomaly rules', category: 'Consumption', severity: 'HIGH', threshold: 1.5, direction: 'above',
    expectedByCountry: { Sweden: 15.2, Norway: 14, Denmark: 11.2, Finland: 10.4, Iceland: 4 },
    select: (data) => data.countries.map((country) => ({ value: country.consumption, country: country.country, region: 'National grid' })),
    title: (item) => `${item.country} consumption exceeds expected`,
    description: (item, expected, threshold) => `Consumption ${item.value} GW is more than ${threshold} GW above the expected ${expected} GW baseline.`,
  }),
]

export const railAnomalyRules: AnomalyRule<RailData>[] = [
  createThresholdRule({
    id: 'train-delay-threshold', name: 'Rail delay threshold', dashboard: 'rail', source: 'Rail anomaly rules', category: 'Delay', severity: 'HIGH', threshold: 'delayMinutes', direction: 'above',
    select: (data) => data.trains.map((train) => ({ value: train.delay, region: train.line })),
    title: (item) => `Delay threshold exceeded on ${item.region}`,
    description: (item, _expected, threshold) => `Current delay of ${item.value} minutes exceeds the ${threshold}-minute operating threshold.`,
  }),
]

export const trafficAnomalyRules: AnomalyRule<TrafficData>[] = [
  createThresholdRule({
    id: 'corridor-speed-below-target', name: 'Traffic speed below target', dashboard: 'traffic', source: 'Road anomaly rules', category: 'Traffic flow', severity: 'MEDIUM', threshold: 8, direction: 'below',
    select: (data) => data.congestion.map((corridor) => ({ value: corridor.current, expected: corridor.target, country: corridor.location.includes('Oslo') ? 'Norway' : corridor.location.includes('Helsinki') ? 'Finland' : corridor.location.includes('Gothenburg') ? 'Sweden' : undefined, region: `${corridor.road} · ${corridor.location}` })),
    title: (item) => `Traffic speed below expected at ${item.region}`,
    description: (item, expected, threshold) => `Observed speed ${item.value} km/h is more than ${threshold} km/h below the expected ${expected} km/h.`,
  }),
]

export const datacenterAnomalyRules: AnomalyRule<DataCenterData>[] = [
  createRateOfChangeRule({
    id: 'power-load-rate-change', name: 'Data center load changed rapidly', dashboard: 'datacenters', source: 'Facility anomaly rules', category: 'Power load', severity: 'HIGH', threshold: 'loadChangeMW', metricKey: 'itLoadMW',
    select: (data) => data.centers.map((center) => ({ historyKey: center.id, value: center.itLoadMW, country: center.country, region: center.name })),
    title: (item) => `Rapid power load change at ${item.region}`,
    description: (item, previous, threshold) => `IT load changed from ${previous} MW to ${item.value} MW, exceeding the ${threshold} MW change threshold.`,
  }),
  createCapacityRule({
    id: 'it-load-capacity', name: 'Facility nearing power capacity', dashboard: 'datacenters', source: 'Facility anomaly rules', category: 'Capacity', severity: 'CRITICAL', limit: 90,
    select: (data) => data.centers.map((center) => ({ value: center.itLoadMW, country: center.country, region: center.name })),
    utilization: (_data, observation) => {
      const center = _data.centers.find((item) => item.name === observation.region)
      return center?.powerCapacityMW && observation.value !== null && observation.value !== undefined ? observation.value / center.powerCapacityMW * 100 : null
    },
    title: (item) => `Power capacity threshold exceeded at ${item.region}`,
    description: (item, limit) => `Power utilization is ${item.value?.toFixed(1)}%, above the ${limit}% capacity threshold.`,
  }),
  createMissingDataRule({
    id: 'facility-capacity-missing', name: 'Facility capacity telemetry missing', dashboard: 'datacenters', source: 'Facility anomaly rules', category: 'Data quality', severity: 'MEDIUM',
    select: (data) => data.centers.map((center) => ({ value: center.powerCapacityMW, country: center.country, region: center.name })),
    title: (item) => `Power capacity missing at ${item.region}`,
    missingLabel: 'Power capacity telemetry',
  }),
  createServiceStateRule({
    id: 'facility-service-state', name: 'Facility service state changed', dashboard: 'datacenters', source: 'Facility anomaly rules', category: 'Service state',
    severity: (state) => state === 'MAJOR OUTAGE' ? 'CRITICAL' : state === 'PARTIAL OUTAGE' ? 'HIGH' : 'MEDIUM',
    select: (data) => data.centers.map((center) => ({ key: center.id, state: center.status, normalStates: ['OPERATIONAL'], country: center.country, region: center.name })),
  }),
]

export const networkAnomalyRules: AnomalyRule<NetworksData>[] = [
  createRateOfChangeRule({
    id: 'packet-loss-increase', name: 'Packet loss increased', dashboard: 'networks', source: 'Network anomaly rules', category: 'Packet loss', severity: 'HIGH', threshold: 'packetLossIncrease', metricKey: 'packetLossPercent',
    select: (data) => data.links.map((link) => ({ historyKey: link.id, value: link.packetLossPercent, region: `${link.sourceNode} → ${link.targetNode}`, country: data.nodes.find((node) => node.id === link.targetNode)?.country })),
    title: (item) => `Packet loss increased on ${item.region}`,
    description: (item, previous, threshold) => `Packet loss increased from ${previous}% to ${item.value}% (threshold ${threshold} percentage points).`,
  }),
]

export const cyberAnomalyRules: AnomalyRule<CyberData>[] = [{
  id: 'new-cisa-kev', name: 'New CISA KEV vulnerability', dashboard: 'cyber',
  evaluate(data, context: AnomalyContext) {
    const previous = context.previousState.data as CyberData | undefined
    if (!previous) return []
    const known = new Set(previous.vulnerabilities.filter((item) => item.cisaKev).map((item) => item.cve))
    return data.vulnerabilities.filter((item) => item.cisaKev && !known.has(item.cve)).map((item) => operationalEvent(this, context, {
      source: 'CISA KEV feed anomaly rule', category: 'Vulnerability', severity: item.severity === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
      title: `New CISA KEV vulnerability: ${item.cve}`,
      description: `${item.vendor} ${item.product} was newly added to the CISA Known Exploited Vulnerabilities catalog.`,
      country: item.affectedCountries[0], region: item.product,
    }))
  },
}]

export const aviationAnomalyRules: AnomalyRule<AviationData>[] = [
  createServiceStateRule({
    id: 'airport-operating-state', name: 'Airport operating state changed', dashboard: 'aviation', source: 'Aviation anomaly rules', category: 'Service state',
    severity: (state) => state === 'CLOSED' ? 'CRITICAL' : state === 'RESTRICTED' ? 'HIGH' : 'MEDIUM',
    select: (data) => data.airports.map((airport) => ({ key: airport.id, state: airport.status, normalStates: ['OPERATIONAL'], country: airport.country, region: airport.name })),
  }),
]

export const maritimeAnomalyRules: AnomalyRule<MaritimeData>[] = [
  createServiceStateRule({
    id: 'port-operating-state', name: 'Port operating state changed', dashboard: 'maritime', source: 'Maritime anomaly rules', category: 'Service state',
    severity: (state) => state === 'CLOSED' ? 'CRITICAL' : state === 'RESTRICTED' ? 'HIGH' : 'MEDIUM',
    select: (data) => data.ports.map((port) => ({ key: port.id, state: port.status, normalStates: ['OPERATIONAL'], country: port.country, region: port.name })),
  }),
]

export function dataCenterHistory(data: DataCenterData) {
  return Object.fromEntries(data.centers.flatMap((center) => center.itLoadMW === null ? [] : [[`itLoadMW:${center.id}`, center.itLoadMW]])) as Record<string, number>
}

export function networkHistory(data: NetworksData) {
  return Object.fromEntries(data.links.flatMap((link) => link.packetLossPercent === null ? [] : [[`packetLossPercent:${link.id}`, link.packetLossPercent]])) as Record<string, number>
}