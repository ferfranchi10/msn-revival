"use client";

import { useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { subscribeToLatestMessage } from "@/lib/chat";
import { useFriendships } from "@/hooks/useFriendships";
import { getFriendshipId, getOtherUid } from "@/lib/friendships";
import { playMessageSound } from "@/lib/sound";

/**
 * Componente invisible montado una sola vez en el layout: escucha el último
 * mensaje de cada conversación con un amigo aceptado, incluso con el chat
 * cerrado, y reproduce el sonido de "mensaje nuevo" cuando llega uno que no
 * envié yo. Mismo criterio que `PresenceManager`/`NudgeManager`: ignora la
 * primera lectura de cada suscripción (el mensaje ya existente al montar, no
 * uno nuevo) para no sonar en cada carga de la app.
 */
export function MessageManager() {
  const { user, profile } = useAuth();
  const { accepted } = useFriendships(user?.uid);

  const friendUidsKey = useMemo(
    () => (user ? accepted.map((f) => getOtherUid(f, user.uid)).join(",") : ""),
    [accepted, user]
  );

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
      });
    });

    return () => unsubscribes.forEach((unsub) => unsub());
  }, [user, profile, friendUidsKey]);

  return null;
}
