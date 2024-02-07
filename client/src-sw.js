const { offlineFallback, warmStrategyCache } = require("workbox-recipes");
const { CacheFirst } = require("workbox-strategies");
const { registerRoute } = require("workbox-routing");
const { CacheableResponsePlugin } = require("workbox-cacheable-response");
const { ExpirationPlugin } = require("workbox-expiration");
const { precacheAndRoute } = require("workbox-precaching/precacheAndRoute");

const { StaleWhileRevalidate } = require("workbox-strategies");

precacheAndRoute(self.__WB_MANIFEST);

const pageCache = new CacheFirst({
  cacheName: "page-cache",
  plugins: [
    new CacheableResponsePlugin({
      statuses: [0, 200],
    }),
    new ExpirationPlugin({
      maxAgeSeconds: 30 * 24 * 60 * 60,
    }),
  ],
});

// Define an offline fallback strategy using offlineFallback
const offlineFallback = offlineFallback({
  cacheName: "offline-fallback-cache",
  plugins: [
    // Cache responses with status codes 0 and 200 (OK)
    new CacheableResponsePlugin({
      statuses: [0, 200],
    }),
  ],
});

warmStrategyCache({
  urls: ["/index.html", "/"],
  strategy: pageCache,
});

registerRoute(({ request }) => request.mode === "navigate", pageCache);

// Implement asset caching
registerRoute(
  // Define the callback function that will filter the requests we want to cache
  ({ request }) => ["style", "script", "worker"].includes(request.destination),
  new StaleWhileRevalidate({
    // Title of cache storage
    cacheName: "asset-cache",
    plugins: [
      // Cache responses with a max-age of 30 days
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);
