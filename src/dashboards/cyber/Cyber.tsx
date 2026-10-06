import { useMemo, useState } from 'react'
import { AlertTriangle, CalendarClock, CheckCircle2, CircleDot, Clock3, Filter, Gauge, Network, PackageSearch, Radar, Search, ShieldCheck, ShieldAlert, Sparkles, TriangleAlert } from 'lucide-react'
import type { DashboardStatus, DataFreshness, OperationalEvent, Severity } from '../../data/models'
import { AlertBanner } from '../../components/events/AlertBanner'
import { EventList } from '../../components/events/EventRow'
import { DashboardGrid, DashboardPanel } from '../../components/layout/DashboardLayout'
import { DataFreshnessIndicator } from '../../components/status/DataFreshnessIndicator'
import { HealthIndicator, SeverityBadge } from '../../components/status/SeverityBadge'
import { StatusIndicator } from '../../components/status/StatusIndicator'

export type VulnerabilitySeverity = Severity
export type VulnerabilityStatus = 'OPEN' | 'IN_PROGRESS' | 'MITIGATED' | 'NOT_APPLICABLE' | 'UNKNOWN'
export interface Vulnerability {
  id: string; cve: string; vendor: string; product: string; version: string; cvss: number | null; severity: VulnerabilitySeverity; cisaKev: boolean; dateAdded: string; dueDate: string; published: string; lastModified: string; description: string; exploitAvailable: boolean; affectedCountries: string[]; status: VulnerabilityStatus
}
export interface CyberProviderHealth { name: string; freshness: DataFreshness; latency: string; status: DashboardStatus }
export interface CyberEvent extends OperationalEvent { affectedProduct?: string; affectedVendor?: string; cve?: string }
export interface CyberData {
  snapshot: { status: DashboardStatus; health: number; headline: string; updatedAt: string; source: string; freshness: DataFreshness; summary: string }
  vulnerabilities: Vulnerability[]; providers: CyberProviderHealth[]; events: CyberEvent[]; abnormalEvents: CyberEvent[]; source: string
}

export type CyberFilters = { country: string; vendor: string; product: string; severity: string; cisaKev: string; age: string; status: string }
const severityRank: Record<VulnerabilitySeverity, number> = { CRITICAL: 5, HIGH: 4, MEDIUM: 3, LOW: 2, INFO: 1 }
const statusClass: Record<VulnerabilityStatus, string> = { OPEN: 'open', IN_PROGRESS: 'in-progress', MITIGATED: 'mitigated', NOT_APPLICABLE: 'not-applicable', UNKNOWN: 'unknown' }
const emptyFilters: CyberFilters = { country: '', vendor: '', product: '', severity: '', cisaKev: '', age: '', status: '' }
const ageLabels = ['0-30 days', '31-90 days', '91-180 days', '181-365 days', 'Over 365 days']

function filterAge(vulnerability: Vulnerability, age: string) {
  const ageDays = Math.max(0, Math.floor((Date.now() - new Date(vulnerability.dateAdded).getTime()) / 86400000))
  return age === '' || age === '0-30 days' ? ageDays <= 30 : age === '31-90 days' ? ageDays <= 90 : age === '91-180 days' ? ageDays <= 180 : age === '181-365 days' ? ageDays <= 365 : ageDays > 365
}

function VulnerabilityTable({ vulnerabilities }: { vulnerabilities: Vulnerability[] }) {
  return <div className="cyber-vulnerability-table">{vulnerabilities.length ? vulnerabilities.map((vulnerability) => <article className={`cyber-vulnerability ${vulnerability.severity.toLowerCase()}`} key={vulnerability.id}><div className="cyber-vulnerability-main"><div className="cyber-vulnerability-id"><strong>{vulnerability.cve}</strong><span>{vulnerability.id}</span></div><div className="cyber-vulnerability-product"><strong>{vulnerability.product}</strong><span>{vulnerability.vendor} · {vulnerability.version}</span></div><p>{vulnerability.description}</p></div><div className="cyber-vulnerability-status"><SeverityBadge severity={vulnerability.severity} compact /><span className={`cyber-status status-${statusClass[vulnerability.status]}`}>{vulnerability.status.replace('_', ' ')}</span>{vulnerability.cisaKev && <span className="cisa-tag">CISA KEV</span>}{vulnerability.exploitAvailable && <span className="exploit-tag">EXPLOITED</span>}{vulnerability.dueDate && new Date(vulnerability.dueDate) < new Date() && vulnerability.status !== 'MITIGATED' && <span className="overdue-tag">OVERDUE</span>}</div><div className="cyber-vulnerability-meta"><span>CVSS {vulnerability.cvss === null ? 'Unknown' : vulnerability.cvss.toFixed(1)}</span><span>Added {vulnerability.dateAdded}</span><span>Due {vulnerability.dueDate}</span></div></article>) : <div className="empty-state"><strong>NO VULNERABILITIES</strong><p>Adjust the active filters to reveal matching findings.</p></div>}</div>
}

