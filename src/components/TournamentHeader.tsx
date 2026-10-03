import React from 'react';
import { View, StyleSheet, TouchableOpacity, Share } from 'react-native';
import { Trophy, RefreshCw, Share2, ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Text } from './Text';
import { theme, useAppTheme, useStyles, ThemeColors } from '../constants/theme';

interface TournamentHeaderProps {
  onReload?: () => void;
  tournamentTitle?: string;
  tournamentId?: string;
  isReloading?: boolean;
}

export function TournamentHeader({
  onReload,
  tournamentTitle = 'Torneio',
  tournamentId,
  isReloading = false,
}: TournamentHeaderProps) {
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = useStyles(getStyles);

  const handleShare = async () => {
    try {
      const url = `https://podiodigital.app.br/torneio/${tournamentId || ''}`;
      await Share.share({
        title: tournamentTitle,
        message: `Acompanhe *${tournamentTitle}* via Pódio Digital: ${url}`,
        url,
      });
    } catch (e) {
      console.error('Error sharing:', e);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.iconButton}
          activeOpacity={0.7}
          accessibilityLabel="Voltar"
        >
          <ArrowLeft size={22} color={colors.textSecondary} />
        </TouchableOpacity>

        <View style={styles.logoRow}>
          <Trophy size={26} color={colors.orange500} />
          <Text style={styles.logoText}>
            Pódio<Text style={styles.logoHighlight}> Digital</Text>
          </Text>
        </View>
      </View>

      <View style={styles.right}>
        {/* {onReload && (
          <TouchableOpacity
            onPress={onReload}
            disabled={isReloading}
            style={styles.iconButton}
            activeOpacity={0.7}
            accessibilityLabel="Recarregar dados"
          >
            <RefreshCw
              size={20}
              color={isReloading ? colors.orange500 : colors.textSecondary}
            />
          </TouchableOpacity>
        )} */}

        <TouchableOpacity
          onPress={handleShare}
          style={styles.iconButton}
          activeOpacity={0.7}
          accessibilityLabel="Compartilhar"
        >
          <Share2 size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      height: 60,
      backgroundColor: colors.headerBg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.md,
    },
    left: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    logoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    logoText: {
      fontFamily: theme.fonts.bold,
      fontSize: 18,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    logoHighlight: {
      fontFamily: theme.fonts.bold,
      color: colors.orange600,
    },
    right: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    iconButton: {
      padding: 8,
      borderRadius: theme.radius.full,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
