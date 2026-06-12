import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEventListener } from 'expo';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Slider from '@react-native-community/slider';

import type { RootStackParamList } from '../navigation/types';
import type { FontChoice, InputMethod, OverlayStyle, Reveal, RevealType, TrickVideo } from '../types';
import { useLibraryStore, useAllLists } from '../store/useLibraryStore';
import { useSettingsStore, useT } from '../store/useSettingsStore';
import { pickVideoFromLibrary } from '../services/media';
import { makeId } from '../utils/id';
import { clamp, formatTime, FRAME_STEP } from '../utils/time';
import { fitRect } from '../utils/layout';
import { colors, radius, spacing } from '../theme';
import { Btn, Chip, InfoDot, Label, SectionHeader } from '../components/ui';
import { SliderRow } from '../components/SliderRow';
import { ColorSwatches } from '../components/ColorSwatches';
import { PredictionOverlay } from '../components/PredictionOverlay';
import { TimelineBar } from '../components/TimelineBar';

type Props = NativeStackScreenProps<RootStackParamList, 'Editor'>;

const REVEAL_TYPES: RevealType[] = ['number', 'text', 'drawing', 'picture'];
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

/** Sample squiggle so drawing reveals have something to preview. */
const SAMPLE_PATHS = ['M 250 700 C 300 300 500 250 520 500 C 535 690 700 650 740 380'];

/** Snapshot for dirty-checking; volatile fields (probed duration, timestamps) don't count. */
const normalize = (v: TrickVideo | null) =>
  v ? JSON.stringify({ ...v, durationSec: 0, updatedAt: 0, width: 0, height: 0 }) : 'null';

function defaultStyle(color: string, font: FontChoice): OverlayStyle {
  return {
    x: 0.5,
    y: 0.45,
    fontSize: 56,
    fontWeight: '700',
    fontFamily: font,
    color,
    opacity: 0.92,
    rotation: 0,
    skewX: 0,
    scale: 1,
  };
}

