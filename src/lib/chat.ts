import {
  addDoc,
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  type Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { getFriendshipId } from "./friendships";

export type Message = {
  id: string;
  senderId: string;
  text: string;
  createdAt: Timestamp | null;
};

/** Mismo esquema de id determinístico que las amistades: solo los amigos aceptados
 * pueden chatear, así que reusar el par ordenado simplifica las reglas de seguridad
 * (permite validar la amistad con un solo `get()` contra `friendships/{conversationId}`). */
export const getConversationId = getFriendshipId;

/** Solo aplicado en el cliente (no hay `firestore.rules` versionado en el repo
 * todavía para reforzarlo también del lado del servidor, ver CONTEXT.md). */
export const MAX_MESSAGE_LENGTH = 2000;

export async function sendMessage(conversationId: string, participants: [string, string], senderId: string, text: string) {
  const trimmed = text.trim().slice(0, MAX_MESSAGE_LENGTH);
  if (!trimmed) return;
  await setDoc(doc(db, "conversations", conversationId), { participants }, { merge: true });
  await addDoc(collection(db, "conversations", conversationId, "messages"), {
    senderId,
    text: trimmed,
    createdAt: serverTimestamp(),
  });
}

/** Escucha el último mensaje de una conversación (usado para el sonido de "mensaje nuevo"). */
export function subscribeToLatestMessage(
  conversationId: string,
  callback: (message: Message) => void
): () => void {
  const q = query(
    collection(db, "conversations", conversationId, "messages"),
    orderBy("createdAt", "desc"),
    limit(1)
  );
  return onSnapshot(q, (snapshot) => {
    const docSnap = snapshot.docs[0];
    if (!docSnap) return;
    callback({ id: docSnap.id, ...docSnap.data() } as Message);
  });
}
