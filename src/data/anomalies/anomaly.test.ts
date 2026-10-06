import { describe, expect, it } from 'vitest'
import type { OperationalEvent } from '../models'
import type { AnomalyRule } from './anomaly'
import { createAnomalyAwareProvider, createCapacityRule, createGeographicRule, createMissingDataRule, createRateOfChangeRule, createServiceStateRule, createThresholdRule } from './anomaly'
import { cyberAnomalyRules, energyAnomalyRules, networkAnomalyRules, railAnomalyRules, trafficAnomalyRules } from './domainRules'
import type { CyberData } from '../../dashboards/cyber/Cyber'
import type { EnergyData } from '../../dashboards/energy/Energy'
import type { NetworksData } from '../../dashboards/networks/Networks'
import type { RailData } from '../../dashboards/rail/Rail'
import type { TrafficData } from '../../dashboards/traffic/Traffic'

interface Sample { value: number | null; state: string; country: string; capacity: number; events?: OperationalEvent[] }

const context = {
  historicalValues: { metric: [10] },
  baseline: { metric: 20 },
  thresholds: { delta: 5 },
  previousState: { data: { value: 10, state: 'UP', country: 'Sweden', capacity: 100 } satisfies Sample },
  timestamps: { current: '2026-10-06T12:00:00Z', previous: '2026-10-06T11:00:00Z' },
}

const common = {
  name: 'Sample rule', dashboard: 'sample', source: 'test', category: 'Telemetry', severity: 'HIGH' as const,
  select: (data: Sample) => [{ value: data.value, country: data.country, region: 'Sample site' }],
  title: () => 'Sample anomaly',
  description: (item: { value: number | null | undefined }) => `Observed ${item.value}`,
}

describe('deterministic anomaly rules', () => {
  it('normalizes threshold anomalies as OperationalEvents and respects the threshold boundary', () => {
    const rule = createThresholdRule({ ...common, id: 'threshold', threshold: 5, direction: 'above', baselineKey: 'metric' })
    expect(rule.evaluate({ value: 26, state: 'UP', country: 'Sweden', capacity: 100 }, context)).toMatchObject([{ relatedDashboard: 'sample', category: 'Telemetry', severity: 'HIGH', timestamp: context.timestamps.current }])
    expect(rule.evaluate({ value: 25, state: 'UP', country: 'Sweden', capacity: 100 }, context)).toHaveLength(0)
  })

  it('detects rate changes only when historical values exist', () => {
    const rule = createRateOfChangeRule({ ...common, id: 'rate', threshold: 'delta', metricKey: 'metric' })
    expect(rule.evaluate({ value: 16, state: 'UP', country: 'Sweden', capacity: 100 }, context)).toHaveLength(1)
    expect(rule.evaluate({ value: 20, state: 'UP', country: 'Sweden', capacity: 100 }, { ...context, historicalValues: {} })).toHaveLength(0)
  })

  it('detects missing data, capacity excess, and geographic deviations', () => {
    const missing = createMissingDataRule({ ...common, id: 'missing', missingLabel: 'Link telemetry' })
    const capacity = createCapacityRule({ ...common, id: 'capacity', limit: 80, utilization: (_data, item) => item.value, description: (item, limit) => `${item.value}% over ${limit}%` })
    const geographic = createGeographicRule({ ...common, id: 'geographic', threshold: 5, direction: 'above', expectedByCountry: { Sweden: 10 }, description: (item, baseline) => `${item.value} vs ${baseline}` })
    const missingResult = missing.evaluate({ value: null, state: 'UP', country: 'Sweden', capacity: 100 }, context)
    expect(missingResult[0].category).toBe('Telemetry')
    expect(capacity.evaluate({ value: 81, state: 'UP', country: 'Sweden', capacity: 100 }, context)).toHaveLength(1)
    expect(geographic.evaluate({ value: 16, state: 'UP', country: 'Sweden', capacity: 100 }, context)).toHaveLength(1)
  })

  it('detects service-state transitions only after a previous state exists', () => {
    const rule: AnomalyRule<Sample> = createServiceStateRule({
      id: 'state', name: 'Service state', dashboard: 'sample', source: 'test', category: 'Service', severity: () => 'CRITICAL',
      select: (data) => [{ key: 'sample', state: data.state, normalStates: ['UP'] }],
    })
    expect(rule.evaluate({ value: 1, state: 'DOWN', country: 'Sweden', capacity: 100 }, context)).toHaveLength(1)
    expect(rule.evaluate({ value: 1, state: 'DOWN', country: 'Sweden', capacity: 100 }, { ...context, previousState: {} })).toHaveLength(0)
  })

  it('appends provider rule events without dropping existing events', async () => {
    const rule = createThresholdRule({ ...common, id: 'threshold', threshold: 5, direction: 'above' })
    const source = { value: 6, state: 'UP', country: 'Sweden', capacity: 100, events: [{ id: 'existing', timestamp: 'now', source: 'fixture', category: 'Existing', severity: 'INFO' as const, title: 'Existing', description: 'Preserved' }] }
    const provider = createAnomalyAwareProvider({
      id: 'sample', provider: {
        load: async () => source,
        refresh: async () => ({ value: 6, state: 'UP', country: 'Sweden', capacity: 100, events: [] }),
      },
      rules: [rule],
    })
    const result = await provider.load()
    expect(result.events).toHaveLength(2)
    expect(result.events?.[1]).toMatchObject({ id: 'sample:threshold:Sweden:Sample site', relatedDashboard: 'sample' })
    expect((await provider.refresh()).events).toHaveLength(1)
  })

  it('applies concrete energy, rail, traffic, and packet-loss rules', () => {
    expect(energyAnomalyRules[0].evaluate({ countries: [{ country: 'Sweden', consumption: 18 }] } as EnergyData, { ...context, previousState: {} })).toHaveLength(1)
    expect(railAnomalyRules[0].evaluate({ trains: [{ delay: 12, line: 'North' }] } as RailData, { ...context, thresholds: { delayMinutes: 10 } })).toHaveLength(1)
    expect(trafficAnomalyRules[0].evaluate({ congestion: [{ current: 40, target: 55, road: 'E18', location: 'Stockholm' }] } as TrafficData, context)).toHaveLength(1)
    const networkData = { links: [{ id: 'link-1', packetLossPercent: 1.2, sourceNode: 'A', targetNode: 'B' }], nodes: [] } as unknown as NetworksData
    expect(networkAnomalyRules[0].evaluate(networkData, { ...context, historicalValues: { 'packetLossPercent:link-1': [0.2] }, thresholds: { packetLossIncrease: 0.5 } })).toHaveLength(1)
  })

  it('detects only a newly observed CISA KEV vulnerability after baseline load', () => {
    const baseline = { vulnerabilities: [{ cve: 'CVE-OLD', cisaKev: true }] } as CyberData
    const current = { vulnerabilities: [{ cve: 'CVE-OLD', cisaKev: true }, { cve: 'CVE-NEW', cisaKev: true, severity: 'HIGH', vendor: 'Example', product: 'Service', affectedCountries: ['Sweden'] }] } as CyberData
    expect(cyberAnomalyRules[0].evaluate(current, { ...context, previousState: { data: baseline } })).toMatchObject([{ title: 'New CISA KEV vulnerability: CVE-NEW', relatedDashboard: 'cyber' }])
  })
})