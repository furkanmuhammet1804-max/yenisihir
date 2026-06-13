import React from 'react';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { GalleryScreen } from '../screens/GalleryScreen';
import { DetailScreen } from '../screens/DetailScreen';
import { EditorScreen } from '../screens/EditorScreen';
import { PerformScreen } from '../screens/PerformScreen';
import { ShareScreen } from '../screens/ShareScreen';
import { PaywallScreen } from '../screens/PaywallScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { IndexListsScreen } from '../screens/IndexListsScreen';
import { AssistantScreen } from '../screens/AssistantScreen';
import { SystemTestScreen } from '../screens/SystemTestScreen';
import { useSettingsStore } from '../store/useSettingsStore';
import { colors } from '../theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

const theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.surface,
    primary: colors.accent,
    text: colors.text,
    border: colors.border,
  },
};

export function RootNavigator() {
  // Stores are hydrated before the navigator mounts (App gates on it),
  // so reading the flag once for the initial route is safe.
  const onboardingSeen = useSettingsStore((s) => s.onboardingSeen);

  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator
        initialRouteName={onboardingSeen ? 'Home' : 'Onboarding'}
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Gallery" component={GalleryScreen} />
        <Stack.Screen name="Detail" component={DetailScreen} />
        <Stack.Screen name="Editor" component={EditorScreen} />
        <Stack.Screen
          name="Perform"
          component={PerformScreen}
          options={{ animation: 'fade', gestureEnabled: false, autoHideHomeIndicator: true }}
        />
        <Stack.Screen name="Share" component={ShareScreen} />
        <Stack.Screen name="Paywall" component={PaywallScreen} options={{ presentation: 'modal' }} />
        <Stack.Screen name="Assistant" component={AssistantScreen} />
        <Stack.Screen name="SystemTest" component={SystemTestScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="IndexLists" component={IndexListsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
