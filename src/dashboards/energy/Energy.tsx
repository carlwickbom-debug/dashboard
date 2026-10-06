import { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { Activity, ArrowDownRight, ArrowUpRight, Zap } from 'lucide-react'
import type { DashboardStatus, DataFreshness, OperationalEvent, Severity } from '../../data/models'
import { DashboardGrid, DashboardPanel } from '../../components/layout/DashboardLayout'
import { AlertBanner } from '../../components/events/AlertBanner'
import { EventList } from '../../components/events/EventRow'
import { NordicMap } from '../../components/maps/NordicMap'
import { DataFreshnessIndicator } from '../../components/status/DataFreshnessIndicator'
import { HealthIndicator, SeverityBadge } from '../../components/status/SeverityBadge'
import { StatusIndicator } from '../../components/status/StatusIndicator'

export interface EnergyCountry { country: string; production: number; consumption: number; share: number; status: DashboardStatus; delta: number }
export interface GenerationSource { type: string; value: number; share: number; status: 'OK' | 'WARNING' | 'CRITICAL'; detail: string }
export interface TransmissionConstraint { id: string; name: string; flow: number; limit: number; status: 'OK' | 'WARNING' | 'CRITICAL'; direction: string; detail: string }
export interface EnergyProviderHealth { name: string; freshness: DataFreshness; latency: string; status: DashboardStatus }
export interface EnergyData {
  snapshot: { status: DashboardStatus; health: number; headline: string; updatedAt: string; source: string; freshness: DataFreshness; summary: string }
  countries: EnergyCountry[]
  generation: GenerationSource[]
  production: Array<{ label: string; value: number }>
  consumption: Array<{ label: string; value: number }>
  imports: Array<{ country: string; value: number }>
  exports: Array<{ country: string; value: number }>
  constraints: TransmissionConstraint[]
  events: OperationalEvent[]
  providers: EnergyProviderHealth[]
  mapLayers: import('../../data/models').MapLayer[]
}

function MiniBarChart({ values, unit }: { values: Array<{ label: string; value: number }>; unit: string }) {
  const max = Math.max(...values.map((item) => item.value), 1)
  return <div className="energy-chart" role="img" aria-label={`Nordic ${unit} chart`}><div className="energy-chart-grid">{values.map((item) => <div className="energy-chart-row" key={item.label}><span>{item.label}</span><div className="energy-chart-track"><i style={{ width: `${(item.value / max) * 100}%` }} /></div><strong>{item.value.toFixed(1)} {unit}</strong></div>)}</div></div>
}

function ProductionChart({ data }: { data: EnergyData }) {
  const max = Math.max(...data.production.map((item) => item.value), 1)
  const points = data.production.map((item, index) => ({ ...item, x: 18 + index * (284 / Math.max(data.production.length - 1, 1)), y: 92 - (item.value / max) * 68 }))
  const line = points.map((point) => `${point.x},${point.y}`).join(' ')
  const area = `18,95 ${line} 302,95`
  return <div className="energy-line-chart" role="img" aria-label="Nordic production trend chart"><svg viewBox="0 0 320 105" preserveAspectRatio="none"><defs><linearGradient id="energy-area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#65d9c7" stopOpacity=".35" /><stop offset="1" stopColor="#65d9c7" stopOpacity="0" /></linearGradient></defs>{[25, 50, 75].map((y) => <line key={y} x1="16" x2="304" y1={y} y2={y} className="energy-chart-axis" />)}<polygon points={area} fill="url(#energy-area)" /><polyline points={line} className="energy-chart-line" />{points.map((point) => <circle key={point.label} cx={point.x} cy={point.y} r="3" className="energy-chart-point" />)}</svg><div className="energy-chart-labels">{points.map((point) => <span key={point.label}>{point.label}</span>)}</div></div>
}

export function Energy({ data }: { data: EnergyData }) {
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null)
  const [activeType, setActiveType] = useState('All')
  const totalProduction = useMemo(() => data.countries.reduce((sum, country) => sum + country.production, 0), [data.countries])
  const totalConsumption = useMemo(() => data.countries.reduce((sum, country) => sum + country.consumption, 0), [data.countries])
  const abnormalEvents = data.events.filter((event) => event.severity === 'CRITICAL' || event.severity === 'HIGH')
  const generationTypes = ['All', ...data.generation.map((item) => item.type)]
  const visibleGeneration = activeType === 'All' ? data.generation : data.generation.filter((item) => item.type === activeType)
  const renewableShare = data.generation.filter((item) => ['Hydro', 'Wind', 'Solar'].includes(item.type)).reduce((sum, item) => sum + item.share, 0)

  return (
    <>
      <section className="overview-strip energy-command-strip"><div><StatusIndicator status={data.snapshot.status} label={data.snapshot.headline} description={data.snapshot.summary} /><p>Electricity production, consumption, interchange and grid stability across five Nordic countries.</p></div><div className="overview-strip-meta"><HealthIndicator health={data.snapshot.health} /><DataFreshnessIndicator updatedAt={data.snapshot.updatedAt} freshness={data.snapshot.freshness} /></div></section>
      <DashboardGrid columns={4}>
        <DashboardPanel title="Total production" subtitle="Current Nordic output" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="energy-kpi"><strong>{totalProduction.toFixed(1)}<small> GW</small></strong><span><ArrowUpRight size={12} /> 2.4% vs forecast</span><p>Across five countries</p></div></DashboardPanel>
        <DashboardPanel title="Consumption" subtitle="Current demand" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="energy-kpi"><strong>{totalConsumption.toFixed(1)}<small> GW</small></strong><span><ArrowUpRight size={12} /> 1.8% above baseline</span><p>Hourly operating load</p></div></DashboardPanel>
        <DashboardPanel title="Renewable share" subtitle="Generation by renewable source" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="energy-kpi"><strong>{renewableShare.toFixed(1)}<small> %</small></strong><span><ArrowUpRight size={12} /> 1.2 pts forecast</span><p>Hydro, wind and solar</p></div></DashboardPanel>
        <DashboardPanel title="Grid frequency" subtitle="System stability indicator" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="energy-kpi"><strong>50.02<small> Hz</small></strong><span className="energy-normal"><Activity size={12} /> Within normal band</span><p>Nominal frequency</p></div></DashboardPanel>
      </DashboardGrid>
      <DashboardGrid>
        <DashboardPanel title="Nordic production" subtitle="Hourly output trend" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><ProductionChart data={data} /></DashboardPanel>
        <DashboardPanel title="Nordic consumption" subtitle="Hourly demand trend" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><MiniBarChart values={data.consumption} unit="GW" /></DashboardPanel>
      </DashboardGrid>
      <DashboardGrid>
        <DashboardPanel title="Generation mix" subtitle="Current output by generation type" status={data.snapshot.status} timestamp={data.snapshot.updatedAt} toolbar={<div className="filter-bar">{generationTypes.map((type) => <button key={type} className={activeType === type ? 'active' : ''} onClick={() => setActiveType(type)}>{type}</button>)}</div>}><div className="generation-mix"><div className="generation-donut" style={{ '--generation-share': `${visibleGeneration.reduce((sum, item) => sum + item.share, 0)}%` } as CSSProperties}><div><strong>{visibleGeneration.reduce((sum, item) => sum + item.share, 0).toFixed(1)}%</strong><span>ACTIVE</span></div></div><div className="generation-legend">{visibleGeneration.map((item) => <div key={item.type}><span className={`generation-dot generation-${item.type.toLowerCase().replace(/ /g, '-')}`} /><div><strong>{item.type}</strong><small>{item.detail}</small></div><b>{item.share.toFixed(1)}%</b><SeverityBadge severity={item.status === 'CRITICAL' ? 'CRITICAL' : item.status === 'WARNING' ? 'HIGH' : 'LOW'} compact /></div>)}</div></div></DashboardPanel>
        <DashboardPanel title="Transmission overview" subtitle="Current inter-country capacity and constraints" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="transmission-overview"><div className="transmission-flow"><div className="transmission-arc transmission-import"><span>IMPORTS</span><strong>{data.imports.reduce((sum, item) => sum + item.value, 0).toFixed(1)} GW</strong></div><div className="transmission-core"><Zap size={20} /><strong>NET FLOW</strong><span>+3.8 GW</span></div><div className="transmission-arc transmission-export"><span>EXPORTS</span><strong>{data.exports.reduce((sum, item) => sum + item.value, 0).toFixed(1)} GW</strong></div></div><div className="transmission-constraints">{data.constraints.map((constraint) => <div className={`constraint constraint-${constraint.status.toLowerCase()}`} key={constraint.id}><div><strong>{constraint.name}</strong><span>{constraint.direction} · {constraint.flow.toFixed(1)} GW</span></div><div className="constraint-meter"><i style={{ width: `${Math.min((constraint.flow / constraint.limit) * 100, 100)}%` }} /></div><b>{Math.round((constraint.flow / constraint.limit) * 100)}%</b></div>)}</div></div></DashboardPanel>
      </DashboardGrid>
      <DashboardGrid>
        <DashboardPanel title="Country production" subtitle="Generation and consumption by country" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="country-energy-list">{data.countries.map((country) => <div className="country-energy-row" key={country.country}><div><strong>{country.country}</strong><span>{country.share}% of Nordic output</span></div><div className="country-energy-values"><span><b>{country.production.toFixed(1)}</b> GW produced</span><span><b>{country.consumption.toFixed(1)}</b> GW consumed</span></div><div className={`country-energy-delta ${country.delta >= 0 ? 'positive' : 'negative'}`}>{country.delta >= 0 ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}{Math.abs(country.delta).toFixed(1)}%</div><StatusIndicator status={country.status} compact /></div>)}</div></DashboardPanel>
        <DashboardPanel title="Transmission constraints" subtitle="Flow limits and congestion indicators" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="constraint-list">{data.constraints.map((constraint) => <div className={`constraint-card constraint-${constraint.status.toLowerCase()}`} key={constraint.id}><div><span>{constraint.name}</span><strong>{constraint.direction}</strong></div><div className="constraint-card-values"><b>{constraint.flow.toFixed(1)} GW</b><small>of {constraint.limit.toFixed(1)} GW</small></div><div className="constraint-progress"><i style={{ width: `${Math.min((constraint.flow / constraint.limit) * 100, 100)}%` }} /></div><p>{constraint.detail}</p><StatusIndicator status={constraint.status} compact /></div>)}</div></DashboardPanel>
      </DashboardGrid>
      <DashboardGrid>
        <DashboardPanel title="Nordic grid map" subtitle="Generation sites, constraints and abnormal production" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><NordicMap layers={data.mapLayers} selectedId={selectedEvent ?? undefined} onSelect={setSelectedEvent} /></DashboardPanel>
        <DashboardPanel title="Abnormal events" subtitle="Deviations from normal operating conditions" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="energy-events">{abnormalEvents.length ? abnormalEvents.map((event) => <AlertBanner key={event.id} severity={event.severity} title={event.title} description={event.description} timestamp={`${event.timestamp} · ${event.country ?? 'Nordic region'}`} />) : <div className="empty-state"><strong>NO ABNORMAL EVENTS</strong><p>All monitored grid conditions are within normal parameters.</p></div>}</div></DashboardPanel>
      </DashboardGrid>
      <DashboardGrid>
        <DashboardPanel title="Grid events" subtitle="Chronological operational feed" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="energy-event-feed"><EventList events={data.events} /></div></DashboardPanel>
        <DashboardPanel title="Data source health" subtitle="Provider availability and telemetry latency" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="energy-provider-grid">{data.providers.map((provider) => <div className={`energy-provider-row status-${provider.freshness === 'OFFLINE' ? 'unavailable' : provider.freshness === 'STALE' || provider.freshness === 'DEGRADED' ? 'warning' : 'ok'}`} key={provider.name}><div><strong>{provider.name}</strong><span>{provider.latency} latency</span></div><DataFreshnessIndicator freshness={provider.freshness} updatedAt={provider.latency} compact /><StatusIndicator status={provider.status} compact /></div>)}</div></DashboardPanel>
      </DashboardGrid>
    </>
  )
}
