import { useMemo, useState } from 'react'
import { Activity, Boxes, CloudCog, Gauge, Globe2, Network, RadioTower, Route, Server, ShieldAlert, Wifi } from 'lucide-react'
import type { DashboardStatus, DataFreshness, MapLayer, MapPoint, OperationalEvent, Severity } from '../../data/models'
import { NetworkTopology } from '../../components/network/NetworkTopology'
import { AlertBanner } from '../../components/events/AlertBanner'
import { EventList } from '../../components/events/EventRow'
import { DashboardGrid, DashboardPanel } from '../../components/layout/DashboardLayout'
import { NordicMap } from '../../components/maps/NordicMap'
import { DataFreshnessIndicator } from '../../components/status/DataFreshnessIndicator'
import { HealthIndicator, SeverityBadge } from '../../components/status/SeverityBadge'
import { StatusIndicator } from '../../components/status/StatusIndicator'

export type NetworkNodeType = 'DATA_CENTER' | 'INTERNET_EXCHANGE' | 'EDGE_NODE' | 'SUBMARINE_CABLE' | 'TERRESTRIAL_BACKBONE' | 'UNKNOWN'
export type LinkStatus = 'UP' | 'DEGRADED' | 'DOWN' | 'MAINTENANCE' | 'UNKNOWN'
export type NetworkProviderStatus = 'OPERATIONAL' | 'DEGRADED' | 'OUTAGE' | 'UNKNOWN'
export interface NetworkNode { id: string; name: string; shortName: string; type: NetworkNodeType; country: string; latitude: number; longitude: number; x: number; y: number }
export interface NetworkLink { id: string; sourceNode: string; targetNode: string; provider: string; capacityGbps: number; utilizationGbps: number; latencyMs: number | null; packetLossPercent: number | null; status: LinkStatus; lastUpdated: string }
export interface NetworkProvider { id: string; name: string; country: string; status: NetworkProviderStatus; uptime: number | null; links: number; latencyMs: number | null; lastUpdated: string }
export interface NetworkIncident { id: string; title: string; location: string; severity: Severity; time: string; type: string; detail: string }
export interface NetworkProviderHealth { name: string; freshness: DataFreshness; latency: string; status: DashboardStatus }
export interface NetworksData {
  snapshot: { status: DashboardStatus; health: number; headline: string; updatedAt: string; source: string; freshness: DataFreshness; summary: string }
  nodes: NetworkNode[]; links: NetworkLink[]; providers: NetworkProvider[]; incidents: NetworkIncident[]; abnormalEvents: OperationalEvent[]
  events: OperationalEvent[]; providersHealth: NetworkProviderHealth[]; mapLayers: MapLayer[]
}

const linkStatusToDashboard: Record<LinkStatus, DashboardStatus> = { UP: 'OK', DEGRADED: 'WARNING', DOWN: 'CRITICAL', MAINTENANCE: 'WARNING', UNKNOWN: 'UNAVAILABLE' }
const linkStatusToSeverity: Record<LinkStatus, Severity> = { UP: 'LOW', DEGRADED: 'MEDIUM', DOWN: 'CRITICAL', MAINTENANCE: 'MEDIUM', UNKNOWN: 'INFO' }
const providerStatusToDashboard: Record<NetworkProviderStatus, DashboardStatus> = { OPERATIONAL: 'OK', DEGRADED: 'WARNING', OUTAGE: 'CRITICAL', UNKNOWN: 'UNAVAILABLE' }
const providerStatusToSeverity: Record<NetworkProviderStatus, Severity> = { OPERATIONAL: 'LOW', DEGRADED: 'MEDIUM', OUTAGE: 'CRITICAL', UNKNOWN: 'INFO' }

function LinkUtilization({ links }: { links: NetworkLink[] }) {
  return <div className="network-link-list">{links.length ? links.map((link) => {
    const utilization = link.capacityGbps > 0 ? link.utilizationGbps / link.capacityGbps * 100 : null
    const source = link.sourceNode
    const target = link.targetNode
    return <article className={`network-link-row status-${link.status.toLowerCase()}`} key={link.id}><div className="network-link-title"><span className="network-link-icon"><Route size={13} /></span><div><strong>{source} → {target}</strong><span>{link.provider} · {link.lastUpdated}</span></div></div><div className="network-link-values"><div><span>Utilization</span><strong>{utilization === null ? 'Unknown' : `${utilization.toFixed(0)}%`}</strong></div><div><span>Latency</span><strong>{link.latencyMs === null ? 'Unknown' : `${link.latencyMs} ms`}</strong></div><div><span>Packet loss</span><strong>{link.packetLossPercent === null ? 'Unknown' : `${link.packetLossPercent}%`}</strong></div></div><div className="network-link-meter"><i style={{ width: `${utilization === null ? 0 : Math.min(utilization, 100)}%` }} className={utilization !== null && utilization >= 95 ? 'critical' : utilization !== null && utilization >= 80 ? 'warning' : 'normal'} /></div><SeverityBadge severity={linkStatusToSeverity[link.status]} compact /></article>
  }) : <div className="empty-state"><strong>NO LINKS</strong><p>No network links are currently reported.</p></div>}</div>
}

