import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../navigation/types';
import { useLibraryStore } from '../store/useLibraryStore';
import { useSettingsStore, useT } from '../store/useSettingsStore';
import { Btn, Card, Label, SectionHeader, Title } from '../components/ui';
import { colors, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Share'>;

import { exporter } from '../services/exportService';

export function ShareScreen({ navigation, route }: Props) {
  const t = useT();
  const insets = useSafeAreaInsets();
  const video = useLibraryStore((s) => s.videos.find((v) => v.id === route.params.videoId));
  const share = useSettingsStore((s) => s.share);
  const setShare = useSettingsStore((s) => s.setShare);

  const defaultCaption = [
    share.caption,
    share.instagram && `Instagram: ${share.instagram}`,
    share.whatsapp && `WhatsApp: ${share.whatsapp}`,
    share.website && share.website,
    share.phone && share.phone,
  ]
    .filter(Boolean)
    .join('\n');

  const [caption, setCaption] = useState(defaultCaption);

  const copy = async () => {
    await Clipboard.setStringAsync(caption);
    Alert.alert('✓', t('copied'));
  };

  const shareVideo = async () => {
    if (!video) return;
    try {
      const result = await exporter.exportVideo(video, []);
      if (await Sharing.isAvailableAsync()) {
        await Clipboard.setStringAsync(caption); // caption ready to paste
        await Sharing.shareAsync(result.uri, { dialogTitle: video.name });
      }
    } catch {
      Alert.alert('!', t('shareMockNote'));
    }
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{
        paddingTop: insets.top + spacing(4),
        paddingHorizontal: spacing(4),
        paddingBottom: insets.bottom + spacing(8),
      }}
    >
      <Title>{t('shareTitle')}</Title>
      {video && <Label style={{ marginTop: 4 }}>{video.name}</Label>}

      <SectionHeader>{t('shareCaption')}</SectionHeader>
      <TextInput
        style={styles.caption}
        value={caption}
        onChangeText={setCaption}
        multiline
        placeholderTextColor={colors.textDim}
      />
      <View style={styles.row}>
        <TextInput
          style={styles.smallInput}
          value={share.instagram}
          onChangeText={(instagram) => setShare({ instagram })}
          placeholder="Instagram"
          placeholderTextColor={colors.textDim}
        />
        <TextInput
          style={styles.smallInput}
          value={share.whatsapp}
          onChangeText={(whatsapp) => setShare({ whatsapp })}
          placeholder="WhatsApp"
          placeholderTextColor={colors.textDim}
        />
      </View>
      <View style={styles.row}>
        <TextInput
          style={styles.smallInput}
          value={share.website}
          onChangeText={(website) => setShare({ website })}
          placeholder="Web"
          placeholderTextColor={colors.textDim}
        />
        <TextInput
          style={styles.smallInput}
          value={share.phone}
          onChangeText={(phone) => setShare({ phone })}
          placeholder="Tel"
          placeholderTextColor={colors.textDim}
        />
      </View>

      <View style={{ gap: spacing(3), marginTop: spacing(5) }}>
        <Btn label={t('copyCaption')} onPress={copy} />
        <Btn kind="gold" label={t('shareVideo')} onPress={shareVideo} />
        <Btn kind="ghost" label={t('backToGallery')} onPress={() => navigation.popToTop()} />
      </View>

      <Card style={{ marginTop: spacing(5) }}>
        <Text style={styles.note}>📹 {t('shareRecordTip')}</Text>
      </Card>
      <Card style={{ marginTop: spacing(3) }}>
        <Text style={styles.note}>{t('shareMockNote')}</Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  caption: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    padding: spacing(3),
    minHeight: 110,
    textAlignVertical: 'top',
    fontSize: 14,
  },
  row: { flexDirection: 'row', gap: spacing(2), marginTop: spacing(2) },
  smallInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(2),
    fontSize: 13,
  },
  note: { color: colors.textDim, fontSize: 12, lineHeight: 18 },
});
