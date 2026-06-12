import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme';

/**
 * Fake lock screen. The "passcode" the performer types is the prediction.
 * When `fakeMask` is on, the audience only ever sees dots.
 */
export function LockScreenOverlay({
  digitCount,
  fakeMask,
  hint,
  onComplete,
}: {
  digitCount: number;
  fakeMask: boolean;
  hint: string;
  onComplete: (digits: string) => void;
}) {
  const [entered, setEntered] = useState('');

  // brief beat so the last dot is visible before "unlocking"; cleared on unmount
  useEffect(() => {
    if (entered.length < digitCount) return;
    const id = setTimeout(() => onComplete(entered), 250);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entered, digitCount]);

  const press = (d: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setEntered((e) => e + d);
  };

  const now = new Date();
  const clock = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  return (
    <View style={[StyleSheet.absoluteFill, styles.wrap]}>
      <Text style={styles.clock}>{clock}</Text>
      <Text style={styles.hint}>{hint}</Text>
      <View style={styles.dots}>
        {Array.from({ length: digitCount }).map((_, i) => (
          <View key={i} style={[styles.dot, i < entered.length && styles.dotFilled]}>
            {!fakeMask && i < entered.length ? <Text style={styles.dotDigit}>{entered[i]}</Text> : null}
          </View>
        ))}
      </View>
      <View style={styles.pad}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((k, i) =>
          k === '' ? (
            <View key={i} style={styles.key} />
          ) : (
            <Pressable
              key={i}
              style={({ pressed }) => [styles.key, styles.keyVisible, pressed && styles.keyPressed]}
              onPress={() => (k === '⌫' ? setEntered((e) => e.slice(0, -1)) : press(k))}
            >
              <Text style={styles.keyText}>{k}</Text>
            </Pressable>
          ),
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: '#05050A', alignItems: 'center', justifyContent: 'center', zIndex: 30 },
  clock: { color: '#E8E6F0', fontSize: 64, fontWeight: '200', letterSpacing: 2 },
  hint: { color: '#8A8896', fontSize: 15, marginTop: 18, marginBottom: 22 },
  dots: { flexDirection: 'row', gap: 16, marginBottom: 34 },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#8A8896',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotFilled: { backgroundColor: '#E8E6F0' },
  dotDigit: { color: '#05050A', fontSize: 10, fontWeight: '700' },
  pad: { flexDirection: 'row', flexWrap: 'wrap', width: 282, justifyContent: 'center', gap: 14 },
  key: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  keyVisible: { backgroundColor: 'rgba(255,255,255,0.08)' },
  keyPressed: { backgroundColor: 'rgba(255,255,255,0.22)' },
  keyText: { color: colors.text, fontSize: 30, fontWeight: '400' },
});
