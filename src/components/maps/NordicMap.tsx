import { useMemo, useState } from 'react'
import type { MapLayer, MapPoint, Severity } from '../../data/models'
import { SeverityBadge } from '../status/SeverityBadge'

const countryShapes: Array<{ name: string; points: string; labelX: number; labelY: number }> = [
  { name: 'Norway', points: '18,31 25,20 42,16 52,24 47,39 33,45', labelX: 34, labelY: 29 },
  { name: 'Sweden', points: '55,19 65,15 78,24 83,39 77,52 65,57 54,47', labelX: 69, labelY: 35 },
  { name: 'Finland', points: '77,58 91,54 98,64 93,78 82,83 72,73', labelX: 85, labelY: 70 },
  { name: 'Iceland', points: '13,82 19,73 27,78 25,90 17,96', labelX: 20, labelY: 86 },
  { name: 'Denmark', points: '49,44 55,41 61,48 57,55 50,52', labelX: 55, labelY: 49 },
]

const severityColor: Record<Severity, string> = { INFO: '#5b9fec', LOW: '#56c7a5', MEDIUM: '#e4b94d', HIGH: '#e9894a', CRITICAL: '#e34b52' }

export function NordicMap({ layers, selectedId, onSelect }: { layers: MapLayer[]; selectedId?: string; onSelect?: (id: string) => void }) {
  const [hovered, setHovered] = useState<MapPoint | null>(null)
  const pointById = useMemo(() => new Map(layers.flatMap((layer) => layer.points ?? []).map((point) => [point.id, point])), [layers])
  const selected = selectedId ? pointById.get(selectedId) : undefined

  return (
    <div className="nordic-map">
      <svg viewBox="0 0 115 105" role="img" aria-label="Nordic operational map">
        <defs><pattern id="map-grid" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M 8 0 L 0 0 0 8" fill="none" stroke="currentColor" strokeWidth=".25" /></pattern><filter id="map-glow"><feGaussianBlur stdDeviation="1.6" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
        <rect width="115" height="105" fill="url(#map-grid)" opacity=".45" />
        {countryShapes.map((country) => <g key={country.name}><polygon points={country.points} className="country-shape" /><text x={country.labelX} y={country.labelY}>{country.name}</text></g>)}
        {layers.flatMap((layer) => layer.lines ?? []).map((line) => <polyline key={line.id} points={line.points.map((point) => `${point.longitude} ${point.latitude}`).join(' ')} className="map-line" style={{ stroke: line.color, strokeWidth: line.width ?? 1 }} />)}
        {layers.flatMap((layer) => layer.regions ?? []).map((region) => <polygon key={region.id} points={region.points.map((point) => `${point.longitude} ${point.latitude}`).join(' ')} className="map-region" style={{ fill: region.color }} />)}
        {layers.flatMap((layer) => layer.points ?? []).map((point) => <g key={point.id} className="map-point-group" transform={`translate(${point.longitude} ${point.latitude})`} onMouseEnter={() => setHovered(point)} onMouseLeave={() => setHovered(null)} onClick={() => onSelect?.(point.id)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') onSelect?.(point.id) }} role="button" tabIndex={0} aria-label={`${point.label}: ${point.severity}${point.detail ? `, ${point.detail}` : ''}`}><circle r={selectedId === point.id ? 3.2 : 2.2} fill={severityColor[point.severity]} filter="url(#map-glow)" /><circle r="5" className="map-hit-area" /></g>)}
      </svg>
      <div className="map-compass"><span>N</span><i /></div>
      <div className="map-legend">{(['INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as Severity[]).map((severity) => <span key={severity}><i style={{ background: severityColor[severity] }} />{severity}</span>)}</div>
      {hovered && <div className="map-tooltip"><strong>{hovered.label}</strong><span><SeverityBadge severity={hovered.severity} compact />{hovered.detail ?? 'Operational location'}</span></div>}
      {selected && <div className="map-detail"><span>SELECTED LOCATION</span><strong>{selected.label}</strong><small>{selected.detail ?? 'Operational point'}</small></div>}
    </div>
  )
}
