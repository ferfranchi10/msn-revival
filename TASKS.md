# TASKS.md — Checklist de fases

> Detalle completo de cada fase en la sección 29 de [PROJECT_MSN_Revival_MVP.md](PROJECT_MSN_Revival_MVP.md).

## FASE 0 — Preparación

- [x] Crear proyecto Next.js + TypeScript (App Router, Tailwind, ESLint, `src/`).
- [x] Estructura inicial y README propio del proyecto.
- [x] `.env.example` con las variables de entorno esperadas (Firebase).
- [x] `git init` local + primer commit.
- [x] Repo en GitHub creado (`ferfranchi10/msn-revival`).
- [x] Proyecto Vercel creado e importado desde GitHub.
- [x] Proyecto Firebase creado (Authentication + Firestore + Realtime Database activados).
- [x] Variables de entorno de Firebase cargadas en `.env.local` (local).
- [ ] Variables de entorno de Firebase cargadas también en Vercel (producción) — pendiente.
- [x] Primer `git push` al repo remoto.
- [x] Primer deploy real en Vercel con la app funcionando (no solo el import vacío).
- [x] Confirmar: app corre en local (`npm run dev`) y en la URL de Vercel (https://msn-revival.vercel.app).

## FASE 1 — Sistema de usuarios

- [x] Registro (nombre, username, email, contraseña, avatar).
- [x] Username único (colección espejo `usernames/{usernameLower}`, con rollback de la
      cuenta de Auth si se ocupa justo en el medio).
- [x] Login (email + contraseña).
- [x] Logout.
- [x] Sesión persistente (persistencia por defecto de Firebase Auth).
- [x] Perfil: ver y editar nombre, avatar, estado (manual, no presencia real), mensaje personal.
- [x] Reglas de seguridad de Firestore publicadas (`users` y `usernames`).
- [ ] Variables de entorno de Firebase cargadas en Vercel (necesario para que Auth/Firestore
      funcionen en producción, no solo en local) — pendiente antes del próximo deploy.

## FASE 2 — Contactos

- [ ] Buscar usuarios, solicitudes, aceptar/rechazar, lista de amigos, eliminar, bloquear.

## FASE 3 — Presencia MSN

- [ ] Online/offline/ausente/no molestar/invisible, last seen, heartbeat, evento `friend_online`.

## FASE 4 — Chat en tiempo real

- [ ] Conversaciones, mensajes en tiempo real, historial, timestamp, estado de entrega, "escribiendo...".

## FASE 5 — Zumbido

- [ ] Botón, evento realtime, animación, sonido, cooldown anti-spam.

## FASE 6 — Notificaciones MSN

- [ ] Mensaje nuevo, amigo conectado, solicitud de amistad, zumbido, configuración y sonidos independientes.

## FASE 7 — Emoticonos y estética

- [ ] Pack propio de emoticonos, selector, animaciones, avatares, estética retro terminada.

## FASE 8 — PWA

- [ ] Manifest, iconos, service worker, instalación, responsive, push notifications.

## FASE 9 — Test privado

- [ ] Grupo de prueba de 5–15 personas, lista de bugs.

## FASE 10 — MVP 1.0

- [ ] Checklist final de la sección 30 del spec.
