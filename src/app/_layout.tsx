import React, { useEffect, useMemo } from 'react';
import { Text as RNText, TextInput as RNTextInput, View } from 'react-native';
import {
  Stack,
  ThemeProvider as NavThemeProvider,
  DarkTheme as NavDarkTheme,
  DefaultTheme as NavDefaultTheme,
} from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MD3LightTheme, MD3DarkTheme, PaperProvider, configureFonts } from 'react-native-paper';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import {
  useFonts,
  Oswald_400Regular,
  Oswald_500Medium,
  Oswald_600SemiBold,
  Oswald_700Bold,
} from '@expo-google-fonts/oswald';
import { theme, ThemeProvider, useAppTheme } from '../constants/theme';

SplashScreen.preventAutoHideAsync();
// Ensure standard React Native Text and TextInput default to Oswald
if ((RNText as any).defaultProps == null) {
  (RNText as any).defaultProps = {};
}
(RNText as any).defaultProps.style = { fontFamily: 'Oswald_400Regular' };

if ((RNTextInput as any).defaultProps == null) {
  (RNTextInput as any).defaultProps = {};
}
(RNTextInput as any).defaultProps.style = { fontFamily: 'Oswald_400Regular' };

function ThemedNavigation() {
  const { colors, isDark } = useAppTheme();

  // Keep native window/root view background in sync with theme to prevent white flash during screen transitions
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.background).catch(() => {});
  }, [colors.background]);

  const navTheme = useMemo(
    () => ({
      ...(isDark ? NavDarkTheme : NavDefaultTheme),
      colors: {
        ...(isDark ? NavDarkTheme.colors : NavDefaultTheme.colors),
        background: colors.background,
        card: colors.card,
      },
    }),
    [isDark, colors.background, colors.card]
  );

  const paperTheme = useMemo(
    () => ({
      ...(isDark ? MD3DarkTheme : MD3LightTheme),
      colors: {
        ...(isDark ? MD3DarkTheme.colors : MD3LightTheme.colors),
        primary: colors.primary,
        background: colors.background,
        surface: colors.card,
      },
      fonts: configureFonts({
        config: {
          fontFamily: theme.fonts.regular,
        },
      }),
    }),
    [isDark, colors.primary, colors.background, colors.card]
  );

  return (
    <NavThemeProvider value={navTheme}>
      <PaperProvider theme={paperTheme}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen
              name="index"
              options={{ contentStyle: { backgroundColor: colors.background } }}
            />
            <Stack.Screen
              name="torneio/[tournamentId]"
              options={{ contentStyle: { backgroundColor: colors.background } }}
            />
            <Stack.Screen
              name="rei-rainha/[tournamentId]"
              options={{ contentStyle: { backgroundColor: colors.background } }}
            />
            <Stack.Screen
              name="futevolei/[tournamentId]"
              options={{ contentStyle: { backgroundColor: colors.background } }}
            />
          </Stack>
        </View>
      </PaperProvider>
    </NavThemeProvider>
  );
}

function RootContainer({ children }: { children: React.ReactNode }) {
  const { colors } = useAppTheme();
  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: colors.background }}>
      {children}
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Oswald: Oswald_400Regular,
    'Oswald-Regular': Oswald_400Regular,
    'Oswald-Medium': Oswald_500Medium,
    'Oswald-SemiBold': Oswald_600SemiBold,
    'Oswald-Bold': Oswald_700Bold,
    Oswald_400Regular,
    Oswald_500Medium,
    Oswald_600SemiBold,
    Oswald_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ThemeProvider>
      <RootContainer>
        <ThemedNavigation />
      </RootContainer>
    </ThemeProvider>
  );
}
