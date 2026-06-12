import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEventListener } from 'expo';
import * as Haptics from 'expo-haptics';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../navigation/types';
import type { IndexList, Reveal } from '../types';
import { useLibraryStore, useAllLists, resolveListItem } from '../store/useLibraryStore';
import { usePerformStore } from '../store/usePerformStore';
import { useSettingsStore, useT } from '../store/useSettingsStore';
import { transmitter } from '../services/transmitter';
import { pickImage, resolveMediaUri } from '../services/media';
import { GridInputLayer, type GridAction } from '../components/GridInputLayer';
import { LockScreenOverlay } from '../components/LockScreenOverlay';
import { PasswordGate } from '../components/PasswordGate';
import { DrawingCanvas, strokesToPaths, type Point } from '../components/DrawingCanvas';
import { PredictionOverlay } from '../components/PredictionOverlay';
import { Btn } from '../components/ui';
import { colors, spacing } from '../theme';
import { fitRect } from '../utils/layout';

type Props = NativeStackScreenProps<RootStackParamList, 'Perform'>;

type Phase = 'gate' | 'ready' | 'playing' | 'ended';

const GRID_METHODS = new Set(['gridNoDim', 'gridDim', 'pause', 'afterPause']);
const GATE_METHODS = new Set(['password', 'lockScreen', 'picture']);

/** Map whatever was secretly entered to what the audience will see. */
function resolveDisplay(reveal: Reveal, raw: string, lists: IndexList[]): string {
  const n = parseInt(raw, 10);
  if (!Number.isNaN(n) && reveal.indexListId) {
    const item = resolveListItem(reveal.indexListId, n, lists);
    if (item) return item;
  }
  if (reveal.type === 'number' && !Number.isNaN(n)) return String(n);
  return raw;
}

