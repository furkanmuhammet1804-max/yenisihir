import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Btn } from './ui';
import { colors, radius, spacing } from '../theme';

/**
 * D-VIR style gate: a believable "protected video" screen shown before
 * playback. Whatever is typed becomes the prediction; with `fakeMask` the
 * audience only sees •••• while the real text is captured.
 */
export function PasswordGate({
  title,
  placeholder,
  unlockLabel,
  fakeMask,
  onComplete,
}: {
  title: string;
  placeholder: string;
  unlockLabel: string;
  fakeMask: boolean;
  onComplete: (text: string) => void;
}) {
  const [text, setText] = useState('');
  return (
    <View style={[StyleSheet.absoluteFill, styles.wrap]}>
      <View style={styles.box}>
        <Text style={styles.lockIcon}>🔒</Text>
        <Text style={styles.title}>{title}</Text>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder={placeholder}
          placeholderTextColor={colors.textDim}
          secureTextEntry={fakeMask}
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus
        />
        <Btn label={unlockLabel} onPress={() => text.trim() && onComplete(text.trim())} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: '#05050A', alignItems: 'center', justifyContent: 'center', zIndex: 30 },
  box: {
    width: '82%',
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing(6),
    alignItems: 'center',
    gap: spacing(4),
  },
  lockIcon: { fontSize: 40 },
  title: { color: colors.text, fontSize: 17, fontWeight: '600', textAlign: 'center' },
  input: {
    alignSelf: 'stretch',
    backgroundColor: colors.bg,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(3),
    fontSize: 16,
  },
});
