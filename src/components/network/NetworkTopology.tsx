import { useMemo, useState } from 'react'
import type { NetworkLink, NetworkNode } from '../../dashboards/networks/Networks'
import { SeverityBadge } from '../status/SeverityBadge'

const statusColor: Record<NetworkLink['status'], string> = {
  UP: '#56c7a5',
  DEGRADED: '#e4b94d',
  DOWN: '#e34b52',
  MAINTENANCE: '#b49cf4',
  UNKNOWN: '#8da0b7',
}

export function NetworkTopology({ nodes, links }: { nodes: NetworkNode[]; links: NetworkLink[] }) {
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null)
  const nodeById = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes])
  const selectedLink = links.find((link) => link.id === selectedLinkId)

  return (
    <div className="network-topology">
      <svg viewBox="0 0 100 60" role="img" aria-label="Network topology visualization">
        <defs>
          <filter id="network-glow"><feGaussianBlur stdDeviation="1.2" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        <g className="network-link-layer">
          {links.map((link) => {
            const source = nodeById.get(link.sourceNode)
            const target = nodeById.get(link.targetNode)
            if (!source || !target) return null
            const utilization = link.capacityGbps > 0 ? link.utilizationGbps / link.capacityGbps * 100 : 0
            const color = statusColor[link.status]
            return (
              <g key={link.id} className={`network-link network-link-${link.status.toLowerCase()}`} onClick={() => setSelectedLinkId(link.id)} role="button" tabIndex={0} aria-label={`${link.id}: ${link.status}, ${utilization.toFixed(0)} percent utilization`} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') setSelectedLinkId(link.id) }}>
                <line x1={source.x} y1={source.y} x2={target.x} y2={target.y} stroke={color} strokeWidth={utilization >= 95 ? 1.6 : utilization >= 80 ? 1.2 : .65} strokeOpacity={utilization >= 95 ? 1 : .72} filter="url(#network-glow)" />
                <circle cx={(source.x + target.x) / 2} cy={(source.y + target.y) / 2} r="1.1" fill={color} />
              </g>
            )
          })}
        </g>
        <g className="network-node-layer">
          {nodes.map((node) => (
            <g key={node.id} transform={`translate(${node.x} ${node.y})`} className={`network-node network-node-${node.type.toLowerCase()}`}>
              <circle r={node.type === 'DATA_CENTER' ? 3.2 : 2.5} fill={node.type === 'DATA_CENTER' ? '#5b9fec' : node.type === 'INTERNET_EXCHANGE' ? '#b49cf4' : node.type === 'SUBMARINE_CABLE' ? '#56c7a5' : '#8da0b7'} />
              <text y={node.type === 'DATA_CENTER' ? 5.1 : 4.6} textAnchor="middle">{node.shortName}</text>
            </g>
          ))}
        </g>
      </svg>
      <div className="network-topology-legend"><span><i className="up" />Up</span><span><i className="degraded" />Degraded</span><span><i className="down" />Down</span><span><i className="maintenance" />Maintenance</span></div>
      {selectedLink && (() => {
        const source = nodeById.get(selectedLink.sourceNode)
        const target = nodeById.get(selectedLink.targetNode)
        const utilization = selectedLink.capacityGbps > 0 ? selectedLink.utilizationGbps / selectedLink.capacityGbps * 100 : 0
        const packetLoss = selectedLink.packetLossPercent === null ? 'Unknown' : `${selectedLink.packetLossPercent}%`
        return <div className="network-topology-detail"><span>{selectedLink.id}</span><strong>{source?.name ?? selectedLink.sourceNode} → {target?.name ?? selectedLink.targetNode}</strong><small>{selectedLink.provider} · {selectedLink.latencyMs === null ? 'Latency unknown' : `${selectedLink.latencyMs} ms`} · {packetLoss} loss</small><b>{utilization.toFixed(0)}% utilized</b><SeverityBadge severity={utilization >= 95 ? 'CRITICAL' : utilization >= 80 ? 'HIGH' : selectedLink.packetLossPercent !== null && selectedLink.packetLossPercent > 1 ? 'MEDIUM' : selectedLink.status === 'DOWN' ? 'CRITICAL' : 'LOW'} compact /></div>
      })()}
    </div>
  )
}
