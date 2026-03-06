---
path: /Users/jm/Codebase/dcwlt/pwa/convex/inventory.ts
type: service
updated: 2025-01-21
status: active
---

# inventory.ts

## Purpose

LEGACY inventory system (deprecated). Previously managed per-merchant items at events. Now replaced by event-level item groups system. Maintained for backward compatibility during migration.

## Exports

- `addItem` - (Deprecated) Add per-merchant item
- `updateItem` - (Deprecated) Update per-merchant item
- `removeItem` - (Deprecated) Remove per-merchant item
- `getEventInventory` - (Deprecated) Get inventory for event
- `getMerchantEventItems` - (Deprecated) Get items for merchant event

## Dependencies

- convex/server - Mutation and query handlers
- convex/values - Argument validators

## Used By

TBD
