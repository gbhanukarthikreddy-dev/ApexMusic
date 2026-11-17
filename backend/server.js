const express = require('express');
const cors = require('cors');
const { Readable } = require('stream');
const { Innertube, Log, Platform, UniversalCache } = require('youtubei.js');

Log.setLevel(Log.Level.ERROR);

// Required by youtubei.js v18+ to decipher player signature & n-parameter
Platform.shim.eval = async (data, env) => {
  const properties = [];
  if (env.n) {
    properties.push(`n: exportedVars.nFunction(${JSON.stringify(env.n)})`);
  }
  if (env.sig) {
    properties.push(`sig: exportedVars.sigFunction(${JSON.stringify(env.sig)})`);
  }
  const code = `${data.output}\nreturn { ${properties.join(', ')} };`;
  return new Function(code)();
};

const PORT = process.env.PORT || 3001;
const app = express();

app.set('trust proxy', 1);
app.use(cors());
app.use(express.json());

let ytPromise = null;

function parseCookieEnv(raw) {
  if (!raw || typeof raw !== 'string') return undefined;
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      const list = Array.isArray(parsed) ? parsed : parsed?.cookies;
      if (Array.isArray(list)) {
        return list
          .filter((c) => c?.name && c?.value !== undefined)
          .map((c) => `${c.name}=${c.value}`)
          .join('; ');
      }
    } catch {
      // Fall back to raw string
    }
  }
  return trimmed;
}

async function getInnertube() {
  if (!ytPromise) {
    ytPromise = Innertube.create({
      cache: new UniversalCache(false),
      generate_session_locally: true,
      cookie: parseCookieEnv(process.env.YT_COOKIE),
    }).catch((err) => {
      ytPromise = null;
      throw err;
    });
  }
  return ytPromise;
}

// Simple in-memory TTL cache
const cache = new Map();
function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}
function setCached(key, value, ttlMs = 5 * 60 * 1000) {
  cache.set(key, { value, expiresAt: Date.now() + ttlMs });
}

// Helpers to safely extract YouTube Music fields across shelf variations
function upgradeArtworkUrl(url) {
  if (!url || typeof url !== 'string') return url;
  if (url.includes('googleusercontent.com') || url.includes('ggpht.com')) {
    if (/=w\d+-h\d+/.test(url)) {
      return url.replace(/=w\d+-h\d+[^&\s]*/, '=w720-h720-l90-rj');
    }
    if (/=s\d+/.test(url)) {
      return url.replace(/=s\d+[^&\s]*/, '=s720');
    }
  }
  return url;
}

function pickArtwork(thumbnails, fallbackId) {
  const list = Array.isArray(thumbnails)
    ? thumbnails
    : Array.isArray(thumbnails?.contents)
      ? thumbnails.contents
      : [];

  if (list.length > 0) {
    const sorted = [...list].sort((a, b) => (b?.width || 0) - (a?.width || 0));
    const best = sorted[0];
    if (best?.url) return upgradeArtworkUrl(best.url);
  }
  if (fallbackId) {
    return `https://i.ytimg.com/vi/${fallbackId}/hqdefault.jpg`;
  }
  return 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg';
}

function parseDurationText(text) {
  if (!text || typeof text !== 'string') return 0;
  const parts = text.split(':').map((n) => parseInt(n, 10));
  if (parts.some((n) => Number.isNaN(n))) return 0;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}

function textOf(val) {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val.toString === 'function') {
    const str = val.toString();
    if (str && str !== '[object Object]') return str;
  }
  if (val.text) return String(val.text);
  return '';
}

function normalizeTrack(item, fallbackArtist) {
  if (!item) return null;
  const id = item.id || item.video_id || item.endpoint?.payload?.videoId;
  if (!id) return null;

  const artistsArr = Array.isArray(item.artists)
    ? item.artists.map((a) => ({
        id: a.channel_id || a.endpoint?.payload?.browseId || '',
        name: a.name || textOf(a),
      }))
    : [];

  const artistName =
    artistsArr.map((a) => a.name).filter(Boolean).join(', ') ||
    textOf(item.author) ||
    textOf(item.subtitle) ||
    fallbackArtist ||
    'Unknown Artist';

  const artistId = artistsArr.find((a) => a.id)?.id || item.author?.channel_id || undefined;
  const durationText = item.duration?.text || (typeof item.duration === 'string' ? item.duration : '');
  const duration =
    typeof item.duration?.seconds === 'number'
      ? item.duration.seconds
      : parseDurationText(durationText);

  return {
    id,
    title: textOf(item.title) || textOf(item.name) || 'Untitled Track',
    artist: artistName,
    artistId,
    artists: artistsArr.length > 0 ? artistsArr : undefined,
    album: textOf(item.album?.name) || textOf(item.album) || undefined,
    albumId: item.album?.id || item.album?.endpoint?.payload?.browseId || undefined,
    artwork: pickArtwork(item.thumbnails || item.thumbnail, id),
    duration,
    durationText: durationText || undefined,
  };
}

