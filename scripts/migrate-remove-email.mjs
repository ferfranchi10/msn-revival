// Script descartable (no forma parte del código de la app): borra el campo `email` de
// los perfiles existentes en `users/{uid}` en Firestore, ahora que ya no se guarda ahí
// (vive solo en Firebase Auth). Ver CONTEXT.md, sección de auditoría, hallazgo 1.
//
// Uso (desde la raíz del repo, con .env.local ya completado):
//   node --env-file=.env.local scripts/migrate-remove-email.mjs           (dry-run, no escribe nada)
//   node --env-file=.env.local scripts/migrate-remove-email.mjs --apply   (aplica el borrado)
//
// Requiere correr DESPUÉS de desplegar la app (para que el registro ya no escriba
// `email`) y ANTES de publicar las reglas nuevas (`npm run rules:deploy`).

import { cert, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

const apply = process.argv.includes("--apply");

const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
});
const db = getFirestore(app);

const snapshot = await db.collection("users").get();
const withEmail = snapshot.docs.filter((d) => "email" in d.data());

console.log(`Perfiles totales: ${snapshot.size}`);
console.log(`Perfiles con campo "email": ${withEmail.length}`);

if (withEmail.length === 0) {
  console.log("Nada para migrar.");
  process.exit(0);
}

if (!apply) {
  console.log("Dry-run (no se escribió nada). Repetir con --apply para borrar el campo.");
  process.exit(0);
}

const BATCH_SIZE = 400;
let done = 0;
for (let i = 0; i < withEmail.length; i += BATCH_SIZE) {
  const chunk = withEmail.slice(i, i + BATCH_SIZE);
  const batch = db.batch();
  for (const docSnap of chunk) {
    batch.update(docSnap.ref, { email: FieldValue.delete() });
  }
  await batch.commit();
  done += chunk.length;
  console.log(`Migrados ${done}/${withEmail.length}`);
}

console.log("Listo.");
