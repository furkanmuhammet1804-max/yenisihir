import React from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useLibraryStore } from '../store/useLibraryStore';
import { usePremiumStore, isLocked } from '../store/usePremiumStore';
import { useT } from '../store/useSettingsStore';
import { VideoCard } from '../components/VideoCard';
import { EmptyState } from '../components/EmptyState';
import { SectionHeader, Title } from '../components/ui';
import { colors, radius, spacing } from '../theme';
import type { TrickVideo } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Gallery'>;

export function GalleryScreen({ navigation }: Props) {
  const t = useT();
  const insets = useSafeAreaInsets();
  const videos = useLibraryStore((s) => s.videos);
  const removeVideo = useLibraryStore((s) => s.removeVideo);
  const isPremium = usePremiumStore((s) => s.isPremium);

  const own = videos.filter((v) => !v.isDemo);
  const demos = videos.filter((v) => v.isDemo);

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
    <View style={[styles.root, { paddingTop: insets.top + spacing(3) }]}>
      <View style={styles.header}>
        <View>
          <Title>{t('appName').toUpperCase()}</Title>
          <Text style={styles.tagline}>{t('tagline')}</Text>
        </View>
        <View style={styles.headerBtns}>
          <Pressable style={styles.iconBtn} onPress={() => navigation.navigate('IndexLists')}>
            <Text style={styles.iconBtnText}>≡</Text>
          </Pressable>
          <Pressable style={styles.iconBtn} onPress={() => navigation.navigate('Settings')}>
            <Text style={styles.iconBtnText}>⚙</Text>
          </Pressable>
        </View>
      </View>

      <FlatList
        data={[]}
        renderItem={null}
        contentContainerStyle={{ paddingHorizontal: spacing(4), paddingBottom: 120 }}
        ListHeaderComponent={
          <View>
            <SectionHeader>{t('myVideos')}</SectionHeader>
            {own.length === 0 ? (
              <EmptyState title={t('emptyLibraryTitle')} body={t('emptyLibraryBody')} />
            ) : (
              own.map(renderCard)
            )}
            {demos.length > 0 && (
              <>
                <SectionHeader>{t('demoVideos')}</SectionHeader>
                {demos.map(renderCard)}
              </>
            )}
          </View>
        }
      />

      <Pressable style={[styles.fab, { bottom: insets.bottom + spacing(5) }]} onPress={() => navigation.navigate('Editor', {})}>
        <LinearGradient colors={[colors.accent, '#6D3BD8']} style={styles.fabInner}>
          <Text style={styles.fabText}>＋ {t('newVideo')}</Text>
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing(4),
    marginBottom: spacing(2),
  },
  tagline: { color: colors.textDim, fontSize: 12, marginTop: 2 },
  headerBtns: { flexDirection: 'row', gap: spacing(2) },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnText: { color: colors.text, fontSize: 18 },
  fab: { position: 'absolute', right: spacing(5), borderRadius: radius.full, overflow: 'hidden', elevation: 6 },
  fabInner: { paddingHorizontal: spacing(6), paddingVertical: spacing(4) },
  fabText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
