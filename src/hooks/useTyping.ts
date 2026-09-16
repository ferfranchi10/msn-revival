"use client";

import { onDisconnect, onValue, ref, remove, set } from "firebase/database";
import { useEffect, useRef, useState } from "react";
import { rtdb } from "@/lib/firebase";

/** Tiempo de inactividad tras el cual se asume que la persona dejó de escribir. */
const TYPING_TIMEOUT_MS = 3000;

/**
 * Indicador "está escribiendo…" para una conversación puntual, usando Realtime
 * Database (mismo criterio que la presencia): efímero, con `onDisconnect` para
 * no dejarlo pegado si se cierra la pestaña a mitad de un mensaje.
 */
export function useTyping(conversationId: string | undefined, myUid: string | undefined, otherUid: string | undefined) {
  const [otherIsTyping, setOtherIsTyping] = useState(false);
  const clearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!conversationId || !otherUid) return;
    return onValue(ref(rtdb, `typing/${conversationId}/${otherUid}`), (snapshot) => {
      setOtherIsTyping(snapshot.val() === true);
    });
  }, [conversationId, otherUid]);

  useEffect(() => {
    if (!conversationId || !myUid) return;
    const myTypingRef = ref(rtdb, `typing/${conversationId}/${myUid}`);
    const disconnectCleanup = onDisconnect(myTypingRef);
    disconnectCleanup.remove();
    return () => {
      remove(myTypingRef);
      disconnectCleanup.cancel();
      if (clearTimer.current) clearTimeout(clearTimer.current);
    };
  }, [conversationId, myUid]);

  function notifyTyping() {
    if (!conversationId || !myUid) return;
    const myTypingRef = ref(rtdb, `typing/${conversationId}/${myUid}`);
    set(myTypingRef, true);
    if (clearTimer.current) clearTimeout(clearTimer.current);
    clearTimer.current = setTimeout(() => set(myTypingRef, false), TYPING_TIMEOUT_MS);
  }

  return { otherIsTyping, notifyTyping };
}
