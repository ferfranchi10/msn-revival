import { getAdminAuth } from "@/lib/firebaseAdmin";

/** uid del usuario que hace la petición, a partir del ID token de Firebase Auth
 * (`Authorization: Bearer ...`). `null` si falta o no es válido. Solo servidor. */
export async function requireCallerUid(request: Request): Promise<string | null> {
  const authHeader = request.headers.get("authorization") ?? "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : "";
  if (!idToken) return null;

  try {
    return (await getAdminAuth().verifyIdToken(idToken)).uid;
  } catch {
    return null;
  }
}
