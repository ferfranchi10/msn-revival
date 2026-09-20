"use client";

import { useChat } from "@/context/ChatContext";
import { ChatWindow } from "./ChatWindow";

/**
 * Renderiza un panel de chat por cada conversación abierta. En pantallas anchas van en fila
 * abajo a la derecha; en móvil ocupan el ancho y se apilan en vertical (con scroll si no
 * caben) para que ninguno quede fuera de pantalla.
 */
export function ChatManager() {
  const { openChats } = useChat();

  if (openChats.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-2 bottom-0 z-40 flex max-h-dvh flex-col items-stretch gap-2 overflow-y-auto pb-[env(safe-area-inset-bottom)] sm:inset-x-auto sm:right-4 sm:flex-row sm:items-end sm:overflow-visible">
      {openChats.map((uid) => (
        <div key={uid} className="pointer-events-auto">
          <ChatWindow uid={uid} />
        </div>
      ))}
    </div>
  );
}
