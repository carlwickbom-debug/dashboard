import { StrictMode, useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Activity, AlertTriangle, Bus, CableCar, ChevronRight, Clock3, Crosshair, Gauge, LocateFixed, MapPin, Radio, RefreshCw, Search, Settings2, TrainFront, TramFront, Wifi } from 'lucide-react'
import './styles.css'
import { fetchLiveTransitData, toDashboardVehicle } from './slApi'
import { MapView } from './MapView'

type Mode = 'Metro' | 'Bus' | 'Train' | 'Tram'
type Vehicle = { id: string; line: string; mode: Mode; destination: string; speed: number; delay: number; occupancy: number; status: string; lat: number; left: number; latitude?: number; longitude?: number; color: string; updated: string; nextStop: string; operator: string }
type Site = { name: string; lat: number; lon: number }

const initialVehicles: Vehicle[] = []
const emptyVehicle: Vehicle = { id: '', line: '—', mode: 'Bus', destination: 'No current vehicle selected', speed: 0, delay: 0, occupancy: 0, status: 'Waiting for live feed', lat: 50, left: 50, color: '#526d80', updated: '—', nextStop: '—', operator: '—' }

const fallbackSites: Site[] = [
  { name: 'T-Centralen', lat: 59.3318, lon: 18.0625 }, { name: 'Slussen', lat: 59.3199, lon: 18.0729 }, { name: 'Odenplan', lat: 59.3428, lon: 18.0498 }, { name: 'Fridhemsplan', lat: 59.3337, lon: 18.0313 }, { name: 'Gullmarsplan', lat: 59.2997, lon: 18.0801 }, { name: 'Liljeholmen', lat: 59.3105, lon: 18.0225 }, { name: 'Skanstull', lat: 59.3076, lon: 18.0758 }, { name: 'Karlaplan', lat: 59.3388, lon: 18.0914 }, { name: 'Stadion', lat: 59.3434, lon: 18.0916 }, { name: 'Kungsträdgården', lat: 59.3304, lon: 18.0733 }, { name: 'Hornstull', lat: 59.3153, lon: 18.0331 }, { name: 'Brommaplan', lat: 59.3383, lon: 17.9393 },
]

const railLines = [
  { points: '7,73 21,63 34,59 45,48 52,42 64,37 78,27 94,18', color: '#ed4d59' },
  { points: '10,15 24,25 38,35 51,42 66,51 77,62 88,77', color: '#ed4d59' },
  { points: '6,83 23,72 38,67 51,63 66,62 83,70 96,88', color: '#f0b82f' },
  { points: '33,5 37,20 46,35 52,42 60,58 64,78 70,95', color: '#2ba68b' },
]

function normalizeSites(data: unknown): Site[] {
  if (!Array.isArray(data)) return fallbackSites
  const sites = data.map((item: any) => ({ name: item.name ?? item.siteName ?? item.id ?? 'SL site', lat: Number(item.lat ?? item.latitude ?? item.position?.latitude), lon: Number(item.lon ?? item.lng ?? item.longitude ?? item.position?.longitude) })).filter((site) => Number.isFinite(site.lat) && Number.isFinite(site.lon))
  return sites.length ? sites : fallbackSites
}

function IconForMode({ mode }: { mode: Mode }) {
  if (mode === 'Bus') return <Bus size={15} />
  if (mode === 'Train') return <TrainFront size={15} />
  if (mode === 'Tram') return <TramFront size={15} />
  return <CableCar size={15} />
}

