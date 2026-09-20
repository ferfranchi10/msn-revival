"use client";

import { type MouseEvent, type ReactNode, useState } from "react";
import { useFriendPresence } from "@/hooks/useFriendPresence";
import { StatusBuddy } from "./StatusBuddy";
import { formatLastSeen } from "@/lib/presence";
import { getStatus } from "@/lib/status";
import { ContactContextMenu, type ContextMenuItem } from "./ContactContextMenu";

export function FriendRow({
  uid,
  onOpenChat,
  contextMenuItems,
  children,
}: {
  uid: string;
  onOpenChat?: () => void;
  contextMenuItems?: ContextMenuItem[];
  children?: ReactNode;
}) {
  const { profile, visibleStatus, lastChanged, loaded } = useFriendPresence(uid);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);

  if (!profile) {
    // Cargado y sin perfil: el usuario ya no existe o no se pudo leer; no es "cargando".
    return (
      <div className="flex min-h-[23px] items-center px-1 text-[12px] text-[#33445A]/50">
        {loaded ? "Usuario no disponible" : "Cargando..."}
      </div>
    );
  }

  const status = getStatus(visibleStatus);
  const isOffline = visibleStatus === "offline";

  function handleContextMenu(e: MouseEvent) {
    if (!contextMenuItems) return;
    e.preventDefault();
    setMenuPos({ x: e.clientX, y: e.clientY });
  }

  return (
    <div
      onDoubleClick={onOpenChat}
      onContextMenu={handleContextMenu}
      className="flex min-h-[23px] cursor-default items-center gap-2 rounded-[2px] px-1 py-0.5 hover:bg-[#E8F1FC]"
    >
      <StatusBuddy status={visibleStatus} />
      {/* Una sola línea, como en el MSN clásico: Nombre (Estado) - mensaje personal. */}
      <p
        className={`min-w-0 flex-1 truncate text-[12px] leading-tight ${isOffline ? "text-[#33445A]/50" : "text-[#1F2D3D]"}`}
      >
        {profile.displayName}
        {visibleStatus !== "online" && <span className="text-[#33445A]/55"> ({status.label})</span>}
        {!isOffline && profile.personalMessage && (
          <span className="text-[#33445A]/70"> - {profile.personalMessage}</span>
        )}
        {isOffline && <span className="text-[#33445A]/55"> - {formatLastSeen(lastChanged)}</span>}
      </p>
      {children && <div className="flex shrink-0 items-center gap-1">{children}</div>}
      {menuPos && contextMenuItems && (
        <ContactContextMenu x={menuPos.x} y={menuPos.y} items={contextMenuItems} onClose={() => setMenuPos(null)} />
      )}
    </div>
  );
}
