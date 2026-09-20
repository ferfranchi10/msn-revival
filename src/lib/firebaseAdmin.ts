import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let cachedApp: App | null = null;

function getAdminApp(): App {
  if (cachedApp) return cachedApp;

  cachedApp = getApps().length
    ? getApps()[0]!
    : initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
      });
  return cachedApp;
}

/** Solo para uso en el servidor (API routes) — nunca importar desde un componente cliente. */
export function getAdminAuth(): Auth {
  return getAuth(getAdminApp());
}

/** Firestore con privilegios de Admin: **ignora las reglas de seguridad**. Solo servidor. */
export function getAdminDb(): Firestore {
  return getFirestore(getAdminApp());
}
