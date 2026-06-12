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

/** Copy a picked asset into app storage so library entries survive gallery cleanups. */
async function persistFile(srcUri: string, ext: string): Promise<string> {
  const dir = FileSystem.documentDirectory;
  if (!dir) return srcUri; // web fallback: use the original uri
  const dest = `${dir}${makeId('media')}.${ext}`;
  try {
    await FileSystem.copyAsync({ from: srcUri, to: dest });
    return dest;
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
  const uri = await persistFile(asset.uri, 'mp4');
  let thumbnailUri: string | undefined;
  try {
    const thumb = await VideoThumbnails.getThumbnailAsync(uri, { time: 1000 });
    thumbnailUri = thumb.uri;
  } catch {
    thumbnailUri = undefined; // thumbnails are cosmetic — never block adding a video
  }
  return {
    uri,
    durationSec: asset.duration ? asset.duration / 1000 : 0,
    thumbnailUri,
    width: asset.width || undefined,
    height: asset.height || undefined,
  };
}

export async function pickImage(fromCamera: boolean): Promise<string | null> {
  const perm = fromCamera
    ? await ImagePicker.requestCameraPermissionsAsync()
    : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return null;
  const result = fromCamera
    ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.9 })
    : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.9 });
  if (result.canceled || result.assets.length === 0) return null;
  return persistFile(result.assets[0].uri, 'jpg');
}
