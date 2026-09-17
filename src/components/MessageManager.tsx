"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";
import { subscribeToLatestMessage } from "@/lib/chat";
import { useFriendships } from "@/hooks/useFriendships";
import { useFriendsPresence } from "@/hooks/useFriendsPresence";
import { getFriendshipId, getOtherUid } from "@/lib/friendships";
import { playMessageSound } from "@/lib/sound";
import { Avatar } from "./Avatar";

type Toast = { id: string; displayName: string; avatarId: string; avatarUrl?: string };

const TOAST_DURATION_MS = 5000;

/**
 * Componente invisible (salvo por los toasts) montado una sola vez en el
 * layout: escucha el último mensaje de cada conversación con un amigo
 * aceptado, incluso con el chat cerrado, y reproduce el sonido de "mensaje
 * nuevo" cuando llega uno que no envié yo. Mismo criterio que
 * `PresenceManager`/`NudgeManager`: ignora la primera lectura de cada
 * suscripción (el mensaje ya existente al montar, no uno nuevo) para no
 * sonar en cada carga de la app. El toast solo se muestra si esa ventana de
 * chat no está ya abierta en pantalla (si está abierta, el mensaje ya se ve
 * llegar ahí — solo suena). A propósito no abre el chat automáticamente
 * (eso es exclusivo del zumbido).
 */
export function MessageManager() {
  const { user, profile } = useAuth();
  const { accepted } = useFriendships(user?.uid);
  const { openChats } = useChat();
  const [toasts, setToasts] = useState<Toast[]>([]);

  const friendUidsKey = useMemo(
    () => (user ? accepted.map((f) => getOtherUid(f, user.uid)).join(",") : ""),
    [accepted, user]
  );
  const presenceMap = useFriendsPresence(friendUidsKey);

  // Se leen por ref (no como dependencia del efecto) para no reabrir las
  // suscripciones de Firestore cada vez que cambian abrir/cerrar un chat o la
  // presencia de un amigo — eso reiniciaría `firstRead` y podría comerse una
  // notificación real.
  const openChatsRef = useRef(openChats);
  const presenceMapRef = useRef(presenceMap);
  useEffect(() => {
    openChatsRef.current = openChats;
  }, [openChats]);
  useEffect(() => {
    presenceMapRef.current = presenceMap;
  }, [presenceMap]);

  useEffect(() => {
    if (!user || !profile || profile.notifyNewMessage === false) return;

    const friendUids = friendUidsKey ? friendUidsKey.split(",") : [];
    const unsubscribes = friendUids.map((otherUid) => {
      const conversationId = getFriendshipId(user.uid, otherUid);
      let firstRead = true;
      return subscribeToLatestMessage(conversationId, (message) => {
        if (firstRead) {
          firstRead = false;
          return;
        }
        if (message.senderId === user.uid) return;
        playMessageSound();

        if (openChatsRef.current.includes(otherUid)) return;
        const senderProfile = presenceMapRef.current[otherUid]?.profile;
        const id = `${otherUid}-${Date.now()}`;
        setToasts((prev) => [
          ...prev,
          {
            id,
            displayName: senderProfile?.displayName ?? "Un amigo",
            avatarId: senderProfile?.avatarId ?? "",
            avatarUrl: senderProfile?.avatarUrl,
          },
        ]);
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, TOAST_DURATION_MS);
      });
    });

    return () => unsubscribes.forEach((unsub) => unsub());
  }, [user, profile, friendUidsKey]);

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
            <p className="text-[13px] font-semibold text-[#1F2D3D]">💬 {toast.displayName} te ha enviado un mensaje</p>
          </div>
        </div>
      ))}
    </div>
  );
}