function normalizeAlbum(item, fallbackArtist) {
  if (!item) return null;
  const id = item.id || item.browse_id || item.endpoint?.payload?.browseId;
  if (!id) return null;

  return {
    id,
    title: textOf(item.title) || textOf(item.name) || 'Untitled Album',
    artist:
      (Array.isArray(item.artists) ? item.artists.map((a) => a.name).join(', ') : '') ||
      textOf(item.author) ||
      textOf(item.subtitle) ||
      fallbackArtist ||
      'Various Artists',
    artistId: item.artists?.[0]?.channel_id || item.author?.channel_id || undefined,
    year: item.year ? String(item.year) : undefined,
    artwork: pickArtwork(item.thumbnails || item.thumbnail),
    type: item.item_type || 'Album',
  };
}

function normalizeArtist(item) {
  if (!item) return null;
  const id = item.id || item.browse_id || item.channel_id || item.endpoint?.payload?.browseId;
  if (!id) return null;

  return {
    id,
    name: textOf(item.name) || textOf(item.title) || 'Unknown Artist',
    subscribers: textOf(item.subscribers) || textOf(item.subtitle) || undefined,
    artwork: pickArtwork(item.thumbnails || item.thumbnail),
  };
}

function normalizePlaylist(item) {
  if (!item) return null;
  const id = item.id || item.browse_id || item.endpoint?.payload?.browseId;
  if (!id) return null;

  return {
    id,
    title: textOf(item.title) || textOf(item.name) || 'Untitled Playlist',
    subtitle: textOf(item.subtitle) || textOf(item.author) || undefined,
    trackCount: typeof item.item_count === 'number' ? item.item_count : undefined,
    artwork: pickArtwork(item.thumbnails || item.thumbnail),
  };
}

app.get('/', (_req, res) => {
  res.json({ ok: true, service: 'apex-music-backend' });
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'apex-music-backend' });
});

app.get('/api/home', async (_req, res) => {
  try {
    const cached = getCached('home');
    if (cached) return res.json(cached);

    const yt = await getInnertube();
    const trending = [];
    const newReleases = [];
    const recommendedPlaylists = [];

    try {
      const home = await yt.music.getHomeFeed();
      const sections = home?.sections || [];

      for (const section of sections) {
        const contents = section?.contents || [];
        for (const item of contents) {
          const itemType = item?.item_type || item?.type || '';
          if (itemType === 'song' || itemType === 'video' || item?.id?.length === 11) {
            const t = normalizeTrack(item);
            if (t && !trending.some((x) => x.id === t.id)) trending.push(t);
          } else if (itemType === 'album' || String(item?.id || '').startsWith('MPRE')) {
            const a = normalizeAlbum(item);
            if (a && !newReleases.some((x) => x.id === a.id)) newReleases.push(a);
          } else if (
            itemType === 'playlist' ||
            String(item?.id || '').startsWith('VL') ||
            String(item?.id || '').startsWith('PL') ||
            String(item?.id || '').startsWith('RD')
          ) {
            const p = normalizePlaylist(item);
            if (p && !recommendedPlaylists.some((x) => x.id === p.id)) recommendedPlaylists.push(p);
          }
        }
      }
    } catch (homeErr) {
      console.warn('[Home] getHomeFeed partial fallback:', homeErr.message);
    }

    // Backfill with targeted YouTube Music searches in parallel if any carousel is sparse
    const [topSearch, albumSearch, plSearch] = await Promise.all([
      trending.length < 6
        ? yt.music.search('top hits music 2025', { type: 'song' }).catch(() => null)
        : Promise.resolve(null),
      newReleases.length < 4
        ? yt.music.search('new music albums', { type: 'album' }).catch(() => null)
        : Promise.resolve(null),
      recommendedPlaylists.length < 4
        ? yt.music.search('electronic chill hits', { type: 'playlist' }).catch(() => null)
        : Promise.resolve(null),
    ]);

    if (topSearch) {
      const items = topSearch?.results || topSearch?.songs?.contents || [];
      for (const item of items) {
        const t = normalizeTrack(item);
        if (t && !trending.some((x) => x.id === t.id)) trending.push(t);
      }
    }

    if (albumSearch) {
      const items = albumSearch?.results || albumSearch?.albums?.contents || [];
      for (const item of items) {
        const a = normalizeAlbum(item);
        if (a && !newReleases.some((x) => x.id === a.id)) newReleases.push(a);
      }
    }

    if (plSearch) {
      const items = plSearch?.results || plSearch?.playlists?.contents || [];
      for (const item of items) {
        const p = normalizePlaylist(item);
        if (p && !recommendedPlaylists.some((x) => x.id === p.id)) recommendedPlaylists.push(p);
      }
    }

    const payload = {
      trending: trending.slice(0, 18),
      newReleases: newReleases.slice(0, 14),
      recommendedPlaylists: recommendedPlaylists.slice(0, 14),
      sections: [],
    };

    setCached('home', payload, 5 * 60 * 1000);
    res.json(payload);

    // Pre-warm stream URLs for top 3 trending songs in background for instant play
    for (const track of payload.trending.slice(0, 3)) {
      void resolveYouTubeStream(track.id, 'high').catch(() => {});
    }
  } catch (err) {
    console.error('[Home Error]', err);
    res.status(500).json({ error: err.message || 'Failed to load home feed' });
  }
});

