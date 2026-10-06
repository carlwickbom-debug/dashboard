import GtfsRealtimeBindings from 'gtfs-realtime-bindings'

export type LiveVehicle = {
  id: string
  line: string
  mode: 'Metro' | 'Bus' | 'Train' | 'Tram'
  destination: string
  speed: number
  delay: number
  occupancy: number
  status: string
  latitude: number
  longitude: number
  timestamp: number
  updated: string
  nextStop: string
  operator: string
}

export type ServiceAlert = {
  id: string
  header: string
  description: string
  cause: string
  effect: string
}

export type LiveTransitData = {
  vehicles: LiveVehicle[]
  alerts: ServiceAlert[]
  timestamp: number
}

const API_ROOT = 'https://opendata.samtrafiken.se/gtfs-rt/sl'
const stockholmBounds = { minLat: 59.20, maxLat: 59.45, minLon: 17.75, maxLon: 18.35 }
const colors = { Metro: '#f04b53', Bus: '#3ca477', Train: '#e5b72d', Tram: '#1997aa' }
const MAX_POSITION_AGE_MS = 120_000
const LIVE_DATA_CACHE_TTL_MS = 30_000
let liveDataCache: { key: string; expiresAt: number; data: LiveTransitData } | null = null

function text(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function number(value: unknown, fallback = 0): number {
  const result = Number(value)
  return Number.isFinite(result) ? result : fallback
}

function modeFor(routeId: string, vehicleId: string): LiveVehicle['mode'] {
  const value = `${routeId} ${vehicleId}`.toLowerCase()
  if (value.includes('metro') || value.includes('tunnel') || /^t?b/.test(value)) return 'Metro'
  if (value.includes('train') || value.includes('pendel') || value.includes('rail')) return 'Train'
  if (value.includes('tram') || value.includes('spår')) return 'Tram'
  return 'Bus'
}

function toMapPosition(latitude: number, longitude: number) {
  const top = 100 - ((latitude - stockholmBounds.minLat) / (stockholmBounds.maxLat - stockholmBounds.minLat)) * 100
  const left = ((longitude - stockholmBounds.minLon) / (stockholmBounds.maxLon - stockholmBounds.minLon)) * 100
  return { lat: Math.max(5, Math.min(95, top)), left: Math.max(4, Math.min(96, left)) }
}

async function decodeFeed(path: string, key: string): Promise<any> {
  const response = await fetch(`${API_ROOT}/${path}?key=${encodeURIComponent(key)}`, { headers: { Accept: 'application/x-protobuf, application/octet-stream, */*' } })
  if (!response.ok) throw new Error(`${path} returned ${response.status}`)
  const bytes = new Uint8Array(await response.arrayBuffer())
  return GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(bytes)
}

export async function fetchLiveTransitData(key: string): Promise<LiveTransitData> {
  if (!key) throw new Error('Missing TRAFIKLAB_GTFS_RT_KEY')
  if (liveDataCache?.key === key && liveDataCache.expiresAt > Date.now()) return liveDataCache.data
  const [vehicleFeed, tripFeed, alertFeed] = await Promise.all([
    decodeFeed('VehiclePositions.pb', key),
    decodeFeed('TripUpdates.pb', key),
    decodeFeed('ServiceAlerts.pb', key),
  ])
  const feedTimestamp = number(vehicleFeed.header?.timestamp) * 1000
  if (!feedTimestamp || Date.now() - feedTimestamp > MAX_POSITION_AGE_MS) throw new Error('Vehicle-position feed is stale')

  const tripDelays = new Map<string, number>()
  for (const entity of tripFeed.entity ?? []) {
    const update = entity.tripUpdate
    const firstStop = update?.stopTimeUpdate?.[0]
    if (update?.trip?.tripId) tripDelays.set(text(update.trip.tripId), Math.round(number(firstStop?.arrival?.delay ?? firstStop?.departure?.delay) / 60))
  }

  const vehicles: LiveVehicle[] = []
  for (const entity of vehicleFeed.entity ?? []) {
    const position = entity.vehicle?.position
    const descriptor = entity.vehicle?.vehicle
    const trip = entity.vehicle?.trip
    const latitude = number(position?.latitude, NaN)
    const longitude = number(position?.longitude, NaN)
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) continue
    const timestamp = number(entity.vehicle?.timestamp, feedTimestamp / 1000) * 1000
    if (timestamp <= 0 || Date.now() - timestamp > MAX_POSITION_AGE_MS) continue
    const mode = modeFor(text(trip?.routeId), text(descriptor?.id))
    const id = text(descriptor?.id) || text(entity.id) || `vehicle-${vehicles.length + 1}`
    const tripId = text(trip?.tripId)
    const delay = Math.max(0, tripDelays.get(tripId) ?? 0)
    vehicles.push({ id, line: text(trip?.routeId) || 'SL', mode, destination: text(trip?.tripHeadsign) || 'Destination unavailable', speed: Math.round(number(position?.speed) * 3.6), delay, occupancy: 0, status: delay > 0 ? 'Running late' : 'In service', latitude, longitude, timestamp, updated: `${Math.max(0, Math.round((Date.now() - timestamp) / 1000))} sec ago`, nextStop: text(trip?.stopId) || 'Next stop unavailable', operator: 'SL' })
  }

  const alerts: ServiceAlert[] = []
  for (const entity of alertFeed.entity ?? []) {
    const alert = entity.alert
    const translation = alert?.headerText?.translation?.[0]
    const description = alert?.descriptionText?.translation?.[0]
    alerts.push({ id: text(entity.id) || `alert-${alerts.length + 1}`, header: text(translation?.text) || 'Service alert', description: text(description?.text), cause: text(alert?.cause), effect: text(alert?.effect) })
  }

  const data = { vehicles, alerts, timestamp: feedTimestamp }
  liveDataCache = { key, expiresAt: Date.now() + LIVE_DATA_CACHE_TTL_MS, data }
  return data
}

export function toDashboardVehicle(vehicle: LiveVehicle, index: number) {
  const position = toMapPosition(vehicle.latitude, vehicle.longitude)
  return { ...vehicle, ...position, color: colors[vehicle.mode], occupancy: vehicle.occupancy || 0, nextStop: vehicle.nextStop || 'Next stop unavailable', operator: vehicle.operator || 'SL', updated: vehicle.updated || 'just now', index }
}
