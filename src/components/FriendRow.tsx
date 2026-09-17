"use client";

import { type MouseEvent, type ReactNode, useState } from "react";
import { useFriendPresence } from "@/hooks/useFriendPresence";
import { Avatar } from "./Avatar";
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
  const { profile, visibleStatus, lastChanged } = useFriendPresence(uid);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);

  if (!profile) {
    return <div className="flex min-h-[23px] items-center px-1 text-[12px] text-[#33445A]/50">Cargando...</div>;
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
      <Avatar
        avatarId={profile.avatarId}
        avatarUrl={profile.avatarUrl}
        className="h-5 w-5 text-[11px]"
        style={{ opacity: isOffline ? 0.5 : 1 }}
      />
      <div className="min-w-0 flex-1">
        <p className={`truncate text-[12px] leading-tight ${isOffline ? "text-[#33445A]/50" : "font-medium text-[#1F2D3D]"}`}>
          {profile.displayName}
        </p>
        <p className="truncate text-[11px] leading-tight text-[#33445A]/70">
          {status.emoji} {status.label}
          {!isOffline && profile.personalMessage && ` — "${profile.personalMessage}"`}
          {isOffline && ` — ${formatLastSeen(lastChanged)}`}
        </p>
      </div>
      {children && <div className="flex shrink-0 items-center gap-1">{children}</div>}
      {menuPos && contextMenuItems && (
        <ContactContextMenu x={menuPos.x} y={menuPos.y} items={contextMenuItems} onClose={() => setMenuPos(null)} />
      )}
    </div>
  );
}
