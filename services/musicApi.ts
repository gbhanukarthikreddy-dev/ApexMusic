import { Platform } from 'react-native';
import Constants from 'expo-constants';
import {
  AlbumDetail,
  ArtistDetail,
  AudioQuality,
  HomeFeedResponse,
  PlaylistDetail,
  SearchResults,
  SearchTab,
  StreamResponse,
} from '../types/music';

/**
 * Resolve a sensible default backend URL for local development:
 * - Uses EXPO_PUBLIC_API_URL if provided.
 * - Derives the Metro host IP when running in Expo Go on a physical device.
 * - Falls back to 10.0.2.2 on Android emulator or localhost on iOS/Web.
 */
function resolveDefaultBaseUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl && envUrl.trim().length > 0) {
    return envUrl.replace(/\/+$/, '');
  }

  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return `http://${host}:3001`;
    }
  }

  if (!__DEV__) {
    return 'https://apexmusic-c5p1.onrender.com';
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3001';
  }
  return 'http://localhost:3001';
}

let customBaseUrl: string | null = null;

export function setApiBaseUrl(url: string | null): void {
  customBaseUrl = url ? url.trim().replace(/\/+$/, '') : null;
  memoryCache.clear();
}

export function getApiBaseUrl(): string {
  return customBaseUrl || resolveDefaultBaseUrl();
}

export class MusicApiError extends Error {
  status?: number;
  isNetworkError: boolean;

  constructor(message: string, status?: number, isNetworkError = false) {
    super(message);
    this.name = 'MusicApiError';
    this.status = status;
    this.isNetworkError = isNetworkError;
  }
}

export interface IMusicDataSource {
  getHomeFeed(forceRefresh?: boolean): Promise<HomeFeedResponse>;
  search(query: string, type?: SearchTab): Promise<SearchResults>;
  getSearchSuggestions(query: string): Promise<string[]>;
  getArtist(artistId: string): Promise<ArtistDetail>;
  getAlbum(albumId: string): Promise<AlbumDetail>;
  getPlaylist(playlistId: string): Promise<PlaylistDetail>;
  getStreamUrl(videoId: string, quality: AudioQuality): Promise<StreamResponse>;
  prefetchStream(videoId: string, quality: AudioQuality): void;
  healthCheck(): Promise<{ ok: boolean; service: string }>;
}

const DEFAULT_TIMEOUT_MS = 55000;

const memoryCache = new Map<string, { value: unknown; expiresAt: number }>();
const inFlightRequests = new Map<string, Promise<unknown>>();

function getCachedValue<T>(key: string): T | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key);
    return null;
  }
  return entry.value as T;
}

function setCachedValue(key: string, value: unknown, ttlMs: number): void {
  memoryCache.set(key, { value, expiresAt: Date.now() + ttlMs });
}

async function requestJson<T>(
  path: string,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  retriesLeft = 1
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const url = `${getApiBaseUrl()}${path}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;
      try {
        const body = (await response.json()) as { error?: string; message?: string };
        errorMessage = body.error || body.message || errorMessage;
      } catch {
        // Ignore JSON parse error on error response
      }
      throw new MusicApiError(errorMessage, response.status, false);
    }

    return (await response.json()) as T;
  } catch (err) {
    if (err instanceof MusicApiError) {
      throw err;
    }
    const msg = err instanceof Error ? err.message : '';
    const isAbort =
      (err instanceof Error && err.name === 'AbortError') ||
      msg.toLowerCase().includes('canceled') ||
      msg.toLowerCase().includes('aborted');

    if (retriesLeft > 0 && (isAbort || msg.toLowerCase().includes('network'))) {
      clearTimeout(timer);
      return requestJson<T>(path, timeoutMs, retriesLeft - 1);
    }

    if (isAbort) {
      throw new MusicApiError(
        'Server is waking up or timed out. Please tap Try Again.',
        undefined,
        true
      );
    }
    throw new MusicApiError(
      msg || 'Unable to reach Apex Music server.',
      undefined,
      true
    );
  } finally {
    clearTimeout(timer);
  }
}

async function cachedRequest<T>(
  cacheKey: string,
  path: string,
  ttlMs: number,
  options?: { forceRefresh?: boolean; timeoutMs?: number }
): Promise<T> {
  if (!options?.forceRefresh) {
    const cached = getCachedValue<T>(cacheKey);
    if (cached) return cached;
  }

  const inflight = inFlightRequests.get(cacheKey);
  if (inflight) return inflight as Promise<T>;

  const promise = requestJson<T>(path, options?.timeoutMs)
    .then((data) => {
      setCachedValue(cacheKey, data, ttlMs);
      return data;
    })
    .finally(() => {
      inFlightRequests.delete(cacheKey);
    });

  inFlightRequests.set(cacheKey, promise);
  return promise;
}

class HttpMusicDataSource implements IMusicDataSource {
  getHomeFeed(forceRefresh = false): Promise<HomeFeedResponse> {
    return cachedRequest<HomeFeedResponse>('home', '/api/home', 3 * 60 * 1000, {
      forceRefresh,
    });
  }

  search(query: string, type?: SearchTab): Promise<SearchResults> {
    const params = new URLSearchParams({ q: query });
    if (type) {
      params.set('type', type);
    }
    const key = `search:${query.toLowerCase()}:${type || 'all'}`;
    return cachedRequest<SearchResults>(key, `/api/search?${params.toString()}`, 2 * 60 * 1000);
  }

  getSearchSuggestions(query: string): Promise<string[]> {
    const params = new URLSearchParams({ q: query });
    const key = `suggestions:${query.toLowerCase()}`;
    return cachedRequest<{ suggestions: string[] }>(
      key,
      `/api/suggestions?${params.toString()}`,
      2 * 60 * 1000,
      { timeoutMs: 6000 }
    ).then((res) => res.suggestions ?? []);
  }

  getArtist(artistId: string): Promise<ArtistDetail> {
    return cachedRequest<ArtistDetail>(
      `artist:${artistId}`,
      `/api/artist/${encodeURIComponent(artistId)}`,
      5 * 60 * 1000
    );
  }

  getAlbum(albumId: string): Promise<AlbumDetail> {
    return cachedRequest<AlbumDetail>(
      `album:${albumId}`,
      `/api/album/${encodeURIComponent(albumId)}`,
      5 * 60 * 1000
    );
  }

  getPlaylist(playlistId: string): Promise<PlaylistDetail> {
    return cachedRequest<PlaylistDetail>(
      `playlist:${playlistId}`,
      `/api/playlist/${encodeURIComponent(playlistId)}`,
      5 * 60 * 1000
    );
  }

  getStreamUrl(videoId: string, quality: AudioQuality): Promise<StreamResponse> {
    const params = new URLSearchParams({ quality });
    return cachedRequest<StreamResponse>(
      `stream:${videoId}:${quality}`,
      `/api/stream/${encodeURIComponent(videoId)}?${params.toString()}`,
      20 * 60 * 1000,
      { timeoutMs: 45000 }
    );
  }

  prefetchStream(videoId: string, quality: AudioQuality): void {
    void this.getStreamUrl(videoId, quality).catch(() => {});
  }

  healthCheck(): Promise<{ ok: boolean; service: string }> {
    return requestJson<{ ok: boolean; service: string }>('/api/health', 5000);
  }
}

export const musicApi: IMusicDataSource = new HttpMusicDataSource();
