"use client";

import { doc, updateDoc } from "firebase/firestore";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { auth, db } from "@/lib/firebase";

const POLL_MS = 30_000;
/** Aunque la canción no cambie, se reescribe a este ritmo para que los amigos no la den por vencida. */
const REFRESH_MS = 3 * 60 * 1000;

/** Manager invisible: mientras la app está abierta, consulta Last.fm y publica "Escuchando: ..." en el perfil. */
export function NowPlayingManager() {
  const { user, profile } = useAuth();
  const uid = user?.uid;
  const lastfmUser = profile?.lastfmUsername?.trim() ?? "";
  const enabled = !!lastfmUser && profile?.shareNowPlaying !== false;

  useEffect(() => {
    if (!uid || !enabled) return;
    let cancelled = false;
    let published: string | null = null;
    let publishedAt = 0;

    async function publish(track: string | null) {
      published = track;
      publishedAt = Date.now();
      await updateDoc(doc(db, "users", uid!), {
        nowPlaying: track ?? "",
        nowPlayingAt: track ? Date.now() : 0,
      }).catch(() => {});
    }

    async function tick() {
      if (document.visibilityState === "hidden") return;
      try {
        const token = await auth.currentUser?.getIdToken();
        if (!token) return;
        const res = await fetch(`/api/now-playing?user=${encodeURIComponent(lastfmUser)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok || cancelled) return;
        const { track } = (await res.json()) as { track: string | null };
        if (cancelled) return;
        if (track !== published || (track && Date.now() - publishedAt > REFRESH_MS)) await publish(track);
      } catch {
        // Sin red o Last.fm caído: se reintenta en el próximo ciclo.
      }
    }

    tick();
    const interval = setInterval(tick, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
      if (published) publish(null);
    };
  }, [uid, enabled, lastfmUser]);

  return null;
}
