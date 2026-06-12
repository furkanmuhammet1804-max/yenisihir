/**
 * MindFrame — core domain types.
 * Every persisted entity lives here so storage/migration stays in one place.
 */

/** What kind of prediction a single reveal shows on top of the video. */
export type RevealType = 'number' | 'text' | 'drawing' | 'picture';

/** How the performer secretly enters the prediction during the show. */
export type InputMethod =
  | 'gridNoDim' // invisible tap grid while video plays
  | 'gridDim' // grid + subtle screen dim as cover
  | 'pause' // taps disguised as pausing the video
  | 'afterPause' // pause first, enter digits, resume
  | 'lockScreen' // fake lock screen, passcode = prediction
  | 'password' // fake password gate before video starts
  | 'drawing' // secret finger drawing pad
  | 'picture' // pick a photo from gallery/camera
  | 'remote'; // assistant device sends the value (mock for now)

/** Visual style + placement of an overlay. Position is relative (0..1). */
export interface OverlayStyle {
  x: number; // 0..1 of video view width (center of overlay)
  y: number; // 0..1 of video view height
  fontSize: number; // pt
  fontWeight: '400' | '600' | '700' | '900';
  fontFamily: FontChoice;
  color: string;
  opacity: number; // 0..1
  rotation: number; // degrees
  skewX: number; // degrees, cheap "perspective" feel
  scale: number; // extra multiplier for drawings/pictures
}

export type FontChoice = 'system' | 'serif' | 'mono' | 'condensed';

/** How a reveal appears on screen at its inTime. */
export type RevealAnimation = 'fade' | 'slideUp' | 'pop' | 'none';

/** A single reveal moment inside a video. Multi-prediction = several reveals. */
export interface Reveal {
  id: string;
  label: string; // editor-facing name, e.g. "Sayı reveal"
  type: RevealType;
  inputMethod: InputMethod;
  inTime: number; // seconds — overlay becomes visible
  outTime: number; // seconds — overlay hides; <=0 means "until end"
  animation: RevealAnimation;
  style: OverlayStyle;
  /** Number reveals can map through an index list (28 -> 28th card). */
  indexListId?: string;
  /** Optional static text around the value, e.g. prefix "My prediction: ". */
  prefix?: string;
  suffix?: string;
  /** Digits expected for grid/pause/lock inputs (1–4). */
  digitCount: number;
}

/** A performable video in the library. */
export interface TrickVideo {
  id: string;
  name: string;
  uri: string;
  thumbnailUri?: string;
  durationSec: number;
  /** Natural pixel size — used to letterbox-match overlay positions. */
  width?: number;
  height?: number;
  isDemo: boolean;
  /** Locked behind the premium entitlement (see usePremiumStore). */
  premium?: boolean;
  reveals: Reveal[];
  createdAt: number;
  updatedAt: number;
}

/** Custom or built-in index list (cards, countries, names…). */
export interface IndexList {
  id: string;
  name: string;
  items: string[];
  builtIn: boolean;
}

/** Value entered live during a performance, keyed by reveal id. */
export interface PerformValue {
  revealId: string;
  /** Resolved display value: text, number string, image uri… */
  display: string;
  /** For drawing reveals: serialized SVG path strings. */
  paths?: string[];
  /** For picture reveals: local image uri. */
  imageUri?: string;
}

export type GridSize = '3x3' | '4x3';

export type Language = 'tr' | 'en';

export interface ShareProfile {
  instagram: string;
  whatsapp: string;
  website: string;
  phone: string;
  caption: string;
}

export interface Settings {
  language: Language;
  defaultInputMethod: InputMethod;
  gridSize: GridSize;
  /** Practice mode: faintly show the grid + entered digits to the performer. */
  gridPractice: boolean;
  /** Seconds before reveal when gridDim starts dimming the screen. */
  dimLeadSec: number;
  /** Extra delay added on top of every reveal inTime. */
  revealDelaySec: number;
  /** Show fake dots/asterisks on lock & password screens. */
  fakeMaskInput: boolean;
  defaultFont: FontChoice;
  defaultColor: string;
  share: ShareProfile;
}

/** Derived label shown on gallery cards. */
export function predictionKind(v: TrickVideo): RevealType | 'multi' | 'none' {
  if (v.reveals.length === 0) return 'none';
  if (v.reveals.length > 1) return 'multi';
  return v.reveals[0].type;
}
