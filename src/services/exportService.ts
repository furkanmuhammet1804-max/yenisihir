import type { PerformValue, TrickVideo } from '../types';
import { resolveMediaUri } from './media';

/**
 * Video export architecture.
 *
 * MVP ships `PassthroughExporter`: it returns the original file and flags
 * `rendered: false` so the UI can tell the user the overlay is not burned in
 * (and point them to screen recording instead).
 *
 * When a development build with `ffmpeg-kit-react-native` (or a custom native
 * module) is added, implement `FfmpegExporter` against the same interface and
 * swap the factory below — no screen code changes.
 */

export interface ExportResult {
  uri: string;
  /** true once a real renderer burns reveals into the footage */
  rendered: boolean;
}

export interface VideoExporter {
  exportVideo(video: TrickVideo, values: PerformValue[]): Promise<ExportResult>;
}

class PassthroughExporter implements VideoExporter {
  async exportVideo(video: TrickVideo): Promise<ExportResult> {
    return { uri: resolveMediaUri(video.uri), rendered: false };
  }
}

/*
class FfmpegExporter implements VideoExporter {
  async exportVideo(video: TrickVideo, values: PerformValue[]): Promise<ExportResult> {
    // 1. rasterize each reveal (text/drawing/picture) to a transparent PNG
    // 2. ffmpeg -i video -i overlay.png -filter_complex
    //      "[0][1]overlay=x:y:enable='between(t,IN,OUT)'" out.mp4
    // 3. return { uri: out, rendered: true }
  }
}
*/

export const exporter: VideoExporter = new PassthroughExporter();
