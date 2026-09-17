"use client";

import { useState } from "react";
import { getAvatar } from "@/lib/avatars";

/**
 * Avatar de un usuario: si tiene `avatarUrl` (imagen propia por URL) la muestra,
 * si no cae al ícono preseleccionado (`avatarId`). Si la URL no carga, cae al
 * ícono preseleccionado igual (no deja un ícono roto).
 */
export function Avatar({
  avatarId,
  avatarUrl,
  className = "",
  style,
}: {
  avatarId: string;
  avatarUrl?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  // Guarda la URL que falló (no un simple booleano) para que, si después
  // cambia a otra URL, se vuelva a intentar en vez de quedar "rota" para siempre.
  const [brokenUrl, setBrokenUrl] = useState<string | null>(null);

  if (avatarUrl && avatarUrl !== brokenUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- URL arbitraria del usuario, no un asset propio optimizable.
      <img
        src={avatarUrl}
        alt=""
        className={`shrink-0 rounded-full object-cover ${className}`}
        style={style}
        onError={() => setBrokenUrl(avatarUrl)}
      />
    );
  }

  const avatar = getAvatar(avatarId);
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full ${className}`}
      style={{ backgroundColor: avatar.bg, ...style }}
    >
      {avatar.emoji}
    </span>
  );
}
