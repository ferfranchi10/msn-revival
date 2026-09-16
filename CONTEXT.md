# CONTEXT.md — Decisiones y estado del proyecto

## Fase actual

**FASE 2 — Contactos: completada y verificada en el navegador local** (buscar por
username, enviar/recibir solicitud, aceptar, rechazar, lista de amigos, eliminar,
bloquear, desbloquear). Falta verificar en producción (Vercel) cuando se haga el
deploy. Lista para arrancar FASE 3 (presencia real) cuando el usuario lo confirme.

## Decisiones tomadas

- Nombre provisional: **MSN Revival**.
- Repo GitHub: `ferfranchi10/msn-revival` (rama `main`).
- Vercel: proyecto `msn-revival` bajo el team `ferfranchi10's projects` (plan Hobby),
  importado directamente desde el repo de GitHub. Deploy inicial exitoso, en producción
  en https://msn-revival.vercel.app (verificado en vivo).
- Stack: Next.js (App Router) + TypeScript + Tailwind CSS, scaffolded con
  `create-next-app` (incluye ESLint, `src/`, alias `@/*`).
- Firebase: proyecto `msn-revival-df50c` (plan Spark, separado de otros proyectos
  Firebase de la cuenta del usuario). Web app registrada como `msn-revival-web`
  (sin Firebase Hosting, se despliega por Vercel). Authentication con
  Email/Contraseña habilitado. Firestore creado (edición Standard, modo producción).
  Realtime Database creado (modo bloqueado) — usado para presencia online/offline.
- Backend/datos: Firebase (Auth + Firestore + Realtime Database para presencia).
- Claves de Firebase cargadas en `.env.local` (no en el repo). Todavía no cargadas
  como env vars del proyecto en Vercel — el código ya usa el SDK de Firebase (desde
  FASE 1), así que esto ahora sí es necesario antes de que el login funcione en
  producción (https://msn-revival.vercel.app).
- Reglas de seguridad de Firestore publicadas manualmente en la consola de Firebase
  (no hay un archivo `firestore.rules` en el repo ni Firebase CLI configurado
  todavía). El contenido exacto está documentado en el plan de FASE 1
  (`C:\Users\ferna\.claude\plans\witty-weaving-sunbeam.md`) — colecciones `users`
  (cada usuario solo puede crear/editar su propio doc, username no editable) y
  `usernames` (mapea username→uid para unicidad, solo creación, nunca update/delete).
- Modelo de datos Fase 1: `users/{uid}` (displayName, username, usernameLower, email,
  avatarId, status manual, personalMessage, activity, isOnline/lastSeen reservados
  para FASE 3) y `usernames/{usernameLower}` → `{ uid }`.
- Avatar: selector fijo de 8 íconos retro propios (`src/lib/avatars.ts`), sin subida
  de archivos ni Firebase Storage todavía.
- Estado (`status`) en Fase 1 es un valor manual elegido por el usuario en su perfil
  (Disponible/Ausente/No molestar/Invisible) — no es presencia real online/offline,
  eso es FASE 3 (Realtime Database, heartbeat, evento `friend_online`).
- **FASE 2 — Contactos**: nueva colección `friendships/{friendshipId}` en
  Firestore. Dos decisiones de implementación (no vienen literal del spec):
  - `friendshipId` es determinístico: `[uidA, uidB].sort().join("_")` (no un id
    autogenerado), para que no pueda existir más de un doc por par de usuarios y
    para que las reglas de seguridad sean simples de validar.
  - Solo 3 estados (`pending | accepted | blocked`), no 4: se quita `rejected`
    del spec porque rechazar una solicitud se implementa como `deleteDoc` del
    documento pendiente (no hace falta persistir un estado "rechazada").
  - Campo extra `blockedBy` (uid de quien bloqueó) para que solo esa persona
    pueda desbloquear/eliminar el documento bloqueado.
  - `/contactos` pasa a ser la pantalla de aterrizaje post-login (antes era
    `/perfil`); `/perfil` ahora tiene un link "← Contactos" para volver.
  - Reglas de Firestore para `friendships` publicadas manualmente en la consola
    (mismo criterio que Fase 1, no hay `firestore.rules` en el repo). El
    contenido exacto queda documentado en el plan de FASE 2
    (`C:\Users\ferna\.claude\plans\dazzling-sparking-milner.md`).
  - Verificado en `npm run dev` con dos cuentas de prueba
    (`anaprueba2@example.com` / `brunoprueba2@example.com`, contraseña
    `prueba123`) recorriendo el flujo completo. Esas cuentas de prueba quedaron
    creadas en el Firebase real (`msn-revival-df50c`); se pueden borrar desde
    la consola si no se quieren conservar.

## Archivos clave

- [PROJECT_MSN_Revival_MVP.md](PROJECT_MSN_Revival_MVP.md) — spec completa del MVP (visión, pantallas, modelo de datos, fases).
- [CLAUDE.md](CLAUDE.md) — contexto fijo para Claude Code.
- [TASKS.md](TASKS.md) — checklist de fases.

## Cosas que NO hay que tocar/romper

- No sobrescribir `PROJECT_MSN_Revival_MVP.md` (es la fuente de verdad del alcance del MVP).
- No implementar funcionalidades marcadas como "no implementar todavía" en la sección 3
  del spec (videollamadas, IA, Spotify automático, pagos, etc.) hasta pasar el MVP.

## Pendiente / en manos del usuario

- (Nada pendiente de FASE 1. Env vars de Firebase cargadas en Vercel como tipo
  "Config" — no "Secret", porque al ser `NEXT_PUBLIC_*` igual quedan expuestas en
  el navegador — y verificado login real en producción.)
