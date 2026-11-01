# T-035 — Map view with clustering

Phase 1.5 · Status: todo · Depends on: 015, 018

## Steps
1. `GET /api/reports/map?bbox=` → max 500 pins in the viewport (`$geoWithin` box), minimal fields.
2. Map tab with `react-leaflet-cluster`; refetch on `moveend` (debounced).
3. Pin popup → report card link.

## AC (PRODUCT §12.4)
- Map stays responsive with 500 pins.
