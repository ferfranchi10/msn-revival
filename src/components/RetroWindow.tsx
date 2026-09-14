import type { ReactNode } from "react";
import { LogoMark } from "./LogoMark";

function WindowButton({ children, close = false }: { children: ReactNode; close?: boolean }) {
  return (
    <span
      className={`flex h-[16px] w-[19px] items-center justify-center rounded-[2px] border text-[10px] leading-none ${
        close
          ? "border-[#7a2020] bg-gradient-to-b from-[#f2a0a0] to-[#c23b3b] text-white"
          : "border-[#8fa3c7] bg-gradient-to-b from-white to-[#c7d3e6] text-[#33445A]"
      }`}
    >
      {children}
    </span>
  );
}

const MENU_ITEMS = ["Archivo", "Contactos", "Acciones", "Herramientas", "Ayuda"];

/** Ilustración casi invisible de fondo (dos figuras abstractas propias) */
function BackgroundWatermark() {
  return (
    <svg
      viewBox="0 0 200 200"
      className="pointer-events-none absolute bottom-0 right-0 h-40 w-40 opacity-[0.06]"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="130" cy="70" r="26" fill="#2E5F9E" />
      <rect x="90" y="96" width="80" height="70" rx="38" fill="#2E5F9E" />
      <circle cx="55" cy="110" r="16" fill="#2E5F9E" />
      <rect x="30" y="126" width="50" height="46" rx="24" fill="#2E5F9E" />
    </svg>
  );
}

export function RetroWindow({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div
      className="w-full max-w-md overflow-hidden rounded-[6px] border border-[#8fa3c7] shadow-[0_3px_14px_rgba(0,0,0,0.55)]"
      style={{ fontFamily: "Tahoma, Verdana, Arial, sans-serif" }}
    >
      {/* Barra de título: degradé azul Windows XP */}
      <div className="flex items-center justify-between border-b border-[#274d80] bg-gradient-to-b from-[#5B8CC5] via-[#3E73B8] to-[#2E5F9E] px-2 py-[5px]">
        <div className="flex items-center gap-1.5 pl-0.5">
          <LogoMark size={16} />
          <span className="text-[13px] font-bold text-white [text-shadow:0_1px_1px_rgba(0,0,0,0.4)]">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-[3px]">
          <WindowButton>–</WindowButton>
          <WindowButton>□</WindowButton>
          <WindowButton close>×</WindowButton>
        </div>
      </div>

      {/* Barra de menú clásica (decorativa) */}
      <div className="flex gap-4 border-b border-[#C4CBD5] bg-[#F4F6FA] px-3 py-1.5 text-[12px] text-[#33445A]">
        {MENU_ITEMS.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>

      {/* Panel principal */}
      <div className="relative overflow-hidden bg-gradient-to-b from-white to-[#DDE5F3] px-6 py-8 sm:px-10">
        <BackgroundWatermark />
        <div className="relative z-10">{children}</div>
      </div>
    </div>
  );
}
