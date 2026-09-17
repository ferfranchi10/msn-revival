"use client";

import { useFriendPresence } from "@/hooks/useFriendPresence";
import { formatLastSeen } from "@/lib/presence";
import { getStatus } from "@/lib/status";
import { Avatar } from "./Avatar";
import { RetroWindow } from "./RetroWindow";

export function ProfilePopup({ uid, onClose }: { uid: string; onClose: () => void }) {
  const { profile, visibleStatus, lastChanged } = useFriendPresence(uid);
  if (!profile) return null;

  const status = getStatus(visibleStatus);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()} className="w-[260px]">
        <RetroWindow title="Información de contacto">
          <div className="flex flex-col items-center gap-1.5 py-1 text-center">
            <Avatar avatarId={profile.avatarId} avatarUrl={profile.avatarUrl} className="h-14 w-14 text-2xl" />
            <p className="text-[15px] font-bold text-[#1F2D3D]">{profile.displayName}</p>
            <p className="text-[12px] text-[#33445A]/70">@{profile.username}</p>
            <p className="text-[13px] text-[#33445A]">
              {status.emoji} {status.label}
            </p>
            {profile.personalMessage && (
              <p className="text-[12px] italic text-[#33445A]">&quot;{profile.personalMessage}&quot;</p>
            )}
            {visibleStatus === "offline" && (
              <p className="text-[11px] text-[#33445A]/50">{formatLastSeen(lastChanged)}</p>
            )}
          </div>
        </RetroWindow>
      </div>
    </div>
  );
}