export function EditorScreen({ navigation, route }: Props) {
  const t = useT();
  const insets = useSafeAreaInsets();
  const settings = useSettingsStore();
  const upsertVideo = useLibraryStore((s) => s.upsertVideo);
  const existing = useLibraryStore((s) => s.videos.find((v) => v.id === route.params.videoId));
  const lists = useAllLists();

  const [draft, setDraft] = useState<TrickVideo>(() =>
    existing
      ? JSON.parse(JSON.stringify(existing))
      : {
          id: makeId('vid'),
          name: '',
          uri: '',
          durationSec: 0,
          isDemo: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          reveals: [],
        },
  );
  const [activeRevealId, setActiveRevealId] = useState<string | null>(draft.reveals[0]?.id ?? null);
  const [previewValue, setPreviewValue] = useState('28');
  const [position, setPosition] = useState(0);
  const [previewSize, setPreviewSize] = useState({ w: 1, h: 1 });
  const savedJsonRef = useRef(normalize(existing ?? null));

  // letterbox-aware rect of the footage inside the preview box
  const videoRect = fitRect(draft.width ?? 16, draft.height ?? 9, previewSize.w, previewSize.h);

  const player = useVideoPlayer(draft.uri || null, (p) => {
    p.loop = false;
    p.timeUpdateEventInterval = 0.1;
    p.muted = true;
  });

  // useVideoPlayer pins the initial source; swap it explicitly when the user
  // picks a different video.
  useEffect(() => {
    if (draft.uri) player.replaceAsync(draft.uri).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.uri]);

  useEventListener(player, 'timeUpdate', (e) => setPosition(e.currentTime));
  useEventListener(player, 'statusChange', () => {
    if (player.duration > 0 && Math.abs(player.duration - draft.durationSec) > 0.5) {
      setDraft((d) => ({ ...d, durationSec: player.duration }));
    }
  });

  const activeReveal = draft.reveals.find((r) => r.id === activeRevealId) ?? null;

  const patchReveal = (id: string, patch: Partial<Reveal>) =>
    setDraft((d) => ({
      ...d,
      reveals: d.reveals.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    }));

  const patchStyle = (id: string, patch: Partial<OverlayStyle>) =>
    setDraft((d) => ({
      ...d,
      reveals: d.reveals.map((r) => (r.id === id ? { ...r, style: { ...r.style, ...patch } } : r)),
    }));

  const addReveal = () => {
    const reveal: Reveal = {
      id: makeId('rev'),
      label: `Reveal ${draft.reveals.length + 1}`,
      type: 'number',
      inputMethod: settings.defaultInputMethod,
      inTime: Math.round(position * 10) / 10,
      outTime: 0,
      digitCount: 2,
      style: defaultStyle(settings.defaultColor, settings.defaultFont),
      prefix: '',
      suffix: '',
    };
    setDraft((d) => ({ ...d, reveals: [...d.reveals, reveal] }));
    setActiveRevealId(reveal.id);
  };

  const removeReveal = (id: string) => {
    setDraft((d) => ({ ...d, reveals: d.reveals.filter((r) => r.id !== id) }));
    if (activeRevealId === id) setActiveRevealId(null);
  };

  const handlePickVideo = async () => {
    try {
      const picked = await pickVideoFromLibrary();
      if (!picked) return;
      setDraft((d) => ({
        ...d,
        uri: picked.uri,
        durationSec: picked.durationSec,
        thumbnailUri: picked.thumbnailUri,
        width: picked.width,
        height: picked.height,
      }));
    } catch {
      Alert.alert('!', t('needVideo'));
    }
  };

  const seekTo = (sec: number) => {
    const target = clamp(sec, 0, Math.max(0, draft.durationSec));
    player.currentTime = target;
    setPosition(target);
  };

  // Drag anywhere on the preview: the active overlay follows the finger.
  // Coordinates are stored relative to the footage rect, not the preview box.
  const placeOverlay = (x: number, y: number) => {
    if (!activeReveal) return;
    patchStyle(activeReveal.id, {
      x: clamp((x - videoRect.x) / videoRect.w, 0.02, 0.98),
      y: clamp((y - videoRect.y) / videoRect.h, 0.02, 0.98),
    });
  };
  const dragGesture = useMemo(
    () =>
      Gesture.Pan()
        .minDistance(2)
        .onUpdate((e) => {
          'worklet';
          runOnJS(placeOverlay)(e.x, e.y);
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeRevealId, previewSize.w, previewSize.h, videoRect.x, videoRect.y, videoRect.w, videoRect.h],
  );

  // ── Unsaved-changes guard ─────────────────────────────────────────────────
  const isDirty =
    savedJsonRef.current === 'null'
      ? Boolean(draft.uri || draft.name.trim() || draft.reveals.length > 0)
      : normalize(draft) !== savedJsonRef.current;
  const dirtyRef = useRef(isDirty);
  dirtyRef.current = isDirty;

  useEffect(() => {
    return navigation.addListener('beforeRemove', (e) => {
      if (!dirtyRef.current) return;
      e.preventDefault();
      Alert.alert(t('unsavedTitle'), t('unsavedBody'), [
        { text: t('keepEditing'), style: 'cancel' },
        { text: t('discard'), style: 'destructive', onPress: () => navigation.dispatch(e.data.action) },
      ]);
    });
  }, [navigation, t]);

  const persistDraft = (): TrickVideo | null => {
    if (!draft.uri) {
      Alert.alert('!', t('needVideo'));
      return null;
    }
    if (!draft.name.trim()) {
      Alert.alert('!', t('needName'));
      return null;
    }
    const final = { ...draft, name: draft.name.trim(), updatedAt: Date.now() };
    upsertVideo(final);
    savedJsonRef.current = normalize(final);
    dirtyRef.current = false;
    return final;
  };

  const handleSave = () => {
    if (persistDraft()) navigation.goBack();
  };

  const handleTestPerform = () => {
    const saved = persistDraft();
    if (saved) navigation.navigate('Perform', { videoId: saved.id });
  };

  const previewContent = (reveal: Reveal) => {
    if (reveal.type === 'drawing') return { display: '', paths: SAMPLE_PATHS };
    if (reveal.type === 'picture') return { display: '🖼', paths: undefined };
    return { display: previewValue || '28' };
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing(3),
          paddingHorizontal: spacing(4),
          paddingBottom: insets.bottom + spacing(10),
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerRow}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Text style={styles.back}>‹</Text>
          </Pressable>
          <Text style={styles.headerTitle}>{t('editorTitle')}</Text>
          <Btn small kind="gold" label={t('save')} onPress={handleSave} />
        </View>

        {/* ── Video preview + overlay placement ───────────────────── */}
        <GestureDetector gesture={dragGesture}>
          <View
            style={styles.preview}
            collapsable={false}
            onLayout={(e) =>
              setPreviewSize({
                w: Math.max(1, e.nativeEvent.layout.width),
                h: Math.max(1, e.nativeEvent.layout.height),
              })
            }
          >
            {draft.uri ? (
              <VideoView player={player} style={StyleSheet.absoluteFill} contentFit="contain" nativeControls={false} />
            ) : (
              <View style={styles.previewEmpty}>
                <Text style={{ fontSize: 40 }}>🎬</Text>
              </View>
            )}
            {activeReveal && (
              <PredictionOverlay
                reveal={activeReveal}
                content={previewContent(activeReveal)}
                rect={videoRect}
              />
            )}
          </View>
        </GestureDetector>

        <View style={{ marginTop: spacing(2), flexDirection: 'row', flexWrap: 'wrap', gap: spacing(2) }}>
          <Btn small kind="ghost" label={draft.uri ? t('changeVideo') : t('pickVideo')} onPress={handlePickVideo} />
          {draft.uri ? (
            <Btn small kind="primary" label={`🎭 ${t('testPerform')}`} onPress={handleTestPerform} info={t('testPerformInfo')} />
          ) : null}
        </View>

        <SectionHeader>{t('videoName')}</SectionHeader>
        <TextInput
          style={styles.input}
          value={draft.name}
          onChangeText={(name) => setDraft((d) => ({ ...d, name }))}
          placeholder={t('videoNamePh')}
          placeholderTextColor={colors.textDim}
        />

        {/* ── Scrubber / timing ────────────────────────────────────── */}
        {draft.uri ? (
          <>
            <SectionHeader info={t('positionHint')}>{t('timing')}</SectionHeader>
            <TimelineBar
              duration={draft.durationSec}
              position={position}
              reveals={draft.reveals}
              activeRevealId={activeRevealId}
            />
            <View style={styles.scrubRow}>
              <Text style={styles.time}>{formatTime(position)}</Text>
              <Slider
                style={{ flex: 1 }}
                minimumValue={0}
                maximumValue={Math.max(0.1, draft.durationSec)}
                value={position}
                onValueChange={seekTo}
                minimumTrackTintColor={colors.gold}
                maximumTrackTintColor={colors.border}
                thumbTintColor={colors.gold}
              />
              <Text style={styles.time}>{formatTime(draft.durationSec)}</Text>
            </View>
            <View style={styles.frameRow}>
              <Btn small kind="ghost" label="⏪ 1s" onPress={() => seekTo(position - 1)} />
              <Btn small kind="ghost" label="◀ frame" onPress={() => seekTo(position - FRAME_STEP)} />
              <Btn small kind="ghost" label={player.playing ? '⏸' : '▶'} onPress={() => (player.playing ? player.pause() : player.play())} />
              <Btn small kind="ghost" label="frame ▶" onPress={() => seekTo(position + FRAME_STEP)} />
              <Btn small kind="ghost" label="1s ⏩" onPress={() => seekTo(position + 1)} />
            </View>
          </>
        ) : null}

        {/* ── Reveals ──────────────────────────────────────────────── */}
        <SectionHeader info={t('mi_gridNoDim')}>{t('revealsSection')}</SectionHeader>
        <View style={styles.chipRow}>
          {draft.reveals.map((r, i) => (
            <Chip key={r.id} label={`${i + 1}. ${t(`kind_${r.type}`)}`} active={r.id === activeRevealId} onPress={() => setActiveRevealId(r.id)} />
          ))}
          <Chip label={`＋ ${t('addReveal')}`} active={false} onPress={addReveal} />
        </View>

        {activeReveal && (
          <View style={styles.revealBox}>
            {/* timing */}
            <View style={styles.inlineRow}>
              <Btn small label={t('setIn')} onPress={() => patchReveal(activeReveal.id, { inTime: Math.round(position * 10) / 10 })} info={t('inTime')} />
              <Btn small kind="ghost" label={t('setOut')} onPress={() => patchReveal(activeReveal.id, { outTime: Math.round(position * 10) / 10 })} info={t('outTime')} />
            </View>
            <Label style={{ marginTop: spacing(1) }}>
              {t('inTime')}: {formatTime(activeReveal.inTime)}   ·   {t('outTime')}:{' '}
              {activeReveal.outTime > 0 ? formatTime(activeReveal.outTime) : t('untilEnd')}
            </Label>

            {/* type */}
            <SectionHeader>{t('revealType')}</SectionHeader>
            <View style={styles.chipRow}>
              {REVEAL_TYPES.map((rt) => (
                <Chip key={rt} label={t(`kind_${rt}`)} active={activeReveal.type === rt} onPress={() => patchReveal(activeReveal.id, { type: rt })} />
              ))}
            </View>

            {/* input method */}
            <SectionHeader>{t('inputMethod')}</SectionHeader>
            <View style={styles.chipRow}>
              {INPUT_METHODS.map((m) => (
                <View key={m} style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Chip label={t(`m_${m}`)} active={activeReveal.inputMethod === m} onPress={() => patchReveal(activeReveal.id, { inputMethod: m })} />
                  <InfoDot text={t(`mi_${m}`)} />
                </View>
              ))}
            </View>

            {activeReveal.type === 'number' && (
              <>
                <SliderRow label={t('digits')} value={activeReveal.digitCount} min={1} max={4} onChange={(v) => patchReveal(activeReveal.id, { digitCount: v })} />
                <SectionHeader>{t('indexList')}</SectionHeader>
                <View style={styles.chipRow}>
                  <Chip label={t('indexListNone')} active={!activeReveal.indexListId} onPress={() => patchReveal(activeReveal.id, { indexListId: undefined })} />
                  {lists.map((l) => (
                    <Chip key={l.id} label={l.name} active={activeReveal.indexListId === l.id} onPress={() => patchReveal(activeReveal.id, { indexListId: l.id })} />
                  ))}
                </View>
              </>
            )}

            {(activeReveal.type === 'number' || activeReveal.type === 'text') && (
              <View style={styles.inlineRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={activeReveal.prefix}
                  onChangeText={(prefix) => patchReveal(activeReveal.id, { prefix })}
                  placeholder={t('prefixLabel')}
                  placeholderTextColor={colors.textDim}
                />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={activeReveal.suffix}
                  onChangeText={(suffix) => patchReveal(activeReveal.id, { suffix })}
                  placeholder={t('suffixLabel')}
                  placeholderTextColor={colors.textDim}
                />
              </View>
            )}

            {/* look */}
            <SectionHeader info={t('positionHint')}>{t('position')}</SectionHeader>
            {(activeReveal.type === 'number' || activeReveal.type === 'text') && (
              <TextInput
                style={styles.input}
                value={previewValue}
                onChangeText={setPreviewValue}
                placeholder={t('previewValue')}
                placeholderTextColor={colors.textDim}
              />
            )}
            <SliderRow label={t('size')} value={activeReveal.style.fontSize} min={14} max={140} onChange={(v) => patchStyle(activeReveal.id, { fontSize: v })} />
            <SliderRow
              label={t('weight')}
              value={['400', '600', '700', '900'].indexOf(activeReveal.style.fontWeight)}
              min={0}
              max={3}
              onChange={(v) => patchStyle(activeReveal.id, { fontWeight: (['400', '600', '700', '900'] as const)[Math.round(v)] })}
              format={(v) => ['400', '600', '700', '900'][Math.round(v)]}
            />
            <SliderRow label={t('opacity')} value={activeReveal.style.opacity} min={0.1} max={1} step={0.01} onChange={(v) => patchStyle(activeReveal.id, { opacity: v })} format={(v) => v.toFixed(2)} />
            <SliderRow label={t('rotation')} value={activeReveal.style.rotation} min={-45} max={45} onChange={(v) => patchStyle(activeReveal.id, { rotation: v })} format={(v) => `${Math.round(v)}°`} />
            <SliderRow label={t('skew')} value={activeReveal.style.skewX} min={-30} max={30} onChange={(v) => patchStyle(activeReveal.id, { skewX: v })} format={(v) => `${Math.round(v)}°`} />

            <SectionHeader>{t('color')}</SectionHeader>
            <ColorSwatches value={activeReveal.style.color} onChange={(color) => patchStyle(activeReveal.id, { color })} />

            <SectionHeader>{t('font')}</SectionHeader>
            <View style={styles.chipRow}>
              {FONTS.map((f) => (
                <Chip key={f} label={f} active={activeReveal.style.fontFamily === f} onPress={() => patchStyle(activeReveal.id, { fontFamily: f })} />
              ))}
            </View>

            <Btn small kind="danger" label={t('removeReveal')} onPress={() => removeReveal(activeReveal.id)} style={{ marginTop: spacing(4) }} />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing(3) },
  back: { color: colors.text, fontSize: 34, fontWeight: '300', paddingHorizontal: spacing(2) },
  headerTitle: { color: colors.text, fontSize: 18, fontWeight: '700' },
  preview: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: colors.border,
  },
  previewEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(3),
    fontSize: 15,
    marginVertical: spacing(1),
  },
  scrubRow: { flexDirection: 'row', alignItems: 'center', gap: spacing(2) },
  time: { color: colors.textDim, fontSize: 12, fontVariant: ['tabular-nums'] },
  frameRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(2), marginTop: spacing(2), justifyContent: 'center' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
  inlineRow: { flexDirection: 'row', gap: spacing(2), alignItems: 'center', marginTop: spacing(2) },
  revealBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing(4),
    marginTop: spacing(2),
  },
});
