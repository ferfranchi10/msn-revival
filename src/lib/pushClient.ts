import { auth } from "./firebase";

/**
 * - `unsupported`: el navegador no tiene Push (o falta la clave VAPID pública).
 * - `needs-install`: iPhone/iPad, donde solo funciona con la app instalada en la pantalla de inicio.
 * - `denied`: el usuario bloqueó las notificaciones en el navegador.
 * - `available`: se puede activar.
 */
export type PushSupport = "unsupported" | "needs-install" | "denied" | "available";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

export function getPushSupport(): PushSupport {
  if (!VAPID_PUBLIC_KEY) return "unsupported";
  const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const installed =
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  if (isIos && !installed) return "needs-install";
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission === "denied" ? "denied" : "available";
}

/** La clave VAPID pública viaja en base64url; `subscribe()` la pide como bytes. */
function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padded = (base64 + "=".repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(padded);
  const bytes = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

/** ¿La suscripción se creó con la clave VAPID pública actual? Si se rotaron las claves, el servicio de push rechaza (403) los envíos a suscripciones viejas. */
function usesCurrentKey(subscription: PushSubscription): boolean {
  const current = subscription.options.applicationServerKey;
  if (!current || !VAPID_PUBLIC_KEY) return false;
  const wanted = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
  const bytes = new Uint8Array(current);
  return bytes.length === wanted.length && bytes.every((b, i) => b === wanted[i]);
}

/** Devuelve la suscripción vigente; si existe una creada con otra clave, la reemplaza (no pide permiso otra vez si ya está concedido). */
async function ensureSubscription(registration: ServiceWorkerRegistration): Promise<PushSubscription> {
  const existing = await registration.pushManager.getSubscription();
  if (existing && usesCurrentKey(existing)) return existing;
  await existing?.unsubscribe();
  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY!),
  });
}

async function authorizedFetch(path: string, method: string, body: unknown): Promise<Response> {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error("No hay sesión");
  return fetch(path, {
    method,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
}

/** Suscripción de push de este dispositivo, o `null` si no está activada. */
export async function getCurrentSubscription(): Promise<PushSubscription | null> {
  if (!("serviceWorker" in navigator)) return null;
  const registration = await navigator.serviceWorker.getRegistration();
  return (await registration?.pushManager.getSubscription()) ?? null;
}

/** Pide permiso (debe llamarse desde un clic), suscribe este dispositivo y lo registra en el servidor. */
export async function enablePush(): Promise<void> {
  if (!VAPID_PUBLIC_KEY) throw new Error("Push no configurado");
  const permission = await Notification.requestPermission();
  if (permission !== "granted") throw new Error("Permiso de notificaciones denegado");

  const registration = await navigator.serviceWorker.ready;
  const subscription = await ensureSubscription(registration);

  const res = await authorizedFetch("/api/push/subscribe", "POST", { subscription: subscription.toJSON() });
  if (!res.ok) {
    await subscription.unsubscribe();
    throw new Error(res.status === 503 ? "Push no configurado en el servidor" : "No se pudo registrar el dispositivo");
  }
}

/**
 * Si este dispositivo ya está suscrito en el navegador, lo (re)registra en el servidor a nombre
 * del usuario con sesión iniciada. La suscripción es del navegador, no de la cuenta: si se
 * cambió de usuario sin cerrar sesión desde la app, el servidor seguiría mandando los avisos
 * al usuario anterior. Es idempotente. No pide permiso ni crea suscripciones nuevas.
 */
export async function syncExistingSubscription(): Promise<void> {
  if (!VAPID_PUBLIC_KEY || Notification.permission !== "granted") return;
  if (!(await getCurrentSubscription())) return; // sin suscripción previa = el usuario no activó push acá
  const subscription = await ensureSubscription(await navigator.serviceWorker.ready);
  await authorizedFetch("/api/push/subscribe", "POST", { subscription: subscription.toJSON() });
}

/** Da de baja este dispositivo en el navegador y en el servidor. Tolera no haber sesión (se llama al cerrar sesión). */
export async function disablePush(): Promise<void> {
  const subscription = await getCurrentSubscription();
  if (!subscription) return;
  try {
    await authorizedFetch("/api/push/subscribe", "DELETE", { endpoint: subscription.endpoint });
  } catch {
    // Sin sesión o sin red: igual se desuscribe localmente.
  }
  await subscription.unsubscribe();
}

/** Avisa al servidor que mande un push al destinatario. Fire-and-forget: si falla, no afecta el envío real. */
export function notifyPush(type: "message" | "nudge" | "friendRequest", toUid: string): void {
  if (!VAPID_PUBLIC_KEY) return;
  authorizedFetch("/api/push/send", "POST", { type, toUid }).catch(() => {});
}
