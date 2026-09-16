/** Estado elegido a mano por el usuario en su perfil (Fase 1). */
export type UserStatus = "online" | "away" | "busy" | "invisible";

/** Estado que ve otro usuario: el manual, o "offline" si no hay conexión real o está invisible. */
export type PresenceStatus = UserStatus | "offline";

export const STATUS_OPTIONS: { id: UserStatus; label: string; emoji: string }[] = [
  { id: "online", label: "Disponible", emoji: "🟢" },
  { id: "away", label: "Ausente", emoji: "🟡" },
  { id: "busy", label: "No molestar", emoji: "🔴" },
  { id: "invisible", label: "Invisible", emoji: "⚫" },
];

export const OFFLINE_STATUS = { id: "offline" as const, label: "Desconectado", emoji: "⚪" };

export const DEFAULT_STATUS: UserStatus = "online";

export function getStatus(status: string) {
  if (status === "offline") return OFFLINE_STATUS;
  return STATUS_OPTIONS.find((s) => s.id === status) ?? STATUS_OPTIONS[0];
}

/**
 * Estado que ven los demás: si no hay conexión real (Realtime Database) o el
 * usuario eligió "invisible", aparece desconectado para todos salvo para sí mismo.
 */
export function getVisibleStatus(manualStatus: UserStatus, isConnected: boolean): PresenceStatus {
  if (!isConnected || manualStatus === "invisible") return "offline";
  return manualStatus;
}
