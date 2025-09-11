const CACHE_NAME = "randoro-cache-v2";
const FILES_TO_CACHE = [
  "./",
  "/index.html",
  "/info.html",
  "/manifest.json",
  "/css/tailwind.css",
  "/js/main.js",
  "/js/modeManager.js",
  "/js/taskManager.js",
  "/js/timer.js",
  "/js/fontManager.js",
  "/js/soundManager.js",
  "/js/pwaManager.js",
  "/fonts/m6x11.ttf",
  "/fonts/m6x11plus.ttf",
  "/sounds/african-tabla.mp3",
  "/sounds/car-horn.mp3",
  "/sounds/funny-alarm.mp3",
  "/sounds/level-up-07.mp3",
];

// Install event: cache files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) =>
        cache.addAll(FILES_TO_CACHE).catch((err) => {
          console.error("Some files failed to cache:", err);
        })
      )
      .then(() => self.skipWaiting()) // Activate SW immediately
  );
});

// Activate event: clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) return caches.delete(key);
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

// Fetch event: respond from cache, then network
self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cachedRes) => {
      if (cachedRes) return cachedRes;

      return fetch(event.request)
        .then((networkRes) => {
          // Optionally cache new requests dynamically
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkRes.clone());
            return networkRes;
          });
        })
        .catch(() => {
          // Fallback to index.html for navigation requests (SPA)
          if (event.request.mode === "navigate") {
            return caches.match("/index.html");
          }
        });
    })
  );
});