export function Networks({ data }: { data: NetworksData }) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const nodesById = useMemo(() => new Map(data.nodes.map((node) => [node.id, node])), [data.nodes])
  const selectedNode = selectedNodeId ? nodesById.get(selectedNodeId) : undefined
  const linksAbove80 = data.links.filter((link) => link.capacityGbps > 0 && link.utilizationGbps / link.capacityGbps * 100 >= 80).length
  const linksAbove95 = data.links.filter((link) => link.capacityGbps > 0 && link.utilizationGbps / link.capacityGbps * 100 >= 95).length
  const packetLossLinks = data.links.filter((link) => link.packetLossPercent !== null && link.packetLossPercent > 0).length
  const abnormalLatencyLinks = data.links.filter((link) => link.latencyMs !== null && link.latencyMs > 100).length
  const activeRoutes = data.links.filter((link) => link.status === 'UP').length
  const linkMapPoints: MapPoint[] = data.nodes.map((node) => ({ id: node.id, label: node.name, latitude: node.latitude, longitude: node.longitude, severity: node.type === 'DATA_CENTER' ? 'LOW' : node.type === 'INTERNET_EXCHANGE' ? 'MEDIUM' : 'INFO', detail: `${node.country} · ${node.type}` }))
  const mapLayers = useMemo<MapLayer[]>(() => data.mapLayers.length ? data.mapLayers : [{ id: 'network-nodes', label: 'Network nodes', color: '#5b9fec', points: linkMapPoints }], [data.mapLayers, linkMapPoints])
  const urgentEvents = data.abnormalEvents.filter((event) => event.severity === 'CRITICAL' || event.severity === 'HIGH')
  const routeFailureCount = data.incidents.filter((incident) => incident.type.toLowerCase().includes('failure') || incident.type.toLowerCase().includes('cable')).length
  const networkStatus = data.links.some((link) => link.status === 'DOWN') ? 'CRITICAL' : data.links.some((link) => ['DEGRADED', 'MAINTENANCE'].includes(link.status)) ? 'WARNING' : 'OK'

  return (
    <>
      <section className="overview-strip networks-command-strip"><div><StatusIndicator status={data.snapshot.status} label={data.snapshot.headline} description={data.snapshot.summary} /><p>Major links, backbone connectivity, submarine cables, exchange points, data centers, providers, latency, packet loss and route health across the Nordic region.</p></div><div className="overview-strip-meta"><HealthIndicator health={data.snapshot.health} /><DataFreshnessIndicator updatedAt={data.snapshot.updatedAt} freshness={data.snapshot.freshness} /></div></section>
      <DashboardGrid columns={4}>
        <DashboardPanel title="Connected links" subtitle="Current operational routes" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="network-kpi"><strong>{activeRoutes}<small> / {data.links.length}</small></strong><span><Network size={12} /> {data.links.length - activeRoutes} unavailable</span><p>Links reporting UP status</p></div></DashboardPanel>
        <DashboardPanel title="Link utilization" subtitle="Above 80% and 95% thresholds" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="network-kpi"><strong>{linksAbove80}<small> high</small></strong><span className={linksAbove95 ? 'critical' : linksAbove80 ? 'warning' : 'normal'}><Gauge size={12} /> {linksAbove95} critical</span><p>Above 80% utilization</p></div></DashboardPanel>
        <DashboardPanel title="Packet loss" subtitle="Links reporting loss" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="network-kpi"><strong>{packetLossLinks}<small> links</small></strong><span className={packetLossLinks ? 'warning' : 'normal'}><Activity size={12} /> {data.links.filter((link) => link.packetLossPercent !== null && link.packetLossPercent > 1).length} elevated</span><p>Non-zero packet loss</p></div></DashboardPanel>
        <DashboardPanel title="Latency" subtitle="Links above operating threshold" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="network-kpi"><strong>{abnormalLatencyLinks}<small> links</small></strong><span className={abnormalLatencyLinks ? 'warning' : 'normal'}><RadioTower size={12} /> {data.links.filter((link) => link.latencyMs !== null && link.latencyMs > 100).length} over 100 ms</span><p>Measured latency</p></div></DashboardPanel>
      </DashboardGrid>
      <DashboardGrid>
        <DashboardPanel title="Network topology" subtitle="Data-driven nodes, links and operating state" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><NetworkTopology nodes={data.nodes} links={data.links} /></DashboardPanel>
        <DashboardPanel title="Nordic network map" subtitle="Nodes and operational link coverage" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><NordicMap layers={mapLayers} selectedId={selectedNodeId ?? undefined} onSelect={setSelectedNodeId} /></DashboardPanel>
      </DashboardGrid>
      {selectedNode && <DashboardPanel title={`${selectedNode.name} node`} subtitle={`${selectedNode.country} · ${selectedNode.type}`} status={networkStatus} timestamp={data.snapshot.updatedAt}><div className="dc-detail-grid"><div><span>Node type</span><strong>{selectedNode.type}</strong></div><div><span>Coordinates</span><strong>{selectedNode.latitude.toFixed(2)}, {selectedNode.longitude.toFixed(2)}</strong></div><div><span>Connected links</span><strong>{data.links.filter((link) => link.sourceNode === selectedNode.id || link.targetNode === selectedNode.id).length}</strong></div><div><span>Provider role</span><strong>{data.providers.filter((provider) => provider.country === selectedNode.country).map((provider) => provider.name).join(', ') || 'Unknown'}</strong></div></div></DashboardPanel>}
      <DashboardGrid>
        <DashboardPanel title="Link utilization" subtitle="Capacity, utilization, latency and packet loss" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><LinkUtilization links={data.links} /></DashboardPanel>
        <DashboardPanel title="Provider overview" subtitle="Network operators and service health" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="network-provider-list">{data.providers.length ? data.providers.map((provider) => <article className={`network-provider-row status-${providerStatusToDashboard[provider.status].toLowerCase()}`} key={provider.id}><div className="network-provider-icon"><CloudCog size={15} /></div><div><strong>{provider.name}</strong><span>{provider.country} · {provider.links} links</span></div><div className="network-provider-metrics"><b>{provider.uptime === null ? 'Unknown' : `${provider.uptime}% uptime`}</b><small>{provider.latencyMs === null ? 'Latency unknown' : `${provider.latencyMs} ms`}</small></div><SeverityBadge severity={providerStatusToSeverity[provider.status]} compact /></article>) : <div className="empty-state"><strong>NO PROVIDERS</strong><p>No network providers are currently reported.</p></div>}</div></DashboardPanel>
      </DashboardGrid>
      <DashboardGrid>
        <DashboardPanel title="Network incidents" subtitle="Cable, routing, link and service failures" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="network-incident-list">{data.incidents.length ? data.incidents.map((incident) => <article className="network-incident" key={incident.id}><div className="network-incident-icon"><ShieldAlert size={15} /></div><div><strong>{incident.title}</strong><span>{incident.location} · {incident.type}</span><small>{incident.detail} · {incident.time}</small></div><SeverityBadge severity={incident.severity} compact /></article>) : <div className="empty-state"><strong>NO INCIDENTS</strong><p>No network incidents are currently reported.</p></div>}</div></DashboardPanel>
        <DashboardPanel title="Abnormal events" subtitle="Route changes, failures and service deviations" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="network-events">{urgentEvents.length ? urgentEvents.map((event) => <AlertBanner key={event.id} severity={event.severity} title={event.title} description={event.description} timestamp={`${event.timestamp} · ${event.country ?? event.region ?? 'Nordic region'}`} />) : <div className="empty-state"><strong>NO ABNORMAL EVENTS</strong><p>All monitored network routes are operating normally.</p></div>}</div></DashboardPanel>
      </DashboardGrid>
      <DashboardPanel title="Data provider status" subtitle="Network observability and provider source health" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="network-provider-health">{data.providersHealth.length ? data.providersHealth.map((provider) => <article className={`network-health-row status-${provider.freshness === 'OFFLINE' ? 'unavailable' : provider.freshness === 'STALE' || provider.freshness === 'DEGRADED' ? 'warning' : 'ok'}`} key={provider.name}><div><strong>{provider.name}</strong><span>{provider.latency} latency</span></div><DataFreshnessIndicator freshness={provider.freshness} updatedAt={provider.latency} compact /><StatusIndicator status={provider.status} compact /></article>) : <div className="empty-state"><strong>NO PROVIDER HEALTH</strong><p>No network provider health is currently reported.</p></div>}</div></DashboardPanel>
      <DashboardPanel title="Operational event feed" subtitle="Chronological network, routing and service events" status={data.snapshot.status} timestamp={data.snapshot.updatedAt}><div className="network-event-feed"><EventList events={data.events} /></div></DashboardPanel>
      {routeFailureCount > 0 && <DashboardPanel title="Route failures and cable incidents" subtitle="High-impact route or submarine cable events" status={networkStatus} timestamp={data.snapshot.updatedAt}><div className="network-incident-list">{data.incidents.filter((incident) => incident.type.toLowerCase().includes('failure') || incident.type.toLowerCase().includes('cable') || incident.type.toLowerCase().includes('route')).map((incident) => <article className="network-incident" key={incident.id}><div className="network-incident-icon"><Wifi size={15} /></div><div><strong>{incident.title}</strong><span>{incident.location} · {incident.type}</span><small>{incident.detail} · {incident.time}</small></div><SeverityBadge severity={incident.severity} compact /></article>)}</div></DashboardPanel>}
    </>
  )
}
