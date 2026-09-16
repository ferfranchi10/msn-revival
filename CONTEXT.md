# CONTEXT.md — Decisiones y estado del proyecto

## Fase actual

**FASE 4 (chat en tiempo real) + parte visual de FASE 7 (emoticonos y estética):
completadas y verificadas en el navegador local**, adelantadas fuera de orden a
pedido explícito del usuario (ver decisión detallada abajo). Falta verificar en
producción (Vercel) cuando se haga el deploy. FASE 5 (zumbido) y FASE 6
(notificaciones) siguen pendientes, sin adelantar.

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
- **FASE 3 — Presencia**: la conexión real (online/offline) vive enteramente en
  Realtime Database, no en Firestore. Decisiones (no vienen literal del spec):
  - Se sacaron los campos `isOnline`/`lastSeen` de `users/{uid}` en Firestore
    (quedaban de Fase 1 sin usar, siempre en `false`/`null`): sin Cloud Functions
    (plan Spark), no hay forma de mantenerlos sincronizados de forma confiable
    si el cliente que se desconecta ya no está vivo para escribirlos. En su
    lugar, todos los clientes leen la presencia de un contacto directamente
    de `status/{uid}` en Realtime Database.
  - Nodo `status/{uid}` en Realtime Database: `{ state: "online"|"offline",
    lastChanged: serverTimestamp }`, mantenido con el patrón oficial de Firebase
    (`.info/connected` + `onDisconnect().set(...)`) — es el propio servidor de
    RTDB el que marca "offline" ante un cierre de pestaña o corte de red, sin
    depender de que el cliente siga vivo. Esto da heartbeat y detección de
    desconexión/reconexión sin código adicional.
  - Estado visible para otros = combinación de la conexión real (RTDB) y el
    estado manual (Firestore, de Fase 1): si no hay conexión real **o** el
    usuario eligió "invisible", aparece "Desconectado" para los demás (para uno
    mismo no aplica: el usuario siempre ve su propio estado manual real).
  - Anti-flapping: debounce de 6 s antes de mostrar "Desconectado" (tanto en la
    UI como en la detección de eventos), para no generar parpadeos por cortes
    de red breves. Las transiciones a "conectado" son inmediatas (sin debounce).
  - Evento "amigo conectado": toast + sonido de dos tonos generado con Web
    Audio API (no un asset de MSN), con un toggle `notifyFriendOnline` en el
    perfil (default `true`). El toggle vive en el mismo doc `users/{uid}`.
  - Bug encontrado y corregido durante la verificación: si se emitía el estado
    de presencia antes de que cargara el perfil de Firestore, se trataba
    momentáneamente como "offline" por defecto, y al llegar el perfil poco
    después se detectaba una transición offline→online falsa (toast fantasma
    en cada remount de la app, aunque nadie se hubiera reconectado). Se
    corrigió esperando a que carguen **ambas** fuentes (perfil + RTDB) antes de
    emitir cualquier estado.
  - Reglas de Realtime Database (pegadas manualmente en la consola, ver sección
    de reglas de Firestore para el mismo criterio — no hay Firebase CLI
    configurado en el repo):
    ```json
    {
      "rules": {
        "status": {
          "$uid": {
            ".read": "auth != null",
            ".write": "auth != null && auth.uid === $uid",
            ".validate": "newData.hasChildren(['state', 'lastChanged']) && (newData.child('state').val() === 'online' || newData.child('state').val() === 'offline')"
          }
        }
      }
    }
    ```
  - Verificado con las cuentas de prueba `anaprueba2`/`brunoprueba2` conectadas
    en paralelo, en dos navegadores distintos (necesario porque el SDK de
    Firebase Auth comparte sesión entre pestañas del mismo navegador): conexión,
    desconexión real (cierre de pestaña) con debounce, reconexión con evento
    "se ha conectado" + sonido, e invisibilidad (aparece desconectado para el
    otro aunque siga conectado).
