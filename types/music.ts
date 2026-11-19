export type AudioQuality = 'low' | 'medium' | 'high';
export type RepeatMode = 'off' | 'all' | 'one';
export type SearchTab = 'songs' | 'albums' | 'artists' | 'playlists';

export interface ArtistRef {
  id: string;
  name: string;
}

export interface AlbumRef {
  id: string;
  title: string;
}

export interface Track {
  id: string; // YouTube videoId
  title: string;
  artist: string;
  artistId?: string;
  artists?: ArtistRef[];
  album?: string;
  albumId?: string;
  artwork: string;
  duration: number; // seconds
  durationText?: string;
  explicit?: boolean;
}

export interface AlbumSummary {
  id: string; // browseId
  title: string;
  artist: string;
  artistId?: string;
  year?: string;
  artwork: string;
  type?: string; // Album | EP | Single
}

export interface ArtistSummary {
  id: string; // channelId / browseId
  name: string;
  subscribers?: string;
  artwork: string;
}

export interface PlaylistSummary {
  id: string; // playlistId / browseId
  title: string;
  subtitle?: string;
  trackCount?: number;
  artwork: string;
}

export interface HomeSection {
  id: string;
  title: string;
  kind: 'tracks' | 'albums' | 'playlists';
  items: Array<Track | AlbumSummary | PlaylistSummary>;
}

export interface HomeFeedResponse {
  trending: Track[];
  newReleases: AlbumSummary[];
  recommendedPlaylists: PlaylistSummary[];
  sections: HomeSection[];
}

export interface SearchResults {
  songs: Track[];
  albums: AlbumSummary[];
  artists: ArtistSummary[];
  playlists: PlaylistSummary[];
}

export interface ArtistDetail {
  id: string;
  name: string;
  description?: string;
  subscribers?: string;
  artwork: string;
  topSongs: Track[];
  albums: AlbumSummary[];
  singles: AlbumSummary[];
}

export interface AlbumDetail {
  id: string;
  title: string;
  artist: string;
  artistId?: string;
  year?: string;
  description?: string;
  artwork: string;
  tracks: Track[];
}

export interface PlaylistDetail {
  id: string;
  title: string;
  subtitle?: string;
  artwork: string;
  tracks: Track[];
}

export interface StreamResponse {
  videoId: string;
  url: string;
  mimeType: string;
  bitrate?: number;
  quality: AudioQuality;
  expiresAt?: number;
}

export interface UserPlaylist {
  id: string;
  name: string;
  description?: string;
  tracks: Track[];
  createdAt: number;
  updatedAt: number;
}

export interface HistoryEntry {
  track: Track;
  playedAt: number;
}

export interface DownloadPlaceholder {
  track: Track;
  addedAt: number;
  status: 'queued' | 'downloading' | 'downloaded' | 'error' | 'cached_metadata';
  estimatedSizeMb: number;
  localUri?: string;
  sizeBytes?: number;
  error?: string;
}

export interface OfflinePlaylist {
  id: string;
  title: string;
  subtitle?: string;
  artwork?: string;
  tracks: Track[];
  savedAt: number;
}
