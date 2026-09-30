import { NextResponse } from "next/server";
import { requireCallerUid } from "@/lib/apiAuth";
import { isValidLastfmUser, parseNowPlaying } from "@/lib/nowPlaying";

/** Qué está sonando ahora en la cuenta de Last.fm indicada (Last.fm reúne lo que reportan Spotify, Apple Music, reproductores de Windows/Mac/móvil, etc.). */
export async function GET(request: Request) {
  const uid = await requireCallerUid(request);
  if (!uid) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const apiKey = process.env.LASTFM_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Last.fm no configurado" }, { status: 503 });

  const user = new URL(request.url).searchParams.get("user") ?? "";
  if (!isValidLastfmUser(user)) return NextResponse.json({ error: "Usuario inválido" }, { status: 400 });

  const url = new URL("https://ws.audioscrobbler.com/2.0/");
  url.search = new URLSearchParams({
    method: "user.getrecenttracks",
    user,
    limit: "1",
    api_key: apiKey,
    format: "json",
  }).toString();

  try {
    const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(8000) });
    if (!res.ok) return NextResponse.json({ error: "Last.fm no respondió" }, { status: 502 });
    return NextResponse.json({ track: parseNowPlaying(await res.json()) });
  } catch {
    return NextResponse.json({ error: "Last.fm no respondió" }, { status: 502 });
  }
}
