"use client";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, serverTimestamp, writeBatch } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AVATARS, DEFAULT_AVATAR_ID } from "@/lib/avatars";
import { auth, db } from "@/lib/firebase";
import { DEFAULT_STATUS } from "@/lib/status";

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

function friendlyAuthError(code: string): string {
  switch (code) {
    case "auth/email-already-in-use":
      return "Ese email ya tiene una cuenta.";
    case "auth/invalid-email":
      return "El email no es válido.";
    case "auth/weak-password":
      return "La contraseña debe tener al menos 6 caracteres.";
    default:
      return "No se pudo crear la cuenta. Probá de nuevo.";
  }
}

export default function RegistroPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatarId, setAvatarId] = useState(DEFAULT_AVATAR_ID);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmedName = displayName.trim();
    const usernameLower = username.trim().toLowerCase();

    if (!trimmedName) {
      setError("Ingresá tu nombre.");
      return;
    }
    if (!USERNAME_REGEX.test(username.trim())) {
      setError("El username debe tener 3-20 caracteres: letras, números o _.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setSubmitting(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const uid = credential.user.uid;

      try {
        // El username se lee/reserva recién acá porque las reglas de Firestore
        // exigen estar autenticado, y hasta este punto todavía no lo estábamos.
        const usernameSnap = await getDoc(doc(db, "usernames", usernameLower));
        if (usernameSnap.exists()) {
          throw new Error("username-taken");
        }

        const batch = writeBatch(db);
        batch.set(doc(db, "usernames", usernameLower), { uid });
        batch.set(doc(db, "users", uid), {
          displayName: trimmedName,
          username: username.trim(),
          usernameLower,
          email: email.trim(),
          avatarId,
          status: DEFAULT_STATUS,
          personalMessage: "",
          activity: "",
          isOnline: false,
          lastSeen: null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        await batch.commit();
      } catch (innerErr) {
        // Username tomado (por el chequeo de arriba, o por una carrera justo contra
        // la escritura): revertimos la cuenta de Auth recién creada para no dejar
        // cuentas huérfanas sin perfil.
        await credential.user.delete().catch(() => {});
        const isTaken =
          innerErr instanceof Error && innerErr.message === "username-taken";
        setError(
          isTaken
            ? "Ese nombre de usuario ya está en uso."
            : "Ese nombre de usuario se acaba de ocupar. Probá con otro."
        );
        setSubmitting(false);
        return;
      }

      router.push("/perfil");
    } catch (err) {
      console.error("registro error", err);
      const code = err instanceof Error && "code" in err ? String((err as { code: string }).code) : "";
      setError(friendlyAuthError(code));
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-gradient-to-b from-sky-100 to-sky-200 px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl bg-white/90 p-8 shadow-lg"
      >
        <h1 className="mb-1 text-center text-2xl font-semibold text-sky-700">MSN Revival</h1>
        <p className="mb-6 text-center text-sm text-sky-900/60">Crear cuenta</p>

        <label className="mb-3 block text-sm text-sky-900/80">
          Nombre
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-sky-200 px-3 py-2 text-sky-900 focus:border-sky-400 focus:outline-none"
            placeholder="Fernando"
          />
        </label>

        <label className="mb-3 block text-sm text-sky-900/80">
          Username
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 w-full rounded-lg border border-sky-200 px-3 py-2 text-sky-900 focus:border-sky-400 focus:outline-none"
            placeholder="fernando99"
          />
        </label>

        <label className="mb-3 block text-sm text-sky-900/80">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-sky-200 px-3 py-2 text-sky-900 focus:border-sky-400 focus:outline-none"
            placeholder="vos@ejemplo.com"
          />
        </label>

        <label className="mb-4 block text-sm text-sky-900/80">
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-sky-200 px-3 py-2 text-sky-900 focus:border-sky-400 focus:outline-none"
            placeholder="Mínimo 6 caracteres"
          />
        </label>

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

        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-sky-600 py-2 font-medium text-white transition hover:bg-sky-700 disabled:opacity-60"
        >
          {submitting ? "Creando cuenta..." : "Crear cuenta"}
        </button>

        <p className="mt-4 text-center text-sm text-sky-900/70">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="font-medium text-sky-700 underline">
            Iniciar sesión
          </Link>
        </p>
      </form>
    </div>
  );
}
