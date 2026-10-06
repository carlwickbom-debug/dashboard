# Road Traffic Dashboard

The ROAD TRAFFIC dashboard consumes a provider-supplied traffic payload. Camera observations are typed data objects and are not hard-coded in the React component.

## Camera data contract

Each camera includes its identifier, country, location, road and direction, status, image or video URL, and last update timestamp. The dashboard renders the latest image when the URL is available and shows a fallback for unavailable or offline cameras.

## Data flow

The traffic provider supplies operational metrics, incidents, closures, accidents, weather and roadwork data, camera records, events, and map layers. The dashboard renders domain calculations and visualizations without calling traffic APIs directly.
