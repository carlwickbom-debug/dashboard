import { useEffect, useRef, useState } from 'react'
import { importLibrary, setOptions } from '@googlemaps/js-api-loader'
import { MarkerClusterer } from '@googlemaps/markerclusterer'

type MapVehicle = {
  id: string
  line: string
  mode: 'Metro' | 'Bus' | 'Train' | 'Tram'
  destination: string
  color: string
  lat: number
  left: number
  latitude?: number
  longitude?: number
}

type MapSite = { name: string; lat: number; lon: number }

type MapViewProps = {
  vehicles: MapVehicle[]
  sites: MapSite[]
  selectedId: string
  onSelect: (id: string) => void
}

const stockholm = { lat: 59.3293, lng: 18.0686 }
const fallbackBounds = { minLat: 59.20, maxLat: 59.45, minLon: 17.75, maxLon: 18.35 }
const railPaths = [
  [{ lat: 59.273, lng: 17.906 }, { lat: 59.310, lng: 18.022 }, { lat: 59.331, lng: 18.063 }, { lat: 59.343, lng: 18.050 }, { lat: 59.370, lng: 18.024 }],
  [{ lat: 59.299, lng: 18.080 }, { lat: 59.320, lng: 18.073 }, { lat: 59.331, lng: 18.063 }, { lat: 59.339, lng: 18.091 }, { lat: 59.349, lng: 18.104 }],
  [{ lat: 59.264, lng: 18.126 }, { lat: 59.300, lng: 18.080 }, { lat: 59.331, lng: 18.063 }, { lat: 59.343, lng: 18.050 }, { lat: 59.372, lng: 18.006 }],
  [{ lat: 59.330, lng: 18.063 }, { lat: 59.342, lng: 18.050 }, { lat: 59.352, lng: 18.048 }, { lat: 59.366, lng: 18.057 }],
]

function positionFor(vehicle: MapVehicle) {
  if (Number.isFinite(vehicle.latitude) && Number.isFinite(vehicle.longitude)) return { lat: vehicle.latitude!, lng: vehicle.longitude! }
  return {
    lat: fallbackBounds.maxLat - (vehicle.lat / 100) * (fallbackBounds.maxLat - fallbackBounds.minLat),
    lng: fallbackBounds.minLon + (vehicle.left / 100) * (fallbackBounds.maxLon - fallbackBounds.minLon),
  }
}

export function MapView({ vehicles, sites, selectedId, onSelect }: MapViewProps) {
  const mapRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])
  const clusterersRef = useRef<MarkerClusterer[]>([])
  const siteMarkersRef = useRef<google.maps.Marker[]>([])
  const polylinesRef = useRef<google.maps.Polyline[]>([])
  const onSelectRef = useRef(onSelect)
  const [mapReady, setMapReady] = useState(false)
  onSelectRef.current = onSelect

  useEffect(() => {
    let cancelled = false
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    const mapWrap = document.querySelector('.map-wrap')
    if (!apiKey || !mapWrap) return
    const host = document.createElement('div')
    host.className = 'google-map-canvas'
    mapWrap.classList.add('map-wrap--google')
    mapWrap.prepend(host)
    setOptions({ key: apiKey, v: 'weekly' })
    importLibrary('maps').then((maps) => {
      if (cancelled) return
      const { Map } = maps as google.maps.MapsLibrary
      const map = new Map(host, { center: stockholm, zoom: 11, mapTypeControl: false, streetViewControl: false, fullscreenControl: false, clickableIcons: false, styles: [{ featureType: 'poi', stylers: [{ visibility: 'off' }] }, { featureType: 'transit.station', stylers: [{ visibility: 'on' }] }] })
      mapRef.current = map
      map.fitBounds(new google.maps.LatLngBounds({ lat: 59.24, lng: 17.82 }, { lat: 59.43, lng: 18.25 }))
      setMapReady(true)
    }).catch(() => undefined)
    return () => { cancelled = true; mapWrap.classList.remove('map-wrap--google'); host.remove() }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !window.google || !mapReady) return
    clusterersRef.current.forEach((clusterer) => clusterer.clearMarkers())
    clusterersRef.current = []
    markersRef.current.forEach((marker) => marker.setMap(null))
    markersRef.current = vehicles.map((vehicle) => {
      const marker = new google.maps.Marker({ position: positionFor(vehicle), title: `${vehicle.line} to ${vehicle.destination}`, label: { text: vehicle.line, color: '#ffffff', fontSize: '11px', fontWeight: '700' }, icon: { path: google.maps.SymbolPath.CIRCLE, scale: vehicle.id === selectedId ? 12 : 9, fillColor: vehicle.color, fillOpacity: 1, strokeColor: vehicle.id === selectedId ? '#ffffff' : '#16334b', strokeWeight: vehicle.id === selectedId ? 4 : 2 } })
      marker.addListener('click', () => onSelectRef.current(vehicle.id))
      return marker
    })
    const modes: MapVehicle['mode'][] = ['Metro', 'Train', 'Tram', 'Bus']
    clusterersRef.current = modes.map((mode) => new MarkerClusterer({ map, markers: vehicles.filter((vehicle) => vehicle.mode === mode).map((vehicle) => markersRef.current[vehicles.indexOf(vehicle)]) }))
    return () => { clusterersRef.current.forEach((clusterer) => clusterer.clearMarkers()); markersRef.current.forEach((marker) => marker.setMap(null)) }
  }, [vehicles, selectedId, mapReady])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !window.google || !mapReady) return
    siteMarkersRef.current.forEach((marker) => marker.setMap(null))
    siteMarkersRef.current = sites.map((site) => new google.maps.Marker({ map, position: { lat: site.lat, lng: site.lon }, title: site.name, icon: { path: google.maps.SymbolPath.CIRCLE, scale: 3, fillColor: '#d9edf0', fillOpacity: 1, strokeColor: '#17354c', strokeWeight: 1 } }))
    polylinesRef.current.forEach((line) => line.setMap(null))
    polylinesRef.current = railPaths.map((path, index) => new google.maps.Polyline({ map, path, strokeColor: ['#ed4d59', '#ed4d59', '#f0b82f', '#2ba68b'][index], strokeOpacity: .85, strokeWeight: 3, clickable: false }))
    return () => { siteMarkersRef.current.forEach((marker) => marker.setMap(null)); polylinesRef.current.forEach((line) => line.setMap(null)) }
  }, [sites, mapReady])

  return null
}
