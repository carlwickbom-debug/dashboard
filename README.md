# SL Network Pulse

A client-side Vite dashboard for monitoring SL traffic in Google AI Studio or any browser-based React environment.

## Run

```bash
npm install
npm run dev
```

## Data boundary

The dashboard requests `https://transport.integration.sl.se/v1/sites` on load and normalizes common SL site coordinate fields. It uses the Trafiklab key from `VITE_TRAFIKLAB_GTFS_RT_KEY` for the GTFS Regional SL protobuf feeds. The UI checks for updates every 15 seconds, but decoded feed data is cached in memory for 30 seconds so the three APIs are not requested on every refresh cycle.

- `https://opendata.samtrafiken.se/gtfs-rt/sl/VehiclePositions.pb` for live vehicle locations and speed
- `https://opendata.samtrafiken.se/gtfs-rt/sl/TripUpdates.pb` for delay and destination information
- `https://opendata.samtrafiken.se/gtfs-rt/sl/ServiceAlerts.pb` for active service alerts

The feeds are decoded in the browser with `gtfs-realtime-bindings`. Vehicle positions older than two minutes are discarded, and a failed or stale refresh clears the active fleet. The dashboard never displays simulated vehicles as current data; it shows an empty fleet until a fresh vehicle feed is available. If the browser blocks a request or the API key has no access to a file, the site markers may fall back to the included Stockholm station fixture, but vehicle markers are not fabricated.

The Google map displays every non-bus vehicle and the first 100 buses from the current feed. The fleet table and metrics still include every current vehicle.

The local key is read from `VITE_TRAFIKLAB_GTFS_RT_KEY` in `.env.local`, which is ignored by Git. The key currently configured for verification (`0785...`) returns `403 Key does not have access to file` from all three GTFS Regional SL feeds, so the dashboard will show no current vehicles until that key is granted access. The previously tested key was authorized for those Regional feeds; the dashboard remains configured to use this Regional API family rather than the unauthorized `gtfs-rt-sweden` files.

The map uses Google Maps JavaScript API. Add a browser-restricted Google Maps key as `VITE_GOOGLE_MAPS_API_KEY` in `.env.local`, with Maps JavaScript API enabled. Without that key, the dashboard keeps its fallback schematic map.

No server or database is required. API keys, if needed by a future provider, should be supplied through Google AI Studio's environment rather than committed to this project.
