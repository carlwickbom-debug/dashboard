import type { OperationalEvent, Severity } from '../models'

export const event = (overrides: Partial<OperationalEvent> & Pick<OperationalEvent, 'id' | 'timestamp' | 'source' | 'category' | 'title' | 'description' | 'severity'>): OperationalEvent => ({ acknowledged: false, ...overrides })

export const events = {
  energy: [
    event({ id: 'e-1', timestamp: '09:42 UTC', source: 'Grid control', category: 'Generation', severity: 'HIGH', title: 'North sea wind forecast exceeds threshold', description: 'Generation reserve is below the normal operating margin.', region: 'North Sea' }),
    event({ id: 'e-2', timestamp: '08:16 UTC', source: 'Battery fleet', category: 'Storage', severity: 'LOW', title: 'Battery cycle completed', description: 'Reserve response completed within target bandwidth.', region: 'Southern Denmark' }),
  ],
  rail: [event({ id: 'r-1', timestamp: '09:27 UTC', source: 'Signal network', category: 'Infrastructure', severity: 'CRITICAL', title: 'Signal maintenance interruption', description: 'Line section C-14 is operating on reduced headway.', region: 'Stockholm Central' })],
  traffic: [event({ id: 't-1', timestamp: '09:18 UTC', source: 'Traffic sensors', category: 'Congestion', severity: 'MEDIUM', title: 'Tunnel queue threshold exceeded', description: 'Queue time is 7 minutes above the operating baseline.', region: 'Greater Stockholm' })],
  datacenters: [event({ id: 'd-1', timestamp: '08:54 UTC', source: 'Cooling telemetry', category: 'Infrastructure', severity: 'HIGH', title: 'Cooling delta outside tolerance', description: 'Primary cooling load is 12% above forecast.', region: 'Oslo, Norway' })],
  aviation: [event({ id: 'a-1', timestamp: '09:05 UTC', source: 'Traffic control', category: 'Weather', severity: 'HIGH', title: 'Convective weather cell', description: 'Approach corridor is restricted until 10:15 UTC.', region: 'Oslo International' })],
  maritime: [event({ id: 'm-1', timestamp: '08:41 UTC', source: 'Port telemetry', category: 'Navigation', severity: 'CRITICAL', title: 'Navigation aid unavailable', description: 'Port channel beacon is offline; vessel route is restricted.', region: 'Göteborg' })],
  networks: [event({ id: 'n-1', timestamp: '09:31 UTC', source: 'Network edge', category: 'Latency', severity: 'MEDIUM', title: 'Edge latency threshold exceeded', description: 'Regional edge cluster is operating above nominal latency.', region: 'Helsinki' })],
  cyber: [event({ id: 'c-1', timestamp: '09:36 UTC', source: 'SIEM', category: 'Detection', severity: 'CRITICAL', title: 'Credential spray pattern detected', description: 'Multi-source authentication attempts exceeded baseline.', region: 'Northern Europe' })],
}

export const severityValues: Severity[] = ['INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
