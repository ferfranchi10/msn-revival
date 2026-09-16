"use client";

import { useState, type ReactNode } from "react";

/** Sección colapsable de contactos con flecha ▶/▼ y contador (online/total), estilo MSN. */
export function ContactGroup({
  title,
  online,
  total,
  defaultOpen = true,
  children,
}: {
  title: string;
  online?: number;
  total?: number;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="mb-0.5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-1.5 px-1 py-1 text-left text-[12px] font-bold text-[#33445A]"
      >
        <span className="inline-block w-3 text-[9px] text-[#5B7BAA]">{open ? "▼" : "▶"}</span>
        <span>{title}</span>
        {typeof total === "number" && (
          <span className="text-[11px] font-normal text-[#33445A]/60">
            ({online ?? 0}/{total})
          </span>
        )}
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}
