import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { Platform, useColorScheme, StyleSheet } from 'react-native';

export const lightColors = {
  // Brand
  primary: '#ea580c', // Orange-600
  primaryLight: '#fff7ed', // Orange-50
  primaryHover: '#c2410c', // Orange-700
  orange400: '#fb923c',
  orange500: '#f97316',
  orange600: '#ea580c',

  // Backgrounds (Light Theme)
  background: '#f8fafc', // Slate-50
  card: '#ffffff',
  cardAlt: '#f1f5f9', // Slate-100
  headerBg: '#ffffff',
  tableHeader: '#f1f5f9',
  tableRowAlt: '#f8fafc',

  // Text
  textPrimary: '#0f172a', // Slate-900
  textSecondary: '#475569', // Slate-600
  textMuted: '#94a3b8', // Slate-400
  textInverse: '#ffffff',

  // Borders & Dividers
  border: '#e2e8f0', // Slate-200
  borderLight: '#f1f5f9',
  borderFocus: '#ea580c',

  // Status Colors
  success: '#16a34a', // Green-600
  successLight: '#dcfce7', // Green-100
  successBorder: '#86efac', // Green-300
  successText: '#14532d',

  warning: '#f97316', // Orange
  warningLight: '#ffedd5',

  error: '#ef4444', // Red-500
  errorLight: '#fee2e2',

  info: '#2563eb', // Blue-600
  infoLight: '#dbeafe',

  purple: '#9333ea', // Purple-600
  purpleLight: '#f3e8ff',

  // Qualified team row
  qualifiedBg: '#dcfce7',
  qualifiedBorder: '#22c55e',
  qualifiedText: '#14532d',
};

export const darkColors: typeof lightColors = {
  // Brand
  primary: '#f97316', // Orange-500 (enhanced vibrancy on dark)
  primaryLight: 'rgba(249, 115, 22, 0.15)',
  primaryHover: '#ea580c',
  orange400: '#fb923c',
  orange500: '#f97316',
  orange600: '#ea580c',

  // Backgrounds (Dark Theme)
  background: '#0b0f19', // Deep dark slate background
  card: '#151d2e', // Elevated dark card
  cardAlt: '#1e293b', // Slate-800
  headerBg: '#111827',
  tableHeader: '#1e293b',
  tableRowAlt: '#0f1726',

  // Text
  textPrimary: '#f8fafc', // Slate-50
  textSecondary: '#94a3b8', // Slate-400
  textMuted: '#64748b', // Slate-500
  textInverse: '#0f172a',

  // Borders & Dividers
  border: '#243048',
  borderLight: '#1b2438',
  borderFocus: '#f97316',

  // Status Colors
  success: '#22c55e',
  successLight: 'rgba(34, 197, 94, 0.15)',
  successBorder: '#166534',
  successText: '#86efac',

  warning: '#fb923c',
  warningLight: 'rgba(251, 146, 60, 0.15)',

  error: '#f87171',
  errorLight: 'rgba(239, 68, 68, 0.15)',

  info: '#38bdf8',
  infoLight: 'rgba(56, 189, 248, 0.15)',

  purple: '#c084fc',
  purpleLight: 'rgba(192, 132, 252, 0.15)',

  // Qualified team row
  qualifiedBg: 'rgba(34, 197, 94, 0.15)',
  qualifiedBorder: '#22c55e',
  qualifiedText: '#86efac',
};

export type ThemeColors = typeof lightColors;

export const getShadows = (isDark: boolean) => ({
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0.35 : 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  subtle: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0.25 : 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  float: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.45 : 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
});

export const theme = {
  fonts: {
    regular: Platform.select({ web: '"Oswald", sans-serif', default: 'Oswald_400Regular' }) as string,
    medium: Platform.select({ web: '"Oswald", sans-serif', default: 'Oswald_500Medium' }) as string,
    semiBold: Platform.select({ web: '"Oswald", sans-serif', default: 'Oswald_600SemiBold' }) as string,
    bold: Platform.select({ web: '"Oswald", sans-serif', default: 'Oswald_700Bold' }) as string,
  },

  colors: lightColors,

  radius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },

  shadows: getShadows(false),
};

interface ThemeContextValue {
  colors: ThemeColors;
  isDark: boolean;
  colorScheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextValue>({
  colors: lightColors,
  isDark: false,
  colorScheme: 'light',
});

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const value = useMemo<ThemeContextValue>(() => {
    return {
      colors: isDark ? darkColors : lightColors,
      isDark,
      colorScheme: isDark ? 'dark' : 'light',
    };
  }, [isDark]);

  return React.createElement(ThemeContext.Provider, { value }, children);
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  const isDark = context?.isDark ?? false;
  const colors = context?.colors ?? lightColors;
  const colorScheme = context?.colorScheme ?? 'light';

  const shadows = useMemo(() => getShadows(isDark), [isDark]);

  return {
    colors,
    isDark,
    colorScheme,
    fonts: theme.fonts,
    radius: theme.radius,
    spacing: theme.spacing,
    shadows,
  };
}

export function useStyles<T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(
  createStyles: (colors: ThemeColors, isDark: boolean) => T
): T {
  const { colors, isDark } = useAppTheme();
  return useMemo(() => StyleSheet.create(createStyles(colors, isDark)), [colors, isDark]);
}
