"use client";

import { doc, getDoc } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useFriendships } from "@/hooks/useFriendships";
import { getAvatar } from "@/lib/avatars";
import { getOtherUid } from "@/lib/friendships";
import { db } from "@/lib/firebase";
import { playFriendRequestSound } from "@/lib/sound";
import type { UserProfile } from "@/lib/types";

type Toast = { id: string; displayName: string; avatarId: string };

const TOAST_DURATION_MS = 5000;

/**
 * Componente invisible (salvo por los toasts) montado una sola vez en el layout:
 * escucha las solicitudes de amistad entrantes (`useFriendships().incoming`) y
 * dispara sonido + toast cuando llega una nueva. Mismo criterio anti-"evento
 * fantasma" que `PresenceManager`/`MessageManager`: ignora las que ya estaban
 * pendientes al montar (primera lectura), solo notifica ids nuevos.
 */
export function FriendRequestManager() {
  const { user, profile } = useAuth();
  const { incoming } = useFriendships(user?.uid);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const seen = useRef<Set<string> | null>(null);

  useEffect(() => {
    if (!user || !profile) return;

    const currentIds = new Set(incoming.map((f) => f.id));

    // Primera lectura: solo establece la base, no notifica nada (evita avisar de
    // solicitudes que ya estaban pendientes antes de abrir la app).
    if (seen.current === null) {
      seen.current = currentIds;
      return;
    }

    // Se reemplaza el set entero (no se acumula): el `friendshipId` es
    // determinístico por par de usuarios, así que si se rechaza y se vuelve a
    // pedir amistad más adelante, el id se reutiliza — debe poder notificarse
    // de nuevo, no quedar "visto" para siempre.
    const newOnes = incoming.filter((f) => !seen.current!.has(f.id));
    seen.current = currentIds;
    if (newOnes.length === 0 || profile.notifyFriendRequest === false) return;

    newOnes.forEach(async (f) => {
      const otherUid = getOtherUid(f, user.uid);
      const snapshot = await getDoc(doc(db, "users", otherUid));
      const senderProfile = snapshot.exists() ? (snapshot.data() as UserProfile) : null;

      playFriendRequestSound();
      const id = `${f.id}-${Date.now()}`;
      setToasts((prev) => [
        ...prev,
        { id, displayName: senderProfile?.displayName ?? "Alguien", avatarId: senderProfile?.avatarId ?? "" },
      ]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, TOAST_DURATION_MS);
    });
  }, [user, profile, incoming]);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => {
        const avatar = getAvatar(toast.avatarId);
        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center gap-2.5 rounded-[4px] border border-[#8fa3c7] bg-gradient-to-b from-white to-[#DDE5F3] px-3 py-2 shadow-[0_3px_12px_rgba(0,0,0,0.4)]"
            style={{ fontFamily: "Tahoma, Verdana, Arial, sans-serif" }}
          >
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-base"
              style={{ backgroundColor: avatar.bg }}
            >
              {avatar.emoji}
            </span>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-[#1F2D3D]">
                🧑 {toast.displayName} te quiere agregar como amigo
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
