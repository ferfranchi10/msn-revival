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

/* ---- Web Push ---- */

// Safari (iOS y macOS) exige mostrar una notificación por cada push; si se omite, revoca la suscripción.
const MUST_ALWAYS_SHOW =
  /iPhone|iPad|iPod/.test(self.navigator.userAgent) ||
  (/Safari/.test(self.navigator.userAgent) && !/Chrome|Chromium|Edg|Firefox|FxiOS|CriOS/.test(self.navigator.userAgent));

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    // Payload que no es JSON: se muestra un aviso genérico.
  }

  event.waitUntil(
    (async () => {
      // Con la app abierta y a la vista ya salen el toast y el sonido propios: no duplicar.
      if (!MUST_ALWAYS_SHOW) {
        const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
        if (windows.some((w) => w.visibilityState === "visible")) return;
      }
      await self.registration.showNotification(data.title || "MSN Revival", {
        body: data.body || "",
        icon: data.icon || "/manifest-icon/192",
        badge: "/manifest-icon/192",
        tag: data.tag,
        renotify: Boolean(data.tag),
        data: { url: data.url || "/contactos" },
      });
    })(),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || "/contactos", self.location.origin).href;
  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      const existing = windows.find((w) => w.url.startsWith(self.location.origin));
      if (existing) return existing.focus();
      return self.clients.openWindow(target);
    })(),
  );
});

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
