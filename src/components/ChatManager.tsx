"use client";

import { useChat } from "@/context/ChatContext";
import { ChatWindow } from "./ChatWindow";

/** Renderiza un panel de chat por cada conversación abierta, apilados abajo a la derecha. */
export function ChatManager() {
  const { openChats } = useChat();

  if (openChats.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-0 right-4 z-40 flex items-end gap-2">
      {openChats.map((uid) => (
        <div key={uid} className="pointer-events-auto">
          <ChatWindow uid={uid} />
        </div>
      ))}
    </div>
  );
}
