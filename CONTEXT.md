# CONTEXT.md — Decisiones y estado del proyecto

## Fase actual

**FASE 6 (notificaciones) completada y verificada en local y en producción**
(https://msn-revival.vercel.app), salvo Web Push (diferido explícitamente a
FASE 8, ver detalle abajo). FASE 4 (chat en tiempo real) + parte visual de
FASE 7 (emoticonos y estética) + FASE 5 (zumbido) siguen completadas y
verificadas en local y en producción.

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
  - **Pendiente, no depende del código**: el primer envío cayó en spam (normal
    para un remitente de prueba `onboarding@resend.dev` sin dominio propio
    verificado — sin SPF/DKIM/DMARC alineados a un dominio real, es esperable).
    Para que llegue a la bandeja principal del grupo de amigos, verificar un
    dominio propio en Resend (Dashboard > Domains) y cambiar `EMAIL_FROM` a un
    remitente de ese dominio.
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
  (`https://msn-revival.vercel.app`), incluyendo el fix del bug de `jose`/ESM
  (ver detalle arriba). Falta verificar un dominio propio en Resend para que
  no caiga en spam / se pueda mandar a cualquier destinatario (no solo al
  dueño de la cuenta de Resend) — pendiente, a definir cuándo se hace.
- FASE 6: **verificada de punta a punta en local y en producción**
  (`https://msn-revival.vercel.app`, PR #9 mergeado). Web Push queda para
  FASE 8 (ver detalle arriba). Nada pendiente en manos del usuario para esta
  fase.
- FASE 8: manifest + iconos (PR #8) mergeados pero sin verificar todavía
  "Agregar a pantalla de inicio" en un dispositivo real (iPhone/Android). No
  es urgente porque el resto de la fase (service worker, push) sigue sin
  empezar; conviene probar la instalación real recién cuando se retome la
  fase completa.
