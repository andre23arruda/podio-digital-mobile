import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from './Text';
import { theme, useAppTheme, useStyles, ThemeColors } from '../constants/theme';
import { formatTeamName, renderTeamType } from '../utils/tournament';

interface ClassificationRow {
  posicao: number;
  dupla?: string;
  nome?: string;
  vitorias: number;
  saldo: number;
  pontos: number;
  jogos: number;
}

interface GroupClassificationCardProps {
  grupoNome: string;
  classificacao: ClassificationRow[];
  torneio: any;
  groupsFinished?: boolean;
  showGroupName?: boolean;
}

export function GroupClassificationCard({
  grupoNome,
  classificacao,
  torneio,
  groupsFinished = false,
  showGroupName = true,
}: GroupClassificationCardProps) {
  const { shadows } = useAppTheme();
  const styles = useStyles(getStyles);

  return (
    <View style={[styles.container, shadows.card]}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <Text style={styles.headerTitle}>
          {showGroupName ? `${grupoNome} - Classificação` : 'Classificação'}
        </Text>
      </View>

      {/* Table Columns Header */}
      <View style={styles.tableHeaderRow}>
        <Text style={[styles.th, styles.thPos]}>#</Text>
        <Text style={[styles.th, styles.thTeam]}>{renderTeamType(torneio)}</Text>
        <Text style={[styles.th, styles.thStat]}>V</Text>
        <Text style={[styles.th, styles.thStat]}>S</Text>
        <Text style={[styles.th, styles.thStat]}>P</Text>
        <Text style={[styles.th, styles.thStat]}>J</Text>
      </View>

      {/* Table Rows */}
      {classificacao.map((item, index) => {
        const isQualified = groupsFinished && item.posicao < 3;
        const isAlt = index % 2 === 1;
        const rawName = item.dupla || item.nome || '';
        const teamLines = formatTeamName(rawName).split('\n');

        return (
          <View
            key={index}
            style={[
              styles.row,
              isAlt && styles.altRow,
              isQualified && styles.qualifiedRow,
              index === classificacao.length - 1 && styles.lastRow,
            ]}
          >
            {/* Position */}
            <View style={styles.posCol}>
              <Text
                style={[
                  styles.posText,
                  isQualified && styles.qualifiedText,
                ]}
              >
                {item.posicao}
              </Text>
            </View>

            {/* Team */}
            <View style={styles.teamCol}>
              {teamLines.map((line, i) => (
                <Text
                  key={i}
                  style={[
                    styles.teamText,
                    isQualified && styles.qualifiedText,
                  ]}
                  numberOfLines={1}
                >
                  {line}
                </Text>
              ))}
            </View>

            {/* V */}
            <Text style={[styles.statCol, isQualified && styles.qualifiedText]}>
              {item.vitorias}
            </Text>

            {/* S */}
            <Text style={[styles.statCol, isQualified && styles.qualifiedText]}>
              {item.saldo}
            </Text>

            {/* P */}
            <Text style={[styles.statCol, isQualified && styles.qualifiedText]}>
              {item.pontos}
            </Text>

            {/* J */}
            <Text style={[styles.statCol, isQualified && styles.qualifiedText]}>
              {item.jogos}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: theme.spacing.xl,
      overflow: 'hidden',
    },
    cardHeader: {
      backgroundColor: colors.tableHeader,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      alignItems: 'center',
    },
    headerTitle: {
      fontFamily: theme.fonts.bold,
      fontSize: 16,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    tableHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.tableHeader,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    th: {
      fontFamily: theme.fonts.bold,
      fontSize: 12,
      fontWeight: '700',
      color: colors.textSecondary,
      textAlign: 'center',
    },
    thPos: {
      width: 28,
    },
    thTeam: {
      flex: 1,
      textAlign: 'left',
      paddingLeft: 8,
    },
    thStat: {
      width: 32,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
      backgroundColor: colors.card,
    },
    altRow: {
      backgroundColor: colors.tableRowAlt,
    },
    qualifiedRow: {
      backgroundColor: colors.qualifiedBg,
      borderLeftWidth: 4,
      borderLeftColor: colors.qualifiedBorder,
    },
    lastRow: {
      borderBottomWidth: 0,
    },
    posCol: {
      width: 28,
      alignItems: 'center',
      justifyContent: 'center',
    },
    posText: {
      fontFamily: theme.fonts.bold,
      fontSize: 13,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    teamCol: {
      flex: 1,
      paddingLeft: 8,
      justifyContent: 'center',
    },
    teamText: {
      fontFamily: theme.fonts.regular,
      fontSize: 13,
      color: colors.textPrimary,
      lineHeight: 18,
    },
    statCol: {
      fontFamily: theme.fonts.medium,
      width: 32,
      textAlign: 'center',
      fontSize: 13,
      color: colors.textSecondary,
    },
    qualifiedText: {
      fontFamily: theme.fonts.bold,
      color: colors.qualifiedText,
      fontWeight: '700',
    },
  });
