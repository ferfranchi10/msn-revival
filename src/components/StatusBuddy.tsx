import type { PresenceStatus } from "@/lib/status";

/** Colores del hombrecito por estado: [claro, oscuro] para el degradado y el contorno. */
const BUDDY_COLORS: Record<PresenceStatus, [string, string]> = {
  online: ["#6FD45A", "#2E8B22"],
  away: ["#FFC94D", "#C9860A"],
  busy: ["#F0736B", "#B02A2A"],
  invisible: ["#C3CAD4", "#7C8694"],
  offline: ["#C3CAD4", "#7C8694"],
};

/** Silueta de persona (cabeza + hombros) sobre una cuadrícula de 16×16. */
function Person({ id, light, dark }: { id: string; light: string; dark: string }) {
  return (
    <>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={light} />
          <stop offset="1" stopColor={dark} />
        </linearGradient>
      </defs>
      <circle cx="7" cy="4.4" r="3.1" fill={`url(#${id})`} stroke={dark} strokeWidth="0.8" />
      <path
        d="M1.3 15 C1.3 10.6 3.8 8.9 7 8.9 C10.2 8.9 12.7 10.6 12.7 15 Z"
        fill={`url(#${id})`}
        stroke={dark}
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
    </>
  );
}

/** Distintivo pequeño en la esquina inferior derecha: reloj (ausente) o prohibido (no molestar). */
function Badge({ status }: { status: PresenceStatus }) {
  if (status === "away") {
    return (
      <>
        <circle cx="12.3" cy="12.3" r="3.4" fill="#fff" stroke="#C9860A" strokeWidth="0.9" />
        <path d="M12.3 10.4 V12.3 H13.7" fill="none" stroke="#C9860A" strokeWidth="0.9" strokeLinecap="round" />
      </>
    );
  }
  if (status === "busy") {
    return (
      <>
        <circle cx="12.3" cy="12.3" r="3.4" fill="#C93434" stroke="#fff" strokeWidth="0.7" />
        <path d="M10.6 12.3 H14" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" />
      </>
    );
  }
  return null;
}

/**
 * Hombrecito de la lista de contactos, estilo MSN clásico: cambia de color según el
 * estado visible (verde disponible, ámbar ausente con reloj, rojo no molestar con
 * signo menos, gris desconectado). Arte propio, decorativo (el estado va también en texto).
 */
export function StatusBuddy({ status, size = 20 }: { status: PresenceStatus; size?: number }) {
  const [light, dark] = BUDDY_COLORS[status];
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true" className="shrink-0">
      <Person id={`buddy-${status}`} light={light} dark={dark} />
      <Badge status={status} />
    </svg>
  );
}

/** Hombrecito azul con un "+" verde: botón "Agregar un contacto". */
export function AddContactIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true" className="shrink-0">
      <Person id="buddy-add" light="#6FA8E8" dark="#2A5FA8" />
      <circle cx="12.3" cy="12.3" r="3.5" fill="#3DAA2E" stroke="#fff" strokeWidth="0.7" />
      <path d="M12.3 10.5 V14.1 M10.5 12.3 H14.1" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
