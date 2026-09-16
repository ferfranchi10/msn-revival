"use client";

import { signOut } from "firebase/auth";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { LogoMark } from "@/components/LogoMark";
import { RetroButton } from "@/components/RetroButton";
import { RetroField } from "@/components/RetroField";
import { RetroWindow } from "@/components/RetroWindow";
import { AVATARS } from "@/lib/avatars";
import { auth, db } from "@/lib/firebase";
import { STATUS_OPTIONS, type UserStatus } from "@/lib/status";

export default function PerfilPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [avatarId, setAvatarId] = useState("");
  const [status, setStatus] = useState<UserStatus>("online");
  const [personalMessage, setPersonalMessage] = useState("");
  const [notifyFriendOnline, setNotifyFriendOnline] = useState(true);
  const [notifyNudge, setNotifyNudge] = useState(true);
  const [notifyNewMessage, setNotifyNewMessage] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (profile && !initialized.current) {
      setDisplayName(profile.displayName);
      setAvatarId(profile.avatarId);
      setStatus(profile.status);
      setPersonalMessage(profile.personalMessage);
      setNotifyFriendOnline(profile.notifyFriendOnline ?? true);
      setNotifyNudge(profile.notifyNudge ?? true);
      setNotifyNewMessage(profile.notifyNewMessage ?? true);
      initialized.current = true;
    }
  }, [profile]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        displayName: displayName.trim() || profile?.displayName,
        avatarId,
        status,
        personalMessage: personalMessage.trim(),
        notifyFriendOnline,
        notifyNudge,
        notifyNewMessage,
        updatedAt: serverTimestamp(),
      });
      setSavedAt(Date.now());
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await signOut(auth);
    router.push("/login");
  }

  if (loading || !profile) {
    return (
      <div className="flex min-h-screen w-full flex-1 items-center justify-center bg-black">
        <p className="text-white/60">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-1 justify-center overflow-y-auto bg-black px-4 py-10">
      <RetroWindow title="MSN Revival">
        <div className="mb-5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <LogoMark size={20} />
            <p className="text-[16px] leading-none">
              <span className="font-bold text-[#2E5F9E]">MSN</span>{" "}
              <span className="font-semibold text-[#33445A]">Revival</span>
            </p>
          </div>
          <Link href="/contactos" className="text-[13px] text-[#2E5F9E] underline">
            ← Contactos
          </Link>
        </div>

        <p className="mb-5 text-[15px] text-[#33445A]">@{profile.username}</p>

        <form onSubmit={handleSave} className="mx-auto w-full max-w-[360px]">
          <p className="mb-2 text-[15px] text-[#1F2D3D]">Avatar</p>
          <div className="mb-5 flex flex-wrap gap-2">
            {AVATARS.map((avatar) => (
              <button
                key={avatar.id}
                type="button"
                onClick={() => setAvatarId(avatar.id)}
                className={`flex h-10 w-10 items-center justify-center rounded-full border text-lg transition ${
                  avatarId === avatar.id
                    ? "border-[#2E5F9E] ring-2 ring-[#2E5F9E] ring-offset-2"
                    : "border-[#A7B0BE]"
                }`}
                style={{ backgroundColor: avatar.bg }}
                aria-label={avatar.id}
              >
                {avatar.emoji}
              </button>
            ))}
          </div>

          <RetroField
            label="Nombre:"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />

          <RetroField label="E-mail:" type="email" value={profile.email} disabled />

          <label className="mb-4 block text-[15px] text-[#1F2D3D]">
            Estado:
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as UserStatus)}
              className="mt-1 w-full rounded-[3px] border border-[#A7B0BE] bg-white px-3 py-2.5 text-[15px] text-[#1F2D3D] shadow-[inset_0_1px_2px_rgba(0,0,0,0.15)] focus:border-[#3E73B8] focus:outline-none"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.emoji} {option.label}
                </option>
              ))}
            </select>
          </label>

          <RetroField
            label="Mensaje personal:"
            type="text"
            value={personalMessage}
            onChange={(e) => setPersonalMessage(e.target.value)}
            maxLength={120}
            placeholder="Escuchando música 🎵"
          />

          <label className="mb-5 flex items-center gap-2 text-[14px] text-[#1F2D3D]">
            <input
              type="checkbox"
              checked={notifyFriendOnline}
              onChange={(e) => setNotifyFriendOnline(e.target.checked)}
              className="h-4 w-4"
            />
            Avisarme cuando mis amigos se conecten
          </label>

          <label className="mb-5 flex items-center gap-2 text-[14px] text-[#1F2D3D]">
            <input
              type="checkbox"
              checked={notifyNudge}
              onChange={(e) => setNotifyNudge(e.target.checked)}
              className="h-4 w-4"
            />
            Avisarme (sonido, temblor y aviso) cuando me envíen un zumbido
          </label>

          <label className="mb-5 flex items-center gap-2 text-[14px] text-[#1F2D3D]">
            <input
              type="checkbox"
              checked={notifyNewMessage}
              onChange={(e) => setNotifyNewMessage(e.target.checked)}
              className="h-4 w-4"
            />
            Reproducir sonido cuando me llega un mensaje nuevo
          </label>

          {savedAt && <p className="mb-3 text-sm text-emerald-700">Perfil guardado.</p>}

          <div className="flex flex-col items-center gap-3">
            <RetroButton type="submit" disabled={saving} className="w-48">
              {saving ? "Guardando..." : "Guardar cambios"}
            </RetroButton>
            <RetroButton type="button" variant="secondary" onClick={handleLogout} className="w-48">
              Cerrar sesión
            </RetroButton>
          </div>
        </form>
      </RetroWindow>
    </div>
  );
}
