import { Platform } from 'react-native';
import { Directory, File, Paths } from 'expo-file-system';
import { AudioQuality, Track } from '../types/music';
import { musicApi } from './musicApi';

function getOfflineDir(): Directory {
  const dir = new Directory(Paths.document, 'apex_offline');
  if (!dir.exists) {
    dir.create({ intermediates: true, idempotent: true });
  }
  return dir;
}

function getExtensionFromMime(mimeType?: string): string {
  const mime = (mimeType || '').toLowerCase();
  if (mime.includes('webm')) return '.webm';
  if (mime.includes('mpeg') || mime.includes('mp3')) return '.mp3';
  if (mime.includes('ogg')) return '.ogg';
  return '.m4a';
}

function sanitizeId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_-]/g, '_');
}

export async function downloadTrackAudio(
  track: Track,
  quality: AudioQuality
): Promise<{ localUri: string; sizeBytes: number; sizeMb: number }> {
  if (Platform.OS === 'web') {
    throw new Error('Offline file downloads are only supported on iOS and Android.');
  }

  const stream = await musicApi.getStreamUrl(track.id, quality);
  const dir = getOfflineDir();
  const ext = getExtensionFromMime(stream.mimeType);
  const targetFile = new File(dir, `${sanitizeId(track.id)}${ext}`);

  const downloaded = await File.downloadFileAsync(stream.url, targetFile, {
    idempotent: true,
  });

  if (!downloaded.exists || !downloaded.size || downloaded.size <= 0) {
    throw new Error('Downloaded audio file is empty or missing.');
  }

  const sizeMb = Math.max(0.1, Number((downloaded.size / (1024 * 1024)).toFixed(1)));
  return {
    localUri: downloaded.uri,
    sizeBytes: downloaded.size,
    sizeMb,
  };
}

export function deleteOfflineTrackFile(localUri?: string): void {
  if (!localUri || Platform.OS === 'web') return;
  try {
    const file = new File(localUri);
    if (file.exists) {
      file.delete();
    }
  } catch (err) {
    console.warn('[OfflineDownload] Failed to delete file:', err);
  }
}

export function getPlayableOfflineUri(localUri?: string): string | null {
  if (!localUri || Platform.OS === 'web') return null;
  try {
    const file = new File(localUri);
    return file.exists ? localUri : null;
  } catch {
    return null;
  }
}
