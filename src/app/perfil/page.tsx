"use client";

import { signOut } from "firebase/auth";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
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
      <div className="flex flex-1 items-center justify-center bg-gradient-to-b from-sky-100 to-sky-200">
        <p className="text-sky-900/60">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-gradient-to-b from-sky-100 to-sky-200 px-4 py-10">
      <form
        onSubmit={handleSave}
        className="w-full max-w-sm rounded-2xl bg-white/90 p-8 shadow-lg"
      >
        <h1 className="mb-1 text-center text-2xl font-semibold text-sky-700">Mi perfil</h1>
        <p className="mb-6 text-center text-sm text-sky-900/60">@{profile.username}</p>

        <p className="mb-2 text-sm text-sky-900/80">Avatar</p>
        <div className="mb-4 flex flex-wrap gap-2">
          {AVATARS.map((avatar) => (
            <button
              key={avatar.id}
              type="button"
              onClick={() => setAvatarId(avatar.id)}
              className={`flex h-10 w-10 items-center justify-center rounded-full text-lg transition ${
                avatarId === avatar.id ? "ring-2 ring-sky-500 ring-offset-2" : ""
              }`}
              style={{ backgroundColor: avatar.bg }}
              aria-label={avatar.id}
            >
              {avatar.emoji}
            </button>
          ))}
        </div>

        <label className="mb-3 block text-sm text-sky-900/80">
          Nombre
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-sky-200 px-3 py-2 text-sky-900 focus:border-sky-400 focus:outline-none"
          />
        </label>

        <label className="mb-3 block text-sm text-sky-900/80">
          Email
          <input
            type="email"
            value={profile.email}
            disabled
            className="mt-1 w-full rounded-lg border border-sky-100 bg-sky-50 px-3 py-2 text-sky-900/50"
          />
        </label>

        <label className="mb-3 block text-sm text-sky-900/80">
          Estado
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as UserStatus)}
            className="mt-1 w-full rounded-lg border border-sky-200 px-3 py-2 text-sky-900 focus:border-sky-400 focus:outline-none"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.emoji} {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="mb-4 block text-sm text-sky-900/80">
          Mensaje personal
          <input
            type="text"
            value={personalMessage}
            onChange={(e) => setPersonalMessage(e.target.value)}
            maxLength={120}
            placeholder="Escuchando música 🎵"
            className="mt-1 w-full rounded-lg border border-sky-200 px-3 py-2 text-sky-900 focus:border-sky-400 focus:outline-none"
          />
        </label>

        {savedAt && <p className="mb-3 text-sm text-emerald-600">Perfil guardado.</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-full bg-sky-600 py-2 font-medium text-white transition hover:bg-sky-700 disabled:opacity-60"
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-3 w-full rounded-full border border-sky-300 py-2 font-medium text-sky-700 transition hover:bg-sky-50"
        >
          Cerrar sesión
        </button>
      </form>
    </div>
  );
}
