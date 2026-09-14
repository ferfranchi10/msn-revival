# CONTEXT.md — Decisiones y estado del proyecto

## Fase actual

**FASE 1 — Sistema de usuarios: completada y verificada en el navegador** (registro,
login, logout, sesión persistente, perfil editable, username único). Lista para
arrancar FASE 2 (contactos) cuando el usuario lo confirme.

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
