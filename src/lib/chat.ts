import {
  addDoc,
  collection,
  doc,
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
