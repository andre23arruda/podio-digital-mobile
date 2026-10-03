import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from './Text';
import { theme, useAppTheme, useStyles, ThemeColors } from '../constants/theme';

interface StatCardProps {
  value: string | number;
  label?: string;
  valueColor?: string;
  isStatus?: boolean;
}

export function StatCard({ value, label, valueColor, isStatus = false }: StatCardProps) {
  const { shadows } = useAppTheme();
  const styles = useStyles(getStyles);

  return (
    <View style={[styles.card, shadows.card]}>
      <Text
        style={[
          styles.value,
          valueColor ? { color: valueColor } : undefined,
          isStatus && styles.statusValue,
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </Text>
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

interface TournamentStatsGridProps {
  torneio: any;
  gruposCount: number;
}

export function TournamentStatsGrid({ torneio, gruposCount }: TournamentStatsGridProps) {
  const { colors, shadows } = useAppTheme();
  const styles = useStyles(getStyles);

  const isFinished = !torneio.ativo;
  const statusText = torneio.ativo
    ? torneio.nao_iniciado
      ? 'Não iniciado'
      : 'Em andamento'
    : 'Finalizado';
  const statusColor = isFinished ? colors.success : colors.orange500;

  const teamType = torneio.tipo === 'S' ? 'Jogadores' : 'Duplas';
  const totalJogos = torneio.jogos || 0;
  const jogosRestantes = torneio.jogos_restantes || 0;
  const jogosRealizados = totalJogos - jogosRestantes;

  return (
    <View style={styles.grid}>
      {/* Status Card (Full width on mobile or top) */}
      <View style={[styles.card, styles.fullWidthCard, shadows.card]}>
        <Text style={[styles.statusValue, { color: statusColor }]}>{statusText}</Text>
      </View>

      {/* 3 Metrics in a Row / Grid */}
      <View style={styles.row}>
        <View style={styles.col}>
          <StatCard
            value={torneio.duplas ?? 0}
            label={teamType}
            valueColor={colors.info}
          />
        </View>

        <View style={styles.col}>
          <StatCard
            value={gruposCount}
            label={gruposCount > 1 ? 'Grupos' : 'Grupo'}
            valueColor={colors.purple}
          />
        </View>

        <View style={styles.col}>
          <StatCard
            value={`${jogosRealizados} / ${totalJogos}`}
            label="Jogos"
            valueColor={colors.success}
          />
        </View>
      </View>
    </View>
  );
}

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    grid: {
      marginBottom: theme.spacing.xl,
      gap: theme.spacing.md,
    },
    fullWidthCard: {
      paddingVertical: theme.spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    row: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    col: {
      flex: 1,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: theme.spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 80,
    },
    value: {
      fontFamily: theme.fonts.bold,
      fontSize: 20,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 4,
    },
    statusValue: {
      fontFamily: theme.fonts.bold,
      fontSize: 22,
      fontWeight: '700',
    },
    label: {
      fontFamily: theme.fonts.medium,
      fontSize: 13,
      color: colors.textSecondary,
      fontWeight: '500',
    },
  });
