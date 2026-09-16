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
- [x] Variables de entorno de Firebase cargadas en Vercel y verificadas: login funciona
      en producción (https://msn-revival.vercel.app).

## FASE 2 — Contactos

- [x] Buscar usuarios por username (prefijo, colección `users`).
- [x] Enviar solicitud de amistad.
- [x] Recibir solicitud (sección "Solicitudes recibidas").
- [x] Aceptar solicitud.
- [x] Rechazar / cancelar solicitud.
- [x] Lista de amigos.
- [x] Eliminar amigo.
- [x] Bloquear / desbloquear amigo.
- [x] Reglas de seguridad de Firestore para `friendships` publicadas.
- [x] Verificado en el navegador con dos cuentas de prueba (flujo completo:
      buscar → solicitud → aceptar → amigos → bloquear → desbloquear →
      rechazar → eliminar). Pendiente: verificar también en producción
      (Vercel) cuando el usuario haga el deploy.

## FASE 3 — Presencia MSN

- [x] Online/ausente/no molestar/invisible (manual, Fase 1) combinado con conexión
      real (Realtime Database) → desconectado automático si se cierra la pestaña o
      se corta la red.
- [x] Invisible: aparece desconectado para los demás.
- [x] Last seen (mostrado en la fila del contacto cuando está desconectado).
- [x] Heartbeat / detección de desconexión y reconexión (`.info/connected` +
      `onDisconnect` de Realtime Database).
- [x] Anti-spam de presencia (debounce de 6 s antes de marcar offline en la UI y
      en las notificaciones).
- [x] Evento "amigo conectado": toast + sonido retro propio (sintetizado), con
      toggle ON/OFF en el perfil (`notifyFriendOnline`, default ON).
- [x] Reglas de seguridad de Realtime Database publicadas.
- [x] Verificado con dos cuentas reales en paralelo (Browser pane + Chrome):
      conexión, desconexión real (cierre de pestaña), reconexión con evento y
      sonido, e invisibilidad. Pendiente: verificar también en producción
      (Vercel) cuando el usuario haga el deploy.

## FASE 4 — Chat en tiempo real

- [x] Conversaciones y mensajes en tiempo real (Firestore: `conversations/{id}/messages`).
- [x] Historial (persistido, se recarga al reabrir el chat).
- [x] Timestamp por mensaje.
- [x] Indicador "está escribiendo..." (Realtime Database, mismo criterio que la presencia).
- [x] Reglas de seguridad de Firestore para `conversations`/`messages` publicadas
      (solo entre amigos aceptados) y de Realtime Database para `typing`.
- [x] Verificado con dos cuentas reales en paralelo: mensajes en tiempo real en
      ambos sentidos, indicador de escritura, emoticonos.
- [ ] Estado de entrega (recibos de lectura por mensaje) — no implementado, ver
      recorte de alcance en CONTEXT.md.

## FASE 5 — Zumbido

- [ ] Botón, evento realtime, animación, sonido, cooldown anti-spam.

## FASE 6 — Notificaciones MSN

- [ ] Mensaje nuevo, amigo conectado, solicitud de amistad, zumbido, configuración y sonidos independientes.

## FASE 7 — Emoticonos y estética

- [x] Pack propio de emoticonos (8, dibujados en SVG inline, con shortcodes) + selector.
- [x] Rediseño visual retro Windows XP/Vista de la pantalla de Contactos y ventana
      de Chat (Tahoma, degradados, scrollbar clásico, menús contextuales, grupos
      colapsables con contador).
- [ ] Animaciones de emoticonos, avatares subidos por el usuario — no implementado.

## FASE 8 — PWA

- [ ] Manifest, iconos, service worker, instalación, responsive, push notifications.

## FASE 9 — Test privado

- [ ] Grupo de prueba de 5–15 personas, lista de bugs.

## FASE 10 — MVP 1.0

- [ ] Checklist final de la sección 30 del spec.
