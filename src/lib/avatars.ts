export type Avatar = {
  id: string;
  emoji: string;
  bg: string;
};

export const AVATARS: Avatar[] = [
  { id: "sun", emoji: "🌞", bg: "#facc15" },
  { id: "star", emoji: "⭐", bg: "#38bdf8" },
  { id: "ghost", emoji: "👻", bg: "#a78bfa" },
  { id: "cat", emoji: "🐱", bg: "#fb923c" },
  { id: "alien", emoji: "👽", bg: "#4ade80" },
  { id: "robot", emoji: "🤖", bg: "#94a3b8" },
  { id: "diskette", emoji: "💾", bg: "#60a5fa" },
  { id: "flame", emoji: "🔥", bg: "#f87171" },
];

export const DEFAULT_AVATAR_ID = AVATARS[0].id;

export function getAvatar(avatarId: string): Avatar {
  return AVATARS.find((a) => a.id === avatarId) ?? AVATARS[0];
}
