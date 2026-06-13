import React from 'react';
import { Alert, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../navigation/types';
import type { FontChoice, InputMethod } from '../types';
import { useSettingsStore, useT } from '../store/useSettingsStore';
import { useLibraryStore } from '../store/useLibraryStore';
import { usePremiumStore } from '../store/usePremiumStore';
import { Btn, Chip, Label, SectionHeader, Title } from '../components/ui';
import { SliderRow } from '../components/SliderRow';
import { ColorSwatches } from '../components/ColorSwatches';
import { colors, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const INPUT_METHODS: InputMethod[] = [
  'gridNoDim',
  'gridDim',
  'pause',
  'afterPause',
  'lockScreen',
  'password',
  'drawing',
  'picture',
  'remote',
];
const FONTS: FontChoice[] = ['system', 'serif', 'mono', 'condensed'];

export function SettingsScreen({ navigation }: Props) {
  const t = useT();
  const insets = useSafeAreaInsets();
  const s = useSettingsStore();
  const restoreDemos = useLibraryStore((st) => st.restoreDemos);
  const isPremium = usePremiumStore((st) => st.isPremium);
  const setPremium = usePremiumStore((st) => st.setPremium);

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{
        paddingTop: insets.top + spacing(4),
        paddingHorizontal: spacing(4),
        paddingBottom: insets.bottom + spacing(10),
      }}
    >
      <Title>{t('settings')}</Title>

      <SectionHeader>{t('s_general')}</SectionHeader>
      <Label>{t('s_language')}</Label>
      <View style={styles.chipRow}>
        <Chip label="Türkçe" active={s.language === 'tr'} onPress={() => s.set({ language: 'tr' })} />
        <Chip label="English" active={s.language === 'en'} onPress={() => s.set({ language: 'en' })} />
      </View>
      <Label>{t('s_defaultMethod')}</Label>
      <View style={styles.chipRow}>
        {INPUT_METHODS.map((m) => (
          <Chip key={m} label={t(`m_${m}`)} active={s.defaultInputMethod === m} onPress={() => s.set({ defaultInputMethod: m })} />
        ))}
      </View>

      <SectionHeader info={t('mi_gridNoDim')}>{t('s_grid')}</SectionHeader>
      <View style={styles.chipRow}>
        <Chip label="3 × 3" active={s.gridSize === '3x3'} onPress={() => s.set({ gridSize: '3x3' })} />
        <Chip label="4 × 3" active={s.gridSize === '4x3'} onPress={() => s.set({ gridSize: '4x3' })} />
      </View>
      <View style={styles.switchRow}>
        <Label>{t('s_gridPractice')}</Label>
        <Switch
          value={s.gridPractice}
          onValueChange={(gridPractice) => s.set({ gridPractice })}
          trackColor={{ true: colors.accent, false: colors.border }}
        />
      </View>
      <SliderRow label={t('s_dimLead')} value={s.dimLeadSec} min={0} max={30} onChange={(dimLeadSec) => s.set({ dimLeadSec })} />
      <SliderRow label={t('s_revealDelay')} value={s.revealDelaySec} min={0} max={10} step={0.5} onChange={(revealDelaySec) => s.set({ revealDelaySec })} format={(v) => v.toFixed(1)} />
      <View style={styles.switchRow}>
        <Label>{t('s_fakeMask')}</Label>
        <Switch
          value={s.fakeMaskInput}
          onValueChange={(fakeMaskInput) => s.set({ fakeMaskInput })}
          trackColor={{ true: colors.accent, false: colors.border }}
        />
      </View>

      <SectionHeader>{t('s_defaults')}</SectionHeader>
      <Label>{t('s_font')}</Label>
      <View style={styles.chipRow}>
        {FONTS.map((f) => (
          <Chip key={f} label={f} active={s.defaultFont === f} onPress={() => s.set({ defaultFont: f })} />
        ))}
      </View>
      <Label>{t('s_color')}</Label>
      <ColorSwatches value={s.defaultColor} onChange={(defaultColor) => s.set({ defaultColor })} />

      <SectionHeader info={t('s_premiumHint')}>{t('s_premium')}</SectionHeader>
      <View style={styles.switchRow}>
        <Label>{isPremium ? `★ ${t('premiumActive')}` : t('s_premiumSim')}</Label>
        <Switch
          value={isPremium}
          onValueChange={setPremium}
          trackColor={{ true: colors.gold, false: colors.border }}
        />
      </View>
      {!isPremium && <Btn kind="ghost" label={t('goPremium')} onPress={() => navigation.navigate('Paywall', {})} />}

      <SectionHeader>{t('demoVideos')}</SectionHeader>
      <Btn
        kind="ghost"
        label={t('s_demo')}
        onPress={() => {
          restoreDemos();
          Alert.alert('✓', t('s_demoDone'));
        }}
      />

      <SectionHeader>{t('s_tools')}</SectionHeader>
      <View style={{ gap: spacing(2) }}>
        <Btn kind="ghost" label={`🤝 ${t('s_assistant')}`} info={t('s_assistantHint')} onPress={() => navigation.navigate('Assistant')} />
        <Btn kind="ghost" label={`≡ ${t('indexLists')}`} onPress={() => navigation.navigate('IndexLists')} />
        <Btn kind="ghost" label={`🩺 ${t('systemTest')}`} info={t('s_systemTestHint')} onPress={() => navigation.navigate('SystemTest')} />
        <Btn kind="ghost" label={`✦ ${t('s_replayOnboarding')}`} onPress={() => navigation.navigate('Onboarding')} />
      </View>

      <View style={{ marginTop: spacing(6) }}>
        <Btn kind="ghost" label={t('backToGallery')} onPress={() => navigation.goBack()} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', marginVertical: spacing(2) },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing(2),
  },
});
