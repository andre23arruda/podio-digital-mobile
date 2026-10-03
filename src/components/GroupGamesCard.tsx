import React from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Info } from 'lucide-react-native';
import { Text } from './Text';
import { StatusIcon } from './StatusIcon';
import { theme, useAppTheme, useStyles, ThemeColors } from '../constants/theme';
import {
  formatTeamName,
  getWinnerColor,
  renderGameDate,
  renderTeamType,
} from '../utils/tournament';

interface GroupGamesCardProps {
  grupoNome: string;
  jogos: any[];
  torneio: any;
  showGroupName?: boolean;
}

export function GroupGamesCard({
  grupoNome,
  jogos,
  torneio,
  showGroupName = true,
}: GroupGamesCardProps) {
  const isDoubles = torneio.tipo === 'D';
  const hasPeriod = Boolean(torneio.periodo);
  const { colors, shadows } = useAppTheme();
  const styles = useStyles(getStyles);

  const handleScoreClick = (obs?: string | null) => {
    if (obs) {
      Alert.alert('Observação do Jogo', obs);
    }
  };

  return (
    <View style={[styles.container, shadows.card]}>
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <Text style={styles.headerTitle}>
          {showGroupName ? `${grupoNome} - Jogos` : 'Jogos'}
        </Text>
      </View>

      {/* Table Header */}
      <View style={styles.tableHeaderRow}>
        {hasPeriod && <Text style={[styles.th, styles.thDate]}>Data</Text>}
        <Text style={[styles.th, styles.thTeam1]}>{renderTeamType(torneio, '1')}</Text>
        <Text style={[styles.th, styles.thScore]}>Placar</Text>
        <Text style={[styles.th, styles.thTeam2]}>{renderTeamType(torneio, '2')}</Text>
        <View style={styles.thStatus} />
      </View>

      {/* Games Rows */}
      {jogos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nenhum jogo encontrado</Text>
        </View>
      ) : (
        jogos.map((jogo, index) => {
          const isFinished = jogo.concluido === 'C';
          const p1 = Number(jogo.pontos_dupla1 ?? 0);
          const p2 = Number(jogo.pontos_dupla2 ?? 0);
          const p1Win = isFinished && p1 > p2;
          const p2Win = isFinished && p2 > p1;

          const team1Lines = formatTeamName(jogo.dupla1).split('\n');
          const team2Lines = formatTeamName(jogo.dupla2).split('\n');

          const gameDate = hasPeriod ? renderGameDate(jogo.data_jogo, 'vertical') : null;
          const isAltRow = index % 2 === 1;

          return (
            <View
              key={jogo.id || index}
              style={[
                styles.gameRow,
                isAltRow && styles.altRow,
                index === jogos.length - 1 && styles.lastRow,
              ]}
            >
              {/* Date (if period) */}
              {hasPeriod && (
                <View style={styles.dateCol}>
                  {gameDate ? (
                    <>
                      <Text style={styles.dateDay}>{gameDate.dayMonth}</Text>
                      <Text style={styles.dateTime}>{gameDate.time}</Text>
                    </>
                  ) : (
                    <Text style={styles.datePlaceholder}>A definir</Text>
                  )}
                </View>
              )}

              {/* Team 1 */}
              <View style={styles.team1Col}>
                {team1Lines.map((line, i) => (
                  <Text
                    key={i}
                    style={[
                      styles.teamText,
                      { color: getWinnerColor(p1Win, isFinished && !p1Win, colors) },
                      p1Win && styles.winnerText,
                    ]}
                    numberOfLines={1}
                  >
                    {line} {i === 0 && isDoubles && team1Lines.length > 1 ? '&' : ''}
                  </Text>
                ))}
              </View>

              {/* Score / Placar */}
              <TouchableOpacity
                style={styles.scoreCol}
                onPress={() => handleScoreClick(jogo.obs)}
                disabled={!jogo.obs}
                activeOpacity={0.7}
              >
                <View style={styles.scoreBox}>
                  <Text style={styles.scoreText}>
                    {jogo.pontos_dupla1 ?? '-'}
                    <Text style={styles.scoreDivider}> ✕ </Text>
                    {jogo.pontos_dupla2 ?? '-'}
                  </Text>
                  {jogo.obs ? (
                    <Info size={13} color={colors.info} style={styles.infoIcon} />
                  ) : null}
                </View>
              </TouchableOpacity>

              {/* Team 2 */}
              <View style={styles.team2Col}>
                {team2Lines.map((line, i) => (
                  <Text
                    key={i}
                    style={[
                      styles.teamText,
                      { color: getWinnerColor(p2Win, isFinished && !p2Win, colors) },
                      p2Win && styles.winnerText,
                    ]}
                    numberOfLines={1}
                  >
                    {line} {i === 0 && isDoubles && team2Lines.length > 1 ? '&' : ''}
                  </Text>
                ))}
              </View>

              {/* Status Icon */}
              <View style={styles.statusCol}>
                <StatusIcon status={jogo.concluido} size={16} />
              </View>
            </View>
          );
        })
      )}
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
      paddingHorizontal: 8,
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
    thDate: {
      width: 52,
    },
    thTeam1: {
      flex: 1,
      textAlign: 'right',
      paddingRight: 6,
    },
    thScore: {
      width: 76,
      textAlign: 'center',
    },
    thTeam2: {
      flex: 1,
      textAlign: 'left',
      paddingLeft: 6,
    },
    thStatus: {
      width: 26,
    },
    emptyContainer: {
      padding: theme.spacing.xl,
      alignItems: 'center',
    },
    emptyText: {
      fontFamily: theme.fonts.regular,
      fontSize: 14,
      color: colors.textMuted,
    },
    gameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
      backgroundColor: colors.card,
    },
    altRow: {
      backgroundColor: colors.tableRowAlt,
    },
    lastRow: {
      borderBottomWidth: 0,
    },
    dateCol: {
      width: 52,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dateDay: {
      fontFamily: theme.fonts.semiBold,
      fontSize: 11,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    dateTime: {
      fontFamily: theme.fonts.regular,
      fontSize: 9,
      color: colors.textMuted,
    },
    datePlaceholder: {
      fontFamily: theme.fonts.regular,
      fontSize: 10,
      color: colors.textMuted,
    },
    team1Col: {
      flex: 1,
      alignItems: 'flex-end',
      justifyContent: 'center',
      paddingRight: 6,
    },
    team2Col: {
      flex: 1,
      alignItems: 'flex-start',
      justifyContent: 'center',
      paddingLeft: 6,
    },
    teamText: {
      fontFamily: theme.fonts.regular,
      fontSize: 12,
      color: colors.textPrimary,
      lineHeight: 16,
    },
    winnerText: {
      fontFamily: theme.fonts.bold,
      fontWeight: '700',
    },
    scoreCol: {
      width: 76,
      alignItems: 'center',
      justifyContent: 'center',
    },
    scoreBox: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 3,
      paddingHorizontal: 6,
      borderRadius: theme.radius.xs,
      backgroundColor: colors.cardAlt,
    },
    scoreText: {
      fontFamily: theme.fonts.bold,
      fontSize: 12,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    scoreDivider: {
      fontFamily: theme.fonts.regular,
      color: colors.textMuted,
      fontSize: 11,
    },
    infoIcon: {
      marginLeft: 3,
    },
    statusCol: {
      width: 26,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
