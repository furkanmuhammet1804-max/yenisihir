import React from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../navigation/types';
import { predictionKind } from '../types';
import { useLibraryStore } from '../store/useLibraryStore';
import { usePremiumStore, isLocked } from '../store/usePremiumStore';
import { useT } from '../store/useSettingsStore';
import { resolveMediaUri } from '../services/media';
import { Btn, Card, Label, SectionHeader } from '../components/ui';
import { colors, radius, spacing } from '../theme';
import { formatTime } from '../utils/time';

type Props = NativeStackScreenProps<RootStackParamList, 'Detail'>;

/** Effect detail page: poster, facts, reveal breakdown and all actions. */
export function DetailScreen({ navigation, route }: Props) {
  const t = useT();
  const insets = useSafeAreaInsets();
  const video = useLibraryStore((s) => s.videos.find((v) => v.id === route.params.videoId));
  const removeVideo = useLibraryStore((s) => s.removeVideo);
  const isPremium = usePremiumStore((s) => s.isPremium);

  if (!video) {
    return (
      <View style={[styles.root, styles.center]}>
        <Btn label={t('backToGallery')} onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const locked = isLocked(video, isPremium);
  const kind = predictionKind(video);

  const perform = () => {
    if (locked) navigation.navigate('Paywall', { videoId: video.id });
    else navigation.navigate('Perform', { videoId: video.id });
  };

  const confirmDelete = () =>
    Alert.alert(t('deleteConfirmTitle'), t('deleteConfirmBody'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: () => {
          removeVideo(video.id);
          navigation.goBack();
        },
      },
    ]);

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{
        paddingTop: insets.top + spacing(3),
        paddingHorizontal: spacing(4),
        paddingBottom: insets.bottom + spacing(10),
      }}
    >
      <View style={styles.headerRow}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.back}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {video.name}
        </Text>
        <View style={{ width: 34 }} />
      </View>

      {/* poster */}
      <View style={styles.poster}>
        {video.thumbnailUri ? (
          <Image source={{ uri: resolveMediaUri(video.thumbnailUri) }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.posterEmpty]}>
            <Text style={{ fontSize: 48 }}>🎬</Text>
          </View>
        )}
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.85)']} style={styles.posterFade} />
        <View style={styles.badgeRow}>
          {video.isDemo && <Text style={styles.badge}>DEMO</Text>}
          {video.premium && (
            <Text style={[styles.badge, locked ? styles.badgeLocked : styles.badgeUnlocked]}>
              {locked ? `🔒 ${t('premiumBadge')}` : `★ ${t('premiumBadge')}`}
            </Text>
          )}
        </View>
        <Text style={styles.posterMeta}>
          {t(`kind_${kind}`)}  ·  {video.durationSec > 0 ? formatTime(video.durationSec) : '—'}  ·  {video.reveals.length}{' '}
          {t('revealsWord')}
        </Text>
      </View>

      {/* actions */}
      <View style={styles.actionRow}>
        <Btn kind="gold" label={locked ? `🔒 ${t('perform')}` : `▶ ${t('perform')}`} onPress={perform} style={{ flex: 1 }} />
      </View>
      <View style={styles.actionRow}>
        <Btn small kind="ghost" label={t('edit')} onPress={() => navigation.navigate('Editor', { videoId: video.id })} />
        <Btn small kind="ghost" label={t('share')} onPress={() => navigation.navigate('Share', { videoId: video.id })} />
        <Btn small kind="danger" label={t('delete')} onPress={confirmDelete} />
      </View>

      {locked && (
        <Card style={{ marginTop: spacing(3) }}>
          <Label>{t('premiumLockedBody')}</Label>
          <Btn small kind="primary" label={t('goPremium')} onPress={() => navigation.navigate('Paywall', { videoId: video.id })} style={{ marginTop: spacing(3) }} />
        </Card>
      )}

      {/* reveal breakdown */}
      <SectionHeader>{t('revealsSection')}</SectionHeader>
      {video.reveals.length === 0 ? (
        <Label>{t('kind_none')}</Label>
      ) : (
        video.reveals.map((r, i) => (
          <Card key={r.id} style={{ marginBottom: spacing(2) }}>
            <Text style={styles.revealTitle}>
              {i + 1}. {t(`kind_${r.type}`)}
            </Text>
            <Label>{t(`m_${r.inputMethod}`)}</Label>
            <Label>
              {t('inTime')}: {formatTime(r.inTime)}   ·   {t('outTime')}:{' '}
              {r.outTime > 0 ? formatTime(r.outTime) : t('untilEnd')}
            </Label>
            <Label>
              {t('animation')}: {t(`anim_${r.animation ?? 'fade'}`)}
            </Label>
          </Card>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { alignItems: 'center', justifyContent: 'center' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing(3) },
  back: { color: colors.text, fontSize: 34, fontWeight: '300', paddingHorizontal: spacing(2) },
  headerTitle: { color: colors.text, fontSize: 18, fontWeight: '700', flex: 1, textAlign: 'center' },
  poster: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'flex-end',
  },
  posterEmpty: { alignItems: 'center', justifyContent: 'center' },
  posterFade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '55%' },
  badgeRow: { position: 'absolute', top: spacing(3), left: spacing(3), flexDirection: 'row', gap: spacing(2) },
  badge: {
    color: colors.text,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: radius.sm,
    overflow: 'hidden',
    paddingHorizontal: spacing(2),
    paddingVertical: 3,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  badgeLocked: { color: colors.gold },
  badgeUnlocked: { color: colors.gold },
  posterMeta: { color: colors.text, fontSize: 13, padding: spacing(3) },
  actionRow: { flexDirection: 'row', gap: spacing(2), marginTop: spacing(3) },
  revealTitle: { color: colors.text, fontSize: 15, fontWeight: '700', marginBottom: 2 },
});
