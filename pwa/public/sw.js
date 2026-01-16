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
  precacheEntries: [{"url":"rO-jBD9YCzuWa2rZ_JVWZ/_ssgManifest.js","revision":"b404e23d62d95bafd03ad7747cc0e88b"},{"url":"rO-jBD9YCzuWa2rZ_JVWZ/_buildManifest.js","revision":"3f290ecb505664f59e6ec20e14f7fccd"},{"url":"media/favicon.0b3bf435.ico","revision":"c30c7d42707a47a3f4591831641e50dc"},{"url":"media/d3fe2f289711ac3f-s.50575af1.woff2","revision":"8fc0aa17e1291e522dc51c63869b051a"},{"url":"media/bfc7db5c00d21bc5-s.247c8473.woff2","revision":"aa01ffde85d9db48aab4b245e5e8f97a"},{"url":"media/a343f882a40d2cc9-s.p.71e1367e.woff2","revision":"101877a7a906c31436104fe33740ae44"},{"url":"media/a342834df7752944-s.bb140f9f.woff2","revision":"28f2a82ccec846f227a8208eb1ca0e01"},{"url":"media/6ab0db14f70d8ed6-s.18d7c7dc.woff2","revision":"623714ac1d9949c8891464126e565fcb"},{"url":"media/58c4895d0a0ef7cc-s.78d1a7ae.woff2","revision":"75ae12b7d0d290534626028cad12724a"},{"url":"chunks/turbopack-6cf5405622412d46.js","revision":"84a69d763d2c760cbe638ae49984e00a"},{"url":"chunks/a6dad97d9634a72d.js","revision":"846118c33b2c0e922d7b3a7676f81f6f"},{"url":"chunks/662e30dc4053497d.js","revision":"d44de55f68159ff9e34e76cdb4bfea91"},{"url":"chunks/45dcbf1fcc35f61d.js","revision":"cfbcb12440fb5e6f1b40cc583c7bb54c"},{"url":"chunks/414d009823392dce.js","revision":"b4ea462517dc92a26b9c9f81a0e5dd60"},{"url":"chunks/1b6bbdc532b95c4b.css","revision":"5f8b944b2aef83781b46352bfaeaccbb"},{"url":"chunks/19764daaf79230d9.js","revision":"1c97b2f451673f0d31b4f4011555c8a9"},{"url":"chunks/10412462823c8500.js","revision":"6551201fb17d0cbd93ed2049579a6072"}],
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
