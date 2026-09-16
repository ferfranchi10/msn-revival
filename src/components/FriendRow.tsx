"use client";

import { doc, onSnapshot } from "firebase/firestore";
import { type ReactNode, useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { getAvatar } from "@/lib/avatars";
import { getStatus } from "@/lib/status";
import type { UserProfile } from "@/lib/types";

export function FriendRow({ uid, children }: { uid: string; children?: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    return onSnapshot(doc(db, "users", uid), (snapshot) => {
      setProfile(snapshot.exists() ? (snapshot.data() as UserProfile) : null);
    });
  }, [uid]);

  if (!profile) {
    return (
      <div className="flex items-center gap-3 border-b border-[#E4E9F2] py-2.5 text-[14px] text-[#33445A]/60">
        Cargando...
      </div>
    );
  }

  const avatar = getAvatar(profile.avatarId);
  const status = getStatus(profile.status);

  return (
    <div className="flex items-center gap-3 border-b border-[#E4E9F2] py-2.5 last:border-b-0">
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base"
        style={{ backgroundColor: avatar.bg }}
      >
        {avatar.emoji}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-semibold text-[#1F2D3D]">
          {profile.displayName}{" "}
          <span className="font-normal text-[#33445A]/60">@{profile.username}</span>
        </p>
        <p className="truncate text-[13px] text-[#33445A]">
          {status.emoji} {status.label}
          {profile.personalMessage && ` — "${profile.personalMessage}"`}
        </p>
      </div>
      {children && <div className="flex shrink-0 items-center gap-1.5">{children}</div>}
    </div>
  );
}
