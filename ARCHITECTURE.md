# Nordic Operational Intelligence Dashboard Architecture

## Summary

The application is a single modular React platform. The application shell discovers all operational dashboards through a central registry. Navigation, theme, top status, health, time, freshness, and global event presentation are owned by core components. Each dashboard is a plugin that owns its domain data contract, mock or real provider, presentation, and optional map configuration.

## Layering

- `src/app`: application shell and global state.
- `src/components`: reusable presentation primitives and operational components.
- `src/components/layout`: application workspace and standard dashboard structure.
- `src/components/navigation`: registry-driven navigation.
- `src/components/status`: severity, health, freshness, loading and availability states.
- `src/components/charts`, `maps`, `events`, `tables`, and `cards`: reusable domain-neutral UI building blocks.
- `src/dashboard-registry`: central registry and navigation projection.
- `src/dashboards`: plugin implementations. The Overview module is a cross-domain entry point; the other modules are operational domains.
- `src/data`: typed models, normalization, provider interfaces, mock fixtures and providers.
- `src/services`: service adapters that may be added without changing UI components.
- `src/hooks`: reusable React data and lifecycle hooks.
- `src/utils`: pure utility functions.
- `src/styles`: design-system tokens and responsive layout.
- `src/assets`: static application assets.

## Dashboard architecture

A dashboard is a component plus a provider definition. The registry owns the component reference and the provider contract. The shell calls `useDashboardData` with the selected provider, then renders the selected component with the returned typed snapshot. The dashboard component does not know about routing, navigation, global state or provider internals.

The common dashboard structure is:

1. Dashboard title and description.
2. Overall health and status.
3. Key metrics.
4. Operational visualization.
5. Reusable Nordic map when applicable.
6. Events outside normal operating conditions.
7. Detailed operational information.
8. Data source and freshness.

`DashboardLayout`, `DashboardHeader`, `DashboardGrid`, `DashboardPanel`, `MetricGrid`, `EventPanel`, and `MapPanel` implement this structure. Domains compose those primitives instead of creating independent page shells.

## Dashboard registry

`src/dashboard-registry/registry.ts` is the single source of truth for enabled dashboards. It imports every plugin and creates a `DashboardDefinition`. The navigation consumes `dashboardNavigation`, which is derived from the registry. The application therefore does not hard-code dashboard names or IDs.

A dashboard entry contains:

- stable identifier and display metadata;
- the React component;
- a `DashboardDataProvider` implementation;
- enabled state.

Adding a dashboard requires registering one provider and component. Navigation and routing automatically discover the entry.

## Component architecture

Shared components are intentionally domain-neutral. Severity and status values are represented by a single `Severity` union. `SeverityBadge`, `StatusIndicator`, `HealthIndicator`, `DataFreshness`, `MetricCard`, `OperationalEventRow`, and `EventPanel` apply consistent semantics across all dashboards.

`NordicMap` is the only map implementation. It supports points, severity markers, lines, regions, selection, hover tooltips and popup-style detail cards. Dashboard modules configure layers through data rather than writing map code.

## Data provider architecture

`DashboardDataProvider<T>` defines `load` and `refresh`. `useDashboardData` owns loading, error, refresh and lifecycle behavior. Providers return a typed `DashboardSnapshot`; they do not manipulate React state or UI.

Mock providers are located in `src/data/providers/mockProvider.ts` and domain fixtures in `src/data/mock`. The current fixtures include normal conditions, warnings, critical events, stale data and unavailable data-source states. Real providers can implement the same interface using a service client, API adapter or normalized model while leaving dashboard components unchanged.

## Adding a dashboard

See `ADDING-A-DASHBOARD.md` for a complete nine-dashboard example.

## Coding conventions

- Use strict TypeScript and avoid `any`.
- Keep data models in `src/data/models.ts`.
- Keep live or mock provider definitions beside the dashboard module.
- Use shared components for presentation and do not duplicate map or event logic.
- Keep domain-specific calculations in pure helpers when they can be tested independently.
- Use semantic sections and accessible controls.
- Preserve the registry-driven navigation contract when adding a plugin.
- Use CSS variables for all visual tokens and avoid inline color values in UI components.
