# Networks Dashboard

## Purpose

The Networks dashboard presents regional telecommunications availability, route health, link utilization, packet loss, latency, providers, incidents, and abnormal events.

## Provider boundary

The dashboard consumes a typed `NetworksData` payload. A real provider should supply the same node, link, provider, incident, event, and map contracts without changing the React component.

## Data assumptions

- `capacityGbps` and `utilizationGbps` are numeric; zero capacity is reported as unknown utilization.
- `latencyMs` and `packetLossPercent` may be null when a measurement is unavailable.
- Nodes and links are the source of truth for topology geometry and route state.
- A provider or link may be unavailable even when the dashboard snapshot remains informational.
