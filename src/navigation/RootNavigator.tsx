import React from 'react';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import { GalleryScreen } from '../screens/GalleryScreen';
import { DetailScreen } from '../screens/DetailScreen';
import { EditorScreen } from '../screens/EditorScreen';
import { PaywallScreen } from '../screens/PaywallScreen';
import { PerformScreen } from '../screens/PerformScreen';
import { ShareScreen } from '../screens/ShareScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { IndexListsScreen } from '../screens/IndexListsScreen';
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
  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Screen name="Gallery" component={GalleryScreen} />
        <Stack.Screen name="Detail" component={DetailScreen} />
        <Stack.Screen name="Editor" component={EditorScreen} />
        <Stack.Screen name="Paywall" component={PaywallScreen} options={{ presentation: 'modal' }} />
        <Stack.Screen
          name="Perform"
          component={PerformScreen}
          options={{ animation: 'fade', gestureEnabled: false, autoHideHomeIndicator: true }}
        />
        <Stack.Screen name="Share" component={ShareScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="IndexLists" component={IndexListsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
