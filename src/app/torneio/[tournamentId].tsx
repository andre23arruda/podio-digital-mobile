import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search } from 'lucide-react-native';
import { Text, TextInput } from '../../components/Text';
import { theme, useAppTheme, useStyles, ThemeColors } from '../../constants/theme';
import { TournamentHeader } from '../../components/TournamentHeader';
import { TournamentStatsGrid } from '../../components/StatCard';
import { RulesAccordion } from '../../components/RulesAccordion';
import { GroupGamesCard } from '../../components/GroupGamesCard';
import { GroupClassificationCard } from '../../components/GroupClassificationCard';
import { PlayoffsCard } from '../../components/PlayoffsCard';
import { LoadingView } from '../../components/LoadingView';
import { Footer } from '../../components/Footer';
import { cleanTeam, formatPeriod } from '../../utils/tournament';

export default function TournamentScreen() {
  const { tournamentId, type = 'torneio' } = useLocalSearchParams<{
    tournamentId: string;
    type?: string;
  }>();
  const router = useRouter();
  const { colors, shadows } = useAppTheme();
  const styles = useStyles(getStyles);

  const [tournamentData, setTournamentData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');

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
      const endpoint =
        type === 'rei-rainha'
          ? 'rei-rainha'
          : type === 'futevolei'
          ? 'futevolei'
          : 'torneio';

      const resp = await fetch(`${API_ROUTE}/${endpoint}/${tournamentId}/json`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!resp.ok) {
        throw new Error(`Failed to load: ${resp.status}`);
      }

      const json = await resp.json();
      setTournamentData(json);
    } catch (e) {
      console.error('Error fetching tournament data:', e);
      setError(true);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [tournamentId, type]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (isLoading) {
    return <LoadingView message="Carregando dados do torneio..." />;
  }

  if (error || !tournamentData || !tournamentData.torneio) {
    return (
      <LoadingView
        isError
        message="Não foi possível carregar os dados deste torneio."
        onRetry={() => loadData()}
        onBack={() => router.replace('/')}
      />
    );
  }

  const {
    torneio,
    grupos = {},
    fases_finais = null,
    groups_finished = false,
  } = tournamentData;

  const gruposList = Object.entries(grupos) as [string, any][];
  const hasMultipleGroups = gruposList.length > 1;
  const hasPlayoffs =
    fases_finais &&
    Object.values(fases_finais).some(
      (arr) => Array.isArray(arr) && arr.length > 0
    );

  const filterGames = (games: any[]) => {
    if (!search.trim()) return games;
    const term = search.toLowerCase().trim();
    return games.filter((jogo: any) => {
      const d1 = cleanTeam(jogo.dupla1).toLowerCase();
      const d2 = cleanTeam(jogo.dupla2).toLowerCase();
      return d1.includes(term) || d2.includes(term);
    });
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
        {/* Tournament Title & Period */}
        <View style={styles.titleSection}>
          <Text style={styles.tournamentTitle}>{torneio.nome}</Text>
          <Text style={styles.tournamentPeriod}>{formatPeriod(torneio)}</Text>
        </View>

        {/* 4 Stats Cards */}
        <TournamentStatsGrid torneio={torneio} gruposCount={gruposList.length} />

        {/* Rules Accordion */}
        <RulesAccordion regras={torneio.regras} hasPlayoffs={hasPlayoffs} />

        {/* Groups and Classification Section */}
        <View style={styles.groupsSection}>
          {hasPlayoffs && (
            <Text style={styles.sectionHeaderTitle}>Grupos e Classificação</Text>
          )}

          {/* Search Box (especially when 1 group or searching player) */}
          {!hasMultipleGroups && (
            <View style={[styles.searchBox, shadows.subtle]}>
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
          )}

          {/* Render Each Group */}
          {gruposList.map(([grupoNome, grupoData]) => {
            const displayJogos = filterGames(grupoData.jogos || []);

            return (
              <View key={grupoNome} style={styles.groupContainer}>
                {/* Games Card */}
                <GroupGamesCard
                  grupoNome={grupoNome}
                  jogos={displayJogos}
                  torneio={torneio}
                  showGroupName={hasMultipleGroups}
                />

                {/* Classification Card */}
                <GroupClassificationCard
                  grupoNome={grupoNome}
                  classificacao={grupoData.classificacao || []}
                  torneio={torneio}
                  groupsFinished={groups_finished}
                  showGroupName={hasMultipleGroups}
                />
              </View>
            );
          })}
        </View>

        {/* Playoffs Section */}
        {hasPlayoffs && (
          <PlayoffsCard fasesFinais={fases_finais} torneio={torneio} />
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
    sectionHeaderTitle: {
      fontFamily: theme.fonts.bold,
      fontSize: 20,
      fontWeight: '700',
      color: colors.textPrimary,
      textAlign: 'center',
      marginBottom: theme.spacing.lg,
    },
    groupsSection: {
      marginBottom: theme.spacing.md,
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
      marginBottom: theme.spacing.lg,
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
    groupContainer: {
      marginBottom: theme.spacing.md,
    },
  });
