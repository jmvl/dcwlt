import {
  PrecacheEntry,
  Serwist,
  CacheFirst,
  StaleWhileRevalidate,
  NetworkFirst,
  ExpirationPlugin,
  CacheableResponsePlugin,
} from "serwist";

const serwist = new Serwist({
  precacheEntries: [{"url":"media/favicon.0b3bf435.ico","revision":"c30c7d42707a47a3f4591831641e50dc"},{"url":"media/d3fe2f289711ac3f-s.50575af1.woff2","revision":"8fc0aa17e1291e522dc51c63869b051a"},{"url":"media/bfc7db5c00d21bc5-s.247c8473.woff2","revision":"aa01ffde85d9db48aab4b245e5e8f97a"},{"url":"media/a343f882a40d2cc9-s.p.71e1367e.woff2","revision":"101877a7a906c31436104fe33740ae44"},{"url":"media/a342834df7752944-s.bb140f9f.woff2","revision":"28f2a82ccec846f227a8208eb1ca0e01"},{"url":"media/6ab0db14f70d8ed6-s.18d7c7dc.woff2","revision":"623714ac1d9949c8891464126e565fcb"},{"url":"media/58c4895d0a0ef7cc-s.78d1a7ae.woff2","revision":"75ae12b7d0d290534626028cad12724a"},{"url":"chunks/turbopack-ce1656ae3f312ff4.js","revision":"a42a12d73c1f76ce4e96864ac0851ae9"},{"url":"chunks/f055db98a901662f.js","revision":"02f0063db3b5f3a2e1b16b6682eb4f2b"},{"url":"chunks/e11f99b0c8446d20.js","revision":"e750332487a609b36ca69078cc27547f"},{"url":"chunks/a6dad97d9634a72d.js","revision":"846118c33b2c0e922d7b3a7676f81f6f"},{"url":"chunks/662e30dc4053497d.js","revision":"d44de55f68159ff9e34e76cdb4bfea91"},{"url":"chunks/594ff43b94306347.css","revision":"f243a7159f8dca5492afe03f372a7135"},{"url":"chunks/414d009823392dce.js","revision":"b4ea462517dc92a26b9c9f81a0e5dd60"},{"url":"chunks/19764daaf79230d9.js","revision":"1c97b2f451673f0d31b4f4011555c8a9"},{"url":"chunks/09317a2f825622c3.js","revision":"0355c50a7eca0b785c35dc4bd4a5fb9b"},{"url":"Dx8KgYyYTlD_W55YpJAvj/_ssgManifest.js","revision":"b404e23d62d95bafd03ad7747cc0e88b"},{"url":"Dx8KgYyYTlD_W55YpJAvj/_buildManifest.js","revision":"3f290ecb505664f59e6ec20e14f7fccd"}],
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
      handler: new CacheFirst({
        cacheName: "google-fonts",
        plugins: [
          new CacheableResponsePlugin({
            statuses: [0, 200],
          }),
          new ExpirationPlugin({
            maxEntries: 4,
            maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
          }),
        ],
      }),
    },
    {
      matcher: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      handler: new StaleWhileRevalidate({
        cacheName: "static-font-assets",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 4,
            maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
          }),
        ],
      }),
    },
    {
      matcher: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      handler: new StaleWhileRevalidate({
        cacheName: "static-image-assets",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 64,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
          }),
        ],
      }),
    },
    {
      matcher: /\/api\/.*$/i,
      handler: new NetworkFirst({
        cacheName: "api-calls",
        networkTimeoutSeconds: 10,
        plugins: [
          new CacheableResponsePlugin({
            statuses: [0, 200],
          }),
          new ExpirationPlugin({
            maxEntries: 16,
            maxAgeSeconds: 60, // 1 minute - stale balance data
          }),
        ],
      }),
    },
    {
      matcher: /\.(?:js|css)$/i,
      handler: new StaleWhileRevalidate({
        cacheName: "static-js-css-assets",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 32,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
          }),
        ],
      }),
    },
  ],
});

serwist.addEventListeners();
