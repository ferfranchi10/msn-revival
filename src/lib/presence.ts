import { doc, onSnapshot } from "firebase/firestore";
import { onDisconnect, onValue, ref, serverTimestamp, set } from "firebase/database";
import { db, rtdb } from "./firebase";
import { getVisibleStatus, type PresenceStatus } from "./status";
import type { UserProfile } from "./types";

/** Tiempo que se espera antes de considerar "offline" real un corte de conexión,
 * para no generar eventos falsos por una red que fluctúa unos segundos. */
export const OFFLINE_DEBOUNCE_MS = 6000;

export type PresenceRecord = { state: "online" | "offline"; lastChanged: number | null };

/**
 * Registra en Realtime Database la conexión real del usuario actual, usando el
 * patrón oficial de Firebase (`.info/connected` + `onDisconnect`): es el propio
 * servidor de RTDB el que marca "offline" ante un cierre de pestaña o corte de
 * red, sin depender de que el cliente siga vivo para avisarlo.
 */
export function startPresenceHeartbeat(uid: string): () => void {
  const myStatusRef = ref(rtdb, `status/${uid}`);
  const connectedRef = ref(rtdb, ".info/connected");

  return onValue(connectedRef, (snapshot) => {
    if (snapshot.val() !== true) return;
    onDisconnect(myStatusRef)
      .set({ state: "offline", lastChanged: serverTimestamp() })
      .then(() => {
        set(myStatusRef, { state: "online", lastChanged: serverTimestamp() });
      });
  });
}

function subscribeToRawPresence(
  uid: string,
  callback: (presence: PresenceRecord | null) => void
): () => void {
  return onValue(ref(rtdb, `status/${uid}`), (snapshot) => {
    callback(snapshot.exists() ? (snapshot.val() as PresenceRecord) : null);
  });
}

export type FriendPresence = {
  profile: UserProfile | null;
  visibleStatus: PresenceStatus;
  lastChanged: number | null;
};

/**
 * Combina el perfil de Firestore (estado manual, avatar, mensaje) con la conexión
 * real de Realtime Database para un contacto puntual, aplicando el debounce
 * anti-flapping antes de reportar una desconexión.
 */
export function subscribeToFriendPresence(
  uid: string,
  callback: (presence: FriendPresence) => void
): () => void {
  let profile: UserProfile | null = null;
  let profileLoaded = false;
  let lastChanged: number | null = null;
  let connected = false;
  // Hasta que no cargaron el perfil Y la primera lectura real de RTDB no sabemos
  // el estado real: no emitir todavía. Si emitiéramos con el perfil todavía en
  // null lo tratamos como "offline" por defecto, y eso generaba una transición
  // offline→online falsa apenas el perfil terminaba de cargar (evento
  // "se conectó" fantasma en cada remount, sin que nadie se haya reconectado).
  let presenceLoaded = false;
  let offlineTimer: ReturnType<typeof setTimeout> | null = null;

  function emit() {
    if (!presenceLoaded || !profileLoaded) return;
    const visibleStatus = profile ? getVisibleStatus(profile.status, connected) : "offline";
    callback({ profile, visibleStatus, lastChanged });
  }

  const unsubProfile = onSnapshot(doc(db, "users", uid), (snapshot) => {
    profile = snapshot.exists() ? (snapshot.data() as UserProfile) : null;
    profileLoaded = true;
    emit();
  });

  const unsubPresence = subscribeToRawPresence(uid, (presence) => {
    const isFirstRead = !presenceLoaded;
    presenceLoaded = true;
    lastChanged = presence?.lastChanged ?? null;
    if (offlineTimer) {
      clearTimeout(offlineTimer);
      offlineTimer = null;
    }
    if (presence?.state === "online") {
      connected = true;
      emit();
    } else if (isFirstRead) {
      // Estado inicial ya desconectado: mostrarlo de una, sin esperar el debounce.
      connected = false;
      emit();
    } else {
      offlineTimer = setTimeout(() => {
        connected = false;
        emit();
      }, OFFLINE_DEBOUNCE_MS);
    }
  });

  return () => {
    unsubProfile();
    unsubPresence();
    if (offlineTimer) clearTimeout(offlineTimer);
  };
}

export function formatLastSeen(lastChanged: number | null): string {
  if (!lastChanged) return "Última conexión desconocida";
  const diffMs = Date.now() - lastChanged;
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Últ. vez hace un momento";
  if (minutes < 60) return `Últ. vez hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Últ. vez hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `Últ. vez hace ${days} d`;
  return `Últ. vez el ${new Date(lastChanged).toLocaleDateString("es-AR")}`;
}
