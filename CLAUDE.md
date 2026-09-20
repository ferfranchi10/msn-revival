@AGENTS.md

# MSN Revival — CLAUDE.md

Contexto fijo del proyecto. Ver también [CONTEXT.md](CONTEXT.md) (decisiones y estado)
y [TASKS.md](TASKS.md) (checklist de fases). La especificación completa del MVP está en
[PROJECT_MSN_Revival_MVP.md](PROJECT_MSN_Revival_MVP.md) — leerla antes de implementar
cualquier fase nueva.

## Qué es

App privada de mensajería instantánea para un grupo cerrado de amigos, con estética y
funcionalidad inspiradas en MSN Messenger clásico (presencia, estados, zumbidos,
mensaje personal, emoticonos propios). No competir con WhatsApp; MVP gratuito primero.

## Stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS
- Firebase: Authentication, Firestore, Realtime Database (presencia), Cloud Messaging, Storage
- Hosting: Vercel
- PWA (manifest + service worker)

## Comandos

```bash
npm run dev      # servidor local (http://localhost:3000)
npm run build    # build de producción
npm run start    # servir el build
npm run lint     # eslint
npm run test     # vitest (tests unitarios de funciones puras, src/**/*.test.ts[x])
```

## Metodología (obligatoria)

Trabajar **fase por fase** según la sección 29 de PROJECT_MSN_Revival_MVP.md (FASE 0 a
FASE 10). No implementar funcionalidades de fases futuras adelantándose. Al cerrar una
fase: actualizar CONTEXT.md y TASKS.md, y dejar que el usuario decida si hace commit.

## Reglas de estilo y seguridad

- No usar assets propietarios de Microsoft (logos, sonidos, emoticonos originales de MSN).
  Todo el arte/sonido retro debe ser propio.
- Nunca poner secretos reales en el repo. Solo `.env.example` con nombres de variables;
  los valores reales van en `.env.local` (ignorado por git) o en las env vars de Vercel.
- No usar `NEXT_PUBLIC_*` para claves que deban permanecer privadas.
- Firestore/Realtime Database: reglas de seguridad desde el día 1 (un usuario solo
  modifica su propio perfil; solo amigos aceptados pueden chatear).
- Presencia: usar Realtime Database para online/offline (con debounce/heartbeat), y
  Firestore para el resto de los datos del usuario. No depender solo de un campo
  `isOnline` en Firestore.