export function PerformScreen({ navigation, route }: Props) {
  const t = useT();
  const video = useLibraryStore((s) => s.videos.find((v) => v.id === route.params.videoId));
  const lists = useAllLists();
  const settings = useSettingsStore();
  const { values, setValue, removeValue, reset } = usePerformStore();

  const [phase, setPhase] = useState<Phase>('gate');
  const [time, setTime] = useState(0);
  const [size, setSize] = useState({ w: 1, h: 1 });
  const [drawPadOpen, setDrawPadOpen] = useState(false);
  const [drawStrokes, setDrawStrokes] = useState<Point[][]>([]);
  const [digitBuffer, setDigitBuffer] = useState('');
  const pausedForInputRef = useRef(false);
  const lastTapRef = useRef(0);

  const reveals = useMemo(
    () => [...(video?.reveals ?? [])].sort((a, b) => a.inTime - b.inTime),
    [video],
  );

  const player = useVideoPlayer(video ? resolveMediaUri(video.uri) : null, (p) => {
    p.loop = false;
    // 0.2s keeps reveal timing tight (fade-in masks the boundary) without
    // re-rendering the whole tree 20x per second.
    p.timeUpdateEventInterval = 0.2;
  });

  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // A spectator pressing Android's back button must not pop the performance;
  // the only exit is the hidden 2s corner long-press.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, []);

  useEventListener(player, 'timeUpdate', (e) => setTime(e.currentTime));
  useEventListener(player, 'playToEnd', () => setPhase('ended'));

  // ── Which reveal is waiting for input right now? ─────────────────────────
  const nextUnvalued = (methods: (m: string) => boolean) =>
    reveals.find((r) => !values[r.id] && methods(r.inputMethod)) ?? null;

  const gateReveal = nextUnvalued((m) => GATE_METHODS.has(m));
  const gridReveal = nextUnvalued((m) => GRID_METHODS.has(m));
  const drawReveal = nextUnvalued((m) => m === 'drawing');
  const remoteReveal = nextUnvalued((m) => m === 'remote');

  // gates finished -> wait for the performer's "start" tap
  useEffect(() => {
    if (phase === 'gate' && !gateReveal) setPhase('ready');
  }, [phase, gateReveal]);

  // ── Remote (mock transmitter) ────────────────────────────────────────────
  useEffect(() => {
    if (!remoteReveal) return;
    return transmitter.subscribe((msg) => {
      if (msg.kind === 'paths' && msg.paths) {
        setValue({ revealId: remoteReveal.id, display: '', paths: msg.paths });
      } else if (msg.kind === 'imageUri') {
        setValue({ revealId: remoteReveal.id, display: '', imageUri: msg.value });
      } else {
        setValue({ revealId: remoteReveal.id, display: resolveDisplay(remoteReveal, msg.value, lists) });
      }
    });
  }, [remoteReveal, lists, setValue]);

  // ── Picture gate (runs the system picker, audience sees a dark screen) ───
  useEffect(() => {
    if (phase !== 'gate' || !gateReveal || gateReveal.inputMethod !== 'picture') return;
    (async () => {
      const uri = await pickImage(false);
      setValue({
        revealId: gateReveal.id,
        display: '',
        imageUri: uri ?? undefined,
      });
    })();
  }, [phase, gateReveal, setValue]);

  if (!video) {
    return (
      <View style={styles.root}>
        <Btn label={t('backToGallery')} onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const start = () => {
    setPhase('playing');
    player.play();
  };

  const commitDigits = (reveal: Reveal, digits: string) => {
    setValue({ revealId: reveal.id, display: resolveDisplay(reveal, digits, lists) });
    setDigitBuffer('');
    if (pausedForInputRef.current) {
      pausedForInputRef.current = false;
      player.play();
    }
  };

  const onGridAction = (a: GridAction) => {
    if (!gridReveal) return;
    Haptics.selectionAsync().catch(() => {});
    if (a.kind === 'delete') return setDigitBuffer((b) => b.slice(0, -1));
    if (a.kind === 'commit') {
      if (digitBuffer.length > 0) commitDigits(gridReveal, digitBuffer);
      return;
    }
    const method = gridReveal.inputMethod;

    // afterPause: the very first tap only pauses, digits start on the frozen frame
    if (method === 'afterPause' && !pausedForInputRef.current) {
      pausedForInputRef.current = true;
      player.pause();
      return;
    }
    // pause: first digit-tap pauses as cover, last one resumes
    if (method === 'pause' && digitBuffer.length === 0) {
      pausedForInputRef.current = true;
      player.pause();
    }

    const next = digitBuffer + String(a.digit);
    if (next.length >= gridReveal.digitCount) commitDigits(gridReveal, next);
    else setDigitBuffer(next);
  };

  const openDrawPad = () => {
    if (!drawReveal || phase !== 'playing') return;
    setDrawStrokes([]);
    setDrawPadOpen(true);
  };

  const onDrawPadTap = () => {
    // double-tap confirms the drawing and hides the pad
    const now = Date.now();
    if (now - lastTapRef.current < 350) {
      if (drawReveal) setValue({ revealId: drawReveal.id, display: '', paths: strokesToPaths(drawStrokes) });
      setDrawPadOpen(false);
    }
    lastTapRef.current = now;
  };

  const replay = () => {
    player.currentTime = 0;
    setPhase('playing');
    player.play();
  };

  // ── Visible overlays at the current time ────────────────────────────────
  const delay = settings.revealDelaySec;
  const visibleReveals = reveals.filter((r) => {
    const v = values[r.id];
    if (!v || (!v.display && !v.paths?.length && !v.imageUri)) return false;
    const inT = r.inTime + delay;
    const outT = r.outTime > 0 ? r.outTime + delay : Infinity;
    return time >= inT && time <= outT;
  });

  const dimActive =
    gridReveal?.inputMethod === 'gridDim' &&
    phase === 'playing' &&
    time >= gridReveal.inTime + delay - settings.dimLeadSec;

  const gridEnabled = phase === 'playing' && !!gridReveal && !drawPadOpen;

  // letterbox-aware footage rect: overlays land on the same spot as in the editor
  const videoRect = fitRect(video.width ?? 16, video.height ?? 9, size.w, size.h);

  // Recovery gesture: long-press the top-right corner to wipe the digit buffer
  // and re-arm the most recently committed grid value. Invisible to spectators.
  const resetInput = () => {
    setDigitBuffer('');
    const lastValued = [...reveals]
      .reverse()
      .find((r) => values[r.id] && GRID_METHODS.has(r.inputMethod));
    if (lastValued) removeValue(lastValued.id);
    if (pausedForInputRef.current) {
      pausedForInputRef.current = false;
      player.play();
    }
  };

  return (
    <View
      style={styles.root}
      onLayout={(e) =>
        setSize({ w: Math.max(1, e.nativeEvent.layout.width), h: Math.max(1, e.nativeEvent.layout.height) })
      }
    >
      <StatusBar hidden />
      <VideoView player={player} style={StyleSheet.absoluteFill} contentFit="contain" nativeControls={false} />

      {/* prediction overlays — fade in as if they were always in the footage */}
      {visibleReveals.map((r) => (
        <PredictionOverlay key={r.id} reveal={r} content={values[r.id]} rect={videoRect} animated />
      ))}

      {/* gridDim cover */}
      {dimActive && <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.dim]} />}

      {/* secret tap keypad */}
      <GridInputLayer
        gridSize={settings.gridSize}
        practice={settings.gridPractice}
        enabled={gridEnabled}
        onAction={onGridAction}
        zeroHint={t('gridZeroHint')}
      />

      {/* practice readout — performer rehearsal only */}
      {settings.gridPractice && digitBuffer.length > 0 && (
        <Text style={styles.practiceBuffer}>{digitBuffer}</Text>
      )}

      {/* drawing long-press trigger: invisible strip at the bottom edge */}
      {drawReveal && phase === 'playing' && !drawPadOpen && (
        <Pressable style={styles.drawTrigger} onLongPress={openDrawPad} delayLongPress={450} />
      )}

      {/* secret drawing pad — looks like a dimmed/sleeping screen */}
      {drawPadOpen && (
        <Pressable style={[StyleSheet.absoluteFill, styles.drawPad]} onPress={onDrawPadTap}>
          <DrawingCanvas
            strokes={drawStrokes}
            onStrokesChange={setDrawStrokes}
            strokeColor="#FFFFFF"
            strokeWidth={3}
            strokeOpacity={0.22}
          />
          {settings.gridPractice && <Text style={styles.drawHint}>{t('drawConfirmHint')}</Text>}
        </Pressable>
      )}

      {/* pre-play gates */}
      {phase === 'gate' && gateReveal?.inputMethod === 'password' && (
        <PasswordGate
          title={t('passwordTitle')}
          placeholder={t('passwordPh')}
          unlockLabel={t('unlock')}
          fakeMask={settings.fakeMaskInput}
          onComplete={(text) => setValue({ revealId: gateReveal.id, display: resolveDisplay(gateReveal, text, lists) })}
        />
      )}
      {phase === 'gate' && gateReveal?.inputMethod === 'lockScreen' && (
        <LockScreenOverlay
          digitCount={gateReveal.digitCount}
          fakeMask={settings.fakeMaskInput}
          hint={t('lockHint')}
          onComplete={(digits) => setValue({ revealId: gateReveal.id, display: resolveDisplay(gateReveal, digits, lists) })}
        />
      )}
      {phase === 'gate' && gateReveal?.inputMethod === 'picture' && (
        <View style={[StyleSheet.absoluteFill, styles.blackout]} />
      )}

      {/* ready: a neutral play glyph — nothing on screen betrays the app.
          Coaching hints only appear in practice mode. */}
      {phase === 'ready' && (
        <Pressable style={[StyleSheet.absoluteFill, styles.readyWrap]} onPress={start}>
          <Text style={styles.readyText}>▶</Text>
          {settings.gridPractice && (
            <>
              <Text style={styles.exitHint}>{t('tapToBegin')}</Text>
              <Text style={styles.exitHint}>{t('performHintExit')}</Text>
              {remoteReveal && <Text style={styles.exitHint}>{t('remoteWaiting')}</Text>}
            </>
          )}
        </Pressable>
      )}

      {/* end-of-show options */}
      {phase === 'ended' && (
        <View style={[StyleSheet.absoluteFill, styles.endWrap]}>
          <Text style={styles.endTitle}>{t('performEnded')}</Text>
          <Btn label={`↻ ${t('replay')}`} onPress={replay} />
          <Btn kind="gold" label={t('share')} onPress={() => navigation.replace('Share', { videoId: video.id })} />
          <Btn kind="ghost" label={t('backToGallery')} onPress={() => navigation.goBack()} />
        </View>
      )}

      {/* hidden exit: 2s long-press, top-left corner only */}
      <Pressable style={styles.exitZone} onLongPress={() => navigation.goBack()} delayLongPress={2000} />
      {/* hidden input reset: 1s long-press, top-right corner */}
      {phase === 'playing' && (
        <Pressable style={styles.resetZone} onLongPress={resetInput} delayLongPress={1000} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  dim: { backgroundColor: 'rgba(0,0,0,0.45)' },
  practiceBuffer: {
    position: 'absolute',
    bottom: 14,
    right: 18,
    color: 'rgba(255,255,255,0.3)',
    fontSize: 18,
    fontWeight: '700',
  },
  drawTrigger: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 70 },
  drawPad: { backgroundColor: 'rgba(2,2,6,0.88)', zIndex: 20 },
  drawHint: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    color: 'rgba(255,255,255,0.25)',
    fontSize: 13,
  },
  blackout: { backgroundColor: '#05050A', zIndex: 30 },
  readyWrap: { alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.75)', gap: spacing(3), zIndex: 25 },
  readyText: { color: colors.gold, fontSize: 54 },
  readyHint: { color: colors.text, fontSize: 16, fontWeight: '600' },
  exitHint: { color: colors.textDim, fontSize: 12 },
  endWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.78)',
    gap: spacing(4),
    zIndex: 25,
  },
  endTitle: { color: colors.text, fontSize: 20, fontWeight: '800', marginBottom: spacing(2) },
  exitZone: { position: 'absolute', top: 0, left: 0, width: 84, height: 84, zIndex: 40 },
  resetZone: { position: 'absolute', top: 0, right: 0, width: 84, height: 84, zIndex: 40 },
});
