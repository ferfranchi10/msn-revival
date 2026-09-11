"use client";

import { signInWithEmailAndPassword } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { auth } from "@/lib/firebase";

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
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.push("/perfil");
    } catch (err) {
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
        <p className="mb-6 text-center text-sm text-sky-900/60">Iniciar sesión</p>

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
            placeholder="••••••••"
          />
        </label>

        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-sky-600 py-2 font-medium text-white transition hover:bg-sky-700 disabled:opacity-60"
        >
          {submitting ? "Ingresando..." : "Iniciar sesión"}
        </button>

        <p className="mt-4 text-center text-sm text-sky-900/70">
          ¿No tenés cuenta?{" "}
          <Link href="/registro" className="font-medium text-sky-700 underline">
            Crear cuenta
          </Link>
        </p>
      </form>
    </div>
  );
}
