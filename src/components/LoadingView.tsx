import React from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Trophy, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react-native';
import { Text } from './Text';
import { theme, useAppTheme, useStyles, ThemeColors } from '../constants/theme';

const SPINNER_SCALE = Platform.select({
  ios: 2.1,
  android: 1.85,
  default: 2.0,
});

interface LoadingViewProps {
  message?: string;
  isError?: boolean;
  onRetry?: () => void;
  onBack?: () => void;
}

export function LoadingView({
  message = 'Carregando torneio...',
  isError = false,
  onRetry,
  onBack,
}: LoadingViewProps) {
  const { colors } = useAppTheme();
  const styles = useStyles(getStyles);

  if (isError) {
    return (
      <View style={styles.container}>
        <View style={styles.errorIconCircle}>
          <AlertCircle size={44} color={colors.error} />
        </View>

        <Text style={styles.errorTitle}>Erro ao carregar o torneio</Text>
        <Text style={styles.errorMessage}>
          Verifique se o ID do torneio está correto ou se a sua conexão com a internet está ativa.
        </Text>

        <View style={styles.actionsRow}>
          {onRetry && (
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={onRetry}
              activeOpacity={0.8}
            >
              <RefreshCw size={18} color="#ffffff" style={styles.btnIcon} />
              <Text style={styles.primaryButtonText}>Tentar Novamente</Text>
            </TouchableOpacity>
          )}

          {onBack && (
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={onBack}
              activeOpacity={0.8}
            >
              <ArrowLeft size={18} color={colors.textSecondary} style={styles.btnIcon} />
              <Text style={styles.secondaryButtonText}>Voltar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.loaderContainer}>
        <ActivityIndicator
          size="large"
          color={colors.orange500}
          style={styles.spinner}
        />
        <View style={styles.trophyWrapper}>
          <Trophy size={24} color={colors.orange500} />
        </View>
      </View>
      <Text style={styles.loadingText}>Carregando torneio...</Text>
    </View>
  );
}

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.xl,
    },
    loaderContainer: {
      width: 100,
      height: 100,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.lg,
    },
    spinner: {
      position: 'absolute',
      transform: [{ scale: SPINNER_SCALE }],
    },
    trophyWrapper: {
      width: 62,
      height: 62,
      borderRadius: 31,
      backgroundColor: colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    errorIconCircle: {
      width: 90,
      height: 90,
      borderRadius: theme.radius.full,
      backgroundColor: colors.errorLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.lg,
    },
    loadingText: {
      fontFamily: theme.fonts.medium,
      fontSize: 16,
      fontWeight: '600',
      color: colors.textSecondary,
      textAlign: 'center',
    },
    errorTitle: {
      fontFamily: theme.fonts.bold,
      fontSize: 20,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: theme.spacing.sm,
      textAlign: 'center',
    },
    errorMessage: {
      fontFamily: theme.fonts.regular,
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: theme.spacing.xl,
      maxWidth: 300,
    },
    actionsRow: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: theme.radius.md,
    },
    primaryButton: {
      backgroundColor: colors.orange600,
    },
    primaryButtonText: {
      fontFamily: theme.fonts.bold,
      color: '#ffffff',
      fontWeight: '600',
      fontSize: 14,
    },
    secondaryButton: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    secondaryButtonText: {
      fontFamily: theme.fonts.medium,
      color: colors.textSecondary,
      fontWeight: '600',
      fontSize: 14,
    },
    btnIcon: {
      marginRight: 6,
    },
  });
