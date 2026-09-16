import { onValue, ref, serverTimestamp, set } from "firebase/database";
import { rtdb } from "./firebase";

/** Cooldown mínimo entre zumbidos de un mismo remitente en una misma conversación:
 * aplicado en el cliente (deshabilita el botón) y reforzado por la regla de
 * Realtime Database (rechaza el `set` si todavía no pasaron 5 s). */
export const NUDGE_COOLDOWN_MS = 5000;

export async function sendNudge(conversationId: string, fromUid: string): Promise<void> {
  await set(ref(rtdb, `nudges/${conversationId}/${fromUid}`), serverTimestamp());
}

/**
 * Escucha los zumbidos que `fromUid` envía dentro de `conversationId`. Ignora la
 * primera lectura (mismo criterio que la presencia): es el valor ya existente al
 * suscribirse, no un zumbido nuevo, así que emitirlo generaría un aviso fantasma
 * apenas se abre la app.
 */
export function subscribeToIncomingNudges(
  conversationId: string,
  fromUid: string,
  callback: (at: number) => void
): () => void {
  let firstRead = true;
  return onValue(ref(rtdb, `nudges/${conversationId}/${fromUid}`), (snapshot) => {
    if (firstRead) {
      firstRead = false;
      return;
    }
    const at = snapshot.val() as number | null;
    if (at) callback(at);
  });
}
