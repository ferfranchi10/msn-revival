"use client";

import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { db } from "@/lib/firebase";
import type { Friendship } from "@/lib/friendships";

/**
 * Se suscribe a todos los `friendships` donde participa `uid` (como emisor o
 * como receptor) y devuelve la lista combinada más los recortes que usa la
 * pantalla de contactos.
 */
const EMPTY: Friendship[] = [];

export function useFriendships(uid: string | undefined) {
  const [sent, setSent] = useState<Friendship[]>([]);
  const [received, setReceived] = useState<Friendship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;

    let sentLoaded = false;
    let receivedLoaded = false;
    const maybeStopLoading = () => {
      if (sentLoaded && receivedLoaded) setLoading(false);
    };

    const unsubSent = onSnapshot(
      query(collection(db, "friendships"), where("userId", "==", uid)),
      (snapshot) => {
        setSent(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Friendship));
        sentLoaded = true;
        maybeStopLoading();
      }
    );
    const unsubReceived = onSnapshot(
      query(collection(db, "friendships"), where("friendId", "==", uid)),
      (snapshot) => {
        setReceived(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Friendship));
        receivedLoaded = true;
        maybeStopLoading();
      }
    );

    return () => {
      unsubSent();
      unsubReceived();
    };
  }, [uid]);

  const effectiveSent = uid ? sent : EMPTY;
  const effectiveReceived = uid ? received : EMPTY;
  const effectiveLoading = uid ? loading : false;

  const all = useMemo(
    () => [...effectiveSent, ...effectiveReceived],
    [effectiveSent, effectiveReceived]
  );

  const incoming = useMemo(
    () => effectiveReceived.filter((f) => f.status === "pending"),
    [effectiveReceived]
  );
  const outgoing = useMemo(
    () => effectiveSent.filter((f) => f.status === "pending"),
    [effectiveSent]
  );
  const accepted = useMemo(() => all.filter((f) => f.status === "accepted"), [all]);
  const blockedByMe = useMemo(
    () => all.filter((f) => f.status === "blocked" && f.blockedBy === uid),
    [all, uid]
  );

  return { all, incoming, outgoing, accepted, blockedByMe, loading: effectiveLoading };
}
