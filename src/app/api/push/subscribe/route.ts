import { NextResponse } from "next/server";
import { requireCallerUid } from "@/lib/apiAuth";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { deviceIdFor, isAllowedEndpoint, isPushConfigured, PUSH_DEVICES } from "@/lib/pushServer";

async function readBody(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await request.json();
    return body && typeof body === "object" ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/** Registra este dispositivo para recibir push. El uid sale del token, nunca del body. */
export async function POST(request: Request) {
  const uid = await requireCallerUid(request);
  if (!uid) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (!isPushConfigured()) return NextResponse.json({ error: "Push no configurado" }, { status: 503 });

  const body = await readBody(request);
  const sub = body?.subscription as { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown } } | undefined;
  const p256dh = sub?.keys?.p256dh;
  const auth = sub?.keys?.auth;
  if (!sub || !isAllowedEndpoint(sub.endpoint) || typeof p256dh !== "string" || typeof auth !== "string") {
    return NextResponse.json({ error: "Suscripción inválida" }, { status: 400 });
  }
  if (p256dh.length > 200 || auth.length > 100) {
    return NextResponse.json({ error: "Suscripción inválida" }, { status: 400 });
  }

  await getAdminDb()
    .collection(PUSH_DEVICES)
    .doc(deviceIdFor(sub.endpoint))
    .set({ uid, endpoint: sub.endpoint, keys: { p256dh, auth }, createdAt: Date.now() });
  return NextResponse.json({ ok: true });
}

/** Quita este dispositivo (solo si es del usuario que lo pide). */
export async function DELETE(request: Request) {
  const uid = await requireCallerUid(request);
  if (!uid) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await readBody(request);
  const endpoint = body?.endpoint;
  if (typeof endpoint !== "string") return NextResponse.json({ error: "Body inválido" }, { status: 400 });

  const ref = getAdminDb().collection(PUSH_DEVICES).doc(deviceIdFor(endpoint));
  const snap = await ref.get();
  if (snap.exists && snap.data()?.uid === uid) await ref.delete();
  return NextResponse.json({ ok: true });
}
