# Adding a Dashboard

## 1. Create the dashboard folder

Create `src/dashboards/yourdomain/` with these files:

- `YourDomain.tsx`
- `provider.ts`

The folder name must match the stable registry identifier.

## 2. Define the domain view

Import the shared `DashboardSnapshot` model and compose the standard dashboard primitives:

```tsx
import type { DashboardSnapshot } from '../../data/models'
import { DashboardContent } from '../../components/dashboard/DashboardContent'
import { NordicMap } from '../../components/maps/NordicMap'

export function YourDomain({ data }: { data: DashboardSnapshot }) {
  return (
    <DashboardContent
      data={data}
      map={<NordicMap layers={data.mapLayers ?? []} />}
      details={<div>Domain-specific details</div>}
    />
  )
}
```

Use `MetricCard`, `DashboardPanel`, `EventPanel`, `StatusIndicator`, `SeverityBadge`, and `DataFreshness` rather than creating new page shells.

## 3. Create a typed mock provider

```tsx
import type { DashboardDefinition, DashboardSnapshot } from '../../data/models'
import { createMockProvider } from '../../data/providers/mockProvider'
import { YourDomain } from './YourDomain'

const snapshot: DashboardSnapshot = {
  status: 'OK',
  health: 100,
  headline: 'Domain operating normally',
  updatedAt: '09:42 UTC',
  source: 'Mock provider',
  freshness: 'CURRENT',
  metrics: [],
  events: [],
  summary: 'All monitored systems are healthy.',
}

export const yourDomainProvider: DashboardDefinition<DashboardSnapshot> = {
  id: 'yourdomain',
  name: 'YOUR DOMAIN',
  description: 'Domain-specific operational intelligence.',
  icon: 'activity',
  category: 'Infrastructure',
  component: YourDomain,
  enabled: true,
  provider: createMockProvider('yourdomain', snapshot),
}
```

Add realistic normal, warning, critical, stale and unavailable states in the fixture before enabling the dashboard.

## 4. Register the dashboard

Import the provider in `src/dashboard-registry/registry.ts` and append it to the registry array:

```ts
import { yourDomainProvider } from '../dashboards/yourdomain/provider'

export const dashboardRegistry = [
  // existing dashboards
  yourDomainProvider,
]
```

The navigation and hash routing are generated automatically from the registry.

## 5. Add the navigation icon

The navigation icon map in `src/components/navigation/Navigation.tsx` supports a stable icon key. Add a `lucide-react` icon key if the domain needs a new visual identifier.

## 6. Replace the mock provider

Create a provider adapter in `src/services/` that implements `DashboardDataProvider<DashboardSnapshot>`. Normalize remote fields into the shared model, then replace `createMockProvider` in the dashboard provider definition. The dashboard component and application shell remain unchanged.

For an API that returns a different domain model, add a normalization function in `src/data/normalization.ts` and keep the remote adapter responsible for transport, authentication, caching and retry behavior.

## 7. Validate

Run:

```bash
npm test
npm run lint
npm run build
```
