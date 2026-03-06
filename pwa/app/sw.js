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
  precacheEntries: self.__SW_MANIFEST,
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