function AgeDistribution({ vulnerabilities }: { vulnerabilities: Vulnerability[] }) {
  const buckets = ageLabels.map((label, index) => {
    const values = vulnerabilities.filter((item) => {
      const days = Math.max(0, Math.floor((Date.now() - new Date(item.dateAdded).getTime()) / 86400000))
      return index === 0 ? days <= 30 : index === 1 ? days <= 90 : index === 2 ? days <= 180 : index === 3 ? days <= 365 : days > 365
    })
    return { label, value: values.length }
  })
  const max = Math.max(...buckets.map((bucket) => bucket.value), 1)
  return <div className="cyber-age-distribution">{buckets.map((bucket) => <div className="cyber-age-row" key={bucket.label}><span>{bucket.label}</span><div><i style={{ width: `${bucket.value / max * 100}%` }} /></div><strong>{bucket.value}</strong></div>)}</div>
}

function VendorConcentration({ vulnerabilities }: { vulnerabilities: Vulnerability[] }) {
  const grouped = vulnerabilities.reduce<Record<string, number>>((result, vulnerability) => { result[vulnerability.vendor] = (result[vulnerability.vendor] ?? 0) + 1; return result }, {})
  const entries = Object.entries(grouped).sort((a, b) => b[1] - a[1]).slice(0, 7)
  const max = Math.max(...entries.map((entry) => entry[1]), 1)
  return <div className="cyber-vendor-concentration">{entries.map(([vendor, count]) => <div key={vendor}><span>{vendor}</span><div><i style={{ width: `${count / max * 100}%` }} /></div><strong>{count}</strong></div>)}</div>
}

function FilterControls({ filters, onChange, options }: { filters: CyberFilters; onChange: (filters: CyberFilters) => void; options: { countries: string[]; vendors: string[]; products: string[]; statuses: VulnerabilityStatus[] } }) {
  const set = (key: keyof CyberFilters, value: string) => onChange({ ...filters, [key]: value })
  return <div className="cyber-filters"><div className="cyber-filter-heading"><Filter size={13} /><span>FILTERS</span><small>{Object.values(filters).filter(Boolean).length} active</small></div><div className="cyber-filter-grid"><label>Country<select value={filters.country} onChange={(event) => set('country', event.target.value)}><option value="">All countries</option>{options.countries.map((item) => <option key={item}>{item}</option>)}</select></label><label>Vendor<select value={filters.vendor} onChange={(event) => set('vendor', event.target.value)}><option value="">All vendors</option>{options.vendors.map((item) => <option key={item}>{item}</option>)}</select></label><label>Product<select value={filters.product} onChange={(event) => set('product', event.target.value)}><option value="">All products</option>{options.products.map((item) => <option key={item}>{item}</option>)}</select></label><label>Severity<select value={filters.severity} onChange={(event) => set('severity', event.target.value)}><option value="">All severities</option><option>CRITICAL</option><option>HIGH</option><option>MEDIUM</option><option>LOW</option><option>INFO</option></select></label><label>CISA KEV<select value={filters.cisaKev} onChange={(event) => set('cisaKev', event.target.value)}><option value="">All findings</option><option value="KEV">CISA KEV only</option><option value="NON_KEV">Non-KEV</option></select></label><label>Age<select value={filters.age} onChange={(event) => set('age', event.target.value)}><option value="">All ages</option>{ageLabels.map((item) => <option key={item}>{item}</option>)}</select></label><label>Status<select value={filters.status} onChange={(event) => set('status', event.target.value)}><option value="">All statuses</option>{options.statuses.map((item) => <option key={item}>{item}</option>)}</select></label></div>{Object.values(filters).some(Boolean) && <button className="cyber-clear-filter" onClick={() => onChange(emptyFilters)}>Clear filters</button>}</div>
}

