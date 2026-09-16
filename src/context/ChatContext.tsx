"use client";

import { createContext, useContext, useMemo, useState } from "react";

type ChatContextValue = {
  openChats: string[];
  activeUid: string | null;
  openChat: (uid: string) => void;
  closeChat: (uid: string) => void;
  focusChat: (uid: string) => void;
  /** Timestamp del último zumbido a animar por contacto (propio o recibido). */
  shakeSignal: Record<string, number>;
  triggerShake: (uid: string) => void;
};

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [openChats, setOpenChats] = useState<string[]>([]);
  const [activeUid, setActiveUid] = useState<string | null>(null);
  const [shakeSignal, setShakeSignal] = useState<Record<string, number>>({});

  const value = useMemo<ChatContextValue>(
    () => ({
      openChats,
      activeUid,
      openChat: (uid) => {
        setOpenChats((prev) => (prev.includes(uid) ? prev : [...prev, uid]));
        setActiveUid(uid);
      },
      closeChat: (uid) => {
        setOpenChats((prev) => prev.filter((u) => u !== uid));
        setActiveUid((prev) => (prev === uid ? null : prev));
      },
      focusChat: (uid) => setActiveUid(uid),
      shakeSignal,
      triggerShake: (uid) => setShakeSignal((prev) => ({ ...prev, [uid]: Date.now() })),
    }),
    [openChats, activeUid, shakeSignal]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat debe usarse dentro de ChatProvider");
  return ctx;
}
