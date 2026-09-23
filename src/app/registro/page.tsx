"use client";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, serverTimestamp, writeBatch } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { HeroLogoBox } from "@/components/HeroLogoBox";
import { LogoMark } from "@/components/LogoMark";
import { RetroButton } from "@/components/RetroButton";
import { RetroField } from "@/components/RetroField";
import { DesktopIcons, Taskbar } from "@/components/RetroDesktop";
import { RetroWindow } from "@/components/RetroWindow";
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
          // El email NO se guarda acá: `users` es legible por cualquier usuario autenticado
          // y filtraría el correo de todos. Vive solo en Firebase Auth (`user.email`).
          avatarId,
          status: DEFAULT_STATUS,
          personalMessage: "",
          activity: "",
          notifyFriendOnline: true,
          notifyNudge: true,
          notifyNewMessage: true,
          notifyFriendRequest: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        await batch.commit();

        // Envío best-effort: si el proveedor de email falla, no debe bloquear el registro.
        // El endpoint exige el ID token del usuario recién creado (no confía en
        // el email del body) para que no sea un endpoint público sin autenticar.
        credential.user
          .getIdToken()
          .then((idToken) =>
            fetch("/api/send-welcome-email", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${idToken}`,
              },
              body: JSON.stringify({ displayName: trimmedName }),
            })
          )
          .catch((emailErr) => console.error("welcome email error", emailErr));
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
    <div className="msn-wallpaper relative flex min-h-screen w-full flex-1 justify-center overflow-y-auto px-4 py-10 pb-14">
      <DesktopIcons />
      <RetroWindow title="MSN Revival">
        <div className="mb-5 flex items-center gap-2">
          <LogoMark size={20} />
          <p className="text-[16px] leading-none">
            <span className="font-bold text-[#2E5F9E]">MSN</span>{" "}
            <span className="font-semibold text-[#33445A]">Revival</span>
          </p>
        </div>

        <div className="mb-6">
          <HeroLogoBox size={96} />
        </div>

        <p className="mb-5 text-center text-[15px] text-[#33445A]">Crear una cuenta nueva</p>

        <form onSubmit={handleSubmit} className="mx-auto w-full max-w-[360px]">
          <RetroField
            label="Nombre:"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Fernando"
          />

          <RetroField
            label="Username:"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="fernando99"
          />

          <RetroField
            label="E-mail:"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vos@ejemplo.com"
          />

          <RetroField
            label="Contraseña:"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
          />

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

          {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

          <div className="flex justify-center">
            <RetroButton type="submit" disabled={submitting} className="w-48">
              {submitting ? "Creando cuenta..." : "Crear cuenta"}
            </RetroButton>
          </div>

          <p className="mt-6 text-center text-[14px] text-[#33445A]">
            ¿Ya tenés cuenta?{" "}
            <Link href="/login" className="text-[#2E5F9E] underline">
              Iniciar sesión
            </Link>
          </p>
        </form>
      </RetroWindow>
      <Taskbar />
    </div>
  );
}
