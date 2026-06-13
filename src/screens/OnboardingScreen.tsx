import React, { useRef, useState } from 'react';
import { Dimensions, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../navigation/types';
import { useSettingsStore, useT } from '../store/useSettingsStore';
import { Btn } from '../components/ui';
import { colors, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const { width: SCREEN_W } = Dimensions.get('window');

/** Three swipeable cards that explain the whole trick in 30 seconds. */
export function OnboardingScreen({ navigation }: Props) {
  const t = useT();
  const insets = useSafeAreaInsets();
  const set = useSettingsStore((s) => s.set);
  const [page, setPage] = useState(0);
  const listRef = useRef<FlatList>(null);

  const pages = [
    { icon: '🎥', title: t('ob_title1'), body: t('ob_body1') },
    { icon: '🤫', title: t('ob_title2'), body: t('ob_body2') },
    { icon: '🔮', title: t('ob_title3'), body: t('ob_body3') },
  ];

  const finish = () => {
    set({ onboardingSeen: true });
    navigation.replace('Home');
  };

  const next = () => {
    if (page >= pages.length - 1) return finish();
    listRef.current?.scrollToIndex({ index: page + 1, animated: true });
  };

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#160E2A', colors.bg]} style={StyleSheet.absoluteFill} />
      <Pressable onPress={finish} style={[styles.skip, { top: insets.top + spacing(3) }]} hitSlop={10}>
        <Text style={styles.skipText}>{t('ob_skip')}</Text>
      </Pressable>

      <FlatList
        ref={listRef}
        data={pages}
        keyExtractor={(p) => p.title}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / SCREEN_W))}
        renderItem={({ item }) => (
          <View style={[styles.page, { width: SCREEN_W }]}>
            <Text style={styles.icon}>{item.icon}</Text>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
          </View>
        )}
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing(6) }]}>
        <View style={styles.dots}>
          {pages.map((_, i) => (
            <View key={i} style={[styles.dot, i === page && styles.dotActive]} />
          ))}
        </View>
        <Btn
          block
          kind={page === pages.length - 1 ? 'gold' : 'primary'}
          label={page === pages.length - 1 ? t('ob_start') : t('ob_next')}
          onPress={next}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  skip: { position: 'absolute', right: spacing(5), zIndex: 5 },
  skipText: { color: colors.textDim, fontSize: 14 },
  page: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing(8) },
  icon: { fontSize: 64, marginBottom: spacing(6) },
  title: { color: colors.text, fontSize: 24, fontWeight: '800', textAlign: 'center', marginBottom: spacing(4) },
  body: { color: colors.textDim, fontSize: 15, lineHeight: 23, textAlign: 'center' },
  footer: { paddingHorizontal: spacing(6), gap: spacing(5) },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: spacing(2) },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.gold, width: 22, borderRadius: radius.full },
});
