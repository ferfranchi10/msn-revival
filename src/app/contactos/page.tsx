"use client";

import {
  collection,
  deleteDoc,
  doc,
  endAt,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  startAt,
  updateDoc,
} from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FriendRow } from "@/components/FriendRow";
import { LogoMark } from "@/components/LogoMark";
import { RetroField } from "@/components/RetroField";
import { RetroWindow } from "@/components/RetroWindow";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { getFriendshipId, getOtherUid, type Friendship } from "@/lib/friendships";
import { getStatus } from "@/lib/status";
import { getAvatar } from "@/lib/avatars";
import { useFriendships } from "@/hooks/useFriendships";
import type { UserProfile } from "@/lib/types";

type SearchResult = { uid: string; profile: UserProfile };

function ActionButton({
  children,
  onClick,
  danger = false,
  disabled = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-[3px] border px-2.5 py-1 text-[12px] font-semibold transition active:translate-y-px disabled:opacity-50 ${
        danger
          ? "border-[#c23b3b] bg-[#fceeee] text-[#a12b2b]"
          : "border-[#8a94a3] bg-gradient-to-b from-white to-[#dfe4ec] text-[#1F2D3D]"
      }`}
    >
      {children}
    </button>
  );
}

function Section({ title, count, children }: { title: string; count?: number; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <p className="mb-1.5 text-[13px] font-bold uppercase tracking-wide text-[#2E5F9E]">
        {title}
        {typeof count === "number" && count > 0 ? ` (${count})` : ""}
      </p>
      {children}
    </div>
  );
}

export default function ContactosPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const { incoming, outgoing, accepted, blockedByMe, all } = useFriendships(user?.uid);

  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!user || term.length < 2) return;
    let cancelled = false;
    const timeout = setTimeout(async () => {
      setSearching(true);
      try {
        const snapshot = await getDocs(
          query(
            collection(db, "users"),
            orderBy("usernameLower"),
            startAt(term),
            endAt(`${term}`)
          )
        );
        if (cancelled) return;
        const found = snapshot.docs
          .map((d) => ({ uid: d.id, profile: d.data() as UserProfile }))
          .filter((r) => r.uid !== user.uid)
          .slice(0, 10);
        setResults(found);
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [searchTerm, user]);

  function friendshipWith(otherUid: string): Friendship | undefined {
    if (!user) return undefined;
    const id = getFriendshipId(user.uid, otherUid);
    return all.find((f) => f.id === id);
  }

  async function sendRequest(otherUid: string) {
    if (!user) return;
    setFeedback(null);
    const id = getFriendshipId(user.uid, otherUid);
    try {
      await setDoc(doc(db, "friendships", id), {
        userId: user.uid,
        friendId: otherUid,
        status: "pending",
        blockedBy: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch {
      setFeedback("No se pudo enviar la solicitud. Puede que ya exista una relación con ese usuario.");
    }
  }

  async function acceptRequest(f: Friendship) {
    await updateDoc(doc(db, "friendships", f.id), {
      status: "accepted",
      updatedAt: serverTimestamp(),
    });
  }

  async function removeFriendship(f: Friendship) {
    await deleteDoc(doc(db, "friendships", f.id));
  }

  async function blockFriendship(f: Friendship) {
    if (!user) return;
    await updateDoc(doc(db, "friendships", f.id), {
      status: "blocked",
      blockedBy: user.uid,
      updatedAt: serverTimestamp(),
    });
  }

  if (loading || !profile || !user) {
    return (
      <div className="flex min-h-screen w-full flex-1 items-center justify-center bg-black">
        <p className="text-white/60">Cargando...</p>
      </div>
    );
  }

  const myAvatar = getAvatar(profile.avatarId);
  const myStatus = getStatus(profile.status);

  return (
    <div className="flex min-h-screen w-full flex-1 justify-center overflow-y-auto bg-black px-4 py-10">
      <RetroWindow title="MSN Revival">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-full text-lg"
              style={{ backgroundColor: myAvatar.bg }}
            >
              {myAvatar.emoji}
            </span>
            <div>
              <p className="text-[15px] font-bold text-[#1F2D3D]">{profile.displayName}</p>
              <p className="text-[13px] text-[#33445A]">
                {myStatus.emoji} {myStatus.label}
                {profile.personalMessage && ` — "${profile.personalMessage}"`}
              </p>
            </div>
          </div>
          <Link href="/perfil" className="shrink-0 text-[13px] text-[#2E5F9E] underline">
            Editar perfil
          </Link>
        </div>

        <RetroField
          label="Buscar contactos por username:"
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="fernando99"
        />

        {feedback && <p className="mb-3 text-sm text-red-600">{feedback}</p>}

        {searchTerm.trim().length >= 2 && (
          <Section title="Resultados de búsqueda">
            {searching && <p className="text-[13px] text-[#33445A]/60">Buscando...</p>}
            {!searching && results.length === 0 && (
              <p className="text-[13px] text-[#33445A]/60">Sin resultados.</p>
            )}
            {results.map((r) => {
              const existing = friendshipWith(r.uid);
              const avatar = getAvatar(r.profile.avatarId);
              return (
                <div
                  key={r.uid}
                  className="flex items-center gap-3 border-b border-[#E4E9F2] py-2.5 last:border-b-0"
                >
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base"
                    style={{ backgroundColor: avatar.bg }}
                  >
                    {avatar.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-semibold text-[#1F2D3D]">
                      {r.profile.displayName}{" "}
                      <span className="font-normal text-[#33445A]/60">@{r.profile.username}</span>
                    </p>
                  </div>
                  {!existing && <ActionButton onClick={() => sendRequest(r.uid)}>Agregar</ActionButton>}
                  {existing?.status === "pending" && (
                    <span className="text-[12px] text-[#33445A]/60">Solicitud pendiente</span>
                  )}
                  {existing?.status === "accepted" && (
                    <span className="text-[12px] text-[#33445A]/60">Ya son amigos</span>
                  )}
                  {existing?.status === "blocked" && (
                    <span className="text-[12px] text-[#33445A]/60">Bloqueado</span>
                  )}
                </div>
              );
            })}
          </Section>
        )}

        <Section title="Solicitudes recibidas" count={incoming.length}>
          {incoming.length === 0 && <p className="text-[13px] text-[#33445A]/60">Ninguna por ahora.</p>}
          {incoming.map((f) => (
            <FriendRow key={f.id} uid={getOtherUid(f, user.uid)}>
              <ActionButton onClick={() => acceptRequest(f)}>Aceptar</ActionButton>
              <ActionButton danger onClick={() => removeFriendship(f)}>
                Rechazar
              </ActionButton>
            </FriendRow>
          ))}
        </Section>

        <Section title="Solicitudes enviadas" count={outgoing.length}>
          {outgoing.length === 0 && <p className="text-[13px] text-[#33445A]/60">Ninguna por ahora.</p>}
          {outgoing.map((f) => (
            <FriendRow key={f.id} uid={getOtherUid(f, user.uid)}>
              <ActionButton danger onClick={() => removeFriendship(f)}>
                Cancelar
              </ActionButton>
            </FriendRow>
          ))}
        </Section>

        <Section title="Amigos" count={accepted.length}>
          {accepted.length === 0 && (
            <p className="text-[13px] text-[#33445A]/60">Todavía no tenés amigos agregados.</p>
          )}
          {accepted.map((f) => (
            <FriendRow key={f.id} uid={getOtherUid(f, user.uid)}>
              <ActionButton onClick={() => blockFriendship(f)}>Bloquear</ActionButton>
              <ActionButton danger onClick={() => removeFriendship(f)}>
                Eliminar
              </ActionButton>
            </FriendRow>
          ))}
        </Section>

        {blockedByMe.length > 0 && (
          <Section title="Bloqueados" count={blockedByMe.length}>
            {blockedByMe.map((f) => (
              <FriendRow key={f.id} uid={getOtherUid(f, user.uid)}>
                <ActionButton onClick={() => removeFriendship(f)}>Desbloquear</ActionButton>
              </FriendRow>
            ))}
          </Section>
        )}

        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[#33445A]/70">
          <LogoMark size={12} />
          Red privada MSN Revival
        </div>
      </RetroWindow>
    </div>
  );
}