app.get('/api/search', async (req, res) => {
  try {
    const q = String(req.query.q || '').trim();
    if (!q) {
      return res.json({ songs: [], albums: [], artists: [], playlists: [] });
    }

    const cacheKey = `search:${q.toLowerCase()}`;
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);

    const yt = await getInnertube();
    const [songRes, albumRes, artistRes, playlistRes] = await Promise.all([
      yt.music.search(q, { type: 'song' }).catch(() => null),
      yt.music.search(q, { type: 'album' }).catch(() => null),
      yt.music.search(q, { type: 'artist' }).catch(() => null),
      yt.music.search(q, { type: 'playlist' }).catch(() => null),
    ]);

    const extractList = (r, key) => r?.results || r?.[key]?.contents || [];

    const payload = {
      songs: extractList(songRes, 'songs')
        .map((item) => normalizeTrack(item))
        .filter(Boolean)
        .slice(0, 20),
      albums: extractList(albumRes, 'albums')
        .map((item) => normalizeAlbum(item))
        .filter(Boolean)
        .slice(0, 15),
      artists: extractList(artistRes, 'artists')
        .map((item) => normalizeArtist(item))
        .filter(Boolean)
        .slice(0, 15),
      playlists: extractList(playlistRes, 'playlists')
        .map((item) => normalizePlaylist(item))
        .filter(Boolean)
        .slice(0, 15),
    };

    setCached(cacheKey, payload, 3 * 60 * 1000);
    res.json(payload);
  } catch (err) {
    console.error('[Search Error]', err);
    res.status(500).json({ error: err.message || 'Search failed' });
  }
});

app.get('/api/suggestions', async (req, res) => {
  try {
    const q = String(req.query.q || '').trim();
    if (!q) return res.json({ suggestions: [] });

    const yt = await getInnertube();
    const raw = await yt.music.getSearchSuggestions(q);
    const suggestions = [];

    if (Array.isArray(raw)) {
      for (const section of raw) {
        const items = section?.contents || [section];
        for (const item of items) {
          const text = textOf(item?.suggestion) || textOf(item?.query) || textOf(item);
          if (text && !suggestions.includes(text)) {
            suggestions.push(text);
          }
        }
      }
    }

    res.json({ suggestions: suggestions.slice(0, 8) });
  } catch (err) {
    res.json({ suggestions: [] });
  }
});

app.get('/api/artist/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `artist:${id}`;
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);

    const yt = await getInnertube();
    const artist = await yt.music.getArtist(id);
    const artistName = textOf(artist.header?.title) || 'Artist';

    const topSongs = [];
    const albums = [];
    const singles = [];

    for (const section of artist.sections || []) {
      const title = textOf(section.header?.title).toLowerCase();
      const contents = section.contents || [];

      if (title.includes('song')) {
        for (const item of contents) {
          const t = normalizeTrack(item, artistName);
          if (t) topSongs.push(t);
        }
      } else if (title.includes('single')) {
        for (const item of contents) {
          const a = normalizeAlbum(item, artistName);
          if (a) singles.push(a);
        }
      } else if (title.includes('album')) {
        for (const item of contents) {
          const a = normalizeAlbum(item, artistName);
          if (a) albums.push(a);
        }
      }
    }

    const payload = {
      id,
      name: artistName,
      description: textOf(artist.header?.description) || undefined,
      subscribers: textOf(artist.header?.subscription_button?.subscribe_accessibility_label) || undefined,
      artwork: pickArtwork(artist.header?.thumbnail?.contents || artist.header?.thumbnails),
      topSongs: topSongs.slice(0, 15),
      albums,
      singles,
    };

    setCached(cacheKey, payload, 10 * 60 * 1000);
    res.json(payload);
  } catch (err) {
    console.error('[Artist Error]', err);
    res.status(500).json({ error: err.message || 'Failed to load artist' });
  }
});

