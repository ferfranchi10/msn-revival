"use client";

import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import type { Message } from "@/lib/chat";

const EMPTY: Message[] = [];

/** Se suscribe a los mensajes de una conversación, en orden cronológico. */
export function useMessages(conversationId: string | undefined) {
  const [messages, setMessages] = useState<Message[]>(EMPTY);

  useEffect(() => {
    if (!conversationId) return;
    return onSnapshot(
      query(collection(db, "conversations", conversationId, "messages"), orderBy("createdAt", "asc")),
      (snapshot) => {
        setMessages(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Message));
      }
    );
  }, [conversationId]);

  return conversationId ? messages : EMPTY;
}
