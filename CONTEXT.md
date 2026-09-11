# CONTEXT.md — Decisiones y estado del proyecto

## Fase actual

**FASE 0 — Preparación: completada.** Lista para arrancar FASE 1 (sistema de usuarios) cuando el usuario lo confirme.

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
  como env vars del proyecto en Vercel — no urgente hasta que el código use el SDK
  de Firebase (FASE 1), pero hay que recordarlo antes de que la app en producción
  necesite login real.

## Archivos clave

- [PROJECT_MSN_Revival_MVP.md](PROJECT_MSN_Revival_MVP.md) — spec completa del MVP (visión, pantallas, modelo de datos, fases).
- [CLAUDE.md](CLAUDE.md) — contexto fijo para Claude Code.
- [TASKS.md](TASKS.md) — checklist de fases.

## Cosas que NO hay que tocar/romper

- No sobrescribir `PROJECT_MSN_Revival_MVP.md` (es la fuente de verdad del alcance del MVP).
- No implementar funcionalidades marcadas como "no implementar todavía" en la sección 3
  del spec (videollamadas, IA, Spotify automático, pagos, etc.) hasta pasar el MVP.

## Pendiente / en manos del usuario

- Crear proyecto Firebase nuevo y activar Authentication + Firestore + Realtime Database.
- Cargar las claves de Firebase en `.env.local` (local) y en las env vars del proyecto Vercel (producción).
