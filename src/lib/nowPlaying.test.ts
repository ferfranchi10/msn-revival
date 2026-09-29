import { describe, expect, it } from "vitest";
import { getVisibleNowPlaying, isValidLastfmUser, NOW_PLAYING_TTL_MS, parseNowPlaying } from "./nowPlaying";

const playing = (artist: string, name: string) => ({
  recenttracks: { track: [{ name, artist: { "#text": artist }, "@attr": { nowplaying: "true" } }] },
});

describe("parseNowPlaying", () => {
  it("devuelve Artista – Canción si suena ahora", () => {
    expect(parseNowPlaying(playing("Soda Stereo", "De música ligera"))).toBe("Soda Stereo – De música ligera");
  });
  it("null si la última canción ya terminó", () => {
    expect(parseNowPlaying({ recenttracks: { track: [{ name: "x", artist: { "#text": "y" } }] } })).toBeNull();
  });
  it("null con datos inválidos", () => {
    expect(parseNowPlaying(null)).toBeNull();
    expect(parseNowPlaying({})).toBeNull();
    expect(parseNowPlaying({ recenttracks: { track: [] } })).toBeNull();
  });
});

describe("isValidLastfmUser", () => {
  it("valida el formato", () => {
    expect(isValidLastfmUser("fer_10")).toBe(true);
    expect(isValidLastfmUser("a")).toBe(false);
    expect(isValidLastfmUser("bad user&x=1")).toBe(false);
  });
});

describe("getVisibleNowPlaying", () => {
  it("vigente dentro del TTL y oculto después", () => {
    const p = { nowPlaying: "A – B", nowPlayingAt: 1000 };
    expect(getVisibleNowPlaying(p, 1000 + NOW_PLAYING_TTL_MS)).toBe("A – B");
    expect(getVisibleNowPlaying(p, 1001 + NOW_PLAYING_TTL_MS)).toBeNull();
    expect(getVisibleNowPlaying({}, 5)).toBeNull();
  });
});