app.get('/api/album/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `album:${id}`;
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);

    const yt = await getInnertube();
    const album = await yt.music.getAlbum(id);

    const title = textOf(album.header?.title) || 'Album';
    const artistName = textOf(album.header?.author) || textOf(album.header?.subtitle) || 'Artist';
    const artwork = pickArtwork(album.header?.thumbnails || album.header?.thumbnail?.contents);

    const tracks = (album.contents || [])
      .map((item) => {
        const t = normalizeTrack(item, artistName);
        if (!t) return null;
        return {
          ...t,
          album: title,
          albumId: id,
          artwork: t.artwork || artwork,
        };
      })
      .filter(Boolean);

    const payload = {
      id,
      title,
      artist: artistName,
      artistId: album.header?.author?.channel_id || tracks[0]?.artistId,
      year: album.header?.year ? String(album.header.year) : undefined,
      description: textOf(album.header?.description) || undefined,
      artwork,
      tracks,
    };

    setCached(cacheKey, payload, 10 * 60 * 1000);
    res.json(payload);
  } catch (err) {
    console.error('[Album Error]', err);
    res.status(500).json({ error: err.message || 'Failed to load album' });
  }
});

app.get('/api/playlist/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `playlist:${id}`;
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);

    const yt = await getInnertube();
    const playlist = await yt.music.getPlaylist(id);

    const title = textOf(playlist.header?.title) || 'Playlist';
    const subtitle = textOf(playlist.header?.subtitle) || textOf(playlist.header?.author) || undefined;
    const artwork = pickArtwork(playlist.header?.thumbnails || playlist.header?.thumbnail?.contents);

    const tracks = (playlist.items || playlist.contents || [])
      .map((item) => normalizeTrack(item))
      .filter(Boolean);

    const payload = {
      id,
      title,
      subtitle,
      artwork: artwork || tracks[0]?.artwork || '',
      tracks,
    };

    setCached(cacheKey, payload, 10 * 60 * 1000);
    res.json(payload);
  } catch (err) {
    console.error('[Playlist Error]', err);
    res.status(500).json({ error: err.message || 'Failed to load playlist' });
  }
});

const inFlightStreams = new Map();

async function resolveYouTubeStream(videoId, quality, forceProbe = false) {
  const cacheKey = `ytstream:${videoId}:${quality}`;
  if (!forceProbe) {
    const cached = getCached(cacheKey);
    if (cached) return cached;
  } else {
    cache.delete(cacheKey);
  }

  const existing = inFlightStreams.get(cacheKey);
  if (existing) return existing;

  const task = (async () => {
    const yt = await getInnertube();
    const clientsToTry = ['YTMUSIC', 'MWEB', 'ANDROID', 'IOS'];
    let selectedFormat = null;
    let streamUrl = null;
    let lastError = null;

    for (const client of clientsToTry) {
      try {
        const info = await yt.getBasicInfo(videoId, { client });
        const progressive = (info.streaming_data?.formats || []).filter((f) => f.has_audio);
        const adaptiveAudio = (info.streaming_data?.adaptive_formats || []).filter(
          (f) => f.has_audio && !f.has_video
        );

        const candidates = progressive.length > 0 ? progressive : adaptiveAudio;
        if (candidates.length === 0) continue;

        const sorted = [...candidates].sort((a, b) =>
          quality === 'low' ? (a.bitrate || 0) - (b.bitrate || 0) : (b.bitrate || 0) - (a.bitrate || 0)
        );

        for (const candidate of sorted) {
          const deciphered =
            typeof candidate.decipher === 'function'
              ? await candidate.decipher(yt.session.player)
              : candidate.url;
          if (!deciphered) continue;

          // Fast path: YTMUSIC progressive formats work reliably without blocking HEAD roundtrip
          if (!forceProbe && client === 'YTMUSIC' && progressive.length > 0) {
            selectedFormat = candidate;
            streamUrl = deciphered;
            break;
          }

          const probe = await fetch(deciphered, { method: 'HEAD' });
          if (probe.ok) {
            selectedFormat = candidate;
            streamUrl = deciphered;
            break;
          }
        }

        if (streamUrl) break;
      } catch (clientErr) {
        lastError = clientErr;
      }
    }

    if (!streamUrl || !selectedFormat) {
      if (lastError) throw lastError;
      return null;
    }

    const resolved = {
      videoId,
      directUrl: streamUrl,
      mimeType: selectedFormat.mime_type || 'video/mp4',
      bitrate: selectedFormat.bitrate || undefined,
      quality,
      expiresAt: Date.now() + 25 * 60 * 1000,
    };

    setCached(cacheKey, resolved, 25 * 60 * 1000);
    return resolved;
  })();

  inFlightStreams.set(cacheKey, task);
  try {
    return await task;
  } finally {
    inFlightStreams.delete(cacheKey);
  }
}

