"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { SplashScreen } from "@/components/SplashScreen";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    router.replace(user ? "/contactos" : "/login");
  }, [loading, user, router]);

  return <SplashScreen />;
}
