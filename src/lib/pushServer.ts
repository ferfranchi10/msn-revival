import { createHash } from "node:crypto";
import webpush from "web-push";
import { getAdminDb } from "@/lib/firebaseAdmin";

/** Colección de dispositivos suscritos a push. Solo la escribe/lee el Admin SDK (las
 * reglas de Firestore la deniegan al cliente por defecto). El id es el hash del
 * `endpoint`, así un mismo dispositivo nunca queda asociado a dos usuarios a la vez. */
export const PUSH_DEVICES = "pushDevices";

export type PushPayload = {
  title: string;
  body: string;
  /** Notificaciones con el mismo `tag` se reemplazan entre sí en vez de apilarse. */
  tag: string;
  url: string;
};

export type StoredSubscription = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

/** Solo estos servicios de push: el servidor hace un POST al `endpoint` que guarda un
 * usuario, así que aceptar cualquier URL sería un SSRF hacia la red interna. */
const ALLOWED_PUSH_HOSTS = [
  /(^|\.)fcm\.googleapis\.com$/,
  /(^|\.)push\.services\.mozilla\.com$/,
  /(^|\.)push\.apple\.com$/,
  /(^|\.)notify\.windows\.com$/,
];

export function isAllowedEndpoint(endpoint: unknown): endpoint is string {
  if (typeof endpoint !== "string" || endpoint.length > 1000) return false;
  try {
    const url = new URL(endpoint);
    return url.protocol === "https:" && ALLOWED_PUSH_HOSTS.some((re) => re.test(url.hostname));
  } catch {
    return false;
  }
}

export function deviceIdFor(endpoint: string): string {
  return createHash("sha256").update(endpoint).digest("hex");
}

let configured: boolean | null = null;

/** `false` si faltan las claves VAPID (el push queda deshabilitado, el resto de la app sigue igual). */
export function isPushConfigured(): boolean {
  if (configured !== null) return configured;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;
  if (!publicKey || !privateKey || !subject) {
    configured = false;
    return false;
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
  return true;
}

/** Manda `payload` a todos los dispositivos de `uid`. Borra los que el servicio de push dice que ya no existen. Devuelve cuántos se enviaron. */
export async function sendPushToUser(
  uid: string,
  payload: PushPayload,
  options: { ttlSeconds: number },
): Promise<number> {
  const db = getAdminDb();
  const snapshot = await db.collection(PUSH_DEVICES).where("uid", "==", uid).get();
  const body = JSON.stringify(payload);

  const results = await Promise.all(
    snapshot.docs.map(async (docSnap) => {
      const sub = docSnap.data() as StoredSubscription;
      try {
        await webpush.sendNotification({ endpoint: sub.endpoint, keys: sub.keys }, body, {
          TTL: options.ttlSeconds,
          urgency: "high",
        });
        return true;
      } catch (err) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) await docSnap.ref.delete();
        else console.error("push send error", status);
        return false;
      }
    }),
  );
  return results.filter(Boolean).length;
}

/** Deja pasar una sola vez por `key` dentro de `windowMs` (transacción, sirve entre instancias serverless). */
export async function claimThrottle(key: string, windowMs: number): Promise<boolean> {
  const db = getAdminDb();
  const ref = db.collection("pushThrottle").doc(key);
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const last = snap.exists ? (snap.data()?.at as number) : 0;
    if (Date.now() - last < windowMs) return false;
    tx.set(ref, { at: Date.now() });
    return true;
  });
}