- **FASE 4 + parte visual de FASE 7 (adelantadas fuera de orden)**: el usuario
  pidió reconstruir la estética exacta de Windows Live Messenger (XP/Vista) para
  contactos y chat, con una spec muy detallada que en los hechos cubre Fase 4
  (chat) y la parte visual/emoticonos de Fase 7. Se consultó explícitamente y el
  usuario decidió: (1) hacerlo ahora con el chat **real** desde el arranque
  (Firestore en tiempo real, no un mock, para no rehacer la UI dos veces), y
  (2) usar un **layout de panel simplificado** en vez de ventanas de escritorio
  flotantes reales (sin drag/resize/minimize/taskbar tipo SO). Plan completo en
  `C:\Users\ferna\.claude\plans\joyful-brewing-bumblebee.md`.
  - **Recortes de alcance explícitos** (documentados y aceptados, no son huecos
    sin cubrir): sin zumbido (Fase 5 propia), sin notificaciones tipo
    "parpadeo en barra de tareas" (Fase 6, no aplica sin un taskbar real), sin
    envío de archivos (el spec ya lo marca "posterior"), sin grupos de contactos
    personalizados tipo "Family"/"Friends" (no existen en el modelo de datos ni
    en la spec del MVP — un único grupo "Amigos" + "Desconectados"), sin formato
    de texto enriquecido por mensaje (negrita/cursiva/color/fuente — un control
    decorativo que no hiciera nada sería una "demo falsa"), sin recibos de
    lectura por mensaje ("estado de entrega": con Firestore, que el mensaje
    aparezca ya es la confirmación de entrega).
  - **Modelo de datos**: `conversations/{conversationId}` (`participants: [uid,
    uid]`) + subcolección `messages/{messageId}` (`senderId`, `text`,
    `createdAt`). `conversationId` reutiliza literalmente `getFriendshipId`
    (mismo esquema de par ordenado que `friendships`), porque solo los amigos
    aceptados pueden chatear — esto permite validar la amistad en las reglas de
    seguridad con un `get()` directo contra `friendships/{conversationId}`, sin
    depender de que el documento de `conversations` ya exista (bug encontrado
    durante la verificación: las reglas originales dependían de leer el propio
    doc de `conversations` para saber los participantes, lo cual falla con
    `permission-denied` antes de que exista — se corrigió apuntando siempre a
    `friendships/{conversationId}` en su lugar, vía dos funciones
    `isFriendshipAccepted`/`isFriendshipParticipant`).
  - **Indicador "está escribiendo..."**: Realtime Database, mismo patrón que la
    presencia — nodo `typing/{conversationId}/{uid}: boolean`, con timeout de
    3 s de inactividad y `onDisconnect` para no dejarlo pegado.
  - **Emoticonos propios**: 8 caras dibujadas en SVG inline (no emoji nativo del
    sistema, para no romper la estética retro), con shortcodes (`:)`, `:D`,
    `:(`, `:@`, `;)`, `:O`, `:P`, `<3`) parseados a nodos React sin
    `dangerouslySetInnerHTML`.
  - **Ventanas**: paneles de chat (no ventanas de SO) apilados abajo a la
    derecha, cada uno independiente (abrir/cerrar/minimizar), gestionados por
    un `ChatContext` global. Los controles de minimizar/cerrar sí son
    funcionales (colapsan/quitan el panel), a diferencia de los de la ventana
    principal de contactos que son decorativos (igual que en Fases 1-3).
  - Reglas de seguridad de Firestore (`conversations`/`messages`) y de Realtime
    Database (`typing`) publicadas manualmente en la consola (mismo criterio
    que fases anteriores).
  - Verificado con las cuentas de prueba `anaprueba2`/`brunoprueba2` en paralelo:
    mensajes en tiempo real en ambos sentidos, emoticonos (shortcode y desde el
    selector), indicador "está escribiendo..." bidireccional, menú contextual
    (click derecho) y popup de "Ver perfil".
  - La ventana de contactos usa una altura fija (`h-[560px]`, vía la nueva prop
    `contentClassName` de `RetroWindow`) con la lista de contactos ocupando el
    espacio restante con scroll interno — corrige que antes la ventana se
    achicaba al contenido dejando fondo negro suelto cuando había pocos
    contactos (reportado por el usuario durante la verificación).

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
- FASE 3: reglas de Realtime Database ya pegadas y publicadas en la consola de
  Firebase por el usuario. Falta verificar la presencia real en producción
  (Vercel) cuando se haga el próximo deploy.
