import { Platform } from 'react-native';
import type { FontChoice } from '../types';

/** MindFrame visual language: black / anthracite / violet / gold. */
export const colors = {
  bg: '#0B0B10',
  surface: '#15151D',
  surfaceHigh: '#1D1D28',
  border: '#2A2A38',
  text: '#F2F0EB',
  textDim: '#9A97A6',
  accent: '#8B5CF6', // violet
  accentSoft: '#8B5CF622',
  gold: '#D4AF37',
  goldSoft: '#D4AF3722',
  danger: '#E5484D',
  success: '#46A758',
  overlayScrim: 'rgba(0,0,0,0.55)',
};

export const spacing = (n: number) => n * 4;

export const radius = { sm: 8, md: 14, lg: 22, full: 999 };

export const fontFamilies: Record<FontChoice, string | undefined> = {
  system: undefined,
  serif: Platform.select({ ios: 'Georgia', android: 'serif' }),
  mono: Platform.select({ ios: 'Courier New', android: 'monospace' }),
  condensed: Platform.select({ ios: 'AvenirNextCondensed-DemiBold', android: 'sans-serif-condensed' }),
};

export const swatches = [
  '#F2F0EB', // bone white
  '#D4AF37', // gold
  '#8B5CF6', // violet
  '#E5484D', // red
  '#3DD6D0', // cyan
  '#111111', // ink
];
