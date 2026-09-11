# Proyecto: MSN Revival — MVP de mensajería instantánea retro

## 1. Visión del proyecto

Crear una aplicación privada de mensajería instantánea para un grupo de amigos, inspirada fuertemente en la experiencia visual y funcional de MSN Messenger/Windows Live Messenger de los años 2000.

El objetivo inicial NO es competir con WhatsApp ni construir una plataforma comercial. El objetivo es:

1. Recuperar la experiencia social de MSN.
2. Crear un MVP funcional y gratuito.
3. Instalarlo/compartirlo con amigos.
4. Probar estabilidad, usabilidad y aceptación.
5. Recoger feedback.
6. Solo después decidir si merece la pena escalar.

La aplicación debe sentirse como MSN desde el primer momento: lista de contactos, estados, avatar, mensajes instantáneos, sonidos, zumbidos, emoticonos, notificaciones de conexión, mensajes personales y estética retro.

> Importante: la interfaz puede recrear la estética y experiencia retro de MSN, pero no se deben reutilizar logos, iconos, sonidos, imágenes, emoticonos propietarios ni otros assets originales de Microsoft. Crear assets propios inspirados en la época.

---

# 2. Nombre provisional

## MSN Revival

Nombre interno del proyecto.

El nombre definitivo se decidirá posteriormente.

Posibles nombres futuros:

- Revival
- Messenger Retro
- RetroChat
- Ping
- Buddy
- Connect
- Nudge
- Retro Messenger

Durante el MVP se puede utilizar un nombre provisional sin invertir tiempo excesivo en branding.

---

# 3. Objetivo del MVP

El MVP debe permitir que un grupo pequeño de amigos pueda:

- Crear una cuenta.
- Iniciar sesión.
- Crear su perfil.
- Elegir avatar.
- Añadir amigos.
- Aceptar/rechazar solicitudes.
- Ver quién está conectado.
- Ver estados.
- Enviar mensajes instantáneos.
- Recibir mensajes en tiempo real.
- Recibir notificación cuando un amigo se conecta.
- Desactivar las notificaciones de conexión.
- Cambiar mensaje personal.
- Mostrar qué está haciendo/escuchando el usuario manualmente.
- Utilizar emoticonos.
- Enviar zumbidos.
- Recibir zumbidos.
- Escuchar sonidos retro propios.
- Recibir notificaciones de nuevos mensajes.
- Instalar la aplicación como PWA.
- Utilizarla desde móvil y ordenador.

No implementar todavía:

- Videollamadas.
- Llamadas de voz.
- IA.
- Marketplace.
- Pagos.
- Publicidad.
- Algoritmos sociales.
- Canales públicos.
- Moderación avanzada.
- Integraciones complejas con Spotify.
- Infraestructura empresarial.

---

# 4. Principio fundamental del producto

La aplicación debe priorizar:

## PRESENCIA

MSN tenía algo que las aplicaciones modernas han perdido:

> Saber quién está conectado.

Por ello el estado de presencia será una funcionalidad central, no un detalle secundario.

Estados:

- 🟢 Disponible
- 🟡 Ausente
- 🔴 No molestar
- ⚫ Invisible
- ⚪ Desconectado

Además:

- Última conexión.
- Mensaje personal.
- Actividad manual.
- Indicador de "escribiendo...".

---

# 5. Funcionalidad crítica: "X se ha conectado"

Esta función es OBLIGATORIA para el MVP.

Cuando un amigo pase de:

`offline → online`

la aplicación debe generar un evento de presencia.

Ejemplo:

> 🟢 Juan se ha conectado.

La experiencia debe recordar a MSN:

- Sonido retro breve.
- Notificación visual.
- Opcionalmente notificación del sistema.
- Animación discreta.
- El evento aparece temporalmente en la interfaz.

Ejemplo:

```text
┌──────────────────────────────┐
│ 🟢 Juan se ha conectado      │
│                              │
│ ¡Está disponible para hablar!│
└──────────────────────────────┘
```

