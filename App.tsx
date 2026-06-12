import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useLibraryStore } from './src/store/useLibraryStore';
import { useSettingsStore } from './src/store/useSettingsStore';
import { colors } from './src/theme';

/** Hold rendering until persisted stores are rehydrated, so the gallery never
 *  flashes demo-only content before the user's library loads. */
function useStoresHydrated(): boolean {
  const [ready, setReady] = useState(
    () => useLibraryStore.persist.hasHydrated() && useSettingsStore.persist.hasHydrated(),
  );
  useEffect(() => {
    if (ready) return;
    const check = () => {
      if (useLibraryStore.persist.hasHydrated() && useSettingsStore.persist.hasHydrated()) setReady(true);
    };
    const unsubA = useLibraryStore.persist.onFinishHydration(check);
    const unsubB = useSettingsStore.persist.onFinishHydration(check);
    check();
    return () => {
      unsubA();
      unsubB();
    };
  }, [ready]);
  return ready;
}

export default function App() {
  const hydrated = useStoresHydrated();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        {hydrated ? (
          <RootNavigator />
        ) : (
          <View style={styles.splash}>
            <Text style={styles.splashTitle}>MINDFRAME</Text>
            <ActivityIndicator color={colors.gold} />
          </View>
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', gap: 16 },
  splashTitle: { color: colors.text, fontSize: 24, fontWeight: '800', letterSpacing: 6 },
});
