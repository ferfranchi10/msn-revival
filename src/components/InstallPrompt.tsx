"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { RETRO_FONT } from "@/lib/theme";

const DISMISS_KEY = "msn-install-dismissed";

/** Evento no estándar de Chromium (Chrome/Edge/Android) que permite lanzar el diálogo de instalación. */
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type Env = "server" | "installed" | "dismissed" | "ios" | "other";

function readEnv(): Env {
  try {
    if (localStorage.getItem(DISMISS_KEY)) return "dismissed";
  } catch {
    // localStorage puede no estar disponible (modo privado); se ignora.
  }
  const standalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  if (standalone) return "installed";
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ? "ios" : "other";
}

const noopSubscribe = () => () => {};

/**
 * Banner para instalar la app. En Chrome/Edge/Android usa el diálogo nativo; en iPhone/iPad
 * (donde no existe) explica el gesto "Compartir → Agregar a pantalla de inicio". No aparece si
 * ya está instalada o si el usuario lo descartó.
 */
export function InstallPrompt() {
  // `readEnv` toca `window`, así que en el servidor (y en la hidratación) se usa "server" y no se pinta nada.
  const env = useSyncExternalStore(noopSubscribe, readEnv, () => "server" as Env);
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setHidden(true);
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (hidden || env === "server" || env === "installed" || env === "dismissed") return null;
  // En otros navegadores (p. ej. Firefox de escritorio) no hay nada que ofrecer.
  if (env === "other" && !installEvent) return null;

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // Si no se puede persistir, al menos se oculta en esta sesión.
    }
    setHidden(true);
  }

  async function install() {
    if (!installEvent) return;
    await installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
    setHidden(true);
  }

  return (
    <div
      role="dialog"
      aria-label="Instalar MSN Revival"
      className="fixed inset-x-2 bottom-2 z-50 mx-auto max-w-sm overflow-hidden rounded-[6px] border border-[#8fa3c7] bg-white shadow-[0_3px_14px_rgba(0,0,0,0.55)] pb-[env(safe-area-inset-bottom)]"
      style={{ fontFamily: RETRO_FONT }}
    >
      <div className="flex items-center justify-between border-b border-[#274d80] bg-gradient-to-b from-[#5B8CC5] via-[#3E73B8] to-[#2E5F9E] px-2 py-1">
        <span className="text-[12px] font-bold text-white [text-shadow:0_1px_1px_rgba(0,0,0,0.4)]">
          Instalar MSN Revival
        </span>
        <button
          type="button"
          onClick={dismiss}
          aria-label="No volver a mostrar"
          className="flex h-[15px] w-[17px] items-center justify-center rounded-[2px] border border-[#7a2020] bg-gradient-to-b from-[#f2a0a0] to-[#c23b3b] text-[9px] leading-none text-white"
        >
          ×
        </button>
      </div>
      <div className="bg-gradient-to-b from-white to-[#DDE5F3] px-3 py-2.5 text-[12px] text-[#1F2D3D]">
        {installEvent ? (
          <>
            <p className="mb-2">Instálala como app para abrirla desde tu pantalla de inicio o escritorio.</p>
            <button
              type="button"
              onClick={install}
              className="rounded-[3px] border border-[#8fa3c7] bg-gradient-to-b from-white to-[#c7d3e6] px-4 py-1 text-[12px]"
            >
              Instalar
            </button>
          </>
        ) : (
          <p>
            Para instalarla en tu iPhone: toca <strong>Compartir</strong> (el cuadrado con la flecha) y luego{" "}
            <strong>Agregar a pantalla de inicio</strong>.
          </p>
        )}
      </div>
    </div>
  );
}
