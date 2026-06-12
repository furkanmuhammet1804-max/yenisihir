import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View, type GestureResponderEvent, type LayoutChangeEvent } from 'react-native';
import type { GridSize } from '../types';

export type GridAction = { kind: 'digit'; digit: number } | { kind: 'delete' } | { kind: 'commit' };

/**
 * Invisible tap keypad covering the video.
 * 3x3 -> digits 1..9; a long-press anywhere enters 0, so values like 10/20/30
 * and zero-padded digits (07) work on every layout.
 * 4x3 adds a phone-style bottom row: delete | 0 | commit.
 * `practice` paints a faint grid so the performer can rehearse zones.
 */
export function GridInputLayer({
  gridSize,
  practice,
  enabled,
  onAction,
  zeroHint,
}: {
  gridSize: GridSize;
  practice: boolean;
  enabled: boolean;
  onAction: (a: GridAction) => void;
  zeroHint?: string;
}) {
  const rows = gridSize === '3x3' ? 3 : 4;
  const cols = 3;
  const [size, setSize] = useState({ w: 1, h: 1 });

  const cellToAction = (cell: number): GridAction => {
    if (cell < 9) return { kind: 'digit', digit: cell + 1 };
    if (cell === 9) return { kind: 'delete' };
    if (cell === 10) return { kind: 'digit', digit: 0 };
    return { kind: 'commit' };
  };

  const handlePress = (e: GestureResponderEvent) => {
    if (!enabled) return;
    const { locationX, locationY } = e.nativeEvent;
    const col = Math.min(cols - 1, Math.floor((locationX / size.w) * cols));
    const row = Math.min(rows - 1, Math.floor((locationY / size.h) * rows));
    onAction(cellToAction(row * cols + col));
  };

  const handleLongPress = () => {
    if (!enabled) return;
    onAction({ kind: 'digit', digit: 0 });
  };

  const onLayout = (e: LayoutChangeEvent) =>
    setSize({ w: Math.max(1, e.nativeEvent.layout.width), h: Math.max(1, e.nativeEvent.layout.height) });

  const labels =
    rows === 3 ? ['1', '2', '3', '4', '5', '6', '7', '8', '9'] : ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', '✓'];

  return (
    <Pressable
      style={[StyleSheet.absoluteFill, { pointerEvents: enabled ? 'auto' : 'none' }]}
      onLayout={onLayout}
      onPress={handlePress}
      onLongPress={handleLongPress}
      delayLongPress={380}
    >
      {practice && (
        <View style={[StyleSheet.absoluteFill, styles.practiceWrap]} pointerEvents="none">
          {labels.map((l, i) => (
            <View key={i} style={[styles.cell, { width: `${100 / cols}%`, height: `${100 / rows}%` }]}>
              <Text style={styles.cellText}>{l}</Text>
            </View>
          ))}
          {rows === 3 && zeroHint ? <Text style={styles.zeroHint}>{zeroHint}</Text> : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  practiceWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  cellText: { color: 'rgba(255,255,255,0.18)', fontSize: 22, fontWeight: '700' },
  zeroHint: {
    position: 'absolute',
    bottom: 8,
    alignSelf: 'center',
    color: 'rgba(255,255,255,0.22)',
    fontSize: 12,
  },
});
