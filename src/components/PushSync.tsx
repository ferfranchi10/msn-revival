"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { syncExistingSubscription } from "@/lib/pushClient";

/** Manager invisible (mismo patrón que `PresenceManager`): al iniciar sesión, deja el push de este dispositivo a nombre del usuario actual. */
export function PushSync() {
  const { user } = useAuth();
  const uid = user?.uid;

  useEffect(() => {
    if (!uid || !("Notification" in window)) return;
    syncExistingSubscription().catch(() => {});
  }, [uid]);

  return null;
}
