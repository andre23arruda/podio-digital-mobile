import React from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Info } from 'lucide-react-native';
import { Text } from './Text';
import { theme, useAppTheme, useStyles, ThemeColors } from '../constants/theme';
import {
  formatTeamName,
  formatTeamNameHelp,
  getWinnerColor,
  renderGameDate,
  renderPoints,
} from '../utils/tournament';

interface PlayoffGameProps {
  jogo: any;
  torneio: any;
}

function PlayoffGameItem({ jogo, torneio }: PlayoffGameProps) {
  const { colors, shadows } = useAppTheme();
  const styles = useStyles(getStyles);

  const isFinished = jogo.concluido === 'C';
  const isInProgress = jogo.concluido === 'A';
  const p1 = Number(jogo.pontos_dupla1 ?? 0);
  const p2 = Number(jogo.pontos_dupla2 ?? 0);
  const p1Win = isFinished && p1 > p2;
  const p2Win = isFinished && p2 > p1;

  const team1Display = jogo.dupla1
    ? formatTeamName(jogo.dupla1)
    : formatTeamNameHelp(jogo.dupla1, jogo, 0);

  const team2Display = jogo.dupla2
    ? formatTeamName(jogo.dupla2)
    : formatTeamNameHelp(jogo.dupla2, jogo, 1);

  const hasPeriod = Boolean(torneio.periodo);
  const gameDate = hasPeriod ? renderGameDate(jogo.data_jogo, 'horizontal') : null;

  const handleScoreClick = () => {
    if (jogo.obs) {
      Alert.alert('Observação do Jogo', jogo.obs);
    }
  };

  return (
    <View
      style={[
        styles.gameCard,
        shadows.subtle,
        isInProgress && styles.gameInProgress,
      ]}
    >
      {/* Observation Icon */}
      {jogo.obs ? (
        <TouchableOpacity
          onPress={handleScoreClick}
          style={styles.obsBadge}
          activeOpacity={0.7}
        >
          <Info size={14} color={colors.info} />
        </TouchableOpacity>
      ) : null}

      {/* Team 1 Row */}
      <View style={styles.teamRow}>
        <View style={styles.teamNameContainer}>
          <Text
            style={[
              styles.teamName,
              { color: getWinnerColor(p1Win, isFinished && !p1Win, colors) },
              p1Win && styles.winnerText,
            ]}
          >
            {team1Display}
          </Text>
        </View>
        <Text style={[styles.scoreValue, p1Win && styles.winnerText]}>
          {renderPoints(jogo, 'pontos_dupla1')}
        </Text>
      </View>

      <View style={styles.rowDivider} />

      {/* Team 2 Row */}
      <View style={styles.teamRow}>
        <View style={styles.teamNameContainer}>
          <Text
            style={[
              styles.teamName,
              { color: getWinnerColor(p2Win, isFinished && !p2Win, colors) },
              p2Win && styles.winnerText,
            ]}
          >
            {team2Display}
          </Text>
        </View>
        <Text style={[styles.scoreValue, p2Win && styles.winnerText]}>
          {renderPoints(jogo, 'pontos_dupla2')}
        </Text>
      </View>

      {/* Game Date */}
      {gameDate && (
        <View style={styles.dateRow}>
          <Text style={styles.dateText}>{gameDate.formatted}</Text>
        </View>
      )}
    </View>
  );
}

interface PlayoffRoundProps {
  title: string;
  games?: any[] | null;
  torneio: any;
}

function PlayoffRound({ title, games, torneio }: PlayoffRoundProps) {
  const styles = useStyles(getStyles);

  if (!games || games.length === 0) return null;

  return (
    <View style={styles.roundContainer}>
      <Text style={styles.roundTitle}>{title}</Text>
      {games.map((jogo, index) => (
        <PlayoffGameItem key={jogo.id || index} jogo={jogo} torneio={torneio} />
      ))}
    </View>
  );
}

interface PlayoffsCardProps {
  fasesFinais: Record<string, any[]> | null;
  torneio: any;
}

export function PlayoffsCard({ fasesFinais, torneio }: PlayoffsCardProps) {
  const styles = useStyles(getStyles);

  if (!fasesFinais) return null;

  const hasAnyGames = Object.values(fasesFinais).some(
    (arr) => Array.isArray(arr) && arr.length > 0
  );

  if (!hasAnyGames) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Fases Finais</Text>

      {/* 32 avos */}
      <PlayoffRound
        title="32 avos de final"
        games={fasesFinais['32 AVOS']}
        torneio={torneio}
      />

      {/* 16 avos */}
      <PlayoffRound
        title="16 avos de final"
        games={fasesFinais['16 AVOS']}
        torneio={torneio}
      />

      {/* Oitavas */}
      <PlayoffRound
        title="Oitavas de final"
        games={fasesFinais['OITAVAS']}
        torneio={torneio}
      />

      {/* Quartas */}
      <PlayoffRound
        title="Quartas de final"
        games={fasesFinais['QUARTAS']}
        torneio={torneio}
      />

      {/* Semifinais */}
      <PlayoffRound
        title="Semifinais"
        games={fasesFinais['SEMI']}
        torneio={torneio}
      />

      {/* Final */}
      <PlayoffRound
        title="Final"
        games={fasesFinais['FINAL']}
        torneio={torneio}
      />

      {/* Terceiro Lugar */}
      <PlayoffRound
        title="Terceiro Lugar"
        games={fasesFinais['TERCEIRO LUGAR']}
        torneio={torneio}
      />
    </View>
  );
}

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
      fontFamily: theme.fonts.bold,
      fontSize: 22,
      fontWeight: '700',
      color: colors.textPrimary,
      textAlign: 'center',
      marginBottom: theme.spacing.lg,
    },
    roundContainer: {
      marginBottom: theme.spacing.lg,
    },
    roundTitle: {
      fontFamily: theme.fonts.bold,
      fontSize: 16,
      fontWeight: '700',
      color: colors.textPrimary,
      textAlign: 'center',
      marginBottom: theme.spacing.sm,
    },
    gameCard: {
      backgroundColor: colors.card,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      position: 'relative',
    },
    gameInProgress: {
      borderWidth: 2,
      borderColor: colors.warning,
    },
    obsBadge: {
      position: 'absolute',
      top: 8,
      right: 8,
      zIndex: 2,
    },
    teamRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 4,
    },
    teamNameContainer: {
      flex: 1,
      paddingRight: theme.spacing.sm,
    },
    teamName: {
      fontFamily: theme.fonts.regular,
      fontSize: 14,
      color: colors.textPrimary,
      lineHeight: 19,
    },
    scoreValue: {
      fontFamily: theme.fonts.bold,
      fontSize: 15,
      fontWeight: '700',
      color: colors.textPrimary,
      minWidth: 24,
      textAlign: 'right',
    },
    winnerText: {
      fontFamily: theme.fonts.bold,
      fontWeight: '700',
    },
    rowDivider: {
      height: 1,
      backgroundColor: colors.borderLight,
      marginVertical: 4,
    },
    dateRow: {
      marginTop: 6,
      alignItems: 'center',
    },
    dateText: {
      fontFamily: theme.fonts.regular,
      fontSize: 11,
      color: colors.textMuted,
    },
  });
