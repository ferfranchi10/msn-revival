"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";
import { useFriendsPresence } from "@/hooks/useFriendsPresence";
import { useFriendships } from "@/hooks/useFriendships";
import { getFriendshipId, getOtherUid } from "@/lib/friendships";
import { subscribeToIncomingNudges } from "@/lib/nudge";
import { playNudgeSound } from "@/lib/sound";
import { Avatar } from "./Avatar";

type Toast = { id: string; displayName: string; avatarId: string; avatarUrl?: string };

const TOAST_DURATION_MS = 5000;

/**
 * Componente invisible (salvo por los toasts) montado una sola vez en el layout:
 * escucha los zumbidos entrantes de todos los amigos, incluso con el chat cerrado,
 * abre/enfoca la ventana correspondiente y dispara sonido + temblor (vía
 * `ChatContext`) + vibración. Mismo criterio que `PresenceManager` para el evento
 * "amigo conectado".
 */
export function NudgeManager() {
  const { user, profile } = useAuth();
  const { accepted } = useFriendships(user?.uid);
  const { openChat, triggerShake } = useChat();
  const [toasts, setToasts] = useState<Toast[]>([]);

  const friendUidsKey = useMemo(
    () => (user ? accepted.map((f) => getOtherUid(f, user.uid)).join(",") : ""),
    [accepted, user]
  );
  const presenceMap = useFriendsPresence(friendUidsKey);

  useEffect(() => {
    if (!user || !profile || profile.notifyNudge === false) return;

    const friendUids = friendUidsKey ? friendUidsKey.split(",") : [];
    const unsubscribes = friendUids.map((otherUid) => {
      const conversationId = getFriendshipId(user.uid, otherUid);
      return subscribeToIncomingNudges(conversationId, otherUid, () => {
        openChat(otherUid);
        // El temblor (y la vibración que dispara ChatWindow al recibir la señal) se
        // maneja en un único lugar para no duplicarla si la ventana ya está abierta.
        triggerShake(otherUid);
        playNudgeSound();

        const friendProfile = presenceMap[otherUid]?.profile;
        const id = `${otherUid}-${Date.now()}`;
        setToasts((prev) => [
          ...prev,
          {
            id,
            displayName: friendProfile?.displayName ?? "Un amigo",
            avatarId: friendProfile?.avatarId ?? "",
            avatarUrl: friendProfile?.avatarUrl,
          },
        ]);
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, TOAST_DURATION_MS);
      });
    });

    return () => unsubscribes.forEach((unsub) => unsub());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, profile, friendUidsKey, openChat, triggerShake]);

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
            <p className="text-[13px] font-semibold text-[#1F2D3D]">📳 {toast.displayName} te ha enviado un zumbido</p>
          </div>
        </div>
      ))}
    </div>
  );
}
