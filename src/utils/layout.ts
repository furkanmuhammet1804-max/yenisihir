export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Where a `contentFit="contain"` video actually lands inside a container.
 * Overlay coordinates are stored relative to this rect, so a reveal placed in
 * the 16:9 editor preview shows up at the same spot on a full portrait screen.
 */
export function fitRect(videoW: number, videoH: number, boxW: number, boxH: number): Rect {
  if (videoW <= 0 || videoH <= 0 || boxW <= 0 || boxH <= 0) {
    return { x: 0, y: 0, w: Math.max(1, boxW), h: Math.max(1, boxH) };
  }
  const scale = Math.min(boxW / videoW, boxH / videoH);
  const w = videoW * scale;
  const h = videoH * scale;
  return { x: (boxW - w) / 2, y: (boxH - h) / 2, w, h };
}
