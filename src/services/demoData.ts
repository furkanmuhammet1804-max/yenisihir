import type { OverlayStyle, TrickVideo } from '../types';

/**
 * Demo entries stream royalty-free sample clips so the app never opens empty.
 * Users replace them with their own pre-recorded prediction videos.
 */
const baseStyle: OverlayStyle = {
  x: 0.5,
  y: 0.42,
  fontSize: 64,
  fontWeight: '700',
  fontFamily: 'system',
  color: '#F2F0EB',
  opacity: 0.92,
  rotation: 0,
  skewX: 0,
  scale: 1,
};

export const demoVideos: TrickVideo[] = [
  {
    id: 'demo_number',
    name: 'Demo — Sayı Tahmini',
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    durationSec: 15,
    width: 1280,
    height: 720,
    isDemo: true,
    createdAt: 0,
    updatedAt: 0,
    reveals: [
      {
        id: 'demo_number_r1',
        label: 'Sayı',
        type: 'number',
        inputMethod: 'gridNoDim',
        inTime: 8,
        outTime: 0,
        animation: 'fade',
        digitCount: 2,
        style: { ...baseStyle, color: '#D4AF37' },
        prefix: '',
        suffix: '',
      },
    ],
  },
  {
    id: 'demo_text',
    name: 'Demo — İsim Tahmini',
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    durationSec: 15,
    width: 1280,
    height: 720,
    isDemo: true,
    createdAt: 0,
    updatedAt: 0,
    reveals: [
      {
        id: 'demo_text_r1',
        label: 'İsim',
        type: 'text',
        inputMethod: 'password',
        inTime: 7,
        outTime: 0,
        animation: 'slideUp',
        digitCount: 2,
        style: { ...baseStyle, fontSize: 48, fontFamily: 'serif' },
        prefix: '',
        suffix: '',
      },
    ],
  },
  {
    id: 'demo_card',
    name: 'Demo — Kart Tahmini (Index)',
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    durationSec: 15,
    width: 1280,
    height: 720,
    isDemo: true,
    // showcases the premium gate end to end with the mock entitlement
    premium: true,
    createdAt: 0,
    updatedAt: 0,
    reveals: [
      {
        id: 'demo_card_r1',
        label: 'Kart',
        type: 'number',
        inputMethod: 'pause',
        inTime: 9,
        outTime: 0,
        animation: 'pop',
        digitCount: 2,
        indexListId: 'builtin_cards',
        style: { ...baseStyle, fontSize: 40, color: '#8B5CF6' },
        prefix: '',
        suffix: '',
      },
    ],
  },
];
