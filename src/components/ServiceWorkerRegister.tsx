"use client";

import { useEffect } from "react";

/**
 * Registra `/sw.js` (solo en producción). En desarrollo se desregistra cualquier SW previo
 * para que la caché de una prueba con `npm run start` no tape los cambios de `npm run dev`.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker.getRegistrations().then((regs) => regs.forEach((r) => r.unregister()));
      return;
    }

    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .catch((err) => console.error("No se pudo registrar el service worker", err));
  }, []);

  return null;
}
