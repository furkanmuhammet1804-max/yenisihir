import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../navigation/types';
import { usePremiumStore } from '../store/usePremiumStore';
import { useT } from '../store/useSettingsStore';
import { Btn, Card, Label } from '../components/ui';
import { colors, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Paywall'>;

/**
 * Premium gate. Purchases go through usePremiumStore's EntitlementProvider,
 * so swapping the mock for RevenueCat/expo-iap later changes nothing here.
 */
export function PaywallScreen({ navigation, route }: Props) {
  const t = useT();
  const insets = useSafeAreaInsets();
  const { isPremium, busy, purchase, restore } = usePremiumStore();

  const finish = () => {
    const videoId = route.params?.videoId;
    if (videoId) navigation.replace('Perform', { videoId });
    else navigation.goBack();
  };

  const handlePurchase = async () => {
    const ok = await purchase();
    if (ok) {
      Alert.alert('✓', t('premiumThanks'), [{ text: t('premiumContinue'), onPress: finish }]);
    }
  };

  const handleRestore = async () => {
    const ok = await restore();
    Alert.alert(ok ? '✓' : '!', ok ? t('premiumRestored') : t('premiumRestoreFailed'));
    if (ok) finish();
  };

  const perks: string[] = [t('premiumPerk1'), t('premiumPerk2'), t('premiumPerk3'), t('premiumPerk4')];

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#1A1030', colors.bg]} style={StyleSheet.absoluteFill} />
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing(3),
          paddingHorizontal: spacing(5),
          paddingBottom: insets.bottom + spacing(8),
        }}
      >
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={{ alignSelf: 'flex-start' }}>
          <Text style={styles.close}>✕</Text>
        </Pressable>

        <Text style={styles.crown}>★</Text>
        <Text style={styles.title}>{t('premiumTitle')}</Text>
        <Text style={styles.pitch}>{t('premiumPitch')}</Text>

        <Card style={{ marginTop: spacing(5) }}>
          {perks.map((p) => (
            <View key={p} style={styles.perkRow}>
              <Text style={styles.perkTick}>✦</Text>
              <Text style={styles.perkText}>{p}</Text>
            </View>
          ))}
        </Card>

        {isPremium ? (
          <>
            <Text style={styles.activeNote}>★ {t('premiumActive')}</Text>
            <Btn kind="gold" label={t('premiumContinue')} onPress={finish} style={{ marginTop: spacing(4) }} />
          </>
        ) : (
          <>
            <Pressable onPress={handlePurchase} disabled={busy} style={{ marginTop: spacing(6) }}>
              <LinearGradient colors={[colors.gold, '#B8932B']} style={styles.cta}>
                <Text style={styles.ctaText}>{busy ? '…' : t('goPremium')}</Text>
                <Text style={styles.ctaPrice}>{t('premiumPrice')}</Text>
              </LinearGradient>
            </Pressable>
            <Btn kind="ghost" label={t('restorePurchases')} onPress={handleRestore} style={{ marginTop: spacing(3), alignSelf: 'center' }} />
            <Label style={styles.mockNote}>{t('premiumMockNote')}</Label>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  close: { color: colors.textDim, fontSize: 22, padding: spacing(2) },
  crown: { color: colors.gold, fontSize: 44, textAlign: 'center', marginTop: spacing(4) },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 1,
    marginTop: spacing(2),
  },
  pitch: { color: colors.textDim, fontSize: 14, textAlign: 'center', marginTop: spacing(2), lineHeight: 20 },
  perkRow: { flexDirection: 'row', alignItems: 'center', gap: spacing(3), paddingVertical: spacing(2) },
  perkTick: { color: colors.gold, fontSize: 14 },
  perkText: { color: colors.text, fontSize: 14, flex: 1 },
  cta: {
    borderRadius: radius.lg,
    paddingVertical: spacing(4),
    alignItems: 'center',
  },
  ctaText: { color: '#1A1505', fontSize: 17, fontWeight: '900', letterSpacing: 1 },
  ctaPrice: { color: '#1A1505', fontSize: 12, fontWeight: '600', marginTop: 2 },
  activeNote: { color: colors.gold, textAlign: 'center', marginTop: spacing(6), fontSize: 15, fontWeight: '700' },
  mockNote: { textAlign: 'center', marginTop: spacing(4), fontSize: 11 },
});
