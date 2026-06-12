import React, { useRef, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

/** Paths are normalized into this square viewbox so they replay at any size. */
export const DRAW_VIEWBOX = 1000;

/**
 * Finger drawing surface. Strokes are stored as SVG path strings in viewbox
 * coordinates, ready to be replayed by PredictionOverlay.
 */
export function DrawingCanvas({
  paths,
  onPathsChange,
  strokeColor,
  strokeWidth,
  strokeOpacity = 1,
}: {
  paths: string[];
  onPathsChange: (paths: string[]) => void;
  strokeColor: string;
  strokeWidth: number;
  strokeOpacity?: number;
}) {
  const [size, setSize] = useState({ w: 1, h: 1 });
  const [livePath, setLivePath] = useState<string | null>(null);
  const currentRef = useRef<string>('');

  const toViewbox = (x: number, y: number) => {
    const s = DRAW_VIEWBOX / Math.min(size.w, size.h);
    return `${(x * s).toFixed(1)} ${(y * s).toFixed(1)}`;
  };

  const begin = (x: number, y: number) => {
    currentRef.current = `M ${toViewbox(x, y)}`;
    setLivePath(currentRef.current);
  };
  const extend = (x: number, y: number) => {
    currentRef.current += ` L ${toViewbox(x, y)}`;
    setLivePath(currentRef.current);
  };
  const finish = () => {
    if (currentRef.current) onPathsChange([...paths, currentRef.current]);
    currentRef.current = '';
    setLivePath(null);
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

  const scale = Math.min(size.w, size.h) / DRAW_VIEWBOX;

  return (
    <GestureDetector gesture={pan}>
      <View style={styles.fill} onLayout={onLayout} collapsable={false}>
        <Svg width={size.w} height={size.h} viewBox={`0 0 ${size.w / scale} ${size.h / scale}`}>
          {[...paths, ...(livePath ? [livePath] : [])].map((d, i) => (
            <Path
              key={i}
              d={d}
              stroke={strokeColor}
              strokeOpacity={strokeOpacity}
              strokeWidth={strokeWidth / scale}
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
