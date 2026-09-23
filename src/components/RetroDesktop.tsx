"use client";

import { useSyncExternalStore } from "react";
import { LogoMark } from "./LogoMark";

/**
 * Escritorio decorativo detrás de la ventana (iconos + barra de tareas),
 * inspirado en un escritorio clásico de PC pero con glifos e iconos 100%
 * propios: ningún logo real de Windows ni de las apps listadas (son solo
 * las mismas etiquetas de texto, a modo de nostalgia/broma interna).
 */

type IconKind =
  | "folder"
  | "monitor"
  | "network"
  | "trash"
  | "browser"
  | "disc"
  | "note"
  | "chat"
  | "bolt"
  | "download"
  | "game"
  | "wrench";

const DESKTOP_ITEMS: { label: string; kind: IconKind }[] = [
  { label: "Mis documentos", kind: "folder" },
  { label: "Mi PC", kind: "monitor" },
  { label: "Mis sitios de red", kind: "network" },
  { label: "Papelera de reciclaje", kind: "trash" },
  { label: "Internet Explorer", kind: "browser" },
  { label: "Mis sitios de Bluetooth", kind: "network" },
  { label: "Actualizar la licencia...", kind: "bolt" },
  { label: "Adobs Audition 1.5", kind: "note" },
  { label: "DAEMON Tools", kind: "bolt" },
  { label: "Google Earth", kind: "browser" },
  { label: "Mozilla Firefox", kind: "browser" },
  { label: "Nero StartSmart", kind: "disc" },
  { label: "eMule", kind: "download" },
  { label: "Nokia PC Suite", kind: "monitor" },
  { label: "Skype", kind: "chat" },
  { label: "TuneUp Utilities 2008", kind: "bolt" },
  { label: "Winamp", kind: "note" },
  { label: "µTorrent", kind: "download" },
  { label: "Ares", kind: "download" },
  { label: "Counter Strike", kind: "game" },
  { label: "VirtualDub", kind: "wrench" },
  { label: "Google Chrome", kind: "browser" },
  { label: "JDownloader", kind: "download" },
  { label: "Nandub", kind: "wrench" },
  { label: "Nero Burning ROM", kind: "disc" },
  { label: "PowerISO", kind: "disc" },
  { label: "sXe Injected", kind: "game" },
  { label: "Virtual DJ", kind: "note" },
  { label: "WinAVI Video Converter", kind: "wrench" },
  { label: "Windows Live Messenger", kind: "chat" },
  { label: "GTA San Andreas", kind: "game" },
];