## Configuración

Debe existir:

### "Avisarme cuando mis amigos se conecten"

`ON / OFF`

Por defecto:

**ON**

El usuario puede desactivarlo.

También debe existir posteriormente la posibilidad de configurar:

- Todos los amigos.
- Solo favoritos.
- Ninguno.

Para el MVP basta con:

`ON / OFF`

## Importante

No enviar una notificación cada vez que se actualice la página o se reconecte brevemente.

El sistema debe detectar transiciones reales de presencia:

```text
offline
   ↓
online
   ↓
evento "friend_online"
```

Debe existir tolerancia frente a desconexiones momentáneas.

---

# 6. Experiencia visual

La interfaz debe tener una estética claramente inspirada en MSN Messenger clásico.

Características:

- Ventanas compactas.
- Bordes redondeados.
- Gradientes suaves.
- Azul/celeste como color predominante.
- Blanco.
- Verde para online.
- Amarillo para ausente.
- Rojo para no molestar.
- Sombras suaves.
- Avatar circular o ligeramente redondeado.
- Tipografía similar a interfaces Windows de la época.
- Iconografía retro propia.
- Pequeñas animaciones.
- Sonidos opcionales.

La aplicación debe evitar parecer una aplicación moderna genérica con un simple "tema azul".

Debe parecer deliberadamente un messenger de principios de los 2000 adaptado a pantallas modernas.

---

# 7. Pantalla principal

Estructura conceptual:

```text
┌─────────────────────────────────────────────┐
│  MSN Revival                                │
├─────────────────────────────────────────────┤
│                                             │
│  [AVATAR]  Fernando                         │
│            🟢 Disponible                    │
│            "Trabajando... ☕"                │
│                                             │
├─────────────────────────────────────────────┤
│ 🔍 Buscar contactos                         │
├─────────────────────────────────────────────┤
│                                             │
│ 🟢 Amigos                                   │
│                                             │
│ [A] Juan                                    │
│     🟢 Disponible                           │
│     "¿Quién juega hoy?"                     │
│                                             │
│ [M] Marcos                                  │
│     🟡 Ausente                              │
│                                             │
│ [L] Laura                                   │
│     ⚫ Invisible                             │
│                                             │
├─────────────────────────────────────────────┤
│ ➕ Agregar amigo                             │
│ ⚙ Configuración                             │
└─────────────────────────────────────────────┘
```

En móvil la lista debe adaptarse correctamente.

---

# 8. Perfil

Cada usuario tendrá:

- Nombre visible.
- Username único.
- Avatar.
- Estado.
- Mensaje personal.
- Actividad.
- Última conexión.
- Lista de amigos.
- Configuración de privacidad.

Ejemplo:

```text
Fernando

🟢 Disponible

"Escuchando música 🎵"

🎵 Daft Punk - One More Time
```

La canción puede introducirse manualmente en el MVP.

No implementar todavía integración automática con Spotify.

---

# 9. Agregar amigos

Flujo:

```text
Agregar amigo
      ↓
Buscar username
      ↓
Enviar solicitud
      ↓
Usuario recibe solicitud
      ↓
Aceptar / Rechazar
      ↓
Se crea amistad
```

No permitir que cualquier usuario pueda enviar mensajes libremente a cualquier otro.

Solo amigos podrán iniciar conversaciones en el MVP.

---

# 10. Chat individual

La conversación debe abrirse en una ventana visual inspirada en MSN.

```text
┌─────────────────────────────────────────────┐
│ 💬 Juan                         🟢           │
├─────────────────────────────────────────────┤
│                                             │
│ Juan                                         │
│ ¿Qué haces?                                 │
│                                             │
│ Fernando                                    │
│ Probando nuestro MSN 😂                     │
│                                             │
│ Juan                                        │
│ jajajaj                                     │
│                                             │
├─────────────────────────────────────────────┤
│ 😊  📎  📳                                   │
│                                             │
│ Escribe un mensaje...                [➤]   │
└─────────────────────────────────────────────┘
```

