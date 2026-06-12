import React, { useRef, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

/** Normalized strokes are fitted into this square viewbox for replay. */
export const DRAW_VIEWBOX = 1000;

export interface Point {
  x: number;
  y: number;
}

/**
 * Fit raw pixel strokes into the square DRAW_VIEWBOX, preserving aspect ratio
 * and centering with a 5% margin. Works for any canvas size or orientation —
 * nothing the performer draws can fall outside the replay viewbox.
 */
export function strokesToPaths(strokes: Point[][]): string[] {
  const drawn = strokes.filter((s) => s.length > 1);
  const pts = drawn.flat();
  if (pts.length === 0) return [];
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of pts) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  const span = Math.max(maxX - minX, maxY - minY, 1);
  const scale = (DRAW_VIEWBOX * 0.9) / span;
  const ox = (DRAW_VIEWBOX - (maxX - minX) * scale) / 2;
  const oy = (DRAW_VIEWBOX - (maxY - minY) * scale) / 2;
  return drawn.map((s) =>
    s
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${((p.x - minX) * scale + ox).toFixed(1)} ${((p.y - minY) * scale + oy).toFixed(1)}`)
      .join(' '),
  );
}

function toPixelPath(stroke: Point[]): string {
  return stroke.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
}

/**
 * Finger drawing surface. Live rendering stays in plain pixel space (no
 * scaling), strokes are normalized only when the parent calls strokesToPaths.
 * Single taps never produce strokes — a stroke needs at least two points.
 */
export function DrawingCanvas({
  strokes,
  onStrokesChange,
  strokeColor,
  strokeWidth,
  strokeOpacity = 1,
}: {
  strokes: Point[][];
  onStrokesChange: (strokes: Point[][]) => void;
  strokeColor: string;
  strokeWidth: number;
  strokeOpacity?: number;
}) {
  const [size, setSize] = useState({ w: 1, h: 1 });
  const [liveStroke, setLiveStroke] = useState<Point[] | null>(null);
  const currentRef = useRef<Point[]>([]);

  const begin = (x: number, y: number) => {
    currentRef.current = [{ x, y }];
    setLiveStroke(currentRef.current);
  };
  const extend = (x: number, y: number) => {
    currentRef.current = [...currentRef.current, { x, y }];
    setLiveStroke(currentRef.current);
  };
  const finish = () => {
    if (currentRef.current.length > 1) onStrokesChange([...strokes, currentRef.current]);
    currentRef.current = [];
    setLiveStroke(null);
  };

  const pan = Gesture.Pan()
    .minDistance(1)
    .onBegin((e) => {
      'worklet';
      runOnJS(begin)(e.x, e.y);
    })
    .onUpdate((e) => {
      'worklet';
      runOnJS(extend)(e.x, e.y);
    })
    .onFinalize(() => {
      'worklet';
      runOnJS(finish)();
    });

  const onLayout = (e: LayoutChangeEvent) =>
    setSize({ w: Math.max(1, e.nativeEvent.layout.width), h: Math.max(1, e.nativeEvent.layout.height) });

  const all = liveStroke ? [...strokes, liveStroke] : strokes;

  return (
    <GestureDetector gesture={pan}>
      <View style={styles.fill} onLayout={onLayout} collapsable={false}>
        <Svg width={size.w} height={size.h} viewBox={`0 0 ${size.w} ${size.h}`}>
          {all.map((s, i) => (
            <Path
              key={i}
              d={toPixelPath(s)}
              stroke={strokeColor}
              strokeOpacity={strokeOpacity}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          ))}
        </Svg>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
