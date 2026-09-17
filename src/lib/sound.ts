/**
 * Sonido de "amigo conectado": archivo propio (`public/sounds/connect.mp3`),
 * creado por el usuario para este proyecto (reemplaza la versión sintetizada
 * con Web Audio API usada originalmente en Fase 3).
 */
export function playConnectSound(): void {
  try {
    const audio = new Audio("/sounds/connect.mp3");
    void audio.play().catch(() => {
      // Autoplay bloqueado por el navegador: seguimos sin sonido.
    });
  } catch {
    // Navegador sin soporte de audio: seguimos sin sonido.
  }
}

/**
 * Sonido de "zumbido": archivo propio (`public/sounds/nudge.mp3`), creado por
 * el propio usuario específicamente para este proyecto — no es el asset
 * original de Microsoft. Se instancia un `Audio` nuevo en cada llamado para
 * que dos zumbidos que se solapen (conversaciones distintas) no se corten
 * entre sí.
 */
export function playNudgeSound(): void {
  try {
    const audio = new Audio("/sounds/nudge.mp3");
    void audio.play().catch(() => {
      // Autoplay bloqueado por el navegador: seguimos sin sonido.
    });
  } catch {
    // Navegador sin soporte de audio: seguimos sin sonido.
  }
}

/**
 * Sonido de "mensaje nuevo": archivo propio (`public/sounds/message.mp3`),
 * también creado por el usuario para este proyecto. Mismo criterio que
 * `playNudgeSound`: un `Audio` nuevo por llamado para que mensajes de
 * conversaciones distintas no se corten entre sí.
 */
export function playMessageSound(): void {
  try {
    const audio = new Audio("/sounds/message.mp3");
    void audio.play().catch(() => {
      // Autoplay bloqueado por el navegador: seguimos sin sonido.
    });
  } catch {
    // Navegador sin soporte de audio: seguimos sin sonido.
  }
}

/**
 * Sonido de "solicitud de amistad": archivo propio (`public/sounds/friend-request.mp3`),
 * creado por el usuario para este proyecto (mismo criterio que `playNudgeSound`).
 */
export function playFriendRequestSound(): void {
  try {
    const audio = new Audio("/sounds/friend-request.mp3");
    void audio.play().catch(() => {
      // Autoplay bloqueado por el navegador: seguimos sin sonido.
    });
  } catch {
    // Navegador sin soporte de audio: seguimos sin sonido.
  }
}
