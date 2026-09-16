"use client";

import { useEffect, useRef } from "react";
import { RETRO_FONT } from "@/lib/theme";

export type ContextMenuItem =
  | { type: "separator" }
  | { type: "item"; label: string; onClick: () => void; danger?: boolean };

/** Menú contextual clásico de Windows (click derecho): fondo blanco, borde gris, hover azul. */
export function ContactContextMenu({
  x,
  y,
  items,
  onClose,
}: {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="fixed z-50 min-w-[170px] rounded-[2px] border border-[#8a94a3] bg-white py-1 text-[13px] shadow-[2px_2px_6px_rgba(0,0,0,0.35)]"
      style={{ left: x, top: y, fontFamily: RETRO_FONT }}
    >
      {items.map((item, i) =>
        item.type === "separator" ? (
          <div key={i} className="my-1 border-t border-[#E4E9F2]" />
        ) : (
          <button
            key={i}
            type="button"
            onClick={() => {
              item.onClick();
              onClose();
            }}
            className={`block w-full px-3 py-1.5 text-left hover:bg-[#316AC5] hover:text-white ${
              item.danger ? "text-[#a12b2b]" : "text-[#1F2D3D]"
            }`}
          >
            {item.label}
          </button>
        )
      )}
    </div>
  );
}