function MiniIcon({ kind }: { kind: IconKind }) {
  const stroke = "#F4F8FF";
  const fill = "#3E73B8";
  const common = { stroke, strokeWidth: 1.4, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

  switch (kind) {
    case "folder":
      return (
        <svg viewBox="0 0 32 32" className="h-7 w-7">
          <path d="M4 10c0-1.1.9-2 2-2h6l2.5 3H26c1.1 0 2 .9 2 2v9c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V10Z" fill={fill} {...common} />
        </svg>
      );
    case "monitor":
      return (
        <svg viewBox="0 0 32 32" className="h-7 w-7">
          <rect x="4" y="6" width="24" height="15" rx="1.5" fill={fill} {...common} />
          <path d="M12 26h8M16 21v5" {...common} fill="none" />
        </svg>
      );
    case "network":
      return (
        <svg viewBox="0 0 32 32" className="h-7 w-7">
          <rect x="3" y="18" width="7" height="6" rx="1" fill={fill} {...common} />
          <rect x="13" y="18" width="7" height="6" rx="1" fill={fill} {...common} />
          <rect x="23" y="18" width="6" height="6" rx="1" fill={fill} {...common} />
          <path d="M9 18v-3a2 2 0 0 1 2-2h10a2 2 0 0 1 2-2v-3M16 13v5" fill="none" {...common} />
        </svg>
      );
    case "trash":
      return (
        <svg viewBox="0 0 32 32" className="h-7 w-7">
          <path d="M7 10h18l-1.4 15.2a2 2 0 0 1-2 1.8H10.4a2 2 0 0 1-2-1.8L7 10Z" fill={fill} {...common} />
          <path d="M11 6h10l1.5 4h-13L11 6ZM4 10h24" fill="none" {...common} />
        </svg>
      );
    case "browser":
      return (
        <svg viewBox="0 0 32 32" className="h-7 w-7">
          <circle cx="16" cy="16" r="12" fill={fill} {...common} />
          <path d="M4 16h24M16 4c3 3.5 3 21 0 24-3-3.5-3-20.5 0-24Z" fill="none" {...common} />
        </svg>
      );
    case "disc":
      return (
        <svg viewBox="0 0 32 32" className="h-7 w-7">
          <circle cx="16" cy="16" r="12" fill={fill} {...common} />
          <circle cx="16" cy="16" r="3.4" fill="#F4F8FF" />
        </svg>
      );
    case "note":
      return (
        <svg viewBox="0 0 32 32" className="h-7 w-7">
          <path d="M12 6v16.3a4 4 0 1 1-2-3.5V9l14-3v14.3" fill="none" {...common} />
          <circle cx="10" cy="24" r="3.6" fill={fill} {...common} />
        </svg>
      );
    case "chat":
      return (
        <svg viewBox="0 0 32 32" className="h-7 w-7">
          <path d="M5 8h22v13H14l-5 4v-4H5V8Z" fill={fill} {...common} />
        </svg>
      );
    case "bolt":
      return (
        <svg viewBox="0 0 32 32" className="h-7 w-7">
          <path d="M18 4 8 18h7l-2 10 12-15h-7l0-9Z" fill={fill} {...common} />
        </svg>
      );
    case "download":
      return (
        <svg viewBox="0 0 32 32" className="h-7 w-7">
          <path d="M16 4v15m0 0-6-6m6 6 6-6" fill="none" {...common} />
          <path d="M6 24h20v3H6z" fill={fill} {...common} />
        </svg>
      );
    case "game":
      return (
        <svg viewBox="0 0 32 32" className="h-7 w-7">
          <rect x="3" y="12" width="26" height="11" rx="5.5" fill={fill} {...common} />
          <path d="M9 14.5v6M6 17.5h6" {...common} />
          <circle cx="23" cy="15.5" r="1.4" fill="#F4F8FF" />
          <circle cx="26" cy="19.5" r="1.4" fill="#F4F8FF" />
        </svg>
      );
    case "wrench":
      return (
        <svg viewBox="0 0 32 32" className="h-7 w-7">
          <path
            d="M22 6a6 6 0 0 0-7.8 7.4L5 22.6l3.4 3.4 9.2-9.2A6 6 0 0 0 22 6Z"
            fill={fill}
            {...common}
          />
        </svg>
      );
  }
}

function DesktopIcon({ label, kind }: { label: string; kind: IconKind }) {
  return (
    <div className="flex w-[92px] flex-col items-center gap-1 px-1 py-1 text-center">
      <div className="flex h-9 w-9 items-center justify-center rounded-[4px] bg-[#1c3a63]/25 shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
        <MiniIcon kind={kind} />
      </div>
      <span className="line-clamp-2 text-[11px] leading-tight text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.85)]">
        {label}
      </span>
    </div>
  );
}

/** Grilla de accesos directos, apilados en columnas como en un escritorio real. */
export function DesktopIcons() {
  return (
    <div
      className="pointer-events-none absolute left-3 top-3 hidden max-h-[calc(100%-3.5rem)] flex-col flex-wrap content-start gap-x-1 gap-y-1 overflow-hidden md:flex"
      aria-hidden
    >
      {DESKTOP_ITEMS.map((item, i) => (
        <DesktopIcon key={`${item.label}-${i}`} label={item.label} kind={item.kind} />
      ))}
    </div>
  );
}

// getSnapshot debe devolver un valor estable entre llamadas (no un Date.now()
// fresco cada vez, o React entra en loop de renders); se actualiza solo
// cuando dispara el intervalo.
let cachedClockMs = 0;

function subscribeToClock(callback: () => void) {
  const id = setInterval(() => {
    cachedClockMs = Date.now();
    callback();
  }, 30_000);
  return () => clearInterval(id);
}

function getClockSnapshot() {
  if (cachedClockMs === 0) cachedClockMs = Date.now();
  return cachedClockMs;
}

function getServerClockSnapshot() {
  return 0;
}

function useClock() {
  const ms = useSyncExternalStore(subscribeToClock, getClockSnapshot, getServerClockSnapshot);
  return ms === 0 ? null : new Date(ms);
}

/** Barra de tareas propia: paleta y logo de MSN Revival, sin marca de Windows. */
export function Taskbar() {
  const now = useClock();
  const time = now
    ? now.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <div className="fixed inset-x-0 bottom-0 z-20 hidden h-9 items-center justify-between border-t border-[#1c3a63] bg-gradient-to-b from-[#5B8CC5] to-[#274d80] px-2 shadow-[0_-2px_6px_rgba(0,0,0,0.35)] md:flex">
      <div className="flex items-center gap-1.5 rounded-[3px] bg-gradient-to-b from-[#79a8e0] to-[#3E73B8] px-2.5 py-1 text-[13px] font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]">
        <LogoMark size={16} />
        Menú
      </div>
      <div className="flex items-center gap-2 rounded-[2px] bg-[#1c3a63]/60 px-2.5 py-1 text-[12px] text-white">
        {time}
      </div>
    </div>
  );
}
