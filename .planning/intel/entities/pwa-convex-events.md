---
path: /Users/jm/Codebase/dcwlt/pwa/convex/events.ts
type: service
updated: 2025-01-21
status: active
---

# events.ts

## Purpose

Convex event management operations. Creates, updates, and deletes events with type validation (Concert, Sports, Festival, Custom), validates date format and capacity, provides queries for all events or filtered by type, and supports event lookup by ID.

## Exports

- `createEvent` - Create new event with validation
- `updateEvent` - Update existing event (partial updates supported)
- `getEvents` - Get all events or filter by type
- `getEvent` - Get single event by ID
- `deleteEvent` - Delete event by ID

## Dependencies

- convex/server - Mutation and query handlers
- convex/values - Argument validators

## Used By

TBD
