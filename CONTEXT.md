# CONTEXT.md — Decisiones y estado del proyecto

## Fase actual

**FASE 7 (emoticonos y estética) completada**, verificada en local. FASE 6
(notificaciones) + FASE 4 (chat en tiempo real) + FASE 5 (zumbido) siguen
completadas y verificadas en local y en producción
(https://msn-revival.vercel.app), salvo Web Push (diferido explícitamente a
FASE 8, ver detalle abajo).

**FASE 8 (PWA) arrancada parcialmente fuera de orden** (PR #8, `62cc5f0`,
mergeado antes de cerrar FASE 6 y sin documentar en su momento — corregido
acá): manifest + iconos ya están. Falta el resto de la fase (service worker,
push, pruebas en dispositivos) — ver detalle abajo y en TASKS.md.

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
  - Bug post-Fase 2: `src/app/login/page.tsx` seguía haciendo
    `router.push("/perfil")` tras un login exitoso en vez de `/contactos`.
    Corregido y mergeado a `main` en
    [PR #1](https://github.com/ferfranchi10/msn-revival/pull/1).
  - **Vercel: las env vars deben estar tildadas también para Preview.** Al abrir
    ese PR se detectó que las `NEXT_PUBLIC_FIREBASE_*` estaban tildadas solo
    para el entorno **Production**, no **Preview** — el primer deploy de Preview
    de un PR fallaba en build (`auth/invalid-api-key`) porque
    `src/lib/firebase.ts` llama a `getAuth()` a nivel de módulo y eso se
    ejecuta al pre-renderizar `/`. El usuario tildó también Preview en Vercel →
    Settings → Environment Variables; verificado que tanto el deploy de Preview
    del PR como el de Production (tras el merge) terminan en verde. Si alguna
    vez un deploy de Preview falla con `auth/invalid-api-key`, revisar primero
    eso.
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
  - **Bug encontrado en producción** (no se manifestó en local porque ahí solo
    se había enviado un mensaje por conversación): `sendMessage()` hace
    `setDoc(conversations/{id}, {participants}, {merge:true})` en **cada**
    envío. El primer mensaje de una conversación crea ese doc (`create`), pero
    del segundo mensaje en adelante Firestore lo trata como `update` sobre un
    doc ya existente — y las reglas solo permitían `create`, no `update`,
    causando `permission-denied` a partir del segundo mensaje. Se corrigió
    unificando esas dos reglas en una sola `allow write` (el doc de conversación
    es metadata inmutable — `participants` nunca cambia — así que permitir el
    re-`merge` es seguro). Verificado en producción con múltiples mensajes en
    la misma conversación después del fix.
  - **Verificado en producción** (https://msn-revival.vercel.app) con las
    cuentas de prueba reales: login, rediseño, presencia, y chat en tiempo real
    en ambos sentidos (incluyendo el fix del bug de arriba).

- **FASE 5 — Zumbido**: evento efímero en Realtime Database, no persistido en
  Firestore (a diferencia de los mensajes) — la spec lo llama explícitamente
  "evento realtime" y no pide historial de zumbidos, así que se evitó tocar el
  modelo/reglas de `messages` para esto. Decisiones (no vienen literal del spec):
  - Nodo `nudges/{conversationId}/{fromUid}: timestamp` (mismo esquema que
    `typing`, un nodo por remitente dentro de la conversación). El cooldown de
    "máximo 1 zumbido cada 5 s" se interpretó **por remitente**, no por
    conversación entera: si A le zumba a B, B puede responder de inmediato sin
    esperar el cooldown de A. Esto evita que ambos compartan un único contador y
    mantiene las reglas de Realtime Database simples de validar.
  - Reglas de Realtime Database para `nudges` (mismo criterio de confianza que
    `typing`: no valida amistad porque las reglas de RTDB no pueden leer
    `friendships` de Firestore — cross-database no es posible en reglas de RTDB.
    El límite real de spam lo pone el `.validate`, no la pertenencia a la
    conversación):
    ```json
    "nudges": {
      "$conversationId": {
        "$fromUid": {
          ".read": "auth != null",
          ".write": "auth != null && auth.uid === $fromUid",
          ".validate": "newData.isNumber() && (!data.exists() || newData.val() > data.val() + 5000)"
        }
      }
    }
    ```
    El cooldown de 5 s queda reforzado en el servidor (no solo en el cliente):
    la comparación usa `now` (el timestamp real de servidor que resuelve
    `serverTimestamp()` al validar), así que no se puede saltear editando el
    cliente.
  - Al recibir un zumbido: se abre/enfoca la ventana de chat aunque estuviera
    cerrada (`NudgeManager`, montado una sola vez en el layout, mismo patrón que
    `PresenceManager` para "amigo conectado"), se hace temblar la ventana
    (`ChatContext.shakeSignal`, une el envío propio y la recepción remota en el
    mismo mecanismo para no duplicar sonido/vibración), suena el zumbido y
    vibra el dispositivo si es compatible (`navigator.vibrate`).
  - Sonido: primero se probó una versión sintetizada con Web Audio API (ráfaga
    de golpes graves + textura de onda cuadrada), pero el usuario terminó
    creando sus propios archivos de audio específicamente para el proyecto y
    se usan esos directamente. **Nunca** se usó el archivo de audio original
    de Microsoft: el usuario llegó a pedir usar el MP3 real del sonido de MSN
    Messenger primero (incluso para uso solo entre amigos); se explicó que el
    uso privado no cambia que sea un asset con copyright ajeno y que la regla
    propia del proyecto lo prohíbe explícitamente, así que no se usó.
  - El usuario subió dos archivos propios y al principio los nombró al revés
    (el que dijo que era "para el zumbido" resultó ser para "mensaje nuevo", y
    viceversa — corregido tras aclararlo). Quedaron así:
    `public/sounds/nudge.mp3` (zumbido) y `public/sounds/message.mp3` (mensaje
    nuevo), ambos recortados con `ffmpeg` para sacar silencios/repeticiones de
    más detectados con `silencedetect` (el de zumbido: de 4.46 s con aire
    muerto al inicio y una repetición de más, a 0.82 s; el de mensaje: sin
    aire muerto, ya venía ajustado). `playNudgeSound`/`playMessageSound` en
    `src/lib/sound.ts` instancian un `Audio` nuevo por llamado, para que dos
    sonidos superpuestos (conversaciones distintas) no se corten entre sí.
  - Toggle `notifyNudge` en el perfil (default `true`, mismo patrón que
    `notifyFriendOnline`): si está en `false`, no se reacciona a zumbidos
    entrantes (ni sonido, ni temblor, ni apertura automática del chat).
  - Verificado con las cuentas de prueba `anaprueba2`/`brunoprueba2` en
    paralelo: zumbido enviado desde un lado abre y hace temblar la ventana del
    otro lado aunque el chat estuviera cerrado, muestra el toast, y el cooldown
    (con cuenta regresiva visible en el botón) bloquea reintentos inmediatos.
    Nota: durante la verificación, dejar una pestaña de prueba mucho tiempo en
    segundo plano hizo que Chrome cortara su conexión de RTDB (se veía como
    "desconectado" del lado del otro usuario); se resuelve solo recargando esa
    pestaña, no es un bug del código.
  - **Sonido de "mensaje nuevo" (adelanto puntual de FASE 6)**: a pedido
    explícito del usuario, junto con el ajuste del sonido del zumbido, se
    agregó `MessageManager` (`src/components/MessageManager.tsx`, montado una
    sola vez en el layout, mismo patrón que `NudgeManager`/`PresenceManager`):
    escucha el último mensaje de cada conversación con un amigo aceptado
    (`subscribeToLatestMessage` en `src/lib/chat.ts`, `orderBy('createdAt',
    'desc') + limit(1)`) y reproduce `message.mp3` cuando llega uno que no
    envié yo, ignorando la primera lectura de cada suscripción (mismo criterio
    anti-"evento fantasma" que el resto de los managers). Toggle
    `notifyNewMessage` en el perfil (default `true`). A propósito **no**
    incluye toast ni abre el chat automáticamente (a diferencia del zumbido):
    es solo el sonido, para no adelantar de más el resto de FASE 6. Verificado
    con `anaprueba2`/`brunoprueba2`: al enviar un mensaje desde un lado, el
    otro lado hace un `GET /sounds/message.mp3` inmediatamente después.

- **FASE 6 — Notificaciones**: se completó lo que quedaba pendiente de la fase
  (amigo conectado y zumbido ya estaban de fases anteriores). Decisiones (no
  vienen literal del spec):
  - **Solicitud de amistad** (`src/components/FriendRequestManager.tsx`, mismo
    patrón de manager invisible montado una vez en el layout que
    `PresenceManager`/`NudgeManager`/`MessageManager`): escucha
    `useFriendships().incoming` y notifica (toast + sonido) cuando aparece un
    id de `friendship` nuevo. A diferencia de los managers basados en
    Realtime Database (que exponen un callback por evento), `useFriendships`
    da un array recalculado en cada snapshot de Firestore, así que "nuevo" se
    detecta comparando el set de ids contra el snapshot del run anterior del
    efecto (no un acumulado que solo crece). Esto importa porque
    `friendshipId` es determinístico por par de usuarios
    (`getFriendshipId`): si se rechaza una solicitud y más adelante se vuelve
    a pedir amistad al mismo par, el id se reutiliza — un set que solo
    acumula (en vez de reemplazarse en cada corrida) nunca volvería a
    notificar esa segunda vez. Se encontró este bug durante la verificación
    (probando rechazar/reenviar repetidamente entre las cuentas de prueba) y
    se corrigió antes de cerrar la fase.
  - Toggle `notifyFriendRequest` en el perfil (default `true`).
  - **Toast de "mensaje nuevo"**: se agregó al `MessageManager` existente
    (que desde el adelanto de Fase 5 sólo reproducía sonido). El toast se
    suprime si la ventana de chat con ese contacto ya está abierta
    (`ChatContext.openChats`), para no duplicar el aviso con el mensaje que
    ya se ve llegar ahí — sigue sin abrir el chat automáticamente (eso queda
    exclusivo del zumbido). `openChats` y el mapa de presencia (para el
    nombre/avatar del remitente) se leen por `ref` dentro del efecto en vez
    de ir en las dependencias: si estuvieran en las dependencias, cada
    apertura/cierre de cualquier chat o cada cambio de presencia de un amigo
    reabriría la suscripción a Firestore y reiniciaría el criterio de
    "ignorar la primera lectura", pudiendo comerse una notificación real.
  - **Sonido de "amigo conectado"**: se reemplazó el tono sintetizado con Web
    Audio API (de Fase 3) por un archivo propio (`public/sounds/connect.mp3`)
    creado por el usuario, mismo criterio que `nudge.mp3`/`message.mp3`. El
    usuario también proveyó `friend-request.mp3`; ambos se recortaron con
    `ffmpeg`/`silencedetect` para sacar aire muerto al inicio/final, mismo
    procedimiento que se usó con `nudge.mp3` en Fase 5.
  - **Perfil**: los 3 toggles sueltos que ya existían (`notifyFriendOnline`,
    `notifyNudge`, `notifyNewMessage`) se agruparon junto con el nuevo
    (`notifyFriendRequest`) en una sección "Notificaciones" con las 4
    opciones (Amigos conectados, Solicitudes de amistad, Zumbidos, Mensajes),
    siguiendo el mockup de la sección 14 del spec.
  - **Web Push (recorte de alcance explícito, consultado con el usuario)**: el
    spec de FASE 6 la menciona ("Web Push cuando sea posible"), pero FASE 8
    (PWA) ya tiene "push notifications" en su propio checklist y requiere el
    service worker que todavía no existe — no tiene sentido adelantar Web
    Push sin esa infraestructura. Queda pendiente para cuando se aborde
    FASE 8.
  - **Rama contaminada con trabajo de otra sesión**: se creó primero la rama
    `fase-6-notificaciones`, pero mientras se trabajaba apareció ahí un commit
    ajeno (`05fd1b6`, PWA/manifest de FASE 8) hecho por otra sesión de Claude
    Code corriendo en paralelo sobre el mismo repo (se detectaron otras ramas
    activas: `docs/context-fix-contactos-redirect`, `feat/presencia-chat-retro`,
    `claude/zen-lamport-c934a8`, y un worktree en
    `.claude/worktrees/zen-lamport-c934a8`). Se resolvió sin tocar esa rama ni
    su contenido: se guardó el trabajo de FASE 6 con `git stash -u`, se creó
    una rama nueva y limpia desde `main` (`fase-6-notificaciones-msn`), y se
    aplicó el stash ahí. `fase-6-notificaciones` se dejó intacta (no se borró
    ni se le hizo push) por si esa otra sesión la sigue usando.
  - Verificado con las cuentas de prueba `fase6ana`/`fase6bruno` (Browser pane
    + Chrome, mismo patrón que fases anteriores): solicitud de amistad enviada
    y reenviada tras rechazo (toast + detección de "nuevo" corregida), mensaje
    nuevo con el chat cerrado (toast) y con el chat abierto (sin toast,
    solo sonido), y el toggle de cada tipo probado ON→OFF→ON confirmando que
    silencia/reactiva solo ese evento puntual.
  - **Verificado también en producción** (https://msn-revival.vercel.app) tras
    mergear el PR #9: toast de solicitud de amistad y toast de mensaje nuevo,
    ambos confirmados en vivo entre `fase6ana`/`fase6bruno`. Durante la
    verificación se vieron varios `permission-denied` transitorios en la
    consola de Firestore (`Uncaught Error in snapshot listener`), coincidiendo
    con una sucesión rápida de rechazar/reenviar/aceptar solicitudes hecha a
    propósito para forzar el caso de "nuevo" — no volvieron a aparecer tras
    recargar la pestaña, y las notificaciones funcionaron bien en un ciclo
    normal (una sola solicitud, un solo accept). No se investigó más a fondo
    porque no es el flujo real de un usuario armando una prueba de estrés;
    si se repite en uso normal, revisar las reglas de `conversations`/
    `messages` (`isFriendshipAccepted`/`isFriendshipParticipant`) por una
    posible carrera cuando el estado de `friendships` cambia justo cuando se
    abre una suscripción nueva.

- **Email de bienvenida/verificación (adelanto fuera de fase, a pedido explícito del
  usuario, no está en la spec del MVP)**: se dispara automáticamente al registrarse
  (`src/app/registro/page.tsx`, `fetch` a `/api/send-welcome-email` justo después de
  crear el perfil en Firestore, sin bloquear el registro si el email falla — es
  best-effort). Decisiones (no vienen literal de ningún pedido anterior):
  - Las plantillas nativas de Firebase Auth (consola > Authentication > Templates)
    no permiten HTML/CSS propio (el pedido era replicar la estética exacta de
    `RetroWindow`), así que se necesitó infraestructura nueva: **Firebase Admin SDK**
    (`src/lib/firebaseAdmin.ts`, server-only) para generar el link de verificación
    (`generateEmailVerificationLink`) + **Resend** para enviar el HTML propio
    (`src/app/api/send-welcome-email/route.ts`). Es la primera vez que el proyecto
    tiene un endpoint server-side propio (`/api/...`) y un secreto que no es
    `NEXT_PUBLIC_*`.
  - Plantilla en `src/lib/welcomeEmail.ts` (HTML con tablas, por compatibilidad con
    clientes de correo, + versión texto plano): reutiliza la paleta de
    `src/lib/theme.ts` para que la barra de título/menú/botón se vean igual que la
    ventana de la app. El logo se sirve desde la ruta ya existente `/icon`.
  - El usuario ya creó la cuenta de Resend y la clave de cuenta de servicio de
    Firebase, cargadas en `.env.local`. También hubo que agregar
    `msn-revival.vercel.app` a Authentication > Settings > Authorized domains en
    la consola de Firebase (si no, `generateEmailVerificationLink` tira
    `auth/unauthorized-continue-uri`) — paso manual ya hecho por el usuario.
    Para producción falta cargar las mismas 5 variables en Vercel (marcadas
    "Sensitive").
  - **Verificado de punta a punta en local** (`npm run dev`, registro real con
    la cuenta de prueba `axentia.consulting@gmail.com` — el email del dueño de
    la cuenta de Resend, porque el remitente de prueba `onboarding@resend.dev`
    solo entrega a esa casilla): el registro dispara el email, llega el HTML con
    el diseño de `RetroWindow` y el botón de verificación funciona. Las cuentas
    de prueba creadas durante la verificación se borraron con un script
    descartable que usó el Admin SDK recién configurado (ya no quedan cuentas de
    prueba sueltas en el Firebase real).
  - **Bug encontrado y corregido durante la verificación**: en Gmail (app,
    modo oscuro) el texto del cuerpo se veía casi invisible (texto claro sobre
    fondo claro) — Gmail reescribe colores de emails que no declaran
    explícitamente que están diseñados solo para modo claro. Se agregó
    `<meta name="color-scheme" content="light only">` +
    `<meta name="supported-color-schemes" content="light only">` y un bloque
    `<style>` en el `<head>` con reglas `[data-ogsc] ...! important` (el hook
    que usa Gmail para detectar modo oscuro) que reafirman los mismos colores
    del diseño original. Verificado reenviando el mail real y confirmado por
    el usuario en la app de Gmail.
  - **Pendiente, no depende del código** *(resuelto, ver bullet siguiente)*: el
    primer envío cayó en spam (normal para un remitente de prueba
    `onboarding@resend.dev` sin dominio propio verificado — sin SPF/DKIM/DMARC
    alineados a un dominio real, es esperable).
  - **Migración de Resend a Gmail SMTP** (PR #7, posterior al fix de
    `jose`/ESM de abajo): en producción, Resend en modo de prueba (sin dominio
    propio verificado) solo entregaba al dueño de la cuenta de Resend — se
    confirmó con un registro real que el mail nunca le llegó a otra persona
    del grupo (la novia del usuario). En vez de verificar un dominio propio en
    Resend, se cambió el envío al relay SMTP de Gmail (`src/lib/mailer.ts`,
    con `nodemailer`), que entrega a cualquier destinatario gratis (hasta
    ~500 emails/día) sin necesitar dominio propio. Variables nuevas:
    `GMAIL_USER` (cuenta remitente, con verificación en 2 pasos activada) y
    `GMAIL_APP_PASSWORD` (contraseña de aplicación de 16 caracteres) —
    reemplazan a las que usaba Resend (`RESEND_API_KEY`/`EMAIL_FROM`) en
    `.env.example` y en las env vars de Vercel. El resto de la infraestructura
    (Firebase Admin SDK para el link de verificación, plantilla HTML propia en
    `welcomeEmail.ts`) no cambió. Verificado en producción con destinatarios
    reales fuera de la cuenta del dueño.
  - **Bug encontrado y corregido en el primer registro real en producción**
    (PR #3 mergeado, cargadas las 5 env vars en Vercel): `/api/send-welcome-email`
    tiraba 500. El log real de Vercel mostraba `Error [ERR_REQUIRE_ESM]` al
    cargar `firebase-admin`. Costó dos vueltas:
    1. Primer intento (PR #4): se asumió que Turbopack estaba empaquetando
       `firebase-admin` dentro de la función serverless y rompiendo ahí; se
       agregó `serverExternalPackages: ["firebase-admin"]` en `next.config.ts`.
       No alcanzó — mismo error exacto después de mergear y volver a probar.
    2. Causa real (PR #5): `jose` (dependencia transitiva de `firebase-admin`
       vía `jwks-rsa`) pasó a ser un paquete **solo ESM** en sus versiones
       recientes (v5+), y `jwks-rsa@4.1.0` todavía lo importa con `require()`
       de forma síncrona — rompe en el runtime de funciones de Vercel (no en
       `next dev` local, que resuelve distinto). Fix: `overrides.jose =
       "4.15.5"` en `package.json` (última versión de `jose` con build CJS).
       El `serverExternalPackages` del intento anterior se dejó (no molesta).
    - Como el preview deploy de Vercel queda atrás de su propia protección
      (401 sin credenciales), cada intento se verificó mergeando a `main` y
      probando `POST /api/send-welcome-email` directo contra
      `https://msn-revival.vercel.app` con PowerShell — de bajo riesgo porque
      solo afecta ese endpoint nuevo, no el resto de la app.
    - **Verificado en producción real** después del segundo fix: `200 OK` y
      el usuario confirmó que llegó el mail. Cuenta de prueba
      (`fertestprod01@`/`axentia.consulting@gmail.com`, creada durante estas
      pruebas) borrada con el mismo patrón de script descartable + Admin SDK.

- **FASE 8 — PWA (manifest e iconos, adelanto parcial fuera de orden)**: PR #8
  (`62cc5f0`) generó `src/app/manifest.ts` (nombre, `display: standalone`,
  colores, iconos 192/512 servidos desde `src/app/manifest-icon/[size]/route.tsx`
  a partir del logo existente) y `src/app/apple-icon.tsx` (180x180 para iOS),
  más meta tags `appleWebApp`/`theme-color` en `src/app/layout.tsx`. El
  objetivo puntual era que "Agregar a pantalla de inicio" abra la app en modo
  standalone (sin barra de navegador), sin todavía tocar el resto de la fase
  (service worker, instalación real, pantalla de carga, push notifications).
  Este PR se mergeó entre FASE 6 y su documentación final, y quedó sin
  reflejar en CONTEXT.md/TASKS.md hasta ahora — no hubo un cierre formal de
  fase ni verificación end-to-end de "instalar como app" en un dispositivo
  real todavía; falta hacerlo cuando se retome FASE 8 completa.

- **FASE 7 — Animaciones de emoticonos y avatar por URL** (lo que quedaba de
  la fase; el pack de emoticonos y el rediseño retro ya estaban de un
  adelanto anterior). Decisiones (no vienen literal del spec):
  - **Animaciones**: cada emoticono (`src/components/Emoticon.tsx`) tiene su
    propio `@keyframes` en loop continuo mientras está en pantalla (`bob` para
    feliz/risa, `droop` para triste, `shake` para enfadado, `pop` para
    sorpresa, `wiggle` para lengua, `heartbeat` para el corazón), definidos en
    `globals.css` junto al resto de animaciones del proyecto (mismo patrón que
    `msn-shake` de Fase 5). El de guiño (`wink`) no anima la cara entera —ya
    tiene una pose fija asimétrica— sino que le agrega un parpadeo periódico
    solo al ojo abierto. Todas las reglas están dentro de
    `@media (prefers-reduced-motion: no-preference)` para respetar la
    preferencia de accesibilidad del sistema operativo.
  - **Avatar por URL, no subida de archivo**: se consultó explícitamente al
    usuario porque subir un archivo requiere Firebase Storage, y desde fines
    de 2024 Firebase exige el plan **Blaze** (pago por uso, con tarjeta) para
    poder usarlo — aunque el uso real quedaría dentro de la capa gratuita,
    igual requiere dar de alta la tarjeta, lo cual choca con "MVP gratuito
    primero". El usuario eligió en cambio que el usuario pegue la URL de una
    imagen ya alojada en otro lado, sin tocar el plan de Firebase ni agregar
    reglas de seguridad nuevas (es un campo de texto más en el mismo doc
    `users/{uid}` que el usuario ya puede editar libremente).
  - **Modelo de datos**: campo nuevo y opcional `avatarUrl` en `users/{uid}`
    (`avatarId` se mantiene siempre, como *fallback*). Si `avatarUrl` está
    presente y la imagen carga, tiene prioridad sobre el ícono preseleccionado
    en todos los lugares donde se muestra un avatar.
  - **Validación** (`src/app/perfil/page.tsx`): al guardar, la URL debe
    empezar con `http://`, `https://` o `data:image/` (permite pegar una
    imagen embebida en base64) y no superar 2000 caracteres — un límite
    generoso para no inflar el documento de Firestore (que tiene un máximo de
    1 MiB) con una imagen embebida grande.
  - **Componente compartido `src/components/Avatar.tsx`**: centraliza la
    lógica de "mostrar la URL si hay y carga, si no el ícono preseleccionado"
    para no repetirla en los ~9 lugares que ya mostraban un avatar (fila de
    contacto, ventana de chat, popup de perfil, los 4 toasts de notificación,
    la ventana de contactos y los resultados de búsqueda). Si la imagen no
    carga (`onError`), cae al ícono preseleccionado en vez de dejar un ícono
    roto — y vuelve a intentar solo si la URL cambia a una distinta (bug
    encontrado y corregido durante la verificación: el estado interno de "esta
    URL falló" guardaba un booleano fijo en vez de la URL puntual que había
    fallado, así que una vez que una imagen no cargaba, el componente quedaba
    "roto" para siempre así el usuario pegara después una URL válida —
    se corrigió guardando la URL que falló y comparándola contra la actual).
  - Verificado en local (`npm run dev`, cuenta de prueba `fase6ana`): vista
    previa en vivo al pegar una URL válida, error inline al guardar una URL
    con esquema no soportado (`ftp://`), el avatar personalizado se ve en la
    ventana de contactos, y las animaciones de los 8 emoticonos confirmadas
    programáticamente (cada `<svg>` tiene su `animation-name` aplicado, y el
    guiño tiene el parpadeo en el ojo). No se verificó en producción todavía.

- **FASE 7 — Ampliación del pack de emoticonos** (a pedido del usuario, que
  mostró una captura del pack original de Windows Live Messenger como
  referencia de qué expresiones/shortcodes cubrir). Decisión clave: esa
  captura es el pack **original de Microsoft** (protegido) — la regla del
  proyecto ("todo el arte/sonido retro debe ser propio", ya aplicada con los
  sonidos en FASE 5) exige diseño propio, así que se dibujaron 14 caras
  **nuevas y originales** que cubren expresiones equivalentes bajo los mismos
  shortcodes convencionales, sin calcar el arte de Microsoft:
  `confused` (`:S`), `blush` (`:$`), `crying` (`:'(`), `neutral` (`:|`),
  `angel` (`(A)`), `cool` (`(H)`, con lentes de sol), `nerd` (`8-|`, con
  anteojos redondos), `sick` (`+o(`, cara verdosa con ojos en X), `party`
  (`<:o)`, gorro de fiesta), `sleepy` (`|-)`), `thinking` (`*-)`),
  `tonguetied` (`:-#`, boca "cerrada con cierre"), `kiss` (`:-*`) y
  `skeptical` (`^o)`, ceja levantada). Cada shortcode tiene también una
  variante sin guion (ej. `:S`/`:-S`) para mayor compatibilidad.
  - Dado el tamaño (el pack original tiene ~32 expresiones/íconos que
    todavía no existían acá, casi la mitad son objetos —gato, perro, luna,
    rosa, reloj, abrazo— no caras), se consultó con el usuario y se decidió
    dividir el trabajo: esta tanda cubre solo las **caras** que faltaban
    (reutilizan la estructura `Face()` ya existente); los íconos de
    objetos/símbolos quedan para una segunda pasada aparte, porque necesitan
    arte bien distinto (no encajan en el wrapper de cara circular) y así no
    se sacrifica calidad visual por apurar un lote enorme de una sola vez.
  - Se consolidaron a propósito un par de expresiones del original que eran
    casi idénticas entre sí (ej. dos variantes de "nerd/sorprendido con
    anteojos") en un único ícono, para no terminar con caras redundantes que
    se vean casi iguales.
  - `neutral` y `tonguetied` quedaron **sin animación** a propósito (encajan
    con "serio"/"silencio" — el resto de las caras nuevas sí tienen su loop
    en CSS, reusando las animaciones existentes de Fase 7 con duraciones
    distintas, más dos nuevas: `emoticon-tilt` —ceja/duda— y
    `emoticon-woozy` —mareo—).
  - Verificado en local: los 22 emoticonos (8 + 14) renderizan sin errores en
    el selector y en un mensaje real de chat (cuenta `fase6ana`, contacto
    `fase6bruno` desconectado). No se verificó en producción todavía.
  - **Corrección posterior, a pedido del usuario tras ver los emoticonos en
    pantalla**: 3 de las 14 caras nuevas no se entendían bien a tamaño real
    (`cool` — la barra plana no se leía como lentes de sol; `party` — el
    gorro apuntando derecho hacia arriba se confundía con una lengua; `kiss`
    — la boca ovalada no se leía como un beso). Se rediseñaron: `cool` ahora
    tiene dos lentes oscuros con puente y patillas + reflejo; `party` tiene
    el gorro inclinado ~18° con pompón, tira de confeti y dos lunares de
    color (para no ser una forma vertical ambigua); `kiss` tiene una boca de
    labios rojos con arco de cupido en vez del óvalo. Verificado ampliando
    los `<svg>` a 80px en el navegador antes de confirmar que se leían bien.

- **FASE 7 — Ventanas flotantes de verdad (revierte una decisión explícita de
  FASE 4) + barra de desplazamiento azul estilo XP**, a pedido del usuario.
  - **Ventanas flotantes**: en FASE 4 se había decidido explícitamente un
    "layout de panel simplificado... sin drag/resize/minimize/taskbar tipo
    SO" (ver más arriba) para no complicar el MVP. El usuario pidió ahora
    que tanto la ventana de Contactos como cada ventana de Chat se puedan
    mover libremente por la pantalla, como ventanas de escritorio reales —
    se implementó **solo el arrastre** (no resize ni minimizar/maximizar
    reales de tamaño, que siguen sin pedirse). Nuevo hook compartido
    `src/hooks/useDraggable.ts`: usa **Pointer Events** (no mouse/touch por
    separado, para andar igual con mouse y con el dedo) y
    `setPointerCapture` en vez de agregar/sacar listeners globales en
    `document` a mano. Antes del primer arrastre, la ventana sigue en el
    flujo normal (centrada por su contenedor con flexbox, o apilada abajo a
    la derecha en el caso del chat); al primer arrastre "se despega" a
    `position: fixed` en el punto exacto donde ya estaba, y desde ahí sigue
    al puntero (con los bordes de la ventana clamped para no poder arrastrarla
    fuera de la pantalla).
    - `RetroWindow` (usado por Contactos y Perfil) suma una prop opcional
      `draggable` (default `false`, para no cambiar el comportamiento de
      Perfil ni de popups chicos como `ProfilePopup` que no la piden) — solo
      la ventana de Contactos la activa.
    - `ChatWindow` no usa `RetroWindow` (tiene su propia barra de título a
      mano), así que se le agregó el arrastre directamente.
    - **Traer al frente (z-index) al enfocar**: como ahora las ventanas de
      chat se pueden superponer libremente entre sí, `ChatContext` suma
      `zIndexOf(uid)` (un contador que se incrementa cada vez que se abre o
      se hace foco en un chat) para que la última tocada quede siempre
      arriba. La ventana de Contactos no compite por ese frente — queda
      siempre en un z-index fijo por debajo de cualquier chat (mismo criterio
      que ya existía: los chats siempre flotan sobre la ventana principal).
    - **Bug encontrado y corregido durante la verificación**: al arrastrar
      desde la barra de título, `setPointerCapture` ahí redirige los eventos
      de puntero subsiguientes a ese mismo elemento — lo cual también se
      comía el `click` de los botones de minimizar/cerrar (que están
      *dentro* de esa misma barra), dejándolos sin funcionar. Se corrigió
      con `onPointerDown` + `stopPropagation()` en el contenedor de esos
      botones, para que el arrastre nunca arranque al hacer click ahí.
    - No se tocó el layout de PWA/responsive (FASE 8) todavía — al ser
      arrastre libre por mouse/touch, en pantallas chicas una ventana movida
      podría quedar en una posición incómoda; se dejó así a propósito porque
      el pedido puntual era la ventana de escritorio, y la revisión de
      responsive es tarea propia de FASE 8.
  - **Barra de desplazamiento**: `.retro-scroll` (definida en `globals.css`,
    ya existía desde antes) tenía colores beige/tostado (tema "Luna" clásico
    de XP) que no combinaban con la paleta azul del resto de la app, y los
    botones de scroll no tenían flecha (cuadrados lisos). Se rediseñó en la
    misma paleta azul de `src/lib/theme.ts` con gradientes 3D en la barra y
    los botones, y flechas dibujadas con un `data:image/svg+xml` inline (sin
    depender de ningún ícono de sistema). Es una recreación del **look & feel
    genérico** de la barra de desplazamiento de Windows XP (colores, bisel,
    flechas) — a diferencia de los emoticonos, esto no es un asset con
    diseño de personaje/marca específico de Microsoft, es el estilo visual
    estándar de una barra de scroll de esa época, así que no aplica la misma
    restricción de copyright.
  - Verificado en el navegador (Browser pane): ambas ventanas se arrastran
    libremente con el mouse, quedan clampeadas dentro de la pantalla, el
    z-index de foco funciona (una ventana de chat arrastrada sobre la otra
    queda al frente; la ventana de Contactos arrastrada sobre un chat queda
    detrás), y minimizar/cerrar siguen funcionando tras el fix del bug de
    arriba. No se verificó en producción ni en touch/mobile real todavía.

- **FASE 8 — PWA base** (rama `feat/fase-8-pwa-base`). Se consultó el alcance con
  el usuario y se decidió hacer **primero la PWA base y dejar Web Push como
  sub-fase aparte**, para no mezclar infraestructura nueva (VAPID, suscripciones,
  endpoint de envío) con lo básico. Decisiones (no vienen literal del spec):
  - **Service worker a mano en `public/sw.js`**, sin Serwist/next-pwa: la app es
    tiempo real (Firestore/RTDB/Auth) y una caché agresiva rompería más de lo que
    ayuda. Solo cachea `/_next/static/*` (cache-first, son archivos con hash),
    sonidos e iconos (stale-while-revalidate) y ofrece `public/offline.html`
    cuando falla una navegación. **Nunca** intercepta otros orígenes (Firebase),
    `/api/*` ni métodos distintos de GET. Al tocar la lógica o `PRECACHE`, subir
    `VERSION` en `sw.js` para que `activate` borre las cachés viejas.
  - `next.config.ts` sirve `/sw.js` con `Cache-Control: no-cache, no-store` (si el
    SW quedara cacheado, los usuarios no recibirían versiones nuevas).
  - `ServiceWorkerRegister` registra el SW **solo en producción**; en desarrollo
    desregistra cualquiera previo, para que una prueba con `npm run start` no
    tape los cambios de `npm run dev`. Por eso probar el SW exige `build` +
    `start` (se agregó `msn-revival-prod` a `.claude/launch.json`).
  - `InstallPrompt`: usa `beforeinstallprompt` en Chromium y una guía de texto en
    iOS (donde ese evento no existe). Se descarta con la × y se recuerda en
    `localStorage` (`msn-install-dismissed`). No aparece si ya corre instalada.
  - `SplashScreen` reemplaza los "Cargando..." de `/`, `/contactos` y `/perfil`;
    usa el mismo fondo que `background_color` del manifest. No se generaron
    imágenes de splash de iOS por tamaño de pantalla (son decenas de PNG): en
    iOS se ve el fondo del manifest y luego este splash.
  - **Responsive**: `ChatManager` apila los chats en vertical y a ancho completo
    bajo `sm` (en fila y `w-[300px]` desde `sm`, como antes); la altura de
    Contactos pasó de `560px` fijo a `min(560px, 100dvh - 6rem)` con mínimo de
    320px; `viewportFit: "cover"` + `env(safe-area-inset-*)` para el notch de iOS.
    De paso `<html lang>` pasó de `en` a `es`.
  - **Verificado** (build de producción con `next start`, Browser pane): SW
    registrado y `activated`, precaché cargada, cabeceras de `/sw.js` correctas,
    y con el servidor **apagado** una navegación a `/contactos` muestra
    `offline.html`. En viewport 375x812: el banner de instalación se ve, no hay
    scroll horizontal y descartarlo persiste tras recargar.
  - **Responsive de chats verificado con sesión iniciada** (Browser pane, 375x812):
    con dos chats abiertos el primer intento dejaba el de abajo cortado (2 x 459
    px no caben en 812), así que la lista de mensajes pasó a `h-[20dvh]
    min-h-[110px]` en móvil (`sm:h-[220px]` como antes). Con el ajuste ambos
    caben completos (caja de texto y botón visibles), sin scroll horizontal; con
    3 o más el contenedor hace scroll vertical. En escritorio no cambió nada
    (chats en fila, 300px, lista de 220px).
  - **No verificado todavía**: la rama iOS del banner y la instalación real en
    iPhone/Android/desktop. Web Push sigue pendiente.

- **FASE 8 — Web Push** (rama `feat/fase-8-web-push`). Notifica mensaje nuevo,
  zumbido y solicitud de amistad aunque la app esté cerrada. Decisiones (no vienen
  literal del spec):
  - **Sin Cloud Functions (plan Spark)**: el push lo dispara el **cliente
    remitente** llamando a `POST /api/push/send` (Vercel) justo después de enviar.
    Como cualquier amigo autenticado puede llamar a ese endpoint, el servidor
    **no confía en el body**: solo recibe `type` y `toUid`; verifica con el Admin
    SDK la relación (mensaje/zumbido → `friendships` aceptada; solicitud →
    pendiente y creada por el que llama), toma el **texto real del mensaje desde
    Firestore** (solo si es el último, enviado por el que llama y de hace <60 s),
    marca `pushedAt` en una transacción (un push por mensaje aunque se repita la
    llamada) y limita el zumbido a 1 cada 5 s y la solicitud a 1 por minuto
    (`pushThrottle`, también transacción, vale entre instancias serverless).
  - **Suscripciones en `pushDevices/{sha256(endpoint)}`** (`uid`, `endpoint`,
    `keys`), escritas y leídas **solo con el Admin SDK**. Firestore deniega por
    defecto lo que no tiene regla, así que **no se tocó ninguna regla de la
    consola**. El id por hash del endpoint garantiza que un dispositivo nunca
    quede asociado a dos usuarios a la vez. `/api/push/subscribe` solo acepta
    endpoints de Google/Mozilla/Apple/Microsoft (allowlist), porque el servidor
    hace un POST a esa URL y aceptar cualquiera sería un SSRF.
  - **Preferencias**: el servidor respeta `notifyNewMessage`/`notifyNudge`/
    `notifyFriendRequest` del destinatario (los mismos toggles que los avisos
    dentro de la app; solo se silencia si están explícitamente en `false`).
  - **Service worker** (`public/sw.js`): si hay una ventana de la app **visible**
    no muestra nada (ya salen el toast y el sonido); en Safari/iOS sí muestra
    siempre, porque Apple revoca la suscripción si se omite una notificación. El
    clic enfoca la app abierta o abre `/contactos`.
  - **La suscripción es del navegador, no de la cuenta** — dos problemas reales
    encontrados en la verificación y corregidos:
    1. Si se cambia de usuario sin "Cerrar sesión" desde la app, el servidor
       seguía asociando el dispositivo al usuario anterior (el envío daba
       `sent: 0`). `PushSync` (manager en el layout) re-registra la suscripción
       existente a nombre del usuario actual en cada inicio de sesión. Además
       "Cerrar sesión" ahora da de baja el dispositivo (`disablePush`).
    2. Una suscripción creada con **otra clave VAPID** (p. ej. tras regenerar las
       claves) hace que FCM rechace los envíos con **403**. `ensureSubscription`
       compara la clave de la suscripción con la pública actual y la reemplaza
       (sin volver a pedir permiso). Verificado forzando una suscripción con una
       clave distinta: tras recargar quedó con la clave correcta.
  - **Variables nuevas**: `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`
    (secreta), `VAPID_SUBJECT` (`mailto:`). Sin ellas el push queda desactivado y
    el resto de la app funciona igual. **Para producción hay que cargarlas en
    Vercel** (la privada como "Sensitive"). Par de claves generado por el usuario
    con `npx web-push generate-vapid-keys`.
  - **Verificado en local** (build de producción; receptor = Chrome real con
    `fase6bruno`, remitente = Fernando en el Browser pane): mensaje y zumbido
    llegan con el nombre del remitente, el texto y su `tag`, con la pestaña del
    receptor oculta; con la pestaña visible se suprime; el toggle apagado
    responde `silenciado` y no envía. Rechazos comprobados: sin token o con token
    falso → 401; repetir la misma petición → `ya enviado`; solicitud a un amigo ya
    aceptado, mensaje a un uid sin relación → 403; a uno mismo o tipo inválido →
    400; dos zumbidos seguidos → `demasiado seguido`.
  - **No verificado todavía**: el envío de solicitud de amistad de punta a punta
    (solo sus rechazos, no el camino feliz), el clic sobre la notificación, Safari/
    iPhone (requiere la app instalada), Android, y **producción (Vercel)**.
    Limitación conocida: el push de zumbido solo tiene el límite de 5 s por par,
    no verifica que el zumbido exista en Realtime Database.

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
- Email de bienvenida/verificación: **verificado de punta a punta en producción**
  (`https://msn-revival.vercel.app`), incluyendo el fix del bug de `jose`/ESM y
  la migración de Resend a Gmail SMTP (ver detalle arriba). El límite de
  Gmail SMTP (~500 emails/día) es de sobra para un grupo cerrado de amigos;
  sin dominio propio verificado sigue existiendo cierto riesgo de que caiga en
  spam, pero ya no bloquea la entrega a destinatarios reales (que era el
  problema con Resend) — no hay acción pendiente salvo que se quiera mejorar
  deliverability en el futuro.
- FASE 6: **verificada de punta a punta en local y en producción**
  (`https://msn-revival.vercel.app`, PR #9 mergeado). Web Push queda para
  FASE 8 (ver detalle arriba). Nada pendiente en manos del usuario para esta
  fase.
- FASE 8: manifest + iconos (PR #8) mergeados pero sin verificar todavía
  "Agregar a pantalla de inicio" en un dispositivo real (iPhone/Android). No
  es urgente porque el resto de la fase (service worker, push) sigue sin
  empezar; conviene probar la instalación real recién cuando se retome la
  fase completa.
- FASE 7: **verificada en local**, falta verificar en producción cuando se
  haga el próximo deploy. Nada más pendiente en manos del usuario para esta
  fase (avatar por URL fue una decisión explícita del usuario para no
  requerir el plan Blaze de Firebase, ver detalle arriba).

## Auditoría (2026-09-17) — hallazgos y seguimiento

Auditoría completa del proyecto a pedido del usuario. `lint` + `tsc --noEmit` +
`build` en verde, sin secretos filtrados en el repo ni en el historial de git,
sin `dangerouslySetInnerHTML`. Lo que se corrigió en el momento (rama
`chore/auditoria-fixes`) y lo que queda pendiente por ser más complejo:

- **Corregido**: nota desactualizada sobre Resend en este archivo (ver arriba).
- **Corregido**: `/api/send-welcome-email` no tenía autenticación — cualquiera
  podía mandar un POST con cualquier email y disparar el envío usando la
  cuota de Gmail del proyecto (además de servir de oráculo para saber qué
  emails tienen cuenta). Ahora exige el ID token de Firebase Auth del usuario
  recién creado (`Authorization: Bearer`) y el `email` se toma del token ya
  verificado server-side (`verifyIdToken`), nunca del body — el cliente ya no
  puede pedir el envío a un email arbitrario.
- **Corregido**: sin límite de longitud en los mensajes de chat. Se agregó un
  `maxLength` de 2000 caracteres en el textarea y en `sendMessage()`.
- **Corregido**: sin `robots: { index: false }` en el metadata — para una app
  privada de un grupo cerrado de amigos no tiene sentido que Google la indexe.
- **Hecho (2026-09-20, rama `chore/reglas-firebase`)**: las reglas de seguridad
  ya están **versionadas en el repo**, volcadas desde lo que está realmente
  publicado (no reconstruidas de los planes de fase, que están desactualizados):
  `firestore.rules`, `firestore.indexes.json` (vacío: no hay índices
  compuestos), `database.rules.json`, `firebase.json` y `.firebaserc`
  (proyecto `msn-revival-df50c`, su ID no es secreto).
  - **Cómo se obtuvieron**: Firestore con `firebase init firestore` (descarga las
    reglas publicadas si no existe el archivo local; es interactivo, lo corrió el
    usuario, y se respondió **no** a instalar las "agent skills" de Firebase); Realtime
    Database con `firebase database:get /.settings/rules` (en Git Bash hace falta
    `MSYS_NO_PATHCONV=1`, si no convierte el `/` inicial en una ruta de Windows).
  - **Flujo de ahora en más**: editar los archivos de reglas → `npm run
    rules:check` (dry-run: compila y valida contra el proyecto, **no publica**) →
    `npm run rules:deploy` (publica; requiere `firebase login`) — en vez de
    pegar a mano en la consola. El archivo del repo pasa a ser la fuente de
    verdad: no editar en la consola sin volcar el cambio acá.
  - Confirmado al leerlas: incluyen el fix de FASE 4 (`allow write` unificado +
    `isFriendshipAccepted`/`isFriendshipParticipant`) y **no hay regla para
    `pushDevices` ni `pushThrottle`**, así que el cliente no puede tocarlas (solo
    el Admin SDK, como se diseñó para Web Push).
  - **Observaciones de seguridad al revisarlas (no se cambiaron: esta tarea es
    solo versionar lo existente, sin alterar comportamiento)**:
    1. `users`: `allow read` a **cualquier usuario autenticado** expone el
       `email` (y el resto del perfil) de todos. Si el registro está abierto a
       cualquiera que conozca la URL, cualquiera puede listar los emails del
       grupo. Mitigar moviendo el email a una subcolección/doc privado, o
       cerrando el registro.
    2. `messages`: no valida el largo de `text` (el tope de 2000 caracteres solo
       existe en el cliente) ni que `createdAt == request.time`, así que un
       cliente modificado puede mandar mensajes enormes o con fecha falsa.
    3. `usernames`: cualquier usuario autenticado puede crear el doc de
       cualquier username libre sin crear su cuenta (squatting de nombres).
  - **Corrección de esos 3 hallazgos (rama `fix/reglas-seguridad`) — en el repo,
    NO desplegada todavía** (las reglas publicadas siguen siendo las anteriores):
    1. **Email**: las reglas no pueden ocultar un campo, así que se atacó el dato.
       El registro ya no guarda `email` en `users/{uid}`; el Perfil muestra el de
       Firebase Auth (`user.email`), que era lo único que lo usaba. Las reglas
       rechazan **crear** un perfil con `email` y **cambiar** ese campo en un
       `update` (con `diff().affectedKeys()`, no prohibiendo el campo: así los
       perfiles viejos que aún lo conserven pueden seguir guardando, y el orden
       entre migración y despliegue de reglas no importa). Los docs existentes
       siguen teniendo el campo hasta correr una **migración con el Admin SDK**
       que lo borre: script en `scripts/migrate-remove-email.mjs` (dry-run por
       defecto, cuenta cuántos perfiles tienen el campo sin tocar nada; con
       `--apply` lo borra en tandas de 400). **Escrito pero sin ejecutar todavía**
       — usa las credenciales reales de `.env.local` contra el Firebase de
       producción (no hay Firebase de prueba separado), así que lo tiene que
       correr el usuario (o dar el visto bueno explícito para correrlo) después
       de desplegar esta rama, no antes.
    2. **Mensajes**: `create` exige exactamente `senderId`/`text`/`createdAt`,
       `text` string de 1 a 2000 caracteres (mismo tope que `MAX_MESSAGE_LENGTH`
       de `src/lib/chat.ts`) y `createdAt == request.time`.
    3. **Usernames**: `usernames/{x}` solo se puede crear si en el mismo batch se
       crea `users/{uid}` con `usernameLower == x` (`getAfter()`), y a la inversa
       `users` exige que exista la reserva `usernames/{usernameLower}` a nombre
       del mismo uid (esto cierra además la variante de dos perfiles con el
       mismo username, que el hallazgo original no mencionaba). El registro ya
       escribía ambos en un `writeBatch`, no cambia.
  - **Orden obligatorio de despliegue**: (1) mergear y desplegar la app (para que
    el registro deje de escribir `email`); (2) migración que borra `email`;
    (3) `npm run rules:deploy`. Si las reglas salieran antes que la app, un
    registro nuevo desde el cliente viejo fallaría.
  - **Verificación**: `npm run rules:check` (compila) y el Perfil sigue mostrando
    el email desde Auth. **Las reglas nuevas no se probaron en ejecución**: no hay
    Java para el emulador de Firestore, y compilar solo prueba la sintaxis, no que
    dejen pasar los casos buenos y bloqueen los malos.
- **Hecho (2026-09-20, rama `chore/tests-funciones-puras`)**: tests
  automatizados de las funciones puras, con **Vitest** (`npm run test`, 46 tests
  en 7 archivos junto a cada módulo, `src/lib/*.test.ts[x]`): `getFriendshipId`/
  `getOtherUid`, `getStatus`/`getVisibleStatus`, `getAvatar`, `formatLastSeen`
  (con reloj falso), `renderWithEmoticons` (incluye que el catálogo no repita
  shortcodes), `escapeHtml`/plantilla del email (que no deje pasar HTML del
  nombre) y `isAllowedEndpoint`/`deviceIdFor` del push (la defensa contra SSRF).
  - Se fijó **`vitest@3`**, no la última (v5): la v5 pide `@types/node` >= 22 y
    el proyecto usa `^20`; se prefirió no subir los tipos de Node solo por esto.
  - Los módulos que importan el cliente de Firebase (`presence.ts`) o el Admin SDK
    (`pushServer.ts`) se prueban mockeando esos imports (`vi.mock`), porque en
    los tests no existen las variables de entorno con las que se inicializan.
  - Se exportó `escapeHtml` de `welcomeEmail.ts` (antes era privada) para poder
    probarla.
  - Se comprobó que los tests **detectan fallos** rompiendo el código a
    propósito. Eso destapó un hueco: quitar el ancla `(^|\.)` de la allowlist de
    push no fallaba ningún test (dejaba pasar `evilfcm.googleapis.com`); se
    agregó ese caso y ahora sí falla.
  - **Sigue sin cobertura automática** todo lo que depende de Firebase o del
    navegador (reglas de seguridad, listeners en tiempo real, componentes, el
    service worker, los endpoints `/api/push/*`): eso sigue siendo verificación
    manual con cuentas de prueba, como en cada fase.
- **Hecho (2026-09-20)**: limpieza de las ramas y el worktree acumulados de
  sesiones en paralelo. Antes de borrar cada una se comprobó contra `main`
  (`git merge-base --is-ancestor` para las mergeadas y `git cherry` para las que
  `main` incorporó con otro hash): todas estaban ya en `main` por contenido, salvo
  dos casos — `claude/zen-lamport-c934a8` (un commit vacío que solo redisparaba
  un deploy de Vercel) y `docs/context-fix-contactos-redirect`, cuya única
  información útil (la nota sobre las env vars de Vercel para Preview, ver la
  sección de FASE 2) se rescató a este archivo antes de borrarla. También se
  quitó el worktree `.claude/worktrees/zen-lamport-c934a8` (estaba limpio). Hoy
  el repo solo tiene `main` (más las ramas de trabajo que se abran).
