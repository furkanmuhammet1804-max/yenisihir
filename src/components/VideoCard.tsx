import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import type { TrickVideo } from '../types';
import { predictionKind } from '../types';
import { colors, radius, spacing } from '../theme';
import { Btn, Card } from './ui';
import { useT } from '../store/useSettingsStore';
import { resolveMediaUri } from '../services/media';
import { formatTime } from '../utils/time';

export function VideoCard({
  video,
  onPerform,
  onEdit,
  onShare,
  onDelete,
}: {
  video: TrickVideo;
  onPerform: () => void;
  onEdit: () => void;
  onShare: () => void;
  onDelete: () => void;
}) {
  const t = useT();
  const kind = predictionKind(video);
  const method = video.reveals[0]?.inputMethod;

  return (
    <Card style={styles.card}>
      <View style={styles.topRow}>
        {video.thumbnailUri ? (
          <Image source={{ uri: resolveMediaUri(video.thumbnailUri) }} style={styles.thumb} />
        ) : (
          <View style={[styles.thumb, styles.thumbPlaceholder]}>
            <Text style={styles.thumbIcon}>🎬</Text>
          </View>
        )}
        <View style={styles.meta}>
          <Text style={styles.name} numberOfLines={1}>
            {video.name}
          </Text>
          <Text style={styles.sub}>
            {t(`kind_${kind}`)}
            {method ? `  ·  ${t(`m_${method}`)}` : ''}
          </Text>
          <Text style={styles.sub}>
            {video.durationSec > 0 ? formatTime(video.durationSec) : '—'}
            {video.isDemo ? '  ·  DEMO' : ''}
          </Text>
        </View>
      </View>
      <View style={styles.actions}>
        <Btn small kind="gold" label={`▶ ${t('perform')}`} onPress={onPerform} />
        <Btn small kind="ghost" label={t('edit')} onPress={onEdit} />
        <Btn small kind="ghost" label={t('share')} onPress={onShare} />
        <Btn small kind="ghost" label={t('delete')} onPress={onDelete} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing(3) },
  topRow: { flexDirection: 'row', gap: spacing(3) },
  thumb: { width: 96, height: 64, borderRadius: radius.sm, backgroundColor: colors.surfaceHigh },
  thumbPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  thumbIcon: { fontSize: 24 },
  meta: { flex: 1, justifyContent: 'center', gap: 3 },
  name: { color: colors.text, fontSize: 16, fontWeight: '700' },
  sub: { color: colors.textDim, fontSize: 12 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(2), marginTop: spacing(3) },
});
