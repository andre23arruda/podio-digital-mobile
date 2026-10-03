import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from './Text';
import { theme, useStyles, ThemeColors } from '../constants/theme';

export function Footer() {
  const year = new Date().getFullYear();
  const styles = useStyles(getStyles);

  return (
    <View style={styles.footer}>
      <Text style={styles.footerText}>
        © {year} Pódio Digital. Todos os direitos reservados.
      </Text>
    </View>
  );
}

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    footer: {
      paddingVertical: theme.spacing.xxl,
      alignItems: 'center',
      justifyContent: 'center',
    },
    footerText: {
      fontFamily: theme.fonts.regular,
      fontSize: 12,
      color: colors.textMuted,
      textAlign: 'center',
    },
  });
