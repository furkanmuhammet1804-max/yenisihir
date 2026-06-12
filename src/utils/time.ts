/** 75.4 -> "01:15.4" */
export function formatTime(sec: number): string {
  if (!isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = sec - m * 60;
  return `${String(m).padStart(2, '0')}:${s.toFixed(1).padStart(4, '0')}`;
}

export const FRAME_STEP = 1 / 30; // assume 30 fps for frame nudging

export function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}