function App() {
  const [vehicles, setVehicles] = useState(initialVehicles)
  const [selectedId, setSelectedId] = useState(initialVehicles[0]?.id ?? '')
  const [activeMode, setActiveMode] = useState<'All' | Mode>('All')
  const [query, setQuery] = useState('')
  const [sites, setSites] = useState(fallbackSites)
  const [isLive, setIsLive] = useState(true)
  const [lastSync, setLastSync] = useState('just now')
  const [alertCount, setAlertCount] = useState(0)
  const [feedError, setFeedError] = useState('')

  useEffect(() => {
    let cancelled = false
    const loadFeeds = async () => {
      try {
        const [sitesResponse, liveData] = await Promise.all([
          fetch('https://transport.integration.sl.se/v1/sites').then((response) => response.json()),
          fetchLiveTransitData(import.meta.env.VITE_TRAFIKLAB_GTFS_RT_KEY ?? ''),
        ])
        if (cancelled) return
        setSites(normalizeSites(sitesResponse))
        const currentVehicles = liveData.vehicles.map(toDashboardVehicle)
        setVehicles(currentVehicles)
        setSelectedId((current) => currentVehicles.some((vehicle) => vehicle.id === current) ? current : (currentVehicles[0]?.id ?? ''))
        setAlertCount(liveData.alerts.length)
        setFeedError('')
        setLastSync('just now')
      } catch (error) {
        if (!cancelled) {
          setVehicles([])
          setSelectedId('')
          setAlertCount(0)
          setFeedError(error instanceof Error ? error.message : 'Live feed unavailable')
          setLastSync('feed unavailable')
        }
      }
    }
    loadFeeds()
    const timer = window.setInterval(loadFeeds, 15000)
    return () => { cancelled = true; window.clearInterval(timer) }
  }, [])

  const filteredVehicles = useMemo(() => vehicles.filter((vehicle) => (activeMode === 'All' || vehicle.mode === activeMode) && `${vehicle.line} ${vehicle.destination} ${vehicle.id}`.toLowerCase().includes(query.toLowerCase())), [vehicles, activeMode, query])
  const mapVehicles = useMemo(() => {
    const buses = vehicles.filter((vehicle) => vehicle.mode === 'Bus').slice(0, 100)
    return [...vehicles.filter((vehicle) => vehicle.mode !== 'Bus'), ...buses]
  }, [vehicles])
  const mapGroupSummary = useMemo(() => {
    const counts = mapVehicles.reduce<Record<Mode, number>>((summary, vehicle) => ({ ...summary, [vehicle.mode]: summary[vehicle.mode] + 1 }), { Metro: 0, Train: 0, Tram: 0, Bus: 0 })
    return `Subway ${counts.Metro} · trains ${counts.Train} · trams ${counts.Tram} · buses ${counts.Bus}`
  }, [mapVehicles])
  const selected = vehicles.find((vehicle) => vehicle.id === selectedId) ?? vehicles[0] ?? emptyVehicle
  const lateCount = vehicles.filter((vehicle) => vehicle.delay > 0).length

  return <div className="app-shell">
    <header className="topbar"><div className="brand"><div className="brand-mark"><Activity size={21} /></div><div><strong>SL / NETWORK PULSE</strong><span>STOCKHOLM TRANSPORT CONTROL</span></div></div><div className="topbar-actions"><div className="live-state"><span className="pulse-dot" /> LIVE <small>updated {lastSync}</small></div><button className="icon-button" title="Settings"><Settings2 size={18} /></button><div className="avatar">CP</div></div></header>
    <MapView vehicles={mapVehicles} sites={sites} selectedId={selectedId} onSelect={setSelectedId} />
    <main>
      <section className="headline"><div><p className="eyebrow">THURSDAY 17 SEPTEMBER 2026 / 08:42 CET</p><h1>Good morning, Carla.</h1><p className="subhead">A clear view of every moving part across the SL network.</p></div><button className={`sync-button ${isLive ? 'active' : ''}`} onClick={() => { setIsLive(!isLive); setLastSync('just now') }}><RefreshCw size={16} /> {isLive ? 'Live feed on' : 'Feed paused'}</button></section>
      <section className="stats-grid"><Stat label="Vehicles tracked" value={vehicles.length.toLocaleString()} detail={feedError ? 'Current feed unavailable' : 'Current GTFS-RT positions'} tone="teal" icon={<Radio size={17} />} /><Stat label="On time now" value={`${vehicles.length ? Math.round(((vehicles.length - lateCount) / vehicles.length) * 100) : 0}%`} detail="Within 2 min of schedule" tone="yellow" icon={<Clock3 size={17} />} /><Stat label="Network status" value={feedError ? 'Unavailable' : vehicles.length ? 'Good' : 'Waiting'} detail={`${alertCount} current service alerts`} tone="green" icon={<Wifi size={17} />} /><Stat label="Average speed" value={`${vehicles.length ? Math.round(vehicles.reduce((total, vehicle) => total + vehicle.speed, 0) / vehicles.length) : 0} km/h`} detail="From current vehicle positions" tone="coral" icon={<Gauge size={17} />} /></section>
      <section className="workspace-grid"><div className="map-panel panel"><div className="panel-header"><div><p className="section-label">NETWORK MAP</p><h2>Greater Stockholm <span className="muted">/ {mapVehicles.length.toLocaleString()} vehicles shown</span></h2><p className="map-group-summary">{mapGroupSummary}</p></div><div className="map-tools"><button className="map-tool active"><MapPin size={15} /> Vehicles</button><button className="map-tool"><LocateFixed size={15} /> Center</button></div></div><div className="map-wrap"><div className="map-watermark">STOCKHOLM<br /><span>COUNTY</span></div><div className="map-grid" /> <svg className="rail-map" viewBox="0 0 100 100" preserveAspectRatio="none">{railLines.map((line, index) => <polyline key={index} points={line.points} stroke={line.color} />)}</svg>{sites.slice(0, 12).map((site, index) => <div key={`${site.name}-${index}`} className="station" style={{ left: `${8 + (index * 17) % 83}%`, top: `${18 + (index * 29) % 68}%` }} title={site.name} />)}{mapVehicles.map((vehicle) => <button key={vehicle.id} className={`vehicle-marker ${selectedId === vehicle.id ? 'selected' : ''}`} style={{ left: `${vehicle.left}%`, top: `${vehicle.lat}%`, backgroundColor: vehicle.color }} onClick={() => setSelectedId(vehicle.id)} title={`${vehicle.line} to ${vehicle.destination}`}><IconForMode mode={vehicle.mode} /><span>{vehicle.line}</span></button>)}<div className="map-legend"><span><i className="legend-line metro" /> Metro</span><span><i className="legend-line train" /> Rail</span><span><i className="legend-dot" /> Station</span></div><div className="zoom-control"><button>+</button><button>-</button></div></div><div className="map-footer"><span><span className="pulse-dot" /> {sites.length.toLocaleString()} sites loaded from SL API</span><span>Grouped by mode · all trains, max 100 buses · current positions only</span></div></div><aside className="details-panel panel"><div className="panel-header compact"><div><p className="section-label">SELECTED VEHICLE</p><h2>{selected.line} <span className="muted">· {selected.mode}</span></h2></div><span className="status-badge"><i /> {selected.status}</span></div><div className="route-card"><div className="route-line" style={{ backgroundColor: selected.color }} /><div><span className="route-kicker">TOWARDS</span><strong>{selected.destination}</strong><span className="route-meta">Next stop: {selected.nextStop}</span></div><ChevronRight className="route-arrow" size={20} /></div><div className="detail-grid"><Detail label="Vehicle ID" value={selected.id} /><Detail label="Current speed" value={`${selected.speed} km/h`} /><Detail label="Delay" value={selected.delay ? `+${selected.delay} min` : 'On time'} danger={selected.delay > 0} /><Detail label="Occupancy" value={`${selected.occupancy}%`} /></div><div className="occupancy"><div className="detail-row"><span>Occupancy level</span><b>{selected.occupancy}%</b></div><div className="occupancy-track"><span style={{ width: `${selected.occupancy}%` }} /></div><div className="occupancy-labels"><span>Low</span><span>Moderate</span><span>High</span></div></div><div className="operator-row"><div className="operator-icon"><IconForMode mode={selected.mode} /></div><div><span>OPERATED BY</span><strong>{selected.operator}</strong></div><span className="updated">{selected.updated}</span></div><button className="full-details">View full vehicle telemetry <ChevronRight size={16} /></button></aside></section>
      <section className="fleet-section"><div className="fleet-heading"><div><p className="section-label">FLEET OVERVIEW</p><h2>All active vehicles <span className="count">{filteredVehicles.length}</span></h2></div><div className="fleet-actions"><div className="search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search line, destination..." /></div><button className="filter-button"><AlertTriangle size={15} /> {alertCount || lateCount} alerts</button></div></div><div className="filters">{(['All', 'Metro', 'Bus', 'Train', 'Tram'] as const).map((mode) => <button key={mode} onClick={() => setActiveMode(mode)} className={activeMode === mode ? 'filter active' : 'filter'}>{mode}</button>)}</div><div className="vehicle-table"><div className="table-head"><span>LINE / VEHICLE</span><span>DESTINATION</span><span>SPEED</span><span>DELAY</span><span>OCCUPANCY</span><span>STATUS</span></div>{filteredVehicles.map((vehicle) => <button className={`table-row ${selectedId === vehicle.id ? 'selected-row' : ''}`} key={vehicle.id} onClick={() => setSelectedId(vehicle.id)}><span className="line-cell"><b style={{ backgroundColor: vehicle.color }}>{vehicle.line}</b><span><strong>{vehicle.id}</strong><small>{vehicle.mode}</small></span></span><span>{vehicle.destination}</span><span>{vehicle.speed} km/h</span><span className={vehicle.delay ? 'delay' : ''}>{vehicle.delay ? `+${vehicle.delay} min` : 'On time'}</span><span><div className="mini-occupancy"><i style={{ width: `${vehicle.occupancy}%` }} /></div>{vehicle.occupancy || '—'}{vehicle.occupancy ? '%' : ''}</span><span className={vehicle.delay ? 'status-late' : 'status-ok'}>{vehicle.delay ? 'Running late' : 'In service'}</span></button>)}</div></section>
    </main><footer><span>SL NETWORK PULSE <b>·</b> INTERNAL OPERATIONS VIEW</span><span>DATA SOURCES: SL TRANSPORT API <b>·</b> REFRESH 15 SEC</span></footer>
  </div>
}

function Stat({ label, value, detail, tone, icon }: { label: string; value: string; detail: string; tone: string; icon: React.ReactNode }) { return <div className="stat-card"><div className={`stat-icon ${tone}`}>{icon}</div><div><span>{label}</span><strong>{value}</strong><small>{detail}</small></div></div> }
function Detail({ label, value, danger = false }: { label: string; value: string; danger?: boolean }) { return <div className="detail"><span>{label}</span><strong className={danger ? 'danger' : ''}>{value}</strong></div> }

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)
