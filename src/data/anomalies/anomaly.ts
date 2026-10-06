import type { OperationalEvent, Severity } from '../models'

export interface AnomalyTimestamps {
  current: string
  previous?: string
  firstObserved?: string
}

export interface AnomalyContext {
  historicalValues: Readonly<Record<string, readonly number[]>>
  baseline: Readonly<Record<string, number>>
  thresholds: Readonly<Record<string, number>>
  previousState: Readonly<Record<string, unknown>>
  timestamps: AnomalyTimestamps
}

export interface AnomalyRule<T> {
  id: string
  name: string
  dashboard: string
  evaluate(data: T, context: AnomalyContext): OperationalEvent[]
}

export interface AnomalyEventDetails {
  source: string
  category: string
  severity: Severity
  title: string
  description: string
  country?: string
  region?: string
  latitude?: number
  longitude?: number
}

export function operationalEvent(rule: Pick<AnomalyRule<never>, 'id' | 'name' | 'dashboard'>, context: AnomalyContext, details: AnomalyEventDetails): OperationalEvent {
  return {
    id: `${rule.dashboard}:${rule.id}:${details.country ?? 'regional'}:${details.region ?? 'unspecified'}`,
    timestamp: context.timestamps.current,
    relatedDashboard: rule.dashboard,
    ...details,
  }
}

interface ValueObservation {
  historyKey?: string
  value: number | null | undefined
  expected?: number
  country?: string
  region?: string
  latitude?: number
  longitude?: number
}

interface NumericRuleOptions<T> {
  id: string
  name: string
  dashboard: string
  source: string
  category: string
  severity: Severity
  threshold: number | string
  baselineKey?: string
  select(data: T): ValueObservation[]
  title(observation: ValueObservation): string
  description(observation: ValueObservation, expected: number, threshold: number): string
}

export function createThresholdRule<T>(options: NumericRuleOptions<T> & { direction: 'above' | 'below' }): AnomalyRule<T> {
  return {
    id: options.id,
    name: options.name,
    dashboard: options.dashboard,
    evaluate(data, context) {
      const threshold = typeof options.threshold === 'number' ? options.threshold : context.thresholds[options.threshold]
      if (threshold === undefined || !Number.isFinite(threshold)) return []
      return options.select(data).flatMap((observation) => {
        if (observation.value === null || observation.value === undefined || !Number.isFinite(observation.value)) return []
        const expected = observation.expected ?? (options.baselineKey ? context.baseline[options.baselineKey] : undefined) ?? 0
        const anomalous = options.direction === 'above' ? observation.value > expected + threshold : observation.value < expected - threshold
        if (!anomalous) return []
        return [operationalEvent(options, context, {
          source: options.source,
          category: options.category,
          severity: options.severity,
          title: options.title(observation),
          description: options.description(observation, expected, threshold),
          country: observation.country,
          region: observation.region,
          latitude: observation.latitude,
          longitude: observation.longitude,
        })]
      })
    },
  }
}

export function createRateOfChangeRule<T>(options: Omit<NumericRuleOptions<T>, 'threshold'> & { metricKey: string; threshold: number | string; direction?: 'increase' | 'decrease' }): AnomalyRule<T> {
  return {
    id: options.id,
    name: options.name,
    dashboard: options.dashboard,
    evaluate(data, context) {
      const threshold = typeof options.threshold === 'number' ? options.threshold : context.thresholds[options.threshold]
      if (threshold === undefined || !Number.isFinite(threshold)) return []
      return options.select(data).flatMap((observation) => {
        const history = context.historicalValues[observation.historyKey ? `${options.metricKey}:${observation.historyKey}` : options.metricKey] ?? []
        const previous = history[history.length - 1]
        if (previous === undefined) return []
        if (observation.value === null || observation.value === undefined) return []
        const delta = observation.value - previous
        const anomalous = options.direction === 'decrease' ? delta < -threshold : delta > threshold
        if (!anomalous) return []
        return [operationalEvent(options, context, {
          source: options.source,
          category: options.category,
          severity: options.severity,
          title: options.title(observation),
          description: options.description(observation, previous, threshold),
          country: observation.country,
          region: observation.region,
          latitude: observation.latitude,
          longitude: observation.longitude,
        })]
      })
    },
  }
}

export function createMissingDataRule<T>(options: Omit<NumericRuleOptions<T>, 'severity' | 'threshold' | 'description'> & { severity?: Severity; missingLabel?: string }): AnomalyRule<T> {
  return {
    id: options.id,
    name: options.name,
    dashboard: options.dashboard,
    evaluate(data, context) {
      return options.select(data).flatMap((observation) => {
        if (observation.value !== null && observation.value !== undefined) return []
        return [operationalEvent(options, context, {
          source: options.source,
          category: options.category,
          severity: options.severity ?? 'MEDIUM',
          title: options.title(observation),
          description: `${options.missingLabel ?? 'Required telemetry'} is missing; no value was reported for this observation.`,
          country: observation.country,
          region: observation.region,
          latitude: observation.latitude,
          longitude: observation.longitude,
        })]
      })
    },
  }
}

export interface StateObservation {
  key: string
  state: string
  normalStates: readonly string[]
  country?: string
  region?: string
}

