import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useLibraryStore } from '../store/useLibraryStore';
import { usePremiumStore, isLocked } from '../store/usePremiumStore';
import { useT } from '../store/useSettingsStore';
import { VideoCard } from '../components/VideoCard';
import { EmptyState } from '../components/EmptyState';
import { colors, radius, spacing } from '../theme';
import type { TrickVideo } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Gallery'>;

/** One list per mode: the user's own shows, or the ready examples. */
export function GalleryScreen({ navigation, route }: Props) {
  const t = useT();
  const insets = useSafeAreaInsets();
  const mode = route.params?.mode ?? 'own';
  const videos = useLibraryStore((s) => s.videos);
  const removeVideo = useLibraryStore((s) => s.removeVideo);
  const isPremium = usePremiumStore((s) => s.isPremium);

  const shown = videos.filter((v) => (mode === 'demos' ? v.isDemo : !v.isDemo));

  const confirmDelete = (v: TrickVideo) =>
    Alert.alert(t('deleteConfirmTitle'), t('deleteConfirmBody'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('delete'), style: 'destructive', onPress: () => removeVideo(v.id) },
    ]);

  const renderCard = (v: TrickVideo) => {
    const locked = isLocked(v, isPremium);
    return (
      <VideoCard
        key={v.id}
        video={v}
        locked={locked}
        onOpen={() => navigation.navigate('Detail', { videoId: v.id })}
        onPerform={() =>
          locked
            ? navigation.navigate('Paywall', { videoId: v.id })
            : navigation.navigate('Perform', { videoId: v.id })
        }
        onEdit={() => navigation.navigate('Editor', { videoId: v.id })}
        onShare={() => navigation.navigate('Share', { videoId: v.id })}
        onDelete={() => confirmDelete(v)}
      />
    );
  };

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing(3),
          paddingHorizontal: spacing(4),
          paddingBottom: 130,
        }}
      >
        <View style={styles.headerRow}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Text style={styles.back}>‹</Text>
          </Pressable>
          <Text style={styles.headerTitle}>{mode === 'demos' ? t('demoVideos') : t('myVideos')}</Text>
          <View style={{ width: 34 }} />
        </View>

        {shown.length === 0 ? (
          <View style={{ marginTop: spacing(6) }}>
            <EmptyState title={t('emptyLibraryTitle')} body={t('emptyLibraryBody')} />
            <Pressable style={styles.emptyCta} onPress={() => navigation.navigate('Editor', {})}>
              <LinearGradient colors={[colors.accent, '#6D3BD8']} style={styles.emptyCtaInner}>
                <Text style={styles.fabText}>{t('emptyLibraryCta')}</Text>
              </LinearGradient>
            </Pressable>
          </View>
        ) : (
          shown.map(renderCard)
        )}
      </ScrollView>

      {mode === 'own' && shown.length > 0 && (
        <Pressable
          style={[styles.fab, { bottom: insets.bottom + spacing(5) }]}
          onPress={() => navigation.navigate('Editor', {})}
        >
          <LinearGradient colors={[colors.accent, '#6D3BD8']} style={styles.fabInner}>
            <Text style={styles.fabText}>＋ {t('newVideo')}</Text>
          </LinearGradient>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing(3),
  },
  back: { color: colors.text, fontSize: 34, fontWeight: '300', paddingHorizontal: spacing(2) },
  headerTitle: { color: colors.text, fontSize: 18, fontWeight: '700' },
  emptyCta: { alignSelf: 'center', marginTop: spacing(5), borderRadius: radius.full, overflow: 'hidden' },
  emptyCtaInner: { paddingHorizontal: spacing(6), paddingVertical: spacing(4) },
  fab: { position: 'absolute', right: spacing(5), borderRadius: radius.full, overflow: 'hidden', elevation: 6 },
  fabInner: { paddingHorizontal: spacing(6), paddingVertical: spacing(4) },
  fabText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
