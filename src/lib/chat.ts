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

export async function sendMessage(conversationId: string, participants: [string, string], senderId: string, text: string) {
  await setDoc(doc(db, "conversations", conversationId), { participants }, { merge: true });
  await addDoc(collection(db, "conversations", conversationId, "messages"), {
    senderId,
    text,
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
