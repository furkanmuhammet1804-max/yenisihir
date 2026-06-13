import React from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { colors, radius, spacing } from '../theme';

export function Title({ children }: { children: React.ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function Label({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[styles.label, style]}>{children}</Text>;
}

export function SectionHeader({ children, info }: { children: React.ReactNode; info?: string }) {
  return (
    <View style={styles.sectionRow}>
      <Text style={styles.section}>{children}</Text>
      {info ? <InfoDot text={info} /> : null}
    </View>
  );
}

/** Tiny ⓘ that explains what a control does — required on every key action. */
export function InfoDot({ text }: { text: string }) {
  return (
    <Pressable
      hitSlop={10}
      onPress={() => Alert.alert('ⓘ', text)}
      style={styles.infoDot}
      accessibilityLabel="info"
    >
      <Text style={styles.infoDotText}>i</Text>
    </Pressable>
  );
}

export function Btn({
  label,
  onPress,
  kind = 'primary',
  info,
  small,
  block,
  style,
}: {
  label: string;
  onPress: () => void;
  kind?: 'primary' | 'ghost' | 'danger' | 'gold';
  info?: string;
  small?: boolean;
  /** Stretch to the full available width. */
  block?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const bg =
    kind === 'primary' ? colors.accent : kind === 'gold' ? colors.gold : kind === 'danger' ? colors.danger : 'transparent';
  const fg = kind === 'gold' ? '#1A1505' : kind === 'ghost' ? colors.text : '#FFFFFF';
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center' }, style]}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.btn,
          small && styles.btnSmall,
          block && { flex: 1 },
          { backgroundColor: bg, opacity: pressed ? 0.75 : 1 },
          kind === 'ghost' && styles.btnGhost,
        ]}
      >
        <Text style={[styles.btnText, small && styles.btnTextSmall, { color: fg }]}>{label}</Text>
      </Pressable>
      {info ? <InfoDot text={info} /> : null}
    </View>
  );
}

export function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && { backgroundColor: colors.accentSoft, borderColor: colors.accent }]}
    >
      <Text style={[styles.chipText, active && { color: colors.text }]}>{label}</Text>
    </Pressable>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 26, fontWeight: '800', letterSpacing: 1 },
  label: { color: colors.textDim, fontSize: 13 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing(5), marginBottom: spacing(2) },
  section: { color: colors.gold, fontSize: 13, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase' },
  infoDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: colors.textDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing(2),
  },
  infoDotText: { color: colors.textDim, fontSize: 11, fontStyle: 'italic', fontWeight: '700' },
  btn: {
    paddingHorizontal: spacing(5),
    paddingVertical: spacing(3),
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSmall: { paddingHorizontal: spacing(3), paddingVertical: spacing(2), borderRadius: radius.sm },
  btnGhost: { borderWidth: 1, borderColor: colors.border },
  btnText: { fontSize: 15, fontWeight: '700' },
  btnTextSmall: { fontSize: 13 },
  chip: {
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(2),
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginRight: spacing(2),
    marginBottom: spacing(2),
  },
  chipText: { color: colors.textDim, fontSize: 13, fontWeight: '600' },
  // "glass" card: translucent fill + hairline light border on the dark bg
  card: {
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    padding: spacing(4),
  },
});
