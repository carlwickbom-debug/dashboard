# Maritime Dashboard

The maritime dashboard models operational vessel, port, lane, incident, anomaly, density, and feed-health data independently of any AIS vendor.

## Provider boundary

The `MaritimeData` contract is the provider-facing domain model. An AIS adapter can map its native records into these entities without changing the dashboard component or its map rendering logic.

## Unknown data

Missing speeds, headings, destinations, capacities, or timestamps are represented as `null` or explicit unavailable states rather than inferred values.