Funciones MVP:

- Texto.
- Emojis.
- Emoticonos propios.
- Indicador "escribiendo...".
- Timestamp.
- Estado de entrega.
- Zumbido.
- Sonido.
- Historial.

---

# 11. Zumbido / Nudge

Función esencial.

Botón:

`📳 Zumbido`

Al utilizarlo:

1. Enviar evento de zumbido.
2. Mostrar aviso.
3. Hacer vibrar/mover ligeramente la ventana de chat.
4. Reproducir sonido retro propio.
5. Mostrar:

> Fernando te ha enviado un zumbido.

Debe existir un cooldown para evitar spam.

Ejemplo:

- Máximo 1 zumbido cada 5 segundos por conversación.

---

# 12. Emoticonos

Crear un conjunto propio de emoticonos retro.

No copiar los originales de Microsoft.

MVP:

- Felicidad.
- Risa.
- Tristeza.
- Enfado.
- Guiño.
- Sorpresa.
- Amor.
- Pulgar arriba.
- Llanto.
- Fiesta.

El selector debe recordar al selector clásico de MSN.

---

# 13. Sonidos

Crear sonidos propios de inspiración retro.

Tipos:

- Nuevo mensaje.
- Amigo conectado.
- Zumbido.
- Solicitud de amistad.
- Error.
- Inicio de sesión.

Configuración:

```text
Sonidos
[ON]

Sonido al recibir mensaje
[ON]

Sonido cuando un amigo se conecta
[ON]

Sonido de zumbido
[ON]
```

Todos los sonidos deben poder desactivarse.

---

# 14. Notificaciones

Dos tipos principales:

## Mensaje nuevo

> 💬 Juan te ha enviado un mensaje.

## Amigo conectado

> 🟢 Juan se ha conectado.

Configuraciones independientes:

```text
Notificaciones

Mensajes                 [ON]
Amigos conectados        [ON]
Solicitudes de amistad   [ON]
Zumbidos                 [ON]
```

El MVP debe tener al menos:

- Mensajes.
- Amigos conectados.
- Solicitudes.
- Zumbidos.

---

# 15. Estados

Implementar estados manuales:

```text
🟢 Disponible
🟡 Ausente
🔴 No molestar
⚫ Invisible
```

## Disponible

El usuario aparece online.

## Ausente

Aparece conectado pero indica que está ausente.

## No molestar

Aparece conectado pero se silencian determinadas notificaciones.

## Invisible

El usuario puede utilizar la aplicación pero aparece desconectado para los demás.

La lógica de presencia debe respetar este estado.

---

# 16. Presencia técnica

La presencia se debe gestionar mediante Firebase.

Conceptualmente:

```text
users/{userId}

{
  displayName,
  username,
  avatarUrl,
  status,
  personalMessage,
  activity,
  lastSeen,
  isOnline
}
```

Para la detección robusta de presencia, estudiar Firebase Realtime Database para el estado online/offline y utilizar Firestore para el resto de los datos.

No depender exclusivamente de `isOnline` almacenado en Firestore.

Objetivo:

```text
conexión establecida
        ↓
presence = online
        ↓
notificar amigos
```

Desconexión:

```text
pérdida de conexión
        ↓
presence = offline
        ↓
guardar lastSeen
```

Implementar debounce/tolerancia para evitar falsos eventos de conexión.

---

# 17. Arquitectura tecnológica del MVP

## Frontend

Recomendación:

- Next.js
- React
- TypeScript
- CSS/Tailwind según conveniencia
- PWA

## Backend

Firebase:

- Firebase Authentication
- Firestore
- Realtime Database
- Firebase Cloud Messaging
- Firebase Storage

## Hosting

Inicialmente:

- Vercel

o Firebase Hosting si simplifica el despliegue.

## Repositorio

GitHub.

---

# 18. Autenticación

MVP:

- Email + contraseña.

