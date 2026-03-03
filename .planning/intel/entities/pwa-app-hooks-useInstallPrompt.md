---
path: /Users/jm/Codebase/dcwlt/pwa/app/hooks/useInstallPrompt.ts
type: hook
updated: 2025-01-21
status: active
---

# useInstallPrompt.ts

## Purpose

PWA install prompt hook detecting beforeinstallprompt event (Chrome/Edge) and iOS devices. Tracks visit count to show prompt on second visit, provides prompt installation for Chrome and iOS instructions, and persists dismissal state.

## Exports

- `useInstallPrompt()` - Hook returning { canInstall, isIOS, showPrompt, promptInstall, dismissPrompt }

## Dependencies

- None (browser APIs only)

## Used By

TBD
