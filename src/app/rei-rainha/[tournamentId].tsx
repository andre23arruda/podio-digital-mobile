import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, ChevronDown, ChevronUp } from 'lucide-react-native';
import { Text, TextInput } from '../../components/Text';
import { theme, useAppTheme, useStyles, ThemeColors } from '../../constants/theme';
import { TournamentHeader } from '../../components/TournamentHeader';
import { StatusIcon } from '../../components/StatusIcon';
import { LoadingView } from '../../components/LoadingView';
import { Footer } from '../../components/Footer';
import { formatDate, getWinnerColor } from '../../utils/tournament';

export default function LeagueScreen() {
  const { tournamentId } = useLocalSearchParams<{ tournamentId: string }>();
  const router = useRouter();
  const { colors, shadows } = useAppTheme();
  const styles = useStyles(getStyles);

  const [tournamentData, setTournamentData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [isRulesOpen, setIsRulesOpen] = useState(false);

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
      const resp = await fetch(`${API_ROUTE}/rei-rainha/${tournamentId}/json`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!resp.ok) {
        console.error('Erro ao buscar dados do Rei e Rainha:', resp.statusText);
        setError(true);
        return;
      }

      const data = await resp.json();
      setTournamentData(data);
    } catch (err) {
      console.error('Erro na requisição do Rei e Rainha:', err);
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
    return <LoadingView message="Carregando Rei e Rainha..." />;
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

  const { torneio, jogos = [], ranking = [], estatisticas = {} } = tournamentData;

  const cleanTeam = (dupla?: string | null) => {
    if (!dupla) return '';
    return dupla
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<[^>]+>/g, '')
      .trim();
  };

  const formatTeamDisplay = (duplaStr?: string | null) => {
    if (!duplaStr) return '';
    const cleanStr = duplaStr.replace(/<\/?span>/g, '');
    const names = cleanStr.split(/<br\s*\/?>/gi);
    return names.map((name, idx) => `${name.trim()}${idx === 0 && names.length > 1 ? ' &' : ''}`).join('\n');
  };

  const filteredJogos = jogos.filter((jogo: any) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    const d1 = cleanTeam(jogo.dupla1).toLowerCase();
    const d2 = cleanTeam(jogo.dupla2).toLowerCase();
    return d1.includes(term) || d2.includes(term);
  });

  const isFinished = !torneio.ativo;
  const statusText = torneio.ativo
    ? torneio.nao_iniciado
      ? 'Não iniciado'
      : 'Em andamento'
    : 'Finalizado';
  const statusColor = isFinished ? colors.success : colors.orange500;

  const handleScoreClick = (obs?: string | null) => {
    if (obs) {
      Alert.alert('Observação', obs);
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

        {/* 4 Stats Cards */}
        <View style={styles.statsGrid}>
          {/* Status Full Width */}
          <View style={[styles.card, styles.fullWidthCard, shadows.card]}>
            <Text style={[styles.statusValue, { color: statusColor }]}>{statusText}</Text>
          </View>

          {/* 3 Metrics */}
          <View style={styles.statsRow}>
            <View style={[styles.card, styles.statCard, shadows.card]}>
              <Text style={[styles.statValue, { color: colors.info }]}>
                {ranking.length}
              </Text>
              <Text style={styles.statLabel}>Jogadores</Text>
            </View>

            <View style={[styles.card, styles.statCard, shadows.card]}>
              <Text style={[styles.statValue, { color: colors.success }]}>
                {estatisticas.total_jogos ?? 0}
              </Text>
              <Text style={styles.statLabel}>Jogos</Text>
            </View>

            <View style={[styles.card, styles.statCard, shadows.card]}>
              <Text style={[styles.statValue, { color: colors.orange500 }]}>
                {estatisticas.jogos_restantes ?? 0}
              </Text>
              <Text style={styles.statLabel}>Pendente</Text>
            </View>
          </View>
        </View>

        {/* Rules Accordion */}
        {torneio.regras && (
          <View style={[styles.card, styles.rulesCard, shadows.card]}>
            <TouchableOpacity
              style={styles.rulesHeader}
              onPress={() => setIsRulesOpen(!isRulesOpen)}
              activeOpacity={0.7}
            >
              <Text style={styles.rulesTitle}>Regras de classificação</Text>
              {isRulesOpen ? (
                <ChevronUp size={20} color={colors.textSecondary} />
              ) : (
                <ChevronDown size={20} color={colors.textSecondary} />
              )}
            </TouchableOpacity>

            {isRulesOpen && (
              <View style={styles.rulesContent}>
                <Text style={styles.rulesDescription}>
                  Classificação de acordo com número de vitórias{' '}
                  <Text style={styles.bold}>(V)</Text>, saldo <Text style={styles.bold}>(S)</Text> e pontos{' '}
                  <Text style={styles.bold}>(P)</Text>
                </Text>

                {Array.isArray(torneio.regras) && (
                  <View style={styles.rulesList}>
                    {torneio.regras.map((regra: any, idx: number) => {
                      const text = typeof regra === 'string' ? regra : JSON.stringify(regra);
                      return (
                        <View key={idx} style={styles.ruleItem}>
                          <Text style={styles.bullet}>•</Text>
                          <Text style={styles.ruleText}>{text}</Text>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {/* Games Card */}
        <View style={[styles.card, styles.tableCard, shadows.card]}>
          <View style={styles.tableCardHeader}>
            <Text style={styles.tableHeaderTitle}>Jogos</Text>
          </View>

          <View style={styles.tableBody}>
            {/* Search Box */}
            <View style={styles.searchBox}>
              <Search size={18} color={colors.textMuted} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar jogador..."
                placeholderTextColor={colors.textMuted}
                value={search}
                onChangeText={setSearch}
                autoCorrect={false}
                clearButtonMode="while-editing"
              />
            </View>

            {/* Table Header Row */}
            <View style={styles.gamesHeaderRow}>
              <Text style={[styles.th, styles.thQuadra]}>Q.</Text>
              <Text style={[styles.th, styles.thTeam1]}>Dupla 1</Text>
              <Text style={[styles.th, styles.thScore]}>Placar</Text>
              <Text style={[styles.th, styles.thTeam2]}>Dupla 2</Text>
              <View style={styles.thStatus} />
            </View>

            {/* Games List */}
            {filteredJogos.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Nenhum jogo encontrado</Text>
              </View>
            ) : (
              filteredJogos.map((jogo: any, index: number) => {
                const isGameFinished = jogo.concluido === 'C';
                const p1 = Number(jogo.placar_dupla1 ?? 0);
                const p2 = Number(jogo.placar_dupla2 ?? 0);
                const p1Win = isGameFinished && p1 > p2;
                const p2Win = isGameFinished && p2 > p1;

                const team1Text = formatTeamDisplay(jogo.dupla1);
                const team2Text = formatTeamDisplay(jogo.dupla2);

                const isAlt = index % 2 === 1;

                return (
                  <View
                    key={jogo.id || index}
                    style={[
                      styles.gameRow,
                      isAlt && styles.altRow,
                      index === filteredJogos.length - 1 && styles.lastRow,
                    ]}
                  >
                    {/* Quadra */}
                    <View style={styles.quadraCol}>
                      <Text style={styles.quadraText}>{jogo.quadra ?? '-'}</Text>
                    </View>

                    {/* Dupla 1 */}
                    <View style={styles.team1Col}>
                      <Text
                        style={[
                          styles.teamText,
                          { color: getWinnerColor(p1Win, isGameFinished && !p1Win, colors) },
                          p1Win && styles.winnerText,
                        ]}
                      >
                        {team1Text}
                      </Text>
                    </View>

                    {/* Placar */}
                    <TouchableOpacity
                      style={styles.scoreCol}
                      onPress={() => handleScoreClick(jogo.obs)}
                      disabled={!jogo.obs}
                      activeOpacity={0.7}
                    >
                      <View style={styles.scoreBox}>
                        <Text style={styles.scoreText}>
                          {jogo.placar_dupla1 ?? '-'}
                          <Text style={styles.scoreDivider}> ✕ </Text>
                          {jogo.placar_dupla2 ?? '-'}
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {/* Dupla 2 */}
                    <View style={styles.team2Col}>
                      <Text
                        style={[
                          styles.teamText,
                          { color: getWinnerColor(p2Win, isGameFinished && !p2Win, colors) },
                          p2Win && styles.winnerText,
                        ]}
                      >
                        {team2Text}
                      </Text>
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
        </View>

        {/* Classification Card */}
        <View style={[styles.card, styles.tableCard, shadows.card]}>
          <View style={styles.tableCardHeader}>
            <Text style={styles.tableHeaderTitle}>Classificação</Text>
          </View>

          <View style={styles.tableBody}>
            {/* Table Header Row */}
            <View style={styles.classifHeaderRow}>
              <Text style={[styles.th, styles.thPos]}>#</Text>
              <Text style={[styles.th, styles.thPlayer]}>Jogador</Text>
              <Text style={[styles.th, styles.thStat]}>V</Text>
              <Text style={[styles.th, styles.thStat]}>S</Text>
              <Text style={[styles.th, styles.thStat]}>P</Text>
              <Text style={[styles.th, styles.thStat]}>J</Text>
            </View>

            {/* Ranking Rows */}
            {ranking.map((jogador: any, index: number) => {
              const isAlt = index % 2 === 1;
              const medal =
                isFinished
                  ? jogador.posicao === 1
                    ? ' 🥇'
                    : jogador.posicao === 2
                    ? ' 🥈'
                    : jogador.posicao === 3
                    ? ' 🥉'
                    : ''
                  : '';

              return (
                <View
                  key={index}
                  style={[
                    styles.classifRow,
                    isAlt && styles.altRow,
                    index === ranking.length - 1 && styles.lastRow,
                  ]}
                >
                  <View style={styles.posCol}>
                    <Text style={styles.posText}>
                      {jogador.posicao}
                      {medal}
                    </Text>
                  </View>

                  <View style={styles.playerCol}>
                    <Text style={styles.playerText}>{jogador.jogador}</Text>
                  </View>

                  <Text style={styles.statCol}>{jogador.vitorias}</Text>
                  <Text style={styles.statCol}>{jogador.saldo}</Text>
                  <Text style={styles.statCol}>{jogador.pontos}</Text>
                  <Text style={styles.statCol}>{jogador.jogos}</Text>
                </View>
              );
            })}
          </View>
        </View>

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
    rulesCard: {
      marginBottom: theme.spacing.xl,
      overflow: 'hidden',
    },
    rulesHeader: {
      padding: theme.spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    rulesTitle: {
      fontFamily: theme.fonts.bold,
      fontSize: 16,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    rulesContent: {
      paddingHorizontal: theme.spacing.md,
      paddingBottom: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.borderLight,
      paddingTop: theme.spacing.sm,
    },
    rulesDescription: {
      fontFamily: theme.fonts.regular,
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
      marginBottom: theme.spacing.xs,
    },
    bold: {
      fontFamily: theme.fonts.bold,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    rulesList: {
      marginTop: theme.spacing.xs,
      gap: 4,
    },
    ruleItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 6,
    },
    bullet: {
      fontFamily: theme.fonts.bold,
      fontSize: 14,
      color: colors.textSecondary,
    },
    ruleText: {
      fontFamily: theme.fonts.regular,
      fontSize: 13,
      color: colors.textSecondary,
      flex: 1,
      lineHeight: 18,
    },
    tableCard: {
      marginBottom: theme.spacing.xl,
      overflow: 'hidden',
    },
    tableCardHeader: {
      backgroundColor: colors.tableHeader,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      alignItems: 'center',
    },
    tableHeaderTitle: {
      fontFamily: theme.fonts.bold,
      fontSize: 16,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    tableBody: {
      padding: theme.spacing.md,
    },
    searchBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: theme.radius.md,
      paddingHorizontal: theme.spacing.md,
      height: 46,
      marginBottom: theme.spacing.md,
    },
    searchIcon: {
      marginRight: theme.spacing.sm,
    },
    searchInput: {
      fontFamily: theme.fonts.regular,
      flex: 1,
      fontSize: 14,
      color: colors.textPrimary,
      height: '100%',
    },
    gamesHeaderRow: {
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
    thQuadra: {
      width: 32,
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
      width: 24,
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
    quadraCol: {
      width: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    quadraText: {
      fontFamily: theme.fonts.medium,
      fontSize: 12,
      color: colors.textSecondary,
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
      textAlign: 'center',
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
    statusCol: {
      width: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    classifHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.tableHeader,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    thPos: {
      width: 44,
    },
    thPlayer: {
      flex: 1,
      textAlign: 'left',
      paddingLeft: 8,
    },
    thStat: {
      width: 30,
    },
    classifRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
      backgroundColor: colors.card,
    },
    posCol: {
      width: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    posText: {
      fontFamily: theme.fonts.bold,
      fontSize: 13,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    playerCol: {
      flex: 1,
      paddingLeft: 8,
      justifyContent: 'center',
    },
    playerText: {
      fontFamily: theme.fonts.regular,
      fontSize: 13,
      color: colors.textPrimary,
    },
    statCol: {
      fontFamily: theme.fonts.medium,
      width: 30,
      textAlign: 'center',
      fontSize: 13,
      color: colors.textSecondary,
    },
  });
