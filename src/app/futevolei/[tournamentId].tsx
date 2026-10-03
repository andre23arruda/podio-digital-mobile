import { useLocalSearchParams, useRouter } from 'expo-router';
import { Award, Info } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Footer } from '../../components/Footer';
import { LoadingView } from '../../components/LoadingView';
import { Text } from '../../components/Text';
import { TournamentHeader } from '../../components/TournamentHeader';
import { theme, ThemeColors, useAppTheme, useStyles } from '../../constants/theme';
import { formatDate } from '../../utils/tournament';

function renderPoints(jogo: any, duplaKey: 'pontos_dupla1' | 'pontos_dupla2') {
  if (jogo?.[duplaKey] !== null && jogo?.[duplaKey] !== undefined && jogo?.[duplaKey] !== '') {
    return String(jogo[duplaKey]);
  }
  return '-';
}

export default function FutevoleiScreen() {
  const { tournamentId } = useLocalSearchParams<{ tournamentId: string }>();
  const router = useRouter();
  const { colors, shadows } = useAppTheme();
  const styles = useStyles(getStyles);

  const [tournamentData, setTournamentData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [selectedChave, setSelectedChave] = useState<string>('all');

  const loadData = useCallback(async (isRefresh = false) => {
    if (!tournamentId) return;

    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(false);

    try {
      const API_ROUTE =
        process.env.EXPO_PUBLIC_API_ROUTE || 'http://localhost:8000/api';
      const resp = await fetch(`${API_ROUTE}/futevolei/${tournamentId}/json`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!resp.ok) {
        console.error('Erro ao buscar dados do Futevôlei:', resp.statusText);
        setError(true);
        return;
      }

      const data = await resp.json();
      setTournamentData(data);
    } catch (err) {
      console.error('Erro na requisição do Futevôlei:', err);
      setError(true);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [tournamentId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (isLoading) {
    return <LoadingView message="Carregando Futevôlei..." />;
  }

  if (error || !tournamentData || !tournamentData.torneio) {
    return (
      <LoadingView
        isError
        onRetry={() => loadData()}
        onBack={() => router.back()}
      />
    );
  }

  const {
    torneio,
    template,
    jogos = [],
    card_style,
  } = tournamentData;

  const templateData =
    template || (!Array.isArray(jogos) && jogos ? { Jogos: jogos } : {});

  const jogosMap: Record<number | string, any> = {};
  if (Array.isArray(jogos)) {
    jogos.forEach((j: any) => {
      if (j && j.id !== undefined) {
        jogosMap[j.id] = j;
      }
    });
  }

  const isValidTeam = (team: any) => {
    if (team === null || team === undefined) return false;
    const str = String(team).trim();
    return str !== '' && str !== 'None' && str !== 'null' && str !== 'undefined';
  };

  const isPlaceholderTeam = (team: any) => {
    if (!team) return true;
    const str = String(team);
    return (
      str.startsWith('Vencedor de ') ||
      str.startsWith('Perdedor de ') ||
      str === 'BYE' ||
      str === 'A definir'
    );
  };

  const formatTeamName = (dupla: any) => {
    if (dupla === null || dupla === undefined) return '';
    return String(dupla).replace(/<br\s*\/?>/gi, '\n');
  };

  const formatTeamNameHelp = (dupla: any, jogo: any, index: number) => {
    if (
      jogo.dupla1 === null ||
      jogo.dupla2 === null ||
      jogo.dupla1 === undefined ||
      jogo.dupla2 === undefined
    ) {
      const help_text = jogo.help_text;
      if (help_text && typeof help_text === 'string') {
        return help_text.split('x')[index] || 'A definir';
      } else {
        return 'A definir';
      }
    }
    return String(dupla || 'A definir').replace(/<br\s*\/?>/gi, '\n');
  };

  const renderTeamDisplay = (
    team: any,
    fallbackHelp: string,
    isWinner: boolean,
    isLoser: boolean
  ) => {
    if (!isValidTeam(team)) {
      return (
        <Text style={[styles.teamName, styles.placeholderTeam]} numberOfLines={2}>
          {fallbackHelp}
        </Text>
      );
    }
    const str = String(team);
    if (isPlaceholderTeam(str)) {
      return (
        <Text style={[styles.teamName, styles.placeholderTeam]} numberOfLines={2}>
          {str}
        </Text>
      );
    }
    const lines = formatTeamName(str).split('\n');
    return (
      <View>
        {lines.map((line, i) => (
          <Text
            key={i}
            style={[
              styles.teamName,
              isWinner && styles.winnerTeam,
              isLoser && styles.loserTeam,
            ]}
            numberOfLines={1}
          >
            {line}
          </Text>
        ))}
      </View>
    );
  };

  const isFinished = !torneio.ativo;
  const statusText = torneio.ativo
    ? torneio.nao_iniciado
      ? 'Não iniciado'
      : 'Em andamento'
    : 'Finalizado';
  const statusColor = isFinished ? colors.success : colors.orange500;

  const templateEntries = Object.entries(templateData || {}) as [string, any][];

  const handleScoreClick = (obs?: string | null) => {
    if (obs) {
      Alert.alert('Observação do Jogo', obs);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Header Bar */}
      <TournamentHeader
        onReload={() => loadData(true)}
        tournamentTitle={torneio.nome}
        tournamentId={tournamentId}
        isReloading={isRefreshing}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadData(true)}
            tintColor={colors.orange500}
            colors={[colors.orange500]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.tournamentTitle}>{torneio.nome}</Text>
          <Text style={styles.tournamentPeriod}>({formatDate(torneio.data)})</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {/* Status */}
          <View style={[styles.card, styles.fullWidthCard, shadows.card]}>
            <Text style={[styles.statusValue, { color: statusColor }]}>{statusText}</Text>
          </View>

          {/* 3 Metrics */}
          <View style={styles.statsRow}>
            <View style={[styles.card, styles.statCard, shadows.card]}>
              <Text style={[styles.statValue, { color: colors.info }]}>
                {torneio.duplas ?? 0}
              </Text>
              <Text style={styles.statLabel}>
                {torneio.tipo === 'S' ? 'Jogadores' : 'Duplas'}
              </Text>
            </View>

            <View style={[styles.card, styles.statCard, shadows.card]}>
              <Text style={[styles.statValue, { color: colors.success }]}>
                {torneio.jogos ?? 0}
              </Text>
              <Text style={styles.statLabel}>Jogos</Text>
            </View>

            <View style={[styles.card, styles.statCard, shadows.card]}>
              <Text style={[styles.statValue, { color: colors.orange500 }]}>
                {torneio.jogos_restantes ?? 0}
              </Text>
              <Text style={styles.statLabel}>Pendente</Text>
            </View>
          </View>
        </View>

        {/* Chaves Filter Tabs */}
        {templateEntries.length > 1 && (
          <View style={styles.filterContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScroll}
            >
              <TouchableOpacity
                style={[
                  styles.filterTab,
                  selectedChave === 'all' && styles.filterTabActive,
                ]}
                onPress={() => setSelectedChave('all')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    selectedChave === 'all' && styles.filterTabTextActive,
                  ]}
                >
                  Todas as Chaves
                </Text>
              </TouchableOpacity>

              {templateEntries.map(([chaveNome]) => (
                <TouchableOpacity
                  key={chaveNome}
                  style={[
                    styles.filterTab,
                    selectedChave === chaveNome && styles.filterTabActive,
                  ]}
                  onPress={() => setSelectedChave(chaveNome)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.filterTabText,
                      selectedChave === chaveNome && styles.filterTabTextActive,
                    ]}
                  >
                    {chaveNome}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Chaves Section */}
        {templateEntries.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum jogo configurado no momento.</Text>
          </View>
        ) : (
          <View style={styles.chavesContainer}>
            {templateEntries
              .filter(([chaveNome]) => selectedChave === 'all' || selectedChave === chaveNome)
              .map(([chaveNome, fases]) => (
                <View key={chaveNome} style={styles.chaveSection}>
                  <View style={styles.chaveHeader}>
                    <Award size={20} color={colors.orange500} />
                    <Text style={styles.chaveTitle}>{chaveNome}</Text>
                  </View>

                  <View style={styles.fasesContainer}>
                    {Object.entries(fases || {}).map(([faseNome, rodadaData]: [string, any]) => {
                      const jogosList: any[] = Array.isArray(rodadaData)
                        ? rodadaData
                        : rodadaData
                          ? [rodadaData]
                          : [];

                      return (
                        <View key={faseNome} style={styles.faseBlock}>
                          <View style={styles.faseHeaderBadge}>
                            <Text style={styles.faseTitle}>{faseNome}</Text>
                          </View>

                          <View style={styles.gamesList}>
                            {jogosList.map((templateJogo) => {
                              const realJogo =
                                templateJogo?.id !== undefined
                                  ? jogosMap[templateJogo.id]
                                  : undefined;
                              const dupla1 = isValidTeam(realJogo?.dupla1)
                                ? realJogo.dupla1
                                : templateJogo.dupla1;
                              const dupla2 = isValidTeam(realJogo?.dupla2)
                                ? realJogo.dupla2
                                : templateJogo.dupla2;

                              const jogo = {
                                ...templateJogo,
                                ...realJogo,
                                referencia: templateJogo.referencia || realJogo?.referencia,
                                dupla1,
                                dupla2,
                              };

                              const isC = jogo.concluido === 'C';
                              const p1 = Number(jogo.pontos_dupla1);
                              const p2 = Number(jogo.pontos_dupla2);
                              const team1Win = isC && p1 > p2;
                              const team1Lose = isC && p1 < p2;
                              const team2Win = isC && p2 > p1;
                              const team2Lose = isC && p2 < p1;

                              return (
                                <View
                                  key={jogo.id}
                                  style={[
                                    styles.gameCard,
                                    shadows.card,
                                    jogo.concluido === 'A' && styles.gameInProgress,
                                  ]}
                                >
                                  {/* Match Header: Reference & Observation */}
                                  <View style={styles.gameCardHeader}>
                                    <Text style={styles.gameReference}>
                                      {jogo.referencia ||
                                        (jogo.playoff_number
                                          ? `Jogo ${jogo.playoff_number}`
                                          : `Jogo ${jogo.id}`)}
                                    </Text>

                                    <View style={styles.gameHeaderRight}>
                                      {jogo.concluido === 'A' && (
                                        <View style={styles.liveBadge}>
                                          <View style={styles.liveDot} />
                                          <Text style={styles.liveText}>AO VIVO</Text>
                                        </View>
                                      )}

                                      {jogo.obs ? (
                                        <TouchableOpacity
                                          onPress={() => handleScoreClick(jogo.obs)}
                                          style={styles.obsButton}
                                          activeOpacity={0.7}
                                        >
                                          <Info size={16} color={colors.info} />
                                        </TouchableOpacity>
                                      ) : null}
                                    </View>
                                  </View>

                                  {/* Team 1 Row */}
                                  <View style={styles.matchRow}>
                                    <View style={styles.teamCol}>
                                      {renderTeamDisplay(
                                        jogo.dupla1,
                                        formatTeamNameHelp(jogo.dupla1, jogo, 0),
                                        team1Win,
                                        team1Lose
                                      )}
                                    </View>

                                    <View style={styles.scoreCol}>
                                      <Text
                                        style={[
                                          styles.scoreText,
                                          team1Win && styles.winnerScore,
                                        ]}
                                      >
                                        {renderPoints(jogo, 'pontos_dupla1')}
                                      </Text>
                                    </View>
                                  </View>

                                  {/* Divider */}
                                  <View style={styles.matchDivider} />

                                  {/* Team 2 Row */}
                                  <View style={styles.matchRow}>
                                    <View style={styles.teamCol}>
                                      {renderTeamDisplay(
                                        jogo.dupla2,
                                        formatTeamNameHelp(jogo.dupla2, jogo, 1),
                                        team2Win,
                                        team2Lose
                                      )}
                                    </View>

                                    <View style={styles.scoreCol}>
                                      <Text
                                        style={[
                                          styles.scoreText,
                                          team2Win && styles.winnerScore,
                                        ]}
                                      >
                                        {renderPoints(jogo, 'pontos_dupla2')}
                                      </Text>
                                    </View>
                                  </View>
                                </View>
                              );
                            })}
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              ))}
          </View>
        )}

        {/* Footer */}
        <Footer />
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.xxl,
    },
    titleSection: {
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
    },
    tournamentTitle: {
      fontFamily: theme.fonts.bold,
      fontSize: 24,
      fontWeight: '800',
      color: colors.textPrimary,
      textAlign: 'center',
      marginBottom: 6,
      letterSpacing: -0.3,
    },
    tournamentPeriod: {
      fontFamily: theme.fonts.medium,
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      fontWeight: '500',
    },
    statsGrid: {
      marginBottom: theme.spacing.xl,
      gap: theme.spacing.md,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    fullWidthCard: {
      paddingVertical: theme.spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    statusValue: {
      fontFamily: theme.fonts.bold,
      fontSize: 22,
      fontWeight: '700',
    },
    statsRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    statCard: {
      flex: 1,
      padding: theme.spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 80,
    },
    statValue: {
      fontFamily: theme.fonts.bold,
      fontSize: 20,
      fontWeight: '700',
      marginBottom: 4,
    },
    statLabel: {
      fontFamily: theme.fonts.medium,
      fontSize: 13,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    filterContainer: {
      marginBottom: theme.spacing.lg,
    },
    filterScroll: {
      gap: theme.spacing.sm,
      paddingHorizontal: 2,
    },
    filterTab: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    filterTabActive: {
      backgroundColor: colors.orange600,
      borderColor: colors.orange600,
    },
    filterTabText: {
      fontFamily: theme.fonts.medium,
      fontSize: 13,
      color: colors.textSecondary,
    },
    filterTabTextActive: {
      fontFamily: theme.fonts.bold,
      color: '#ffffff',
    },
    chavesContainer: {
      gap: theme.spacing.xl,
      marginBottom: theme.spacing.xl,
    },
    chaveSection: {
      gap: theme.spacing.md,
    },
    chaveHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1.5,
      borderBottomColor: colors.border,
    },
    chaveTitle: {
      fontFamily: theme.fonts.bold,
      fontSize: 20,
      fontWeight: '700',
      color: colors.orange600,
      textAlign: 'center',
      letterSpacing: -0.3,
    },
    fasesContainer: {
      gap: theme.spacing.lg,
    },
    faseBlock: {
      gap: theme.spacing.sm,
    },
    faseHeaderBadge: {
      alignSelf: 'center',
      backgroundColor: colors.cardAlt,
      paddingVertical: 4,
      paddingHorizontal: 14,
      borderRadius: theme.radius.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    faseTitle: {
      fontFamily: theme.fonts.bold,
      fontSize: 14,
      fontWeight: '700',
      color: colors.textPrimary,
      textAlign: 'center',
    },
    gamesList: {
      gap: theme.spacing.md,
    },
    gameCard: {
      backgroundColor: colors.card,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: theme.spacing.md,
    },
    gameInProgress: {
      borderWidth: 2,
      borderColor: colors.orange500,
    },
    gameCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    gameReference: {
      fontFamily: theme.fonts.semiBold,
      fontSize: 12,
      fontWeight: '600',
      color: colors.textMuted,
    },
    gameHeaderRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    liveBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primaryLight,
      paddingVertical: 2,
      paddingHorizontal: 6,
      borderRadius: 4,
      gap: 4,
    },
    liveDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.orange600,
    },
    liveText: {
      fontFamily: theme.fonts.bold,
      fontSize: 10,
      color: colors.orange600,
      fontWeight: '700',
    },
    obsButton: {
      padding: 2,
    },
    matchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 4,
    },
    teamCol: {
      flex: 1,
      paddingRight: theme.spacing.md,
    },
    teamName: {
      fontFamily: theme.fonts.regular,
      fontSize: 14,
      color: colors.textPrimary,
      lineHeight: 18,
    },
    placeholderTeam: {
      color: colors.textMuted,
      fontStyle: 'italic',
      fontSize: 13,
    },
    winnerTeam: {
      fontFamily: theme.fonts.bold,
      color: colors.success,
      fontWeight: '700',
    },
    loserTeam: {
      color: colors.error,
    },
    scoreCol: {
      minWidth: 32,
      alignItems: 'flex-end',
      justifyContent: 'center',
    },
    scoreText: {
      fontFamily: theme.fonts.bold,
      fontSize: 16,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    winnerScore: {
      color: colors.success,
    },
    matchDivider: {
      height: 1,
      backgroundColor: colors.borderLight,
      marginVertical: 4,
    },
    emptyContainer: {
      padding: theme.spacing.xxl,
      alignItems: 'center',
    },
    emptyText: {
      fontFamily: theme.fonts.regular,
      fontSize: 15,
      color: colors.textMuted,
      textAlign: 'center',
    },
  });
