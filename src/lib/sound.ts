/**
 * Sonido de "amigo conectado": un par de tonos ascendentes generados con Web
 * Audio API. Es original (no un asset de MSN) y no requiere cargar archivos.
 */
export function playConnectSound(): void {
  try {
    const AudioContextCtor =
      window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioContextCtor();
    const now = ctx.currentTime;

    [523.25, 783.99].forEach((freq, i) => {
      const start = now + i * 0.09;
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.2, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.12);
      oscillator.connect(gain).connect(ctx.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.13);
    });

    setTimeout(() => ctx.close(), 400);
  } catch {
    // Autoplay bloqueado o navegador sin Web Audio: seguimos sin sonido.
  }
}
