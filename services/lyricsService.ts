import { Track } from '../types/music';

export interface LyricLine {
  time: number; // seconds
  text: string;
}

export interface LyricsResult {
  synced: LyricLine[];
  plain: string | null;
  instrumental: boolean;
}

const lyricsCache = new Map<string, LyricsResult>();

function cleanTitleForSearch(title: string): string {
  return title
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/\b(official|video|audio|lyric|lyrics|hd|4k|visualizer|remastered)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanArtistForSearch(artist: string): string {
  return artist.split(',')[0].split('&')[0].trim();
}

export function parseLrc(lrc: string): LyricLine[] {
  const lines: LyricLine[] = [];
  const regex = /\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]\s*(.*)/;

  for (const raw of lrc.split('\n')) {
    const match = raw.trim().match(regex);
    if (!match) continue;
    const mins = Number(match[1]);
    const secs = Number(match[2]);
    const msPart = match[3] ? Number(match[3].padEnd(3, '0')) / 1000 : 0;
    const text = match[4].trim();
    if (!text) continue;
    lines.push({
      time: mins * 60 + secs + msPart,
      text,
    });
  }

  return lines.sort((a, b) => a.time - b.time);
}

interface LrcLibRecord {
  syncedLyrics?: string | null;
  plainLyrics?: string | null;
  instrumental?: boolean;
}

function toLyricsResult(record: LrcLibRecord | null | undefined): LyricsResult | null {
  if (!record) return null;
  const synced = record.syncedLyrics ? parseLrc(record.syncedLyrics) : [];
  const plain = record.plainLyrics?.trim() || null;
  const instrumental = Boolean(record.instrumental);

  if (synced.length === 0 && !plain && !instrumental) {
    return null;
  }
  return { synced, plain, instrumental };
}

async function fetchJsonWithTimeout<T>(url: string, timeoutMs = 8000): Promise<T | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchTrackLyrics(track: Track): Promise<LyricsResult> {
  const cached = lyricsCache.get(track.id);
  if (cached) return cached;

  const title = cleanTitleForSearch(track.title) || track.title;
  const artist = cleanArtistForSearch(track.artist) || track.artist;

  const params = new URLSearchParams({
    track_name: title,
    artist_name: artist,
  });
  if (track.album) params.set('album_name', track.album);
  if (track.duration > 0) params.set('duration', String(Math.round(track.duration)));

  const exact = await fetchJsonWithTimeout<LrcLibRecord>(
    `https://lrclib.net/api/get?${params.toString()}`
  );
  const exactResult = toLyricsResult(exact);
  if (exactResult) {
    lyricsCache.set(track.id, exactResult);
    return exactResult;
  }

  const searchParams = new URLSearchParams({
    track_name: title,
    artist_name: artist,
  });
  const list = await fetchJsonWithTimeout<LrcLibRecord[]>(
    `https://lrclib.net/api/search?${searchParams.toString()}`
  );

  if (Array.isArray(list)) {
    const withSynced = list.map(toLyricsResult).find((r) => r && r.synced.length > 0);
    if (withSynced) {
      lyricsCache.set(track.id, withSynced);
      return withSynced;
    }
    const withAny = list.map(toLyricsResult).find(Boolean);
    if (withAny) {
      lyricsCache.set(track.id, withAny);
      return withAny;
    }
  }

  const empty: LyricsResult = { synced: [], plain: null, instrumental: false };
  return empty;
}