Opcional posteriormente:

- Google.
- Apple.
- Microsoft.

No complicar el MVP.

---

# 19. Base de datos propuesta

## users

```text
users/{userId}

displayName
username
email
avatarUrl
status
personalMessage
activity
isOnline
lastSeen
createdAt
updatedAt
```

## friendships

```text
friendships/{friendshipId}

userId
friendId
status
createdAt
```

Estados:

- pending
- accepted
- rejected
- blocked

## conversations

```text
conversations/{conversationId}

type
createdAt
updatedAt
```

MVP:

`type = direct`

## conversationMembers

```text
conversationMembers/{id}

conversationId
userId
```

## messages

```text
conversations/{conversationId}/messages/{messageId}

senderId
type
text
createdAt
status
```

Tipos:

- text
- emoji
- nudge
- system

## userSettings

```text
userSettings/{userId}

notifyMessages
notifyFriendOnline
notifyFriendRequests
notifyNudges
soundMessages
soundFriendOnline
soundNudges
```

---

# 20. Seguridad

Desde el MVP:

- Firebase Authentication obligatorio.
- Firestore Security Rules.
- Un usuario solo puede modificar su propio perfil.
- Solo amigos aceptados pueden iniciar conversaciones.
- Solo miembros de una conversación pueden leer sus mensajes.
- No permitir escrituras arbitrarias.
- Validar longitud de mensajes.
- Limitar frecuencia de zumbidos.
- No confiar en datos enviados desde el frontend.
- No almacenar API keys privadas en el frontend.

Nunca colocar secretos en:

```text
NEXT_PUBLIC_*
```

si realmente son secretos.

---

# 21. PWA

La primera versión debe ser una Progressive Web App.

Objetivos:

### Ordenador

El usuario puede instalarla desde Chrome/Edge.

### Android

Instalable desde navegador.

### iPhone

Añadir a pantalla de inicio.

Debe tener:

- icono.
- splash screen.
- manifest.
- service worker.
- caché básica.
- funcionamiento responsive.

No intentar desarrollar aplicaciones nativas para App Store/Google Play en el MVP.

---

# 22. Diseño responsive

Desktop:

```text
┌──────────────┬──────────────────────────────┐
│              │                              │
│ CONTACTOS    │       CONVERSACIÓN           │
│              │                              │
│              │                              │
│              │                              │
└──────────────┴──────────────────────────────┘
```

Móvil:

```text
┌─────────────────────┐
│ Fernando            │
├─────────────────────┤
│ 🟢 Juan             │
│ 🟡 Marcos           │
│ 🔴 Pedro            │
└─────────────────────┘
```

Al abrir un contacto:

```text
┌─────────────────────┐
│ ← Juan              │
├─────────────────────┤
│                     │
│     CHAT            │
│                     │
├─────────────────────┤
│ 😊       Escribir   │
└─────────────────────┘
```

---

# 23. Pantallas del MVP

Construir estas pantallas:

## 1. Splash

Logo/nombre del proyecto.

## 2. Login

Email + contraseña.

## 3. Registro

Nombre + username + email + contraseña.

## 4. Lista de contactos

Pantalla principal.

## 5. Perfil

Perfil propio.

## 6. Perfil de amigo

Información y acciones.

## 7. Solicitudes

Solicitudes pendientes.

## 8. Chat

Conversación individual.

## 9. Configuración

Preferencias.

## 10. Modal de amigo conectado

Notificación visual.

---

# 24. Configuración del usuario

Debe incluir:

## Cuenta

- Nombre.
- Username.
- Avatar.
- Cambiar contraseña.

## Estado

- Disponible.
- Ausente.
- No molestar.
- Invisible.

## Notificaciones

- Mensajes.
- Amigos conectados.
- Solicitudes.
- Zumbidos.

## Sonidos

- Mensajes.
- Conexiones.
- Zumbidos.

## Privacidad

MVP:

- Quién puede enviarme solicitudes.
- Quién puede ver mi estado.

