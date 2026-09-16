"use client";

import { useEffect, useState } from "react";
import { subscribeToFriendPresence, type FriendPresence } from "@/lib/presence";

/** Mapa uid -> presencia visible, usado para contar conectados/total y agrupar. */
export function useFriendsPresence(uidsKey: string) {
  const [map, setMap] = useState<Record<string, FriendPresence>>({});
  const uids = uidsKey ? uidsKey.split(",") : [];

  useEffect(() => {
    const unsubscribes = uids.map((uid) =>
      subscribeToFriendPresence(uid, (presence) => {
        setMap((prev) => ({ ...prev, [uid]: presence }));
      })
    );
    return () => unsubscribes.forEach((unsub) => unsub());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uidsKey]);

  return map;
}
