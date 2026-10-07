# Data Provider Architecture

Dashboards consume domain provider interfaces from `contracts.ts`, not concrete adapters. The supported domains are Energy, Rail, Traffic, Data Centers, Aviation, Maritime, Networks, and Cyber. Each interface exposes current state, normalized operational events, last-updated time, provider health, and capabilities.

`domainFactories.ts` is the dependency-injection boundary. It selects an implementation from a provider registry. The current application registers only mock implementations; requesting `api`, `firestore`, or another unregistered mode fails explicitly. The existing dashboard `load()` and `refresh()` methods are compatibility adapters while the app migrates to the richer domain contract.

Set `VITE_DATA_PROVIDER_MODE=mock` in local configuration. `VITE_OPS_DATA_SOURCE` remains a temporary compatibility fallback. These variables select an implementation only; never put API credentials, signing keys, database credentials, or privileged tokens in `VITE_*` variables because Vite embeds them in the browser bundle.

## Adding A Server-Side Provider

1. Add a backend or BFF service that owns upstream credentials and makes authenticated calls to external APIs or Firestore.
2. Expose a narrow application endpoint that returns validated domain state, `OperationalEvent[]`, health, and update metadata. Apply authorization, rate limits, timeout handling, and audit logging on the server.
3. Implement the matching `DomainDataProvider<T>` interface in a server-backed client adapter. The adapter should call only the application endpoint and must not contain upstream secrets.
4. Register the implementation under `api` or `firestore` in the domain's `ProviderRegistry`; inject that registry into the domain factory.
5. Deploy the server and configure the frontend with only its non-secret base URL and `VITE_DATA_PROVIDER_MODE=api` (or `firestore`). Keep credentials in the server's secret manager/environment, never in source, `.env.example`, or client build variables.
6. Add contract tests using mocked HTTP responses and verify the same health/event semantics as the mock provider before enabling production traffic.

No external API or Firestore connection is configured by this repository yet.