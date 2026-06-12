import React from 'react';
import { Image, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInUp, ZoomIn } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import type { Reveal, RevealAnimation } from '../types';
import { fontFamilies } from '../theme';
import type { Rect } from '../utils/layout';
import { DRAW_VIEWBOX } from './DrawingCanvas';

export interface OverlayContent {
  display: string;
  paths?: string[];
  imageUri?: string;
}

/** Subtle entrances — the goal is "it was always in the footage", not a show-off effect. */
function enteringFor(animation: RevealAnimation | undefined) {
  switch (animation ?? 'fade') {
    case 'none':
      return undefined;
    case 'slideUp':
      return FadeInUp.duration(700);
    case 'pop':
      return ZoomIn.duration(450);
    case 'fade':
    default:
      return FadeIn.duration(600);
  }
}

/**
 * Draws one reveal on top of the video. Coordinates are relative to the
 * actual video rect (letterbox-aware), so editor preview and full-screen
 * perform place the overlay on the exact same pixel of the footage.
 */
export function PredictionOverlay({
  reveal,
  content,
  rect,
  animated = false,
}: {
  reveal: Reveal;
  content: OverlayContent;
  rect: Rect;
  animated?: boolean;
}) {
  const { style } = reveal;
  const cx = rect.x + style.x * rect.w;
  const cy = rect.y + style.y * rect.h;
  // scale typography with the rendered video size so it matches across screens
  const unit = rect.w / 1000;
  const fontSize = style.fontSize * unit * 2.2;

  const transform = [
    { rotate: `${style.rotation}deg` },
    { skewX: `${style.skewX}deg` },
    { scale: style.scale },
  ];

  let body: React.ReactNode = null;
  if (reveal.type === 'drawing' && content.paths && content.paths.length > 0) {
    const side = Math.min(rect.w, rect.h) * 0.55;
    body = (
      <Svg width={side} height={side} viewBox={`0 0 ${DRAW_VIEWBOX} ${DRAW_VIEWBOX}`}>
        {content.paths.map((d, i) => (
          <Path
            key={i}
            d={d}
            stroke={style.color}
            strokeWidth={Math.max(4, style.fontSize / 6)}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        ))}
      </Svg>
    );
  } else if (reveal.type === 'picture' && content.imageUri) {
    const side = Math.min(rect.w, rect.h) * 0.5;
    body = (
      <Image
        source={{ uri: content.imageUri }}
        style={{ width: side, height: side, borderRadius: 6 }}
        resizeMode="cover"
      />
    );
  } else {
    const text = `${reveal.prefix ?? ''}${content.display}${reveal.suffix ?? ''}`;
    if (!text) return null;
    body = (
      <Text
        style={{
          color: style.color,
          fontSize,
          fontWeight: style.fontWeight,
          fontFamily: fontFamilies[style.fontFamily],
          textAlign: 'center',
        }}
      >
        {text}
      </Text>
    );
  }

  // A full-size box centered on (cx, cy) keeps the content's center exactly at
  // the anchor point without measuring, on any screen size.
  return (
    <Animated.View
      pointerEvents="none"
      entering={animated ? enteringFor(reveal.animation) : undefined}
      style={{
        position: 'absolute',
        left: cx - rect.w / 2,
        top: cy - rect.h / 2,
        width: rect.w,
        height: rect.h,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: style.opacity,
      }}
    >
      <View style={{ transform }}>{body}</View>
    </Animated.View>
  );
}
