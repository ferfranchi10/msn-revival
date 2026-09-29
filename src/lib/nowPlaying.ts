/** Si el dato no se refrescó en este tiempo, se considera que ya no está escuchando. */
export const NOW_PLAYING_TTL_MS = 6 * 60 * 1000;

/** Usuario de Last.fm: letras, números, guion y guion bajo (2–15). */
const LASTFM_USER_REGEX = /^[A-Za-z][A-Za-z0-9_-]{1,14}$/;

export function isValidLastfmUser(value: string): boolean {
  return LASTFM_USER_REGEX.test(value);
}

/** Lee la respuesta de `user.getRecentTracks` de Last.fm: "Artista – Canción" si algo suena ahora, si no `null`. */
export function parseNowPlaying(data: unknown): string | null {
  const tracks = (data as { recenttracks?: { track?: unknown } })?.recenttracks?.track;
  const first = Array.isArray(tracks) ? tracks[0] : tracks;
  if (!first || typeof first !== "object") return null;

  const track = first as { name?: unknown; artist?: { "#text"?: unknown }; "@attr"?: { nowplaying?: unknown } };
  if (track["@attr"]?.nowplaying !== "true") return null;

  const name = typeof track.name === "string" ? track.name.trim() : "";
  const artist = typeof track.artist?.["#text"] === "string" ? track.artist["#text"].trim() : "";
  if (!name) return null;
  return (artist ? `${artist} – ${name}` : name).slice(0, 120);
}

/** Texto a mostrar a los amigos, o `null` si no hay nada vigente. */
export function getVisibleNowPlaying(
  profile: { nowPlaying?: string; nowPlayingAt?: number } | null | undefined,
  now: number = Date.now(),
): string | null {
  if (!profile?.nowPlaying || typeof profile.nowPlayingAt !== "number") return null;
  return now - profile.nowPlayingAt <= NOW_PLAYING_TTL_MS ? profile.nowPlaying : null;
}
