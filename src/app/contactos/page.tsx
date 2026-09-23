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
import { useEffect, useMemo, useRef, useState } from "react";
import { Avatar } from "@/components/Avatar";
import type { ContextMenuItem } from "@/components/ContactContextMenu";
import { ContactGroup } from "@/components/ContactGroup";
import { FriendRow } from "@/components/FriendRow";
import { LogoMark } from "@/components/LogoMark";
import { ProfilePopup } from "@/components/ProfilePopup";
import { AddContactIcon } from "@/components/StatusBuddy";
import { RetroField } from "@/components/RetroField";
import { RetroWindow } from "@/components/RetroWindow";
import { SplashScreen } from "@/components/SplashScreen";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";
import { db } from "@/lib/firebase";
import { getFriendshipId, getOtherUid, type Friendship } from "@/lib/friendships";
import { notifyPush } from "@/lib/pushClient";
import { useFriendsPresence } from "@/hooks/useFriendsPresence";
import { STATUS_OPTIONS, type UserStatus } from "@/lib/status";
import { useFriendships } from "@/hooks/useFriendships";
import type { UserProfile } from "@/lib/types";

type SearchResult = { uid: string; profile: UserProfile };

function Section({ title, count, children }: { title: string; count?: number; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <p className="mb-1 text-[12px] font-bold uppercase tracking-wide text-[#2E5F9E]">
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
  const { openChat } = useChat();
  const { incoming, outgoing, accepted, blockedByMe, all } = useFriendships(user?.uid);

  const friendUidsKey = useMemo(
    () => (user ? accepted.map((f) => getOtherUid(f, user.uid)).join(",") : ""),
    [accepted, user]
  );
  const presenceMap = useFriendsPresence(friendUidsKey);

  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [filterTerm, setFilterTerm] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [viewingProfileUid, setViewingProfileUid] = useState<string | null>(null);
  const [personalMessageDraft, setPersonalMessageDraft] = useState("");
  const [editingMessage, setEditingMessage] = useState(false);
  const draftInitialized = useRef(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (profile && !draftInitialized.current) {
      setPersonalMessageDraft(profile.personalMessage);
      draftInitialized.current = true;
    }
  }, [profile]);

  useEffect(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!user || term.length < 2) return;
    let cancelled = false;
    const timeout = setTimeout(async () => {
      setSearching(true);
      try {
        const snapshot = await getDocs(
          query(collection(db, "users"), orderBy("usernameLower"), startAt(term), endAt(`${term}`))
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
      notifyPush("friendRequest", otherUid);
    } catch {
      setFeedback("No se pudo enviar la solicitud. Puede que ya exista una relación con ese usuario.");
    }
  }

  async function acceptRequest(f: Friendship) {
    await updateDoc(doc(db, "friendships", f.id), { status: "accepted", updatedAt: serverTimestamp() });
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

  async function saveStatus(status: UserStatus) {
    if (!user) return;
    await updateDoc(doc(db, "users", user.uid), { status, updatedAt: serverTimestamp() });
  }

  async function savePersonalMessage() {
    if (!user) return;
    setEditingMessage(false);
    await updateDoc(doc(db, "users", user.uid), {
      personalMessage: personalMessageDraft.trim(),
      updatedAt: serverTimestamp(),
    });
  }

  function buildFriendMenu(f: Friendship): ContextMenuItem[] {
    if (!user) return [];
    const otherUid = getOtherUid(f, user.uid);
    return [
      { type: "item", label: "Enviar mensaje", onClick: () => openChat(otherUid) },
      { type: "item", label: "Ver perfil", onClick: () => setViewingProfileUid(otherUid) },
      { type: "separator" },
      { type: "item", label: "Bloquear", onClick: () => blockFriendship(f) },
      { type: "item", label: "Eliminar contacto", onClick: () => removeFriendship(f), danger: true },
    ];
  }

  const filteredAccepted = useMemo(() => {
    const term = filterTerm.trim().toLowerCase();
    if (!term || !user) return accepted;
    return accepted.filter((f) => {
      const otherUid = getOtherUid(f, user.uid);
      const p = presenceMap[otherUid]?.profile;
      if (!p) return true;
      return p.displayName.toLowerCase().includes(term) || p.username.toLowerCase().includes(term);
    });
  }, [accepted, filterTerm, presenceMap, user]);

  const { onlineFriends, offlineFriends } = useMemo(() => {
    if (!user) return { onlineFriends: [] as Friendship[], offlineFriends: [] as Friendship[] };
    const online: Friendship[] = [];
    const offline: Friendship[] = [];
    for (const f of filteredAccepted) {
      const otherUid = getOtherUid(f, user.uid);
      const isOnline = presenceMap[otherUid]?.visibleStatus !== "offline";
      (isOnline ? online : offline).push(f);
    }
    return { onlineFriends: online, offlineFriends: offline };
  }, [filteredAccepted, presenceMap, user]);

  if (loading || !profile || !user) {
    return <SplashScreen />;
  }

  return (
    <div className="flex min-h-screen w-full flex-1 flex-col overflow-y-auto">
      <RetroWindow title="MSN Revival" contentClassName="flex flex-1 min-h-0 flex-col" draggable>
        <div className="mb-2 flex shrink-0 items-center gap-2.5 border-b border-[#C4CBD5] pb-2.5">
          <Avatar
            avatarId={profile.avatarId}
            avatarUrl={profile.avatarUrl}
            className="h-9 w-9 border border-[#8fa3c7] text-base"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-[13px] font-bold text-[#1F2D3D]">{profile.displayName}</p>
              <select
                value={profile.status}
                onChange={(e) => saveStatus(e.target.value as UserStatus)}
                className="rounded-[2px] border border-[#A7B0BE] bg-white px-1 py-0.5 text-[11px] text-[#33445A]"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.emoji} {option.label}
                  </option>
                ))}
              </select>
            </div>
            {editingMessage ? (
              <input
                autoFocus
                value={personalMessageDraft}
                onChange={(e) => setPersonalMessageDraft(e.target.value)}
                onBlur={savePersonalMessage}
                onKeyDown={(e) => e.key === "Enter" && savePersonalMessage()}
                maxLength={120}
                className="mt-0.5 w-full border-b border-[#A7B0BE] bg-transparent text-[12px] text-[#33445A] focus:outline-none"
              />
            ) : (
              <button
                type="button"
                onClick={() => setEditingMessage(true)}
                className="mt-0.5 block truncate text-left text-[12px] italic text-[#33445A]/70 hover:underline"
              >
                {profile.personalMessage || "Escribe un mensaje personal..."}
              </button>
            )}
          </div>
          <Link href="/perfil" className="shrink-0 text-[11px] text-[#2E5F9E] underline">
            Editar perfil
          </Link>
        </div>

        {/* Barra de acciones */}
        <div className="mb-2 flex shrink-0 items-center gap-1 border-b border-[#C4CBD5] pb-1.5">
          <button
            type="button"
            aria-expanded={showAddPanel}
            onClick={() => setShowAddPanel((v) => !v)}
            className={`flex items-center gap-1.5 rounded-[2px] px-1.5 py-0.5 text-[12px] font-semibold text-[#1F3F6E] hover:bg-[#E8F1FC] ${
              showAddPanel ? "bg-[#CDE3FA]" : ""
            }`}
          >
            <AddContactIcon />
            Agregar un contacto
          </button>
        </div>

        {showAddPanel && (
          <div className="mb-3 shrink-0 rounded-[3px] border border-[#C4CBD5] bg-[#F4F6FA] p-2">
            <RetroField
              label="Buscar contactos por username:"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="fernando99"
            />
            {feedback && <p className="mb-2 text-[12px] text-red-600">{feedback}</p>}
            {searchTerm.trim().length >= 2 && (
              <div>
                {searching && <p className="text-[12px] text-[#33445A]/60">Buscando...</p>}
                {!searching && results.length === 0 && (
                  <p className="text-[12px] text-[#33445A]/60">Sin resultados.</p>
                )}
                {results.map((r) => {
                  const existing = friendshipWith(r.uid);
                  return (
                    <div key={r.uid} className="flex items-center gap-2 border-t border-[#E4E9F2] py-1.5 first:border-t-0">
                      <Avatar avatarId={r.profile.avatarId} avatarUrl={r.profile.avatarUrl} className="h-6 w-6 text-[12px]" />
                      <p className="min-w-0 flex-1 truncate text-[12px] text-[#1F2D3D]">
                        {r.profile.displayName} <span className="text-[#33445A]/60">@{r.profile.username}</span>
                      </p>
                      {!existing && (
                        <button
                          type="button"
                          onClick={() => sendRequest(r.uid)}
                          className="rounded-[2px] border border-[#8a94a3] bg-white px-2 py-0.5 text-[11px] hover:bg-[#E8F1FC]"
                        >
                          Agregar
                        </button>
                      )}
                      {existing?.status === "pending" && (
                        <span className="text-[11px] text-[#33445A]/60">Pendiente</span>
                      )}
                      {existing?.status === "accepted" && (
                        <span className="text-[11px] text-[#33445A]/60">Ya son amigos</span>
                      )}
                      {existing?.status === "blocked" && (
                        <span className="text-[11px] text-[#33445A]/60">Bloqueado</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="shrink-0">
          <RetroField
            label=""
            type="text"
            value={filterTerm}
            onChange={(e) => setFilterTerm(e.target.value)}
            placeholder="🔎 Buscar un contacto..."
            className="mb-3"
          />
        </div>

        <div className="retro-scroll min-h-0 flex-1 overflow-y-auto pr-1">
          {incoming.length > 0 && (
            <Section title="Solicitudes recibidas" count={incoming.length}>
              {incoming.map((f) => (
                <FriendRow key={f.id} uid={getOtherUid(f, user.uid)}>
                  <button
                    type="button"
                    onClick={() => acceptRequest(f)}
                    className="rounded-[2px] border border-[#8a94a3] bg-white px-2 py-0.5 text-[11px] hover:bg-[#E8F1FC]"
                  >
                    Aceptar
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFriendship(f)}
                    className="rounded-[2px] border border-[#c23b3b] bg-[#fceeee] px-2 py-0.5 text-[11px] text-[#a12b2b]"
                  >
                    Rechazar
                  </button>
                </FriendRow>
              ))}
            </Section>
          )}

          {outgoing.length > 0 && (
            <Section title="Solicitudes enviadas" count={outgoing.length}>
              {outgoing.map((f) => (
                <FriendRow key={f.id} uid={getOtherUid(f, user.uid)}>
                  <button
                    type="button"
                    onClick={() => removeFriendship(f)}
                    className="rounded-[2px] border border-[#c23b3b] bg-[#fceeee] px-2 py-0.5 text-[11px] text-[#a12b2b]"
                  >
                    Cancelar
                  </button>
                </FriendRow>
              ))}
            </Section>
          )}

          <ContactGroup title="Amigos" online={onlineFriends.length} total={filteredAccepted.length}>
            {onlineFriends.length === 0 && (
              <p className="px-1 text-[12px] text-[#33445A]/50">Nadie conectado ahora mismo.</p>
            )}
            {onlineFriends.map((f) => (
              <FriendRow
                key={f.id}
                uid={getOtherUid(f, user.uid)}
                onOpenChat={() => openChat(getOtherUid(f, user.uid))}
                contextMenuItems={buildFriendMenu(f)}
              />
            ))}
          </ContactGroup>

          {offlineFriends.length > 0 && (
            <ContactGroup title="Desconectados" total={offlineFriends.length} defaultOpen={false}>
              {offlineFriends.map((f) => (
                <FriendRow
                  key={f.id}
                  uid={getOtherUid(f, user.uid)}
                  onOpenChat={() => openChat(getOtherUid(f, user.uid))}
                  contextMenuItems={buildFriendMenu(f)}
                />
              ))}
            </ContactGroup>
          )}

          {accepted.length === 0 && (
            <p className="px-1 text-[12px] text-[#33445A]/50">Todavía no tenés amigos agregados.</p>
          )}

          {blockedByMe.length > 0 && (
            <Section title="Bloqueados" count={blockedByMe.length}>
              {blockedByMe.map((f) => (
                <FriendRow key={f.id} uid={getOtherUid(f, user.uid)}>
                  <button
                    type="button"
                    onClick={() => removeFriendship(f)}
                    className="rounded-[2px] border border-[#8a94a3] bg-white px-2 py-0.5 text-[11px] hover:bg-[#E8F1FC]"
                  >
                    Desbloquear
                  </button>
                </FriendRow>
              ))}
            </Section>
          )}
        </div>

        <div className="mt-2 flex shrink-0 items-center gap-1.5 border-t border-[#C4CBD5] pt-2 text-[11px] text-[#33445A]/70">
          <LogoMark size={12} />
          Red privada MSN Revival
        </div>
      </RetroWindow>

      {viewingProfileUid && (
        <ProfilePopup uid={viewingProfileUid} onClose={() => setViewingProfileUid(null)} />
      )}
    </div>
  );
}
