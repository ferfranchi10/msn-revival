"use client";

import type { Timestamp } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";
import { useDraggable } from "@/hooks/useDraggable";
import { useFriendPresence } from "@/hooks/useFriendPresence";
import { useMessages } from "@/hooks/useMessages";
import { useTyping } from "@/hooks/useTyping";
import { getConversationId, MAX_MESSAGE_LENGTH, sendMessage } from "@/lib/chat";
import { renderWithEmoticons } from "@/lib/emoticons";
import { NUDGE_COOLDOWN_MS, sendNudge } from "@/lib/nudge";
import { playNudgeSound } from "@/lib/sound";
import { getStatus } from "@/lib/status";
import { RETRO_FONT } from "@/lib/theme";
import { Avatar } from "./Avatar";
import { Emoticon } from "./Emoticon";
import { EmoticonPicker } from "./EmoticonPicker";
import { RetroButton } from "./RetroButton";

function formatTime(ts: Timestamp | null): string {
  if (!ts) return "";
  return ts.toDate().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
}

export function ChatWindow({ uid }: { uid: string }) {
  const { user } = useAuth();
  const { closeChat, focusChat, shakeSignal, triggerShake, zIndexOf } = useChat();
  const { elementRef, position, dragHandleProps } = useDraggable();
  const { profile, visibleStatus } = useFriendPresence(uid);
  const conversationId = user ? getConversationId(user.uid, uid) : undefined;
  const messages = useMessages(conversationId);
  const { otherIsTyping, notifyTyping } = useTyping(conversationId, user?.uid, uid);

  const [text, setText] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [nudgeCooldownUntil, setNudgeCooldownUntil] = useState(0);
  const [nudgeRemaining, setNudgeRemaining] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const lastShakeHandled = useRef(0);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages.length]);

  // Temblor: reacciona tanto a un zumbido propio recién enviado como a uno recibido
  // (ambos avisan a través del mismo `shakeSignal[uid]` en ChatContext).
  useEffect(() => {
    const signal = shakeSignal[uid];
    if (!signal || signal === lastShakeHandled.current) return;
    lastShakeHandled.current = signal;
    setIsShaking(true);
    // Mismo patrón rítmico de ráfaga de 4 golpes que playNudgeSound().
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([80, 30, 80, 30, 80, 30, 80]);
    const timeout = setTimeout(() => setIsShaking(false), 500);
    return () => clearTimeout(timeout);
  }, [shakeSignal, uid]);

  useEffect(() => {
    if (!nudgeCooldownUntil) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((nudgeCooldownUntil - Date.now()) / 1000));
      setNudgeRemaining(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 250);
    return () => clearInterval(interval);
  }, [nudgeCooldownUntil]);

  async function handleNudge() {
    if (!user || !conversationId || Date.now() < nudgeCooldownUntil) return;
    setNudgeCooldownUntil(Date.now() + NUDGE_COOLDOWN_MS);
    triggerShake(uid);
    playNudgeSound();
    try {
      await sendNudge(conversationId, user.uid);
    } catch {
      // Rechazado por el cooldown reforzado en el servidor o sin conexión: el
      // aviso local (temblor + sonido) ya se mostró igual.
    }
  }

  async function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || !user || !conversationId) return;
    setText("");
    const participants = [user.uid, uid].sort() as [string, string];
    await sendMessage(conversationId, participants, user.uid, trimmed);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  if (!profile || !user) return null;
  const status = getStatus(visibleStatus);

  return (
    <div
      ref={elementRef}
      onMouseDown={() => focusChat(uid)}
      className={`flex w-[300px] flex-col overflow-hidden rounded-t-[6px] border border-[#8fa3c7] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.45)] ${
        isShaking ? "animate-msn-shake" : ""
      }`}
      style={{
        fontFamily: RETRO_FONT,
        zIndex: zIndexOf(uid),
        ...(position ? { position: "fixed", left: position.x, top: position.y } : { position: "relative" }),
      }}
    >
      <div
        className="flex touch-none items-center justify-between border-b border-[#274d80] bg-gradient-to-b from-[#5B8CC5] via-[#3E73B8] to-[#2E5F9E] px-2 py-1 select-none cursor-move"
        {...dragHandleProps}
      >
        <span className="truncate text-[12px] font-bold text-white [text-shadow:0_1px_1px_rgba(0,0,0,0.4)]">
          {profile.displayName}
        </span>
        <div className="flex shrink-0 items-center gap-[3px]" onPointerDown={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setMinimized((m) => !m)}
            aria-label="Minimizar"
            className="flex h-[15px] w-[17px] items-center justify-center rounded-[2px] border border-[#8fa3c7] bg-gradient-to-b from-white to-[#c7d3e6] text-[9px] leading-none text-[#33445A]"
          >
            –
          </button>
          <button
            type="button"
            onClick={() => closeChat(uid)}
            aria-label="Cerrar"
            className="flex h-[15px] w-[17px] items-center justify-center rounded-[2px] border border-[#7a2020] bg-gradient-to-b from-[#f2a0a0] to-[#c23b3b] text-[9px] leading-none text-white hover:from-[#ff8080] hover:to-[#a52020]"
          >
            ×
          </button>
        </div>
      </div>

      {!minimized && (
        <>
          <div className="flex items-center gap-2 border-b border-[#C4CBD5] bg-[#F4F6FA] px-2 py-1.5">
            <Avatar avatarId={profile.avatarId} avatarUrl={profile.avatarUrl} className="h-7 w-7 text-sm" />
            <div className="min-w-0">
              <p className="truncate text-[12px] font-semibold text-[#1F2D3D]">{profile.displayName}</p>
              <p className="truncate text-[11px] text-[#33445A]">
                {status.emoji} {status.label}
              </p>
            </div>
          </div>

          <div ref={listRef} className="retro-scroll h-[220px] overflow-y-auto bg-white px-2 py-2 text-[13px]">
            {messages.length === 0 && (
              <p className="text-[12px] text-[#33445A]/50">Todavía no hay mensajes.</p>
            )}
            {messages.map((m) => {
              const mine = m.senderId === user.uid;
              return (
                <p key={m.id} className="mb-2 leading-snug">
                  <span className="font-bold" style={{ color: mine ? "#2E5F9E" : "#a12b6b" }}>
                    {mine ? "Tú" : profile.displayName}
                  </span>
                  {m.createdAt && (
                    <span className="ml-1 text-[10px] text-[#33445A]/50">[{formatTime(m.createdAt)}]</span>
                  )}
                  <br />
                  <span className="text-[#1F2D3D]">{renderWithEmoticons(m.text)}</span>
                </p>
              );
            })}
          </div>

          <div className="h-[16px] px-2 text-[11px] italic text-[#33445A]/60">
            {otherIsTyping && `${profile.displayName} está escribiendo...`}
          </div>

          <div className="relative flex items-center gap-1 border-t border-[#C4CBD5] bg-[#F4F6FA] px-2 py-1">
            <button
              type="button"
              onClick={() => setShowPicker((p) => !p)}
              title="Emoticonos"
              className="flex h-6 w-6 items-center justify-center rounded-[2px] hover:bg-[#E8F1FC]"
            >
              <Emoticon id="happy" size={16} />
            </button>
            {showPicker && (
              <EmoticonPicker
                onPick={(code) => {
                  setText((t) => `${t}${code} `);
                  setShowPicker(false);
                }}
              />
            )}
            <button
              type="button"
              onClick={handleNudge}
              disabled={nudgeRemaining > 0}
              title={nudgeRemaining > 0 ? `Espera ${nudgeRemaining}s` : "Enviar zumbido"}
              className="flex h-6 w-6 items-center justify-center rounded-[2px] text-[13px] hover:bg-[#E8F1FC] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
            >
              📳
            </button>
          </div>

          <div className="border-t border-[#C4CBD5] bg-white p-1.5">
            <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                notifyTyping();
              }}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu mensaje..."
              rows={2}
              maxLength={MAX_MESSAGE_LENGTH}
              className="w-full resize-none border-0 text-[13px] text-[#1F2D3D] focus:outline-none"
            />
          </div>
          <div className="flex justify-end border-t border-[#C4CBD5] bg-[#F4F6FA] px-2 py-1.5">
            <RetroButton type="button" onClick={handleSend} className="h-7 px-4 text-[12px]">
              Enviar
            </RetroButton>
          </div>
        </>
      )}
    </div>
  );
}
