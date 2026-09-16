import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";

let cachedAuth: Auth | null = null;

/** Solo para uso en el servidor (API routes) — nunca importar desde un componente cliente. */
export function getAdminAuth(): Auth {
  if (cachedAuth) return cachedAuth;

  const app = getApps().length
    ? getApps()[0]!
    : initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
      });

  cachedAuth = getAuth(app);
  return cachedAuth;
}