app.get('/api/stream/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    const quality = ['low', 'medium', 'high'].includes(req.query.quality)
      ? req.query.quality
      : 'high';

    const resolved = await resolveYouTubeStream(videoId, quality);
    if (!resolved) {
      return res.status(404).json({ error: 'No playable audio stream found for this track.' });
    }

    const proxyUrl = `${req.protocol}://${req.get('host')}/api/audio/${encodeURIComponent(videoId)}?quality=${quality}`;

    res.json({
      videoId,
      url: proxyUrl,
      mimeType: resolved.mimeType,
      bitrate: resolved.bitrate,
      quality,
      expiresAt: resolved.expiresAt,
    });
  } catch (err) {
    console.error('[Stream Error]', err);
    res.status(500).json({ error: err.message || 'Failed to resolve audio stream' });
  }
});

app.get('/api/audio/:videoId', async (req, res) => {
  const controller = new AbortController();
  let aborted = false;
  req.on('close', () => {
    aborted = true;
    controller.abort();
  });

  try {
    const { videoId } = req.params;
    const quality = ['low', 'medium', 'high'].includes(req.query.quality)
      ? req.query.quality
      : 'high';
    console.log(`[Audio Proxy] ${videoId} (${quality}) method=${req.method} range=${req.headers.range || 'none'}`);

    let resolved = await resolveYouTubeStream(videoId, quality);
    if (!resolved) {
      return res.status(404).json({ error: 'No playable audio stream found.' });
    }

    const headers = {};
    if (req.headers.range) {
      headers.Range = req.headers.range;
    }

    let upstream = await fetch(resolved.directUrl, {
      method: req.method === 'HEAD' ? 'HEAD' : 'GET',
      headers,
      signal: controller.signal,
    });

    // If fast-path URL returned 403/410, invalidate cache and probe fallback clients once
    if (upstream.status === 403 || upstream.status === 410) {
      try { await upstream.body?.cancel(); } catch {}
      resolved = await resolveYouTubeStream(videoId, quality, true);
      if (resolved) {
        upstream = await fetch(resolved.directUrl, {
          method: req.method === 'HEAD' ? 'HEAD' : 'GET',
          headers,
          signal: controller.signal,
        });
      }
    }

    if (!upstream.ok && upstream.status !== 206) {
      console.warn(`[Audio Proxy] Upstream status ${upstream.status} for ${videoId}`);
      return res.status(upstream.status).end();
    }

    res.status(upstream.status);
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'video/mp4');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'no-store');

    const contentLength = upstream.headers.get('content-length');
    if (contentLength) res.setHeader('Content-Length', contentLength);

    const contentRange = upstream.headers.get('content-range');
    if (contentRange) res.setHeader('Content-Range', contentRange);

    if (req.method === 'HEAD' || !upstream.body) {
      return res.end();
    }

    const nodeStream = Readable.fromWeb(upstream.body);
    nodeStream.on('error', () => {
      if (!res.headersSent) res.status(500);
      if (!res.writableEnded) res.end();
    });
    nodeStream.pipe(res);
  } catch (err) {
    if (err?.name === 'AbortError' || aborted) return;
    console.error('[Audio Proxy Error]', err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message || 'Audio proxy failed' });
    } else if (!res.writableEnded) {
      res.end();
    }
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Apex Music backend running on http://0.0.0.0:${PORT}`);
  // Warm Innertube session on boot so the first request is instant
  void getInnertube().catch(() => {});
});
