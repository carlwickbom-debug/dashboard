# Data Centers Dashboard

This dashboard is a provider-driven operational view for Nordic data center infrastructure. All values are supplied by the data provider; missing measurements are represented as `null` and displayed as "Not reported" or "Unknown" rather than inferred.

## Data model

Every facility supports the requested identity, location, capacity, power, cooling, energy, network, operator, cloud provider, status, availability, and update fields. Status values include OPERATIONAL, DEGRADED, PARTIAL OUTAGE, MAJOR OUTAGE, MAINTENANCE, and UNKNOWN.

## Operational signals

The dashboard highlights cooling load, power utilization, sudden load changes, network isolation, high utilization, outages, maintenance, and unknown telemetry. The source and freshness indicators communicate whether the provider data is live, fresh, stale, degraded, or unavailable.