---

# 25. Experiencia de "amigo conectado"

Este punto debe recibir especial atención.

Ejemplo:

Fernando está utilizando la aplicación.

Juan abre la aplicación.

Sistema:

```text
Juan
offline
   ↓
Juan
online
```

Fernando recibe:

```text
╭──────────────────────────────╮
│ 🟢 Juan se ha conectado      │
│                              │
│  Disponible                 │
╰──────────────────────────────╯
```

Además:

- Sonido.
- Animación.
- Notificación del sistema si está permitido.

Si Fernando tiene:

`notifyFriendOnline = false`

no se muestra notificación de conexión.

Pero Juan sí aparece online en la lista de contactos.

---

# 26. Evitar spam de presencia

Problema:

Una conexión móvil puede fluctuar.

No queremos:

```text
Juan se conectó
Juan se desconectó
Juan se conectó
Juan se desconectó
Juan se conectó
```

en pocos segundos.

Implementar:

- debounce.
- heartbeat.
- timeout.
- `lastSeen`.
- detección de transición.

Una notificación de conexión debe representar una nueva sesión real, no cada reconexión técnica.

---

# 27. Sistema de amigos favoritos

No es imprescindible para la primera versión, pero dejar la arquitectura preparada.

Posteriormente:

⭐ Favoritos

Esto permitiría:

```text
Avisarme cuando se conecten:

☑ Juan
☑ Laura
☐ Marcos
☐ Pedro
```

No implementar necesariamente esta interfaz en el primer MVP.

---

# 28. Qué NO desarrollar inicialmente

Para mantener el proyecto gratuito y realizable:

NO:

- Videollamadas.
- Llamadas.
- Grupos complejos.
- Stories.
- Estados tipo WhatsApp.
- IA.
- Integración Spotify.
- Envío masivo.
- Bots.
- Canales.
- Administración avanzada.
- Monetización.
- Aplicación nativa.
- Cifrado E2E propio.

El cifrado E2E puede estudiarse después con una librería/protocolo consolidado. No inventar criptografía.

---

# 29. Fases de desarrollo

# FASE 0 — Preparación

Objetivo:

Crear el proyecto base.

Tareas:

1. Crear repositorio GitHub.
2. Crear proyecto Next.js + TypeScript.
3. Configurar Vercel.
4. Crear proyecto Firebase.
5. Activar Authentication.
6. Crear Firestore.
7. Crear Realtime Database.
8. Configurar variables de entorno.
9. Crear estructura inicial.
10. Crear README.

Resultado:

Aplicación vacía funcionando en local y Vercel.

---

# FASE 1 — Sistema de usuarios

Tareas:

- Registro.
- Login.
- Logout.
- Sesión persistente.
- Perfil.
- Username único.
- Avatar.
- Estado.
- Mensaje personal.

Resultado:

Dos usuarios pueden registrarse e iniciar sesión.

---

# FASE 2 — Contactos

Tareas:

- Buscar usuarios.
- Enviar solicitud.
- Recibir solicitud.
- Aceptar.
- Rechazar.
- Lista de amigos.
- Eliminar amigo.
- Bloquear amigo básico.

Resultado:

Los usuarios pueden construir su lista de contactos.

---

# FASE 3 — Presencia MSN

Esta es una de las fases más importantes.

Tareas:

- Online.
- Offline.
- Ausente.
- No molestar.
- Invisible.
- Last seen.
- Heartbeat.
- Detección de desconexión.
- Detección de reconexión.
- Evento friend_online.

Resultado:

La aplicación empieza a sentirse realmente como MSN.

---

# FASE 4 — Chat en tiempo real

Tareas:

- Crear conversación.
- Enviar mensajes.
- Recibir mensajes en tiempo real.
- Historial.
- Timestamp.
- Estado de entrega.
- Indicador escribiendo.
- Scroll automático.
- Emojis.

Resultado:

Mensajería instantánea funcional.

---

