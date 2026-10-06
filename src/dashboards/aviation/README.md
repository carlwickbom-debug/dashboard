# Aviation Dashboard

The aviation dashboard exposes provider-driven operational intelligence for Nordic airports, flights, departures, arrivals, delays, cancellations, airspace restrictions, weather disruption, and abnormal events.

## Provider contract

The dashboard consumes typed entities for airports and flights. Provider adapters can replace the mock provider with a live ATC, flight tracking, weather, or airport operations feed while preserving the same domain model.

## Unknown and unavailable values

The UI uses explicit status and missing-value states. It never estimates flight counts, delays, availability, or locations when a provider has not supplied them.
