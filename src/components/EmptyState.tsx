import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme';

export function EmptyState({ title, body, icon = '🃏' }: { title: string; body: string; icon?: string }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: spacing(10), paddingHorizontal: spacing(8), gap: spacing(2) },
  icon: { fontSize: 44 },
  title: { color: colors.text, fontSize: 18, fontWeight: '700' },
  body: { color: colors.textDim, fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