# FASE 5 — Zumbido

Tareas:

- Botón.
- Evento realtime.
- Animación.
- Vibración en dispositivos compatibles.
- Sonido.
- Aviso visual.
- Cooldown anti-spam.
- Configuración ON/OFF.

Resultado:

Primera gran función diferencial del proyecto.

---

# FASE 6 — Notificaciones MSN

Tareas:

- Nuevo mensaje.
- Amigo conectado.
- Solicitud de amistad.
- Zumbido.
- Configuración independiente.
- Sonidos independientes.
- Web Push cuando sea posible.

Resultado:

Recuperar una de las características sociales más reconocibles de MSN.

---

# FASE 7 — Emoticonos y estética

Tareas:

- Crear pack propio.
- Selector.
- Animaciones.
- Avatares.
- Gradientes.
- Bordes.
- Ventanas.
- Sonidos.
- Estados visuales.

Objetivo:

Que el producto deje de parecer un prototipo y realmente transmita la estética retro.

---

# FASE 8 — PWA

Tareas:

- Manifest.
- Iconos.
- Service Worker.
- Instalación.
- Responsive.
- Pantalla de carga.
- Push notifications.
- Pruebas iPhone.
- Pruebas Android.
- Pruebas desktop.

Resultado:

Los amigos pueden instalar la aplicación.

---

# FASE 9 — Test privado

Crear un grupo de prueba de:

5–15 personas.

Probar:

- Registro.
- Login.
- Amigos.
- Presencia.
- Conexiones.
- Mensajes.
- Zumbidos.
- Notificaciones.
- Reconexiones.
- Móvil.
- Escritorio.
- Diferentes navegadores.

Crear una lista de bugs.

---

# 30. FASE 10 — MVP 1.0

El MVP estará terminado cuando:

- [ ] Registro funciona.
- [ ] Login funciona.
- [ ] Perfil funciona.
- [ ] Amigos funcionan.
- [ ] Estados funcionan.
- [ ] Presencia funciona.
- [ ] Chat funciona.
- [ ] Mensajes en tiempo real funcionan.
- [ ] Notificación de amigo conectado funciona.
- [ ] La notificación se puede desactivar.
- [ ] Zumbido funciona.
- [ ] Sonidos funcionan.
- [ ] Emoticonos funcionan.
- [ ] PWA funciona.
- [ ] Firebase Security Rules están revisadas.
- [ ] Aplicación desplegada.
- [ ] Al menos 5 personas la han probado.

---

# 31. Presupuesto del MVP

Objetivo:

## €0

Siempre que las cuotas gratuitas de los servicios utilizados sean suficientes para el grupo de pruebas.

Herramientas:

- GitHub: plan gratuito.
- Vercel: plan gratuito para MVP.
- Firebase: utilizar cuota gratuita mientras el uso sea pequeño.
- PWA: sin coste de distribución.
- Dominio: NO comprar inicialmente.
- App Store: NO publicar inicialmente.
- Google Play: NO publicar inicialmente.
- Servidor dedicado: NO.
- Base de datos externa: NO.

La primera versión puede funcionar simplemente con una URL de Vercel:

```text
https://nombre-del-proyecto.vercel.app
```

Posteriormente se podrá comprar un dominio.

---

# 32. Control de costes

Desde el primer día:

- Evitar imágenes pesadas.
- Comprimir avatares.
- Limitar tamaño de archivos.
- No permitir vídeo en MVP.
- No permitir audio enviado por usuarios.
- No crear consultas Firestore innecesarias.
- Evitar listeners abiertos cuando no sean necesarios.
- Paginar historial.
- No descargar toda la lista de mensajes.
- Optimizar presencia.
- No utilizar IA en el MVP.

Objetivo:

Mantener el proyecto dentro de las cuotas gratuitas durante las pruebas.

---

# 33. Git

Trabajar con commits pequeños.

Ejemplos:

```bash
git add .
git commit -m "feat: add authentication"
git push
```

