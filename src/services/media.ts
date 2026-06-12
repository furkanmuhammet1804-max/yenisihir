import * as ImagePicker from 'expo-image-picker';
import * as VideoThumbnails from 'expo-video-thumbnails';
import * as FileSystem from 'expo-file-system/legacy';
import { makeId } from '../utils/id';

export interface PickedVideo {
  uri: string;
  durationSec: number;
  thumbnailUri?: string;
  width?: number;
  height?: number;
}

/**
 * Persistence strategy: the library stores bare filenames (e.g.
 * "media_x.mp4"), never absolute paths — on iOS the app container UUID (and
 * therefore documentDirectory) changes across updates, which would orphan
 * every stored absolute URI. `resolveMediaUri` re-anchors at runtime.
 */
export function resolveMediaUri(stored: string): string;
export function resolveMediaUri(stored?: string): string | undefined;
export function resolveMediaUri(stored?: string): string | undefined {
  if (!stored) return undefined;
  if (/^(https?|data|content|asset|ph):/.test(stored)) return stored;
  const dir = FileSystem.documentDirectory;
  if (stored.startsWith('file://')) {
    // legacy record from a build that stored absolute paths: re-anchor by name
    const name = stored.split('/').pop();
    return dir && name ? dir + name : stored;
  }
  return dir ? dir + stored : stored;
}

/** Migration helper: collapse legacy absolute file:// paths to bare filenames. */
export function toPortableUri(uri: string): string {
  if (uri.startsWith('file://')) return uri.split('/').pop() ?? uri;
  return uri;
}

/**
 * Copy a picked asset into app document storage and return its bare filename
 * (portable). Falls back to the original absolute uri if the copy fails.
 */
async function persistFile(srcUri: string, ext: string): Promise<string> {
  const dir = FileSystem.documentDirectory;
  if (!dir) return srcUri; // web fallback: use the original uri
  const name = `${makeId('media')}.${ext}`;
  try {
    await FileSystem.copyAsync({ from: srcUri, to: dir + name });
    return name;
  } catch {
    return srcUri;
  }
}

export async function pickVideoFromLibrary(): Promise<PickedVideo | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return null;
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['videos'],
    allowsEditing: false,
    quality: 1,
    videoExportPreset: ImagePicker.VideoExportPreset.Passthrough,
  });
  if (result.canceled || result.assets.length === 0) return null;
  const asset = result.assets[0];
  const storedUri = await persistFile(asset.uri, 'mp4');
  let thumbnailUri: string | undefined;
  try {
    const thumb = await VideoThumbnails.getThumbnailAsync(resolveMediaUri(storedUri), { time: 1000 });
    // thumbnails land in the purgeable cache dir — move them somewhere stable
    thumbnailUri = await persistFile(thumb.uri, 'jpg');
  } catch {
    thumbnailUri = undefined; // thumbnails are cosmetic — never block adding a video
  }
  return {
    uri: storedUri,
    durationSec: asset.duration ? asset.duration / 1000 : 0,
    thumbnailUri,
    width: asset.width || undefined,
    height: asset.height || undefined,
  };
}

/** Returns a resolved absolute uri — picture values live only in runtime perform state. */
export async function pickImage(fromCamera: boolean): Promise<string | null> {
  const perm = fromCamera
    ? await ImagePicker.requestCameraPermissionsAsync()
    : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return null;
  const result = fromCamera
    ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.9 })
    : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.9 });
  if (result.canceled || result.assets.length === 0) return null;
  const stored = await persistFile(result.assets[0].uri, 'jpg');
  return resolveMediaUri(stored) ?? null;
}
