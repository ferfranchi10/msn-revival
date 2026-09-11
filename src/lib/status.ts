export type UserStatus = "online" | "away" | "busy" | "invisible";

export const STATUS_OPTIONS: { id: UserStatus; label: string; emoji: string }[] = [
  { id: "online", label: "Disponible", emoji: "🟢" },
  { id: "away", label: "Ausente", emoji: "🟡" },
  { id: "busy", label: "No molestar", emoji: "🔴" },
  { id: "invisible", label: "Invisible", emoji: "⚫" },
];

export const DEFAULT_STATUS: UserStatus = "online";

export function getStatus(status: string) {
  return STATUS_OPTIONS.find((s) => s.id === status) ?? STATUS_OPTIONS[0];
}
