import React, { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import * as VideoThumbnails from 'expo-video-thumbnails';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../navigation/types';
import type { Reveal } from '../types';
import { useT } from '../store/useSettingsStore';
import { demoVideos } from '../services/demoData';
import { PredictionOverlay } from '../components/PredictionOverlay';
import { Btn, Card, Label } from '../components/ui';
import { colors, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'SystemTest'>;

type CheckState = 'idle' | 'running' | 'pass' | 'fail' | 'skip';
interface CheckResult {
  key: string;
  state: CheckState;
  detail?: string;
}

const CHECK_KEYS = ['st_storage', 'st_files', 'st_thumb', 'st_picker', 'st_share', 'st_net'] as const;

/** Sample reveal so the overlay layer can be verified visually. */
const SAMPLE_REVEAL: Reveal = {
  id: 'systest',
  label: 'test',
  type: 'number',
  inputMethod: 'gridNoDim',
  inTime: 0,
  outTime: 0,
  animation: 'none',
  digitCount: 2,
  style: {
    x: 0.5,
    y: 0.5,
    fontSize: 64,
    fontWeight: '700',
    fontFamily: 'system',
    color: '#D4AF37',
    opacity: 1,
    rotation: 0,
    skewX: 0,
    scale: 1,
  },
};

/** Runs real device checks and reports each one plainly. */
export function SystemTestScreen({ navigation }: Props) {
  const t = useT();
  const insets = useSafeAreaInsets();
  const [results, setResults] = useState<CheckResult[]>(CHECK_KEYS.map((key) => ({ key, state: 'idle' })));
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);

  const update = (key: string, state: CheckState, detail?: string) =>
    setResults((rs) => rs.map((r) => (r.key === key ? { key, state, detail } : r)));

  const run = async () => {
    setRunning(true);
    setFinished(false);
    setResults(CHECK_KEYS.map((key) => ({ key, state: 'running' })));

    // 1. AsyncStorage round-trip — the show library depends on it
    try {
      await AsyncStorage.setItem('mindframe.systest', 'ok');
      const back = await AsyncStorage.getItem('mindframe.systest');
      await AsyncStorage.removeItem('mindframe.systest');
      update('st_storage', back === 'ok' ? 'pass' : 'fail');
    } catch (e) {
      update('st_storage', 'fail', String(e));
    }

    // 2. FileSystem round-trip — imported videos live here
    try {
      const dir = FileSystem.documentDirectory;
      if (!dir) {
        update('st_files', 'skip', 'documentDirectory yok');
      } else {
        const path = dir + 'mindframe.systest.txt';
        await FileSystem.writeAsStringAsync(path, 'ok');
        const back = await FileSystem.readAsStringAsync(path);
        await FileSystem.deleteAsync(path, { idempotent: true });
        update('st_files', back === 'ok' ? 'pass' : 'fail');
      }
    } catch (e) {
      update('st_files', 'fail', String(e));
    }

    // 3. Thumbnail generation from the first local video; remote demos skip
    try {
      const dir = FileSystem.documentDirectory;
      let localVideo: string | undefined;
      if (dir) {
        const names = await FileSystem.readDirectoryAsync(dir);
        localVideo = names.find((n) => n.endsWith('.mp4'));
        if (localVideo) localVideo = dir + localVideo;
      }
      if (!localVideo) {
        update('st_thumb', 'skip', t('st_skip'));
      } else {
        await VideoThumbnails.getThumbnailAsync(localVideo, { time: 500 });
        update('st_thumb', 'pass');
      }
    } catch (e) {
      update('st_thumb', 'fail', String(e));
    }

    // 4. Media library permission status (query only — no prompt)
    try {
      const perm = await ImagePicker.getMediaLibraryPermissionsAsync();
      update('st_picker', perm.granted || perm.canAskAgain ? 'pass' : 'fail', perm.granted ? undefined : '?');
    } catch (e) {
      update('st_picker', 'fail', String(e));
    }

    // 5. Native share sheet availability
    try {
      const ok = await Sharing.isAvailableAsync();
      update('st_share', ok ? 'pass' : 'fail');
    } catch (e) {
      update('st_share', 'fail', String(e));
    }

    // 6. Sample videos reachable (demo library streams)
    try {
      const demoUri = demoVideos[0]?.uri ?? '';
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(demoUri, { method: 'HEAD', signal: controller.signal });
      clearTimeout(timer);
      update('st_net', res.ok ? 'pass' : 'fail', res.ok ? undefined : `HTTP ${res.status}`);
    } catch {
      update('st_net', 'fail', 'offline?');
    }

    setRunning(false);
    setFinished(true);
  };

  const allPass = finished && results.every((r) => r.state === 'pass' || r.state === 'skip');

  const stateGlyph = (s: CheckState) =>
    s === 'pass' ? '✅' : s === 'fail' ? '❌' : s === 'skip' ? '➖' : s === 'running' ? '⏳' : '·';
  const stateLabel = (s: CheckState) =>
    s === 'pass' ? t('st_pass') : s === 'fail' ? t('st_fail') : s === 'skip' ? t('st_skip') : '';

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
        <Text style={styles.headerTitle}>{t('st_title')}</Text>
        <View style={{ width: 34 }} />
      </View>

      <Label style={{ marginBottom: spacing(4) }}>{t('st_intro')}</Label>

      <Btn block kind="gold" label={running ? t('st_running') : t('st_run')} onPress={running ? () => {} : run} />
      {running && <ActivityIndicator color={colors.gold} style={{ marginTop: spacing(4) }} />}

      <View style={{ marginTop: spacing(5), gap: spacing(2) }}>
        {results.map((r) => (
          <Card key={r.key} style={styles.checkRow}>
            <Text style={{ fontSize: 18 }}>{stateGlyph(r.state)}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.checkTitle}>{t(r.key as never)}</Text>
              {r.detail ? <Label style={{ fontSize: 11 }}>{r.detail}</Label> : null}
            </View>
            <Label>{stateLabel(r.state)}</Label>
          </Card>
        ))}
      </View>

      {finished && (
        <Text style={[styles.verdict, { color: allPass ? colors.success : colors.danger }]}>
          {allPass ? t('st_allPass') : t('st_someFail')}
        </Text>
      )}

      {/* live overlay sample — proves the placement layer renders */}
      <Card style={{ marginTop: spacing(5) }}>
        <Label>{t('st_overlayNote')}</Label>
        <View style={styles.overlayBox}>
          <PredictionOverlay
            reveal={SAMPLE_REVEAL}
            content={{ display: '28' }}
            rect={{ x: 0, y: 0, w: 280, h: 130 }}
          />
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing(3) },
  back: { color: colors.text, fontSize: 34, fontWeight: '300', paddingHorizontal: spacing(2) },
  headerTitle: { color: colors.text, fontSize: 18, fontWeight: '700' },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: spacing(3), paddingVertical: spacing(3) },
  checkTitle: { color: colors.text, fontSize: 14, fontWeight: '600' },
  verdict: { marginTop: spacing(4), fontSize: 15, fontWeight: '700', textAlign: 'center' },
  overlayBox: {
    height: 130,
    width: 280,
    alignSelf: 'center',
    marginTop: spacing(3),
    borderRadius: radius.sm,
    backgroundColor: '#000',
    overflow: 'hidden',
  },
});