export function Cyber({ data }: { data: CyberData }) {
  const [filters, setFilters] = useState<CyberFilters>(emptyFilters)
  const [search, setSearch] = useState('')
  const vulnerabilities = useMemo(() => data.vulnerabilities.filter((item) => {
    const countryMatches = !filters.country || item.affectedCountries.includes(filters.country)
    const vendorMatches = !filters.vendor || item.vendor === filters.vendor
    const productMatches = !filters.product || item.product === filters.product
    const severityMatches = !filters.severity || item.severity === filters.severity
    const kevMatches = !filters.cisaKev || (filters.cisaKev === 'KEV' ? item.cisaKev : !item.cisaKev)
    const statusMatches = !filters.status || item.status === filters.status
    const searchMatches = !search || [item.cve, item.id, item.vendor, item.product, item.description].some((value) => value.toLowerCase().includes(search.toLowerCase()))
    return countryMatches && vendorMatches && productMatches && severityMatches && kevMatches && statusMatches && searchMatches && filterAge(item, filters.age)
  }), [data.vulnerabilities, filters, search])
  const critical = data.vulnerabilities.filter((item) => item.severity === 'CRITICAL')
  const kev = data.vulnerabilities.filter((item) => item.cisaKev)
  const newVulnerabilities = data.vulnerabilities.filter((item) => Math.floor((Date.now() - new Date(item.published).getTime()) / 86400000) <= 30)
  const overdue = data.vulnerabilities.filter((item) => item.status !== 'MITIGATED' && new Date(item.dueDate) < new Date())
  const exploited = data.vulnerabilities.filter((item) => item.exploitAvailable || item.cisaKev)
  const highExposure = data.vulnerabilities.filter((item) => item.severity === 'CRITICAL' || item.severity === 'HIGH')
  const nordicRelevant = data.vulnerabilities.filter((item) => item.affectedCountries.some((country) => ['Norway', 'Sweden', 'Finland', 'Denmark', 'Iceland'].includes(country)))
  const urgentEvents = data.abnormalEvents.filter((event) => event.severity === 'CRITICAL' || event.severity === 'HIGH')
  const options = useMemo(() => ({ countries: [...new Set(data.vulnerabilities.flatMap((item) => item.affectedCountries))].sort(), vendors: [...new Set(data.vulnerabilities.map((item) => item.vendor))].sort(), products: [...new Set(data.vulnerabilities.map((item) => item.product))].sort(), statuses: [...new Set(data.vulnerabilities.map((item) => item.status))].sort() }), [data.vulnerabilities])
  const exposureScore = Math.min(100, Math.round((critical.length * 8 + kev.length * 7 + overdue.length * 5 + exploited.length * 4) / Math.max(data.vulnerabilities.length, 1)))
  const highExposureCount = highExposure.length
  const riskStatus: DashboardStatus = critical.length || overdue.length ? 'CRITICAL' : kev.length || highExposureCount ? 'WARNING' : 'OK'

  return <>
    <section className="overview-strip cyber-command-strip"><div><StatusIndicator status={data.snapshot.status} label={data.snapshot.headline} description={data.snapshot.summary} /><p>Defensive vulnerability monitoring, exploitation status, remediation posture, affected products and Nordic exposure.</p></div><div className="overview-strip-meta"><HealthIndicator health={data.snapshot.health} /><DataFreshnessIndicator updatedAt={data.snapshot.updatedAt} freshness={data.snapshot.freshness} /></div></section>
    <DashboardGrid columns={4}>
      <DashboardPanel title="Cyber risk posture" subtitle="Weighted exposure index" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="cyber-kpi"><strong>{exposureScore}<small>/100</small></strong><span className={riskStatus === 'CRITICAL' ? 'critical' : riskStatus === 'WARNING' ? 'warning' : 'normal'}><Gauge size={12} /> {riskStatus}</span><p>{critical.length} critical · {kev.length} CISA KEV · {overdue.length} overdue</p></div></DashboardPanel>
      <DashboardPanel title="CISA KEV" subtitle="Known exploited vulnerabilities" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="cyber-kpi"><strong>{kev.length}<small> findings</small></strong><span className={kev.length ? 'critical' : 'normal'}><ShieldAlert size={12} /> {kev.filter((item) => item.severity === 'CRITICAL').length} critical</span><p>Actively exploited catalog coverage</p></div></DashboardPanel>
      <DashboardPanel title="Critical findings" subtitle="Severity and remediation posture" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="cyber-kpi"><strong>{critical.length}<small> findings</small></strong><span className={critical.length ? 'critical' : 'normal'}><AlertTriangle size={12} /> {critical.filter((item) => item.status !== 'MITIGATED').length} open</span><p>High-impact vulnerability set</p></div></DashboardPanel>
      <DashboardPanel title="High exposure" subtitle="Critical and high severity findings" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="cyber-kpi"><strong>{highExposureCount}<small> findings</small></strong><span className={highExposureCount ? 'warning' : 'normal'}><Radar size={12} /> {exploited.length} exploit available</span><p>Priority review population</p></div></DashboardPanel>
    </DashboardGrid>
    <DashboardGrid columns={3}>
      <DashboardPanel title="Vulnerability age" subtitle="Distribution by publication age" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><AgeDistribution vulnerabilities={data.vulnerabilities} /></DashboardPanel>
      <DashboardPanel title="Vendor concentration" subtitle="Open findings by vendor" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><VendorConcentration vulnerabilities={data.vulnerabilities} /></DashboardPanel>
      <DashboardPanel title="Nordic relevance" subtitle="Findings affecting Nordic countries" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="cyber-nordic-relevance"><strong>{nordicRelevant.length}<small> findings</small></strong><span>{nordicRelevant.filter((item) => item.severity === 'CRITICAL').length} critical</span><p>{nordicRelevant.filter((item) => item.cisaKev).length} CISA KEV · {nordicRelevant.filter((item) => item.status !== 'MITIGATED').length} open</p></div></DashboardPanel>
    </DashboardGrid>
    <FilterControls filters={filters} onChange={setFilters} options={options} />
    <DashboardGrid>
      <DashboardPanel title="Vulnerability inventory" subtitle={`${vulnerabilities.length} matching findings`} status={data.snapshot.status} timestamp={data.snapshot.updatedAt} toolbar={<label className="cyber-search"><Search size={12} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search CVE, vendor, product" /></label>}><VulnerabilityTable vulnerabilities={vulnerabilities} /></DashboardPanel>
      <DashboardPanel title="Remediation intelligence" subtitle="Priority findings and passive defensive controls" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="cyber-remediation-list"><div className="cyber-remediation-high"><div><span>CRITICAL</span><strong>{critical.length}</strong></div><p>Immediate containment and remediation review.</p></div><div className="cyber-remediation-overdue"><div><span>OVERDUE</span><strong>{overdue.length}</strong></div><p>Findings beyond the assigned remediation date.</p></div><div className="cyber-remediation-new"><div><span>NEW</span><strong>{newVulnerabilities.length}</strong></div><p>Published within the last 30 days.</p></div><div className="cyber-remediation-exploited"><div><span>EXPLOITED</span><strong>{exploited.length}</strong></div><p>Known exploitation or public exploit availability.</p></div></div></DashboardPanel>
    </DashboardGrid>
    <DashboardGrid>
      <DashboardPanel title="Abnormal cyber events" subtitle="Defensive detections requiring review" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="cyber-events">{urgentEvents.length ? urgentEvents.map((event) => <AlertBanner key={event.id} severity={event.severity} title={event.title} description={event.description} timestamp={`${event.timestamp} · ${event.country ?? event.region ?? 'Nordic region'}`} />) : <div className="empty-state"><strong>NO ABNORMAL EVENTS</strong><p>No high-impact cyber events are currently reported.</p></div>}</div></DashboardPanel>
      <DashboardPanel title="Feed health" subtitle="Vulnerability intelligence source status" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="cyber-feed-list">{data.providers.length ? data.providers.map((provider) => <article className={`cyber-feed status-${provider.freshness === 'OFFLINE' ? 'unavailable' : provider.freshness === 'STALE' || provider.freshness === 'DEGRADED' ? 'warning' : 'ok'}`} key={provider.name}><div><strong>{provider.name}</strong><span>{provider.latency} latency</span></div><DataFreshnessIndicator freshness={provider.freshness} updatedAt={provider.latency} compact /><StatusIndicator status={provider.status} compact /></article>) : <div className="empty-state"><strong>NO FEED HEALTH</strong><p>No vulnerability feed health is currently reported.</p></div>}</div></DashboardPanel>
    </DashboardGrid>
    <DashboardPanel title="Operational event feed" subtitle="Chronological defensive security events" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="cyber-event-feed"><EventList events={data.events} /></div></DashboardPanel>
  </>
}
