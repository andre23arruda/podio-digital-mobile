import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { CheckCircle2, Circle } from 'lucide-react-native';
import { useAppTheme } from '../constants/theme';

interface StatusIconProps {
  status?: string | null;
  size?: number;
}

export function StatusIcon({ status, size = 18 }: StatusIconProps) {
  const { colors } = useAppTheme();

  if (status === 'C') {
    return (
      <View style={styles.container}>
        <CheckCircle2 size={size} color={colors.success} />
      </View>
    );
  }

  if (status === 'A') {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color={colors.warning} />
      </View>
    );
  }

  if (status === 'P') {
    return (
      <View style={styles.container}>
        <Circle size={size} color={colors.textMuted} />
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
