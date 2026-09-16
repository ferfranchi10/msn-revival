"use client";

import { useEffect, useState } from "react";
import { subscribeToFriendPresence, type FriendPresence } from "@/lib/presence";

const EMPTY: FriendPresence = { profile: null, visibleStatus: "offline", lastChanged: null };

/** Presencia visible (estado manual + conexión real, ya combinados) de un contacto. */
export function useFriendPresence(uid: string): FriendPresence {
  const [presence, setPresence] = useState<FriendPresence>(EMPTY);

  useEffect(() => {
    return subscribeToFriendPresence(uid, setPresence);
  }, [uid]);

  return presence;
}
