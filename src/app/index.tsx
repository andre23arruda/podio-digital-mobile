import { useFocusEffect, useRouter } from 'expo-router';
import { ArrowRight, Search, Trophy } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Footer } from '../components/Footer';
import { Text, TextInput } from '../components/Text';
import {
  TournamentType,
  TournamentTypeSelect,
} from '../components/TournamentTypeSelect';
import { theme, ThemeColors, useAppTheme, useStyles } from '../constants/theme';

const SUGGESTIONS_BY_TYPE: Record<TournamentType, Array<{ id: string; name: string }>> = {
  torneio: [
    { id: 'EOLUZAX3', name: 'Commodo autem' },
  ],
  'rei-rainha': [
    { id: 'ZQUYJ9WM', name: 'Areal Super 8' },
  ],
  futevolei: [
    { id: 'VENFUAFO', name: 'Torneio FTV PNA' },
  ],
};

export default function HomeScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<any>(null);
  const [tournamentType, setTournamentType] = useState<TournamentType>('torneio');
  const [tournamentId, setTournamentId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const { colors, shadows } = useAppTheme();
  const styles = useStyles(getStyles);

  // When returning to this screen, reset keyboard and scroll position
  useFocusEffect(
    useCallback(() => {
      Keyboard.dismiss();
      inputRef.current?.blur();
      setKeyboardHeight(0);
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }, [])
  );

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      const height = e.endCoordinates?.height || 280;
      setKeyboardHeight(height);
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: 160, animated: true });
      }, 50);
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleInputFocus = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: 160, animated: true });
    }, 50);
  };

  const handleTextChange = (text: string) => {
    const upper = text.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (upper.length <= 8) {
      setTournamentId(upper);
      if (errorMessage) setErrorMessage('');
    }
  };

  const handleNavigate = (id?: string, type?: TournamentType) => {
    // Dismiss keyboard and reset scroll before navigating so HomeScreen is not displaced when returning
    Keyboard.dismiss();
    inputRef.current?.blur();
    setKeyboardHeight(0);
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });

    const targetId = (id || tournamentId).trim();
    const targetType = type || tournamentType;

    if (!targetId) {
      setErrorMessage('Por favor, informe o código do torneio.');
      return;
    }

    if (targetId.length < 8) {
      setErrorMessage('O código do torneio deve ter exatamente 8 caracteres.');
      return;
    }

    switch (targetType) {
      case 'rei-rainha':
        router.push(`/rei-rainha/${targetId}`);
        break;
      case 'futevolei':
        router.push(`/futevolei/${targetId}`);
        break;
      case 'torneio':
      default:
        router.push(`/torneio/${targetId}`);
        break;
    }
  };

  const currentSuggestions = SUGGESTIONS_BY_TYPE[tournamentType] || [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={[
            styles.scrollContent,
            keyboardHeight > 0 ? { paddingBottom: keyboardHeight + 80 } : undefined,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {/* Hero Branding */}
          <View style={styles.heroSection}>
            <View>
              <Trophy size={42} color={colors.orange500} />
            </View>

            <View style={styles.brandRow}>
              <Text style={styles.brandTitle}>
                Pódio<Text style={styles.brandHighlight}> Digital</Text>
              </Text>
            </View>

            <Text style={styles.heroSubtitle}>
              Acompanhe os jogos na palma da sua mão
            </Text>
          </View>

          {/* Search Card */}
          <View style={[styles.card, shadows.card]}>
            <Text style={styles.cardTitle}>Buscar Torneio</Text>
            <Text style={styles.cardDescription}>
              Selecione a modalidade e digite o código para acompanhar os jogos e classificação.
            </Text>

            {/* Select da Modalidade */}
            <TournamentTypeSelect
              value={tournamentType}
              onChange={setTournamentType}
              setTournamentId={setTournamentId}
              label="Modalidade"
            />

            {/* Input do ID */}
            <View style={styles.inputLabelRow}>
              <Text style={styles.inputLabel}>Código do Torneio</Text>
              <Text
                style={[
                  styles.charCounter,
                  tournamentId.length === 8 && styles.charCounterComplete,
                ]}
              >
                {tournamentId.length}/8
              </Text>
            </View>
            <View style={[styles.inputWrapper, errorMessage ? styles.inputError : null]}>
              <Search size={20} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                ref={inputRef}
                style={styles.input}
                placeholder="Ex: ABCD1234"
                placeholderTextColor={colors.textMuted}
                value={tournamentId}
                onChangeText={handleTextChange}
                onFocus={handleInputFocus}
                autoCapitalize="characters"
                autoCorrect={false}
                returnKeyType="go"
                onSubmitEditing={() => handleNavigate()}
              />
            </View>

            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

            <TouchableOpacity
              style={styles.submitButton}
              onPress={() => handleNavigate()}
              activeOpacity={0.85}
            >
              <Text style={styles.submitButtonText}>Ver Torneio</Text>
              <ArrowRight size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* Quick Suggestions */}
          {/* {currentSuggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <View style={styles.suggestionsHeader}>
                <Sparkles size={16} color={colors.orange500} />
                <Text style={styles.suggestionsTitle}>Torneios de exemplo</Text>
              </View>

              <View style={styles.suggestionsList}>
                {currentSuggestions.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.suggestionChip}
                    onPress={() => {
                      setTournamentId(item.id);
                      handleNavigate(item.id, tournamentType);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.chipText}>{item.name}</Text>
                    <Text style={styles.chipId}>{item.id}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )} 

          <View style={styles.spacer} />*/}
          <Footer />
        </ScrollView>
      </KeyboardAvoidingView>
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
      flexGrow: 1,
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.xl,
      paddingBottom: 40,
    },
    spacer: {
      flex: 1,
      minHeight: 24,
    },
    heroSection: {
      alignItems: 'center',
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.xxl,
    },
    brandRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.xs,
    },
    brandTitle: {
      fontFamily: theme.fonts.bold,
      fontSize: 24,
      fontWeight: '800',
      color: colors.textPrimary,
      letterSpacing: -0.5,
    },
    brandHighlight: {
      fontFamily: theme.fonts.bold,
      color: colors.orange600,
    },
    heroSubtitle: {
      fontFamily: theme.fonts.regular,
      fontSize: 15,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
      maxWidth: 290,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.xl,
    },
    cardTitle: {
      fontFamily: theme.fonts.bold,
      fontSize: 18,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 4,
    },
    cardDescription: {
      fontFamily: theme.fonts.regular,
      fontSize: 13,
      color: colors.textSecondary,
      lineHeight: 18,
      marginBottom: theme.spacing.lg,
    },
    inputLabelRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    inputLabel: {
      fontFamily: theme.fonts.bold,
      fontSize: 13,
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    charCounter: {
      fontFamily: theme.fonts.medium,
      fontSize: 12,
      color: colors.textMuted,
    },
    charCounterComplete: {
      fontFamily: theme.fonts.bold,
      color: colors.success,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: theme.radius.md,
      paddingHorizontal: theme.spacing.md,
      height: 52,
      marginBottom: theme.spacing.md,
    },
    inputError: {
      borderColor: colors.error,
    },
    inputIcon: {
      marginRight: theme.spacing.sm,
    },
    input: {
      fontFamily: theme.fonts.medium,
      flex: 1,
      fontSize: 15,
      color: colors.textPrimary,
      height: '100%',
    },
    errorText: {
      fontFamily: theme.fonts.medium,
      fontSize: 13,
      color: colors.error,
      marginBottom: theme.spacing.sm,
      fontWeight: '500',
    },
    submitButton: {
      backgroundColor: colors.orange600,
      borderRadius: theme.radius.md,
      height: 50,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.sm,
      marginTop: 4,
      shadowColor: colors.orange600,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.25,
      shadowRadius: 5,
      elevation: 3,
    },
    submitButtonText: {
      fontFamily: theme.fonts.bold,
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '700',
    },
    suggestionsContainer: {
      marginBottom: theme.spacing.xl,
    },
    suggestionsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: theme.spacing.sm,
    },
    suggestionsTitle: {
      fontFamily: theme.fonts.bold,
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    suggestionsList: {
      gap: theme.spacing.sm,
    },
    suggestionChip: {
      backgroundColor: colors.card,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 12,
      paddingHorizontal: theme.spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    chipText: {
      fontFamily: theme.fonts.semiBold,
      fontSize: 14,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    chipId: {
      fontFamily: theme.fonts.regular,
      fontSize: 12,
      color: colors.textMuted,
    },
  });
