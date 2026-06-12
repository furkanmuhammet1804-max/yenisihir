import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../navigation/types';
import { useLibraryStore } from '../store/useLibraryStore';
import { getBuiltInLists } from '../services/builtInLists';
import { useSettingsStore, useT } from '../store/useSettingsStore';
import { Btn, Card, Label, SectionHeader, Title } from '../components/ui';
import { colors, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'IndexLists'>;

export function IndexListsScreen({ navigation }: Props) {
  const t = useT();
  const insets = useSafeAreaInsets();
  const lang = useSettingsStore((s) => s.language);
  const builtIns = getBuiltInLists(lang);
  const customLists = useLibraryStore((s) => s.customLists);
  const addList = useLibraryStore((s) => s.addList);
  const updateList = useLibraryStore((s) => s.updateList);
  const removeList = useLibraryStore((s) => s.removeList);

  const [name, setName] = useState('');
  const [itemsText, setItemsText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const save = () => {
    const items = itemsText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    if (!name.trim() || items.length === 0) return;
    if (editingId) updateList(editingId, { name: name.trim(), items });
    else addList(name.trim(), items);
    setName('');
    setItemsText('');
    setEditingId(null);
  };

  const startEdit = (id: string) => {
    const list = customLists.find((l) => l.id === id);
    if (!list) return;
    setEditingId(id);
    setName(list.name);
    setItemsText(list.items.join('\n'));
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{
        paddingTop: insets.top + spacing(4),
        paddingHorizontal: spacing(4),
        paddingBottom: insets.bottom + spacing(10),
      }}
    >
      <Title>{t('indexLists')}</Title>
      <Label style={{ marginTop: 4 }}>{t('il_empty')}</Label>

      <SectionHeader>{editingId ? t('il_edit') : t('il_new')}</SectionHeader>
      <Card>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder={t('il_name')}
          placeholderTextColor={colors.textDim}
        />
        <TextInput
          style={[styles.input, styles.multiline]}
          value={itemsText}
          onChangeText={setItemsText}
          placeholder={t('il_items')}
          placeholderTextColor={colors.textDim}
          multiline
        />
        <View style={{ flexDirection: 'row', gap: spacing(2) }}>
          <Btn small label={t('save')} onPress={save} />
          {editingId && (
            <Btn
              small
              kind="ghost"
              label={t('cancel')}
              onPress={() => {
                setEditingId(null);
                setName('');
                setItemsText('');
              }}
            />
          )}
        </View>
      </Card>

      <SectionHeader>{t('il_custom')}</SectionHeader>
      {customLists.map((l) => (
        <Card key={l.id} style={{ marginBottom: spacing(2) }}>
          <View style={styles.listRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.listName}>{l.name}</Text>
              <Label>{l.items.length} {t('itemsWord')} · {l.items.slice(0, 4).join(', ')}…</Label>
            </View>
            <Btn small kind="ghost" label={t('il_edit')} onPress={() => startEdit(l.id)} />
            <Btn small kind="danger" label={t('delete')} onPress={() => removeList(l.id)} />
          </View>
        </Card>
      ))}

      <SectionHeader>{t('il_builtIn')}</SectionHeader>
      {builtIns.map((l) => (
        <Card key={l.id} style={{ marginBottom: spacing(2) }}>
          <Text style={styles.listName}>{l.name}</Text>
          <Label>{l.items.length} {t('itemsWord')} · {l.items.slice(0, 4).join(', ')}…</Label>
        </Card>
      ))}

      <View style={{ marginTop: spacing(4) }}>
        <Btn kind="ghost" label={t('backToGallery')} onPress={() => navigation.goBack()} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  input: {
    backgroundColor: colors.bg,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(2),
    fontSize: 14,
    marginBottom: spacing(2),
  },
  multiline: { minHeight: 110, textAlignVertical: 'top' },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: spacing(2) },
  listName: { color: colors.text, fontSize: 15, fontWeight: '700', marginBottom: 2 },
});
