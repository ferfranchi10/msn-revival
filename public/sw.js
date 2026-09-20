/* Service worker de MSN Revival (FASE 8, PWA base).
 *
 * Alcance deliberadamente mínimo: la app es tiempo real (Firestore/RTDB/Auth), así
 * que NO se cachea nada de datos ni de `/api`. Solo se cachea lo estático y se
 * ofrece una pantalla "sin conexión" cuando falla una navegación.
 *   - /_next/static/*  → cache-first (archivos con hash en el nombre, inmutables).
 *   - sonidos e iconos → stale-while-revalidate.
 *   - navegaciones     → network-first; si no hay red, /offline.html.
 *   - todo lo demás (otros orígenes, POST, /api, Firebase) → el navegador, sin tocar.
 * Al cambiar la lógica o la lista de PRECACHE, subir VERSION para limpiar cachés viejas.
 */
const VERSION = "v1";
const STATIC_CACHE = `msn-static-${VERSION}`;
const RUNTIME_CACHE = `msn-runtime-${VERSION}`;
const OFFLINE_URL = "/offline.html";
const PRECACHE = [OFFLINE_URL, "/manifest-icon/192", "/manifest-icon/512"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("msn-") && key !== STATIC_CACHE && key !== RUNTIME_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(STATIC_CACHE);
    cache.put(request, response.clone());
  }
  return response;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);
  return cached || network;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => (await caches.match(OFFLINE_URL)) || Response.error()),
    );
    return;
  }

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (
    url.pathname.startsWith("/sounds/") ||
    url.pathname.startsWith("/manifest-icon/") ||
    url.pathname === "/icon" ||
    url.pathname === "/apple-icon"
  ) {
    event.respondWith(staleWhileRevalidate(request));
  }
});