export function createServiceStateRule<T>(options: {
  id: string
  name: string
  dashboard: string
  source: string
  category: string
  severity: (state: string) => Severity
  select(data: T): StateObservation[]
}): AnomalyRule<T> {
  return {
    id: options.id,
    name: options.name,
    dashboard: options.dashboard,
    evaluate(data, context) {
      const previous = context.previousState.data as T | undefined
      if (!previous) return []
      const priorStates = new Map(options.select(previous).map((item) => [item.key, item.state]))
      return options.select(data).flatMap((observation) => {
        const previousState = priorStates.get(observation.key)
        if (observation.normalStates.includes(observation.state) || observation.state === previousState) return []
        return [operationalEvent(options, context, {
          source: options.source,
          category: options.category,
          severity: options.severity(observation.state),
          title: `${options.name}: ${observation.key} ${observation.state.toLowerCase()}`,
          description: `${observation.key} changed from ${previousState ?? 'unreported'} to ${observation.state}.`,
          country: observation.country,
          region: observation.region ?? observation.key,
        })]
      })
    },
  }
}

export function createCapacityRule<T>(options: Omit<NumericRuleOptions<T>, 'threshold' | 'baselineKey'> & { limit: number; utilization(data: T, observation: ValueObservation): number | null | undefined }): AnomalyRule<T> {
  return {
    id: options.id,
    name: options.name,
    dashboard: options.dashboard,
    evaluate(data, context) {
      const threshold = context.thresholds[options.id] ?? 0
      return options.select(data).flatMap((observation) => {
        const utilization = options.utilization(data, observation)
        if (utilization === null || utilization === undefined || utilization <= options.limit + threshold) return []
        return [operationalEvent(options, context, {
          source: options.source,
          category: options.category,
          severity: options.severity,
          title: options.title(observation),
          description: options.description({ ...observation, value: utilization }, options.limit, threshold),
          country: observation.country,
          region: observation.region,
          latitude: observation.latitude,
          longitude: observation.longitude,
        })]
      })
    },
  }
}

export function createGeographicRule<T>(options: Omit<NumericRuleOptions<T>, 'threshold' | 'baselineKey'> & { threshold: number; direction: 'above' | 'below'; expectedByCountry?: Readonly<Record<string, number>> }): AnomalyRule<T> {
  return {
    id: options.id,
    name: options.name,
    dashboard: options.dashboard,
    evaluate(data, context) {
      return options.select(data).flatMap((observation) => {
        if (observation.value === null || observation.value === undefined || !observation.country) return []
        const expected = options.expectedByCountry?.[observation.country] ?? context.baseline[`${options.id}:${observation.country}`] ?? 0
        const anomalous = options.direction === 'above' ? observation.value > expected + options.threshold : observation.value < expected - options.threshold
        if (!anomalous) return []
        return [operationalEvent(options, context, {
          source: options.source,
          category: options.category,
          severity: options.severity,
          title: options.title(observation),
          description: options.description(observation, expected, options.threshold),
          country: observation.country,
          region: observation.region,
          latitude: observation.latitude,
          longitude: observation.longitude,
        })]
      })
    },
  }
}

export interface AnomalyAwareProvider<T> {
  load(): Promise<T>
  refresh(): Promise<T>
}

export function createAnomalyAwareProvider<T extends object>(options: {
  id: string
  provider: AnomalyAwareProvider<T>
  rules: readonly AnomalyRule<T>[]
  thresholds?: Record<string, number>
  baseline?: Record<string, number>
  historicalValues?: (data: T) => Record<string, number>
}): AnomalyAwareProvider<T> {
  let previousData: T | undefined
  const history: Record<string, number[]> = {}
  const emittedEvents = new Map<string, OperationalEvent>()
  let previousTimestamp: string | undefined

  const process = (data: T): T => {
    const prior = previousData
    const values = options.historicalValues?.(data) ?? {}
    const currentTimestamp = new Date().toISOString()
    const context: AnomalyContext = {
      historicalValues: Object.fromEntries(Object.entries(history).map(([key, value]) => [key, [...value]])),
      baseline: options.baseline ?? {},
      thresholds: options.thresholds ?? {},
      previousState: prior ? { data: prior } : {},
      timestamps: { current: currentTimestamp, ...(previousTimestamp ? { previous: previousTimestamp } : {}) },
    }
    const detected = options.rules.flatMap((rule) => rule.evaluate(data, context))
    for (const event of detected) {
      if (!emittedEvents.has(event.id)) emittedEvents.set(event.id, event)
    }
    previousData = data
    previousTimestamp = currentTimestamp
    for (const [key, value] of Object.entries(values)) {
      if (!Number.isFinite(value)) continue
      history[key] = [...(history[key] ?? []), value].slice(-100)
    }
    const record = data as T & { events?: OperationalEvent[] }
    const existing = record.events ?? []
    const ids = new Set(existing.map((event) => event.id))
    const anomalyEvents = [...emittedEvents.values()].filter((event) => !ids.has(event.id))
    return anomalyEvents.length ? { ...data, events: [...existing, ...anomalyEvents] } : data
  }

  return {
    async load() { return process(await options.provider.load()) },
    async refresh() { return process(await options.provider.refresh()) },
  }
}