Branches:

```text
main
develop
feature/auth
feature/friends
feature/presence
feature/chat
feature/nudge
feature/notifications
```

Para una persona sola, se puede simplificar utilizando `main` + branches de funcionalidad.

---

# 34. Metodología para Claude

Claude debe trabajar por fases.

NO pedir:

> "Construye toda la aplicación."

En su lugar:

```text
Implementa FASE 0.
Comprueba que funciona.
No avances a FASE 1 hasta que FASE 0 esté funcionando.
```

Después:

```text
Implementa FASE 1 según PROJECT.md.
No modifiques funcionalidades futuras.
```

Y así sucesivamente.

Cada fase debe:

1. Analizar el estado actual.
2. Implementar.
3. Probar.
4. Detectar errores.
5. Corregir.
6. Confirmar qué archivos fueron modificados.
7. Explicar cómo probarlo.
8. No romper funcionalidades existentes.

---

# 35. Prompt inicial para Claude

Utilizar este prompt al comenzar:

```text
Quiero desarrollar el proyecto descrito en PROJECT.md.

Lee PROJECT.md completo antes de modificar cualquier archivo.

Soy un usuario no programador, por lo que necesito que trabajes de forma controlada y explícita.

Reglas:

1. No construyas todo de golpe.
2. Trabajaremos fase por fase.
3. Empieza únicamente por FASE 0.
4. Antes de escribir código, analiza el entorno actual.
5. Si ya existe código, no lo sobrescribas sin necesidad.
6. Explica brevemente qué vas a hacer.
7. Implementa la fase.
8. Ejecuta las pruebas necesarias.
9. Corrige los errores.
10. Al terminar, indica:
   - archivos creados;
   - archivos modificados;
   - comandos ejecutados;
   - cómo probar la fase;
   - problemas pendientes.
11. No avances automáticamente a la siguiente fase.
12. Mantén siempre el proyecto compatible con el objetivo visual retro MSN.
13. No utilices assets propietarios de Microsoft.
14. Crea una arquitectura limpia que permita ampliar posteriormente.
15. Prioriza soluciones gratuitas durante el MVP.
```

---

# 36. Criterio de diseño

La aplicación no debe convertirse en:

> "Un chat moderno con un skin azul."

Debe ser:

> "Una aplicación moderna que reproduce la sensación de utilizar MSN Messenger."

Elementos fundamentales:

- Presencia.
- Lista de contactos.
- Estados.
- Mensaje personal.
- Amigo conectado.
- Sonido.
- Ventana de conversación.
- Zumbido.
- Emoticonos.
- Personalización.

Estos elementos tienen prioridad sobre funcionalidades modernas.

---

# 37. Evolución posterior al MVP

Solo después de probarlo con amigos:

## V2

- Grupos.
- Fotos.
- GIF.
- Archivos.
- Notas de voz.
- Favoritos.
- Personalización avanzada.
- Más sonidos.
- Más emoticonos.

## V3

- Videollamadas.
- Voz.
- Escritorio.
- Aplicaciones móviles nativas.
- Cifrado E2E mediante protocolo/librería consolidada.
- Sincronización avanzada.

## V4

- Integraciones.
- IA opcional.
- Comunidades.
- Personalización profunda.
- Posible modelo de negocio.

No desarrollar ninguna de estas fases hasta validar el MVP.

---

# 38. Principio final

La aplicación debe recuperar una característica que las plataformas modernas han perdido:

## "Mis amigos están aquí."

Al abrir la aplicación quiero poder ver:

```text
🟢 Juan está conectado
🟢 Laura está conectada
🟡 Marcos está ausente
⚫ Pedro está invisible
```

Y que cuando alguien se conecte aparezca:

```text
🟢 Juan se ha conectado
```

con su sonido característico, salvo que el usuario haya desactivado esa función.

Ese comportamiento de presencia debe considerarse una funcionalidad principal del producto y no una simple notificación.

---

# FIN DEL PROJECT.md
