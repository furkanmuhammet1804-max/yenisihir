import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../navigation/types';
import { useLibraryStore } from '../store/useLibraryStore';
import { useT } from '../store/useSettingsStore';
import { colors, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

/** Big, obvious menu rows — the home screen must need zero explanation. */
function MenuRow({
  icon,
  title,
  sub,
  badge,
  onPress,
}: {
  icon: string;
  title: string;
  sub: string;
  badge?: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && { opacity: 0.8 }]}>
      <View style={styles.rowIcon}>
        <Text style={{ fontSize: 24 }}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSub}>{sub}</Text>
      </View>
      {badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : null}
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

export function HomeScreen({ navigation }: Props) {
  const t = useT();
  const insets = useSafeAreaInsets();
  const ownCount = useLibraryStore((s) => s.videos.filter((v) => !v.isDemo).length);

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing(8),
          paddingHorizontal: spacing(5),
          paddingBottom: insets.bottom + spacing(8),
        }}
      >
        <Text style={styles.brand}>{t('appName').toUpperCase()}</Text>
        <Text style={styles.tagline}>{t('tagline')}</Text>

        {/* primary action — visually dominant */}
        <Pressable onPress={() => navigation.navigate('Editor', {})} style={({ pressed }) => pressed && { opacity: 0.85 }}>
          <LinearGradient colors={[colors.accent, '#5B2BB8']} style={styles.cta} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Text style={styles.ctaIcon}>✦</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.ctaTitle}>{t('home_create')}</Text>
              <Text style={styles.ctaSub}>{t('home_createSub')}</Text>
            </View>
          </LinearGradient>
        </Pressable>

        <View style={styles.menu}>
          <MenuRow
            icon="🎬"
            title={t('home_myVideos')}
            sub={t('home_myVideosSub')}
            badge={ownCount > 0 ? String(ownCount) : undefined}
            onPress={() => navigation.navigate('Gallery', { mode: 'own' })}
          />
          <MenuRow
            icon="🔮"
            title={t('home_examples')}
            sub={t('home_examplesSub')}
            onPress={() => navigation.navigate('Gallery', { mode: 'demos' })}
          />
          <MenuRow
            icon="🤝"
            title={t('home_assistant')}
            sub={t('home_assistantSub')}
            onPress={() => navigation.navigate('Assistant')}
          />
          <MenuRow
            icon="⚙️"
            title={t('home_settings')}
            sub={t('home_settingsSub')}
            onPress={() => navigation.navigate('Settings')}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  brand: { color: colors.text, fontSize: 30, fontWeight: '900', letterSpacing: 5 },
  tagline: { color: colors.textDim, fontSize: 14, marginTop: spacing(1), marginBottom: spacing(7) },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(4),
    borderRadius: radius.lg,
    padding: spacing(5),
    marginBottom: spacing(5),
  },
  ctaIcon: { fontSize: 30, color: '#fff' },
  ctaTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  ctaSub: { color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 2 },
  menu: { gap: spacing(3) },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(4),
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing(4),
  },
  rowIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  rowSub: { color: colors.textDim, fontSize: 12, marginTop: 2 },
  badge: {
    minWidth: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: { color: colors.text, fontSize: 12, fontWeight: '700' },
  chevron: { color: colors.textDim, fontSize: 26, fontWeight: '300' },
});
