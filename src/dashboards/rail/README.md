# Rail Dashboard

The RAIL dashboard consumes a typed mock payload through the registry provider. React components render derived operational views and do not call transport APIs directly.

## Service states

- NORMAL — operating on schedule
- DELAY — minor schedule deviation
- MAJOR DELAY — substantial schedule deviation
- SERVICE DISRUPTION — service or route interruption
- INFRASTRUCTURE FAILURE — track, signal, or station infrastructure failure

## Data flow

1. The rail provider creates a typed mock payload.
2. The registry supplies that provider to the application lifecycle.
3. The Rail component receives the payload and renders operational views.
4. Map and event markers use the supplied severity and location data.
