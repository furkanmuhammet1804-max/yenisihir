import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { Reveal } from '../types';
import { colors } from '../theme';

/**
 * Compact timeline strip: each reveal paints its [in, out] window, the gold
 * line is the playhead. Sits right above the scrubber.
 */
export function TimelineBar({
  duration,
  position,
  reveals,
  activeRevealId,
}: {
  duration: number;
  position: number;
  reveals: Reveal[];
  activeRevealId: string | null;
}) {
  const d = Math.max(0.1, duration);
  const pct = (sec: number) => `${Math.min(100, Math.max(0, (sec / d) * 100))}%` as const;

  return (
    <View style={styles.track}>
      {reveals.map((r) => {
        const out = r.outTime > 0 ? r.outTime : d;
        const active = r.id === activeRevealId;
        return (
          <React.Fragment key={r.id}>
            <View
              style={[
                styles.segment,
                {
                  left: pct(r.inTime),
                  width: pct(Math.max(0.15, out - r.inTime)),
                  backgroundColor: active ? colors.gold : colors.accent,
                  opacity: active ? 0.85 : 0.45,
                },
              ]}
            />
            <View style={[styles.tick, { left: pct(r.inTime), backgroundColor: active ? colors.gold : colors.accent }]} />
            {r.outTime > 0 && (
              <View style={[styles.tick, { left: pct(r.outTime), backgroundColor: active ? colors.gold : colors.accent }]} />
            )}
          </React.Fragment>
        );
      })}
      <View style={[styles.playhead, { left: pct(position) }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.surfaceHigh,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: 2,
  },
  segment: { position: 'absolute', top: 5, bottom: 5, borderRadius: 6 },
  tick: { position: 'absolute', top: 0, bottom: 0, width: 2 },
  playhead: { position: 'absolute', top: 0, bottom: 0, width: 2, backgroundColor: '#FFFFFF' },
});
