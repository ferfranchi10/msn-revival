"use client";

import { createContext, useContext, useMemo, useRef, useState } from "react";

const BASE_Z_INDEX = 40;

type ChatContextValue = {
  openChats: string[];
  activeUid: string | null;
  openChat: (uid: string) => void;
  closeChat: (uid: string) => void;
  focusChat: (uid: string) => void;
  /** z-index de la ventana de chat de ese contacto, para traerla al frente al enfocarla (ventanas flotantes que se pueden superponer). */
  zIndexOf: (uid: string) => number;
  /** Timestamp del último zumbido a animar por contacto (propio o recibido). */
  shakeSignal: Record<string, number>;
  triggerShake: (uid: string) => void;
};

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [openChats, setOpenChats] = useState<string[]>([]);
  const [activeUid, setActiveUid] = useState<string | null>(null);
  const [shakeSignal, setShakeSignal] = useState<Record<string, number>>({});
  const [zIndexMap, setZIndexMap] = useState<Record<string, number>>({});
  const nextZIndex = useRef(BASE_Z_INDEX);

  function bringToFront(uid: string) {
    nextZIndex.current += 1;
    setZIndexMap((prev) => ({ ...prev, [uid]: nextZIndex.current }));
  }

  const value = useMemo<ChatContextValue>(
    () => ({
      openChats,
      activeUid,
      openChat: (uid) => {
        setOpenChats((prev) => (prev.includes(uid) ? prev : [...prev, uid]));
        setActiveUid(uid);
        bringToFront(uid);
      },
      closeChat: (uid) => {
        setOpenChats((prev) => prev.filter((u) => u !== uid));
        setActiveUid((prev) => (prev === uid ? null : prev));
      },
      focusChat: (uid) => {
        setActiveUid(uid);
        bringToFront(uid);
      },
      zIndexOf: (uid) => zIndexMap[uid] ?? BASE_Z_INDEX,
      shakeSignal,
      triggerShake: (uid) => setShakeSignal((prev) => ({ ...prev, [uid]: Date.now() })),
    }),
    [openChats, activeUid, shakeSignal, zIndexMap]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat debe usarse dentro de ChatProvider");
  return ctx;
}
