# CONTEXT.md — Decisiones y estado del proyecto

## Fase actual

**FASE 0 — Preparación** (en curso).

## Decisiones tomadas

- Nombre provisional: **MSN Revival**.
- Repo GitHub: `ferfranchi10/msn-revival` (rama `main`).
- Vercel: proyecto `msn-revival` bajo el team `ferfranchi10's projects` (plan Hobby),
  importado directamente desde el repo de GitHub.
- Stack: Next.js (App Router) + TypeScript + Tailwind CSS, scaffolded con
  `create-next-app` (incluye ESLint, `src/`, alias `@/*`).
- Firebase: aún no creado. Se usará un proyecto Firebase nuevo y separado (no se
  comparte con otros proyectos Firebase de la cuenta del usuario — las cuotas del
  plan Spark son por proyecto, no por cuenta).
- Backend/datos: Firebase (Auth + Firestore + Realtime Database para presencia).

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
- Cargar las claves de Firebase en `.env.local` (nunca commitear ese archivo).
- Hacer el primer `git push` al repo `ferfranchi10/msn-revival` (Claude no hace push sin pedirlo explícitamente).
- Deploy inicial en Vercel — recién después de que exista código real en el repo.
