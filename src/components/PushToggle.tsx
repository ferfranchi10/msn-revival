"use client";

import { useEffect, useState } from "react";
import { RetroButton } from "@/components/RetroButton";
import { disablePush, enablePush, getCurrentSubscription, getPushSupport, type PushSupport } from "@/lib/pushClient";

type State = { support: PushSupport; active: boolean } | null;

/** Activa/desactiva las notificaciones push **en este dispositivo** (la suscripción es por dispositivo, no por cuenta). */
export function PushToggle() {
  const [state, setState] = useState<State>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const support = getPushSupport();
      const active = support === "available" || support === "denied" ? Boolean(await getCurrentSubscription()) : false;
      if (!cancelled) setState({ support, active });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function toggle() {
    if (!state) return;
    setBusy(true);
    setError(null);
    try {
      if (state.active) await disablePush();
      else await enablePush();
      setState({ support: getPushSupport(), active: !state.active });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cambiar la configuración");
      setState({ support: getPushSupport(), active: Boolean(await getCurrentSubscription()) });
    } finally {
      setBusy(false);
    }
  }

  if (!state) return null;

  const hint: Record<PushSupport, string> = {
    unsupported: "Este navegador o dispositivo no admite notificaciones push.",
    "needs-install": "En iPhone/iPad primero instala la app: Compartir → Agregar a pantalla de inicio.",
    denied: "Bloqueaste las notificaciones en el navegador. Habilítalas en la configuración del sitio.",
    available: "Recibe avisos de mensajes, zumbidos y solicitudes aunque la app esté cerrada.",
  };

  return (
    <div className="mt-2 border-t border-[#C4CBD5] pt-3">
      <p className="mb-1 text-[14px] font-semibold text-[#1F2D3D]">
        Notificaciones push: {state.active ? "activadas" : "desactivadas"} en este dispositivo
      </p>
      <p className="mb-2 text-[12px] text-[#33445A]">{hint[state.support]}</p>
      {state.support === "available" && (
        <RetroButton type="button" variant="secondary" onClick={toggle} disabled={busy} className="w-48">
          {busy ? "Un momento..." : state.active ? "Desactivar" : "Activar en este dispositivo"}
        </RetroButton>
      )}
      {state.support === "denied" && state.active && (
        <RetroButton type="button" variant="secondary" onClick={toggle} disabled={busy} className="w-48">
          Desactivar
        </RetroButton>
      )}
      {error && <p className="mt-2 text-[12px] text-red-700">{error}</p>}
    </div>
  );
}
