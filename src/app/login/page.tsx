"use client";

import {
  browserLocalPersistence,
  browserSessionPersistence,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
} from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { HeroLogoBox } from "@/components/HeroLogoBox";
import { LogoMark } from "@/components/LogoMark";
import { RetroWindow } from "@/components/RetroWindow";
import { auth } from "@/lib/firebase";

const REMEMBER_EMAIL_KEY = "msn-revival:rememberedEmail";

function friendlyAuthError(code: string): string {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Email o contraseña incorrectos.";
    case "auth/invalid-email":
      return "El email no es válido.";
    case "auth/too-many-requests":
      return "Demasiados intentos. Probá de nuevo en un rato.";
    default:
      return "No se pudo iniciar sesión. Probá de nuevo.";
  }
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberEmail, setRememberEmail] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  useEffect(() => {
    // Lectura única de localStorage (no hay SSR de este valor, así que no
    // aplica el patrón de "sincronizar con snapshot externo" del linter).
    const saved = window.localStorage.getItem(REMEMBER_EMAIL_KEY);
    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEmail(saved);
      setRememberEmail(true);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResetMessage(null);
    setSubmitting(true);
    try {
      await setPersistence(auth, keepSignedIn ? browserLocalPersistence : browserSessionPersistence);
      await signInWithEmailAndPassword(auth, email.trim(), password);
      if (rememberEmail) {
        window.localStorage.setItem(REMEMBER_EMAIL_KEY, email.trim());
      } else {
        window.localStorage.removeItem(REMEMBER_EMAIL_KEY);
      }
      router.push("/perfil");
    } catch (err) {
      const code = err instanceof Error && "code" in err ? String((err as { code: string }).code) : "";
      setError(friendlyAuthError(code));
      setSubmitting(false);
    }
  }

  async function handleForgotPassword() {
    const trimmed = email.trim();
    setResetMessage(null);
    if (!trimmed) {
      setError("Escribí tu email arriba y volvé a tocar el enlace para recuperar la contraseña.");
      return;
    }
    setError(null);
    setSendingReset(true);
    try {
      await sendPasswordResetEmail(auth, trimmed);
      setResetMessage("Te enviamos un email con el enlace para restablecer tu contraseña.");
    } catch {
      setError("No pudimos enviar el email. Revisá que la dirección sea correcta.");
    } finally {
      setSendingReset(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-1 justify-center overflow-y-auto bg-black px-4 py-10">
      <RetroWindow title="MSN Revival">
        {/* Wordmark interno, sobre el panel claro (no es una franja de color aparte) */}
        <div className="mb-6 flex items-center gap-2">
          <LogoMark size={22} />
          <p className="text-[17px] leading-none">
            <span className="font-bold text-[#2E5F9E]">MSN</span>{" "}
            <span className="font-semibold text-[#33445A]">Revival</span>
          </p>
        </div>

        <div className="mb-7">
          <HeroLogoBox size={140} />
        </div>

        <form onSubmit={handleSubmit} className="mx-auto w-full max-w-[360px]">
          <label className="mb-1 block text-[15px] text-[#1F2D3D]">
            E-mail:
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-[3px] border border-[#A7B0BE] bg-white px-3 py-2.5 text-[15px] text-[#1F2D3D] shadow-[inset_0_1px_2px_rgba(0,0,0,0.15)] focus:border-[#3E73B8] focus:outline-none"
              placeholder="vos@ejemplo.com"
            />
          </label>

          <label className="mb-1 mt-4 block text-[15px] text-[#1F2D3D]">
            Contraseña:
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-[3px] border border-[#A7B0BE] bg-white px-3 py-2.5 text-[15px] text-[#1F2D3D] shadow-[inset_0_1px_2px_rgba(0,0,0,0.15)] focus:border-[#3E73B8] focus:outline-none"
              placeholder="••••••••"
            />
          </label>

          <p className="mb-4 mt-3 text-[14px] text-[#33445A]">Estado: Disponible ▾</p>

          <label className="mb-2.5 flex items-center gap-2.5 text-[15px] text-[#33445A]">
            <input
              type="checkbox"
              checked={rememberEmail}
              onChange={(e) => setRememberEmail(e.target.checked)}
              className="h-5 w-5 rounded-none border border-[#A7B0BE] accent-[#2E5F9E]"
            />
            Recordar mi email
          </label>

          <label className="mb-5 flex items-center gap-2.5 text-[15px] text-[#33445A]">
            <input
              type="checkbox"
              checked={keepSignedIn}
              onChange={(e) => setKeepSignedIn(e.target.checked)}
              className="h-5 w-5 rounded-none border border-[#A7B0BE] accent-[#2E5F9E]"
            />
            Mantener la sesión iniciada
          </label>

          {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
          {resetMessage && <p className="mb-3 text-sm text-emerald-700">{resetMessage}</p>}

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={submitting}
              className="h-14 w-44 rounded-[4px] border border-[#8a94a3] bg-gradient-to-b from-white via-[#f4f6fa] to-[#dfe4ec] text-[17px] font-bold text-[#1F2D3D] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.3)] transition active:translate-y-px active:shadow-[inset_0_1px_3px_rgba(0,0,0,0.3)] disabled:opacity-60"
            >
              {submitting ? "Ingresando..." : "Iniciar sesión"}
            </button>
          </div>

          <div className="mt-14 flex items-end justify-between text-[14px]">
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={sendingReset}
              className="text-[#2E5F9E] underline disabled:opacity-60"
            >
              {sendingReset ? "Enviando..." : "¿Olvidaste tu contraseña?"}
            </button>
            <Link href="/registro" className="text-[#2E5F9E] underline">
              Crear cuenta
            </Link>
          </div>

          <div className="mt-6 flex items-center gap-1.5 text-[11px] text-[#33445A]/70">
            <LogoMark size={12} />
            Red privada MSN Revival
          </div>
        </form>
      </RetroWindow>
    </div>
  );
}
