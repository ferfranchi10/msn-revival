"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    router.replace(user ? "/perfil" : "/login");
  }, [loading, user, router]);

  return (
    <div className="flex flex-1 items-center justify-center bg-gradient-to-b from-sky-100 to-sky-200">
      <p className="text-sky-900/60">Cargando...</p>
    </div>
  );
}
