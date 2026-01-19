# Phase 1: PWA Foundation - Context

**Gathered:** 2026-01-16
**Status:** Ready for planning

<vision>
## How This Should Work

Users discover the app either by visiting the website directly or by scanning a QR code. They land on a web page where they can register and use the app as a normal website.

The PWA install isn't forced immediately. Instead, the browser's native install prompt appears when the browser determines the user is engaged - standard PWA pattern. The user chooses when to install.

Once installed, the app launches in standalone mode (not a browser tab) and works offline through service worker caching.

</vision>

<essential>
## What Must Be Nailed

- **True PWA behavior** - The app must install and launch in standalone mode, not inside a browser tab
- **Service worker caching** - Offline capability is core to the PWA value proposition

</essential>

<specifics>
## Specific Ideas

- QR code OR direct URL access - both paths to the app are valid
- Registration happens on the website before PWA install is needed
- Browser-controlled install prompt (not custom/triggered manually)
- Standard PWA patterns - follow Next.js 16 + Serwist conventions

</specifics>

<notes>
## Additional Context

User emphasized **security** as a priority for the overall project. While Privy key sharding (auth/wallet security) is Phase 2, the security mindset applies to Phase 1 as well - secure HTTPS, proper CSP, safe service worker scope.

User seems to prefer standard, proven patterns over custom implementations.

</notes>

---

*Phase: 1-pwa-foundation*
*Context gathered: 2026-01-16*
