import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../navigation/types';
import { useAllLists } from '../store/useLibraryStore';
import { useT } from '../store/useSettingsStore';
import { transmitter } from '../services/transmitter';
import { Btn, Card, Chip, Label, SectionHeader } from '../components/ui';
import { colors, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Assistant'>;

/** Human-friendly pairing code: no 0/O or 1/I lookalikes. */
function makeSessionCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 6; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

/**
 * Assistant Mode: a second person types the spectator's choice here and it
 * appears in the show video. Runs over the in-process transmitter for now;
 * when a realtime backend lands, the session code becomes the channel id
 * (e.g. `mindframe:{code}`) and this screen stays unchanged.
 */
export function AssistantScreen({ navigation }: Props) {
  const t = useT();
  const insets = useSafeAreaInsets();
  const lists = useAllLists();
  const sessionCode = useMemo(makeSessionCode, []);
  const [value, setValue] = useState('');
  const [sentAt, setSentAt] = useState(0);
  const [activeListId, setActiveListId] = useState<string | null>(null);

  const activeList = lists.find((l) => l.id === activeListId);

  const send = (v: string) => {
    const text = v.trim();
    if (!text) return;
    transmitter.send({ kind: 'text', value: text });
    setValue('');
    setSentAt(Date.now());
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{
        paddingTop: insets.top + spacing(3),
        paddingHorizontal: spacing(4),
        paddingBottom: insets.bottom + spacing(10),
      }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.headerRow}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.back}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{t('as_title')}</Text>
        <View style={{ width: 34 }} />
      </View>

      <Label style={{ marginBottom: spacing(4) }}>{t('as_intro')}</Label>

      {/* session code — becomes the realtime channel id later */}
      <Card style={styles.codeCard}>
        <Label>{t('as_codeLabel')}</Label>
        <Text style={styles.code}>{sessionCode}</Text>
        <Label style={{ fontSize: 11 }}>{t('as_codeHint')}</Label>
      </Card>

      <SectionHeader>{t('as_valueLabel')}</SectionHeader>
      <Card>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={setValue}
          placeholder={t('as_valuePh')}
          placeholderTextColor={colors.textDim}
          onSubmitEditing={() => send(value)}
          returnKeyType="send"
        />
        <Btn block kind="gold" label={t('as_send')} onPress={() => send(value)} />
        {sentAt > 0 && <Text style={styles.sent}>✓ {t('as_sent')}</Text>}
      </Card>

      {/* quick pick from ready lists — assistants shouldn't have to type cards */}
      <SectionHeader>{t('as_quickLabel')}</SectionHeader>
      <View style={styles.chipRow}>
        {lists.map((l) => (
          <Chip
            key={l.id}
            label={l.name}
            active={activeListId === l.id}
            onPress={() => setActiveListId((cur) => (cur === l.id ? null : l.id))}
          />
        ))}
      </View>
      {activeList && (
        <Card style={{ marginTop: spacing(2) }}>
          <View style={styles.chipRow}>
            {activeList.items.map((item, i) => (
              <Chip key={`${item}_${i}`} label={item} active={false} onPress={() => send(item)} />
            ))}
          </View>
        </Card>
      )}

      <SectionHeader>{t('as_howTitle')}</SectionHeader>
      <Card>
        <Text style={styles.how}>{t('as_how1')}</Text>
        <Text style={styles.how}>{t('as_how2')}</Text>
        <Text style={styles.how}>{t('as_how3')}</Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing(3) },
  back: { color: colors.text, fontSize: 34, fontWeight: '300', paddingHorizontal: spacing(2) },
  headerTitle: { color: colors.text, fontSize: 18, fontWeight: '700' },
  codeCard: { alignItems: 'center', gap: spacing(2) },
  code: {
    color: colors.gold,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 10,
    fontVariant: ['tabular-nums'],
  },
  input: {
    backgroundColor: colors.bg,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(3),
    fontSize: 16,
    marginBottom: spacing(3),
  },
  sent: { color: colors.success, fontSize: 13, marginTop: spacing(3), textAlign: 'center' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap' },
  how: { color: colors.textDim, fontSize: 13, lineHeight: 20, marginBottom: spacing(2) },
});
