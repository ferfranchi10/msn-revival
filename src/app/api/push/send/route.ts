import { NextResponse } from "next/server";
import { requireCallerUid } from "@/lib/apiAuth";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { getFriendshipId } from "@/lib/friendships";
import { claimThrottle, isPushConfigured, sendPushToUser, type PushPayload } from "@/lib/pushServer";

type PushType = "message" | "nudge" | "friendRequest";

/** Campo del perfil del destinatario que silencia cada tipo (mismos toggles que los avisos dentro de la app). */
const PREF_FIELD: Record<PushType, string> = {
  message: "notifyNewMessage",
  nudge: "notifyNudge",
  friendRequest: "notifyFriendRequest",
};

/** Un mensaje solo genera push si se acaba de enviar: evita usar este endpoint para reenviar mensajes viejos. */
const MESSAGE_MAX_AGE_MS = 60_000;
const NUDGE_COOLDOWN_MS = 5_000;
const FRIEND_REQUEST_COOLDOWN_MS = 60_000;
const BODY_PREVIEW_LENGTH = 120;

function truncate(text: string): string {
  return text.length > BODY_PREVIEW_LENGTH ? `${text.slice(0, BODY_PREVIEW_LENGTH - 1)}…` : text;
}

/**
 * Manda un push al destinatario cuando el cliente remitente envió un mensaje, un zumbido o
 * una solicitud de amistad. Sin Cloud Functions (plan Spark), el remitente es quien dispara
 * esto, así que el servidor **no confía en el body**: verifica la amistad, toma el texto real
 * desde Firestore y limita la frecuencia. El cliente solo dice el tipo y a quién.
 */
export async function POST(request: Request) {
  const callerUid = await requireCallerUid(request);
  if (!callerUid) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (!isPushConfigured()) return NextResponse.json({ error: "Push no configurado" }, { status: 503 });

  let body: { type?: unknown; toUid?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }
  const { type, toUid } = body;
  if (
    (type !== "message" && type !== "nudge" && type !== "friendRequest") ||
    typeof toUid !== "string" ||
    !toUid ||
    toUid === callerUid
  ) {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const db = getAdminDb();
  const friendshipId = getFriendshipId(callerUid, toUid);
  const friendship = (await db.collection("friendships").doc(friendshipId).get()).data();
  const validRelation =
    type === "friendRequest"
      ? friendship?.status === "pending" && friendship.userId === callerUid
      : friendship?.status === "accepted";
  if (!validRelation) return NextResponse.json({ error: "Sin relación válida" }, { status: 403 });

  const [recipientSnap, senderSnap] = await Promise.all([
    db.collection("users").doc(toUid).get(),
    db.collection("users").doc(callerUid).get(),
  ]);
  if (!recipientSnap.exists || !senderSnap.exists) {
    return NextResponse.json({ error: "Usuario inexistente" }, { status: 404 });
  }
  // Mismo criterio que los avisos en la app: solo se silencia si el toggle está explícitamente en false.
  if (recipientSnap.data()?.[PREF_FIELD[type]] === false) {
    return NextResponse.json({ ok: true, sent: 0, reason: "silenciado" });
  }
  const senderName = String(senderSnap.data()?.displayName ?? "Alguien");

  let payload: PushPayload;
  let ttlSeconds: number;

  if (type === "message") {
    const latest = (
      await db.collection("conversations").doc(friendshipId).collection("messages").orderBy("createdAt", "desc").limit(1).get()
    ).docs[0];
    const data = latest?.data();
    const createdAtMs = data?.createdAt?.toMillis?.() as number | undefined;
    if (!latest || data?.senderId !== callerUid || !createdAtMs || Date.now() - createdAtMs > MESSAGE_MAX_AGE_MS) {
      return NextResponse.json({ ok: true, sent: 0, reason: "sin mensaje reciente" });
    }
    // Un push por mensaje, aunque se llame varias veces a este endpoint.
    const claimed = await db.runTransaction(async (tx) => {
      const fresh = await tx.get(latest.ref);
      if (fresh.data()?.pushedAt) return false;
      tx.update(latest.ref, { pushedAt: Date.now() });
      return true;
    });
    if (!claimed) return NextResponse.json({ ok: true, sent: 0, reason: "ya enviado" });
    payload = { title: senderName, body: truncate(String(data.text ?? "")), tag: `msg-${callerUid}`, url: "/contactos" };
    ttlSeconds = 60 * 60;
  } else if (type === "nudge") {
    if (!(await claimThrottle(`nudge_${friendshipId}_${callerUid}`, NUDGE_COOLDOWN_MS))) {
      return NextResponse.json({ ok: true, sent: 0, reason: "demasiado seguido" });
    }
    payload = { title: senderName, body: "te ha enviado un zumbido 📳", tag: `nudge-${callerUid}`, url: "/contactos" };
    ttlSeconds = 30;
  } else {
    if (!(await claimThrottle(`friendreq_${friendshipId}`, FRIEND_REQUEST_COOLDOWN_MS))) {
      return NextResponse.json({ ok: true, sent: 0, reason: "demasiado seguido" });
    }
    payload = {
      title: "Solicitud de amistad",
      body: `${senderName} quiere agregarte`,
      tag: `friendreq-${callerUid}`,
      url: "/contactos",
    };
    ttlSeconds = 60 * 60 * 24;
  }

  try {
    const sent = await sendPushToUser(toUid, payload, { ttlSeconds });
    return NextResponse.json({ ok: true, sent });
  } catch (err) {
    console.error("push/send error", err);
    return NextResponse.json({ error: "No se pudo enviar el push" }, { status: 500 });
  }
}
