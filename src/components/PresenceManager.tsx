"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useFriendships } from "@/hooks/useFriendships";
import { getOtherUid } from "@/lib/friendships";
import { startPresenceHeartbeat, subscribeToFriendPresence } from "@/lib/presence";
import { playConnectSound } from "@/lib/sound";
import { Avatar } from "./Avatar";

type Toast = { id: string; displayName: string; avatarId: string; avatarUrl?: string };

const TOAST_DURATION_MS = 5000;

/**
 * Componente invisible (salvo por los toasts) montado una sola vez en el layout:
 * mantiene viva la presencia real del usuario logueado en Realtime Database y
 * dispara el evento "amigo conectado" (sonido + toast) cuando corresponde.
 */
export function PresenceManager() {
  const { user, profile } = useAuth();
  const { accepted } = useFriendships(user?.uid);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const wasOnline = useRef<Map<string, boolean>>(new Map());

  useEffect(() => {
    if (!user) return;
    return startPresenceHeartbeat(user.uid);
  }, [user]);

  useEffect(() => {
    if (!user || !profile || profile.notifyFriendOnline === false) return;

    const friendUids = accepted.map((f) => getOtherUid(f, user.uid));
    const unsubscribes = friendUids.map((uid) =>
      subscribeToFriendPresence(uid, ({ visibleStatus, profile: friendProfile }) => {
        const isOnlineNow = visibleStatus !== "offline";
        const wasOnlineBefore = wasOnline.current.get(uid);
        wasOnline.current.set(uid, isOnlineNow);

        // Sin valor previo: es la primera lectura al suscribirse, no una transición real.
        if (wasOnlineBefore === undefined || wasOnlineBefore === isOnlineNow) return;
        if (!isOnlineNow || !friendProfile) return;

        playConnectSound();
        const id = `${uid}-${Date.now()}`;
        setToasts((prev) => [
          ...prev,
          { id, displayName: friendProfile.displayName, avatarId: friendProfile.avatarId, avatarUrl: friendProfile.avatarUrl },
        ]);
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, TOAST_DURATION_MS);
      })
    );

    return () => unsubscribes.forEach((unsub) => unsub());
  }, [user, profile, accepted]);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-center gap-2.5 rounded-[4px] border border-[#8fa3c7] bg-gradient-to-b from-white to-[#DDE5F3] px-3 py-2 shadow-[0_3px_12px_rgba(0,0,0,0.4)]"
          style={{ fontFamily: "Tahoma, Verdana, Arial, sans-serif" }}
        >
          <Avatar avatarId={toast.avatarId} avatarUrl={toast.avatarUrl} className="h-8 w-8 text-base" />
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-[#1F2D3D]">
              🟢 {toast.displayName} se ha conectado
            </p>
            <p className="text-[12px] text-[#33445A]">¡Está disponible para hablar!</p>
          </div>
        </div>
      ))}
    </div>
  );
}
