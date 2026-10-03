import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { Trophy, Crown, Volleyball, ChevronDown, Check, X } from 'lucide-react-native';
import { Text } from './Text';
import { theme, useAppTheme, useStyles, ThemeColors } from '../constants/theme';

export type TournamentType = 'torneio' | 'rei-rainha' | 'futevolei';

export interface TournamentTypeOption {
  value: TournamentType;
  label: string;
  description: string;
}

export const TOURNAMENT_TYPE_OPTIONS: TournamentTypeOption[] = [
  {
    value: 'torneio',
    label: 'Torneio',
    description: 'Chaveamento tradicional com grupos e playoffs',
  },
  {
    value: 'rei-rainha',
    label: 'Rei e Rainha',
    description: 'Duplas rotativas e pontuação individual',
  },
  {
    value: 'futevolei',
    label: 'Futevôlei',
    description: 'Chaves de vencedores e perdedores',
  },
];

interface TournamentTypeSelectProps {
  value: TournamentType;
  onChange: (type: TournamentType) => void;
  setTournamentId: (id: string) => void;
  label?: string;
}

export function TournamentTypeSelect({
  value,
  onChange,
  setTournamentId,
  label = 'Tipo de Torneio',
}: TournamentTypeSelectProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const { colors, isDark } = useAppTheme();
  const styles = useStyles(getStyles);

  const selectedOption =
    TOURNAMENT_TYPE_OPTIONS.find((opt) => opt.value === value) ||
    TOURNAMENT_TYPE_OPTIONS[0];

  const renderIcon = (type: TournamentType, size = 20, color = colors.orange600) => {
    switch (type) {
      case 'rei-rainha':
        return <Crown size={size} color={color} />;
      case 'futevolei':
        return <Volleyball size={size} color={color} />;
      case 'torneio':
      default:
        return <Trophy size={size} color={color} />;
    }
  };

  const handleSelect = (newValue: TournamentType) => {
    onChange(newValue);
    setTournamentId('');
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      {/* Select Trigger Box */}
      <TouchableOpacity
        style={styles.selectTrigger}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
        accessibilityRole="combobox"
        accessibilityLabel={`${label}: ${selectedOption.label}`}
      >
        <View style={styles.leftContent}>
          <View style={styles.iconCircle}>
            {renderIcon(selectedOption.value, 18, colors.orange600)}
          </View>
          <Text style={styles.selectedLabel}>{selectedOption.label}</Text>
        </View>

        <ChevronDown size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      {/* Options Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione a Modalidade</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
                activeOpacity={0.7}
                accessibilityLabel="Fechar seleção"
              >
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.optionsList}>
              {TOURNAMENT_TYPE_OPTIONS.map((option) => {
                const isSelected = option.value === value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionCard,
                      isSelected && styles.optionCardSelected,
                    ]}
                    onPress={() => handleSelect(option.value)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.optionLeft}>
                      <View
                        style={[
                          styles.optionIconContainer,
                          isSelected && styles.optionIconContainerSelected,
                        ]}
                      >
                        {renderIcon(
                          option.value,
                          22,
                          isSelected ? colors.orange600 : colors.textSecondary
                        )}
                      </View>
                      <View style={styles.optionTextContainer}>
                        <Text
                          style={[
                            styles.optionLabel,
                            isSelected && styles.optionLabelSelected,
                          ]}
                        >
                          {option.label}
                        </Text>
                        <Text style={styles.optionDescription}>
                          {option.description}
                        </Text>
                      </View>
                    </View>

                    {isSelected && (
                      <View style={styles.checkCircle}>
                        <Check size={14} color="#ffffff" strokeWidth={3} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const getStyles = (colors: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    container: {
      marginBottom: theme.spacing.lg,
    },
    label: {
      fontFamily: theme.fonts.bold,
      fontSize: 13,
      color: colors.textSecondary,
      marginBottom: 6,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    selectTrigger: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.card,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: theme.radius.md,
      paddingHorizontal: theme.spacing.md,
      height: 52,
    },
    leftContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    iconCircle: {
      width: 32,
      height: 32,
      borderRadius: theme.radius.full,
      backgroundColor: colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    selectedLabel: {
      fontFamily: theme.fonts.bold,
      fontSize: 15,
      color: colors.textPrimary,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: isDark ? 'rgba(0, 0, 0, 0.75)' : 'rgba(15, 23, 42, 0.55)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
    },
    modalContent: {
      width: '100%',
      maxWidth: 400,
      backgroundColor: colors.card,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.lg,
      borderWidth: isDark ? 1 : 0,
      borderColor: colors.border,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: isDark ? 0.4 : 0.2,
      shadowRadius: 20,
      elevation: 10,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
      paddingBottom: theme.spacing.sm,
    },
    modalTitle: {
      fontFamily: theme.fonts.bold,
      fontSize: 18,
      color: colors.textPrimary,
    },
    closeButton: {
      padding: 4,
      borderRadius: theme.radius.full,
    },
    optionsList: {
      gap: theme.spacing.sm,
    },
    optionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: theme.spacing.md,
      borderRadius: theme.radius.md,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    optionCardSelected: {
      borderColor: colors.orange600,
      backgroundColor: colors.primaryLight,
    },
    optionLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      flex: 1,
    },
    optionIconContainer: {
      width: 44,
      height: 44,
      borderRadius: theme.radius.md,
      backgroundColor: colors.cardAlt,
      alignItems: 'center',
      justifyContent: 'center',
    },
    optionIconContainerSelected: {
      backgroundColor: colors.primaryLight,
    },
    optionTextContainer: {
      flex: 1,
    },
    optionLabel: {
      fontFamily: theme.fonts.bold,
      fontSize: 16,
      color: colors.textPrimary,
      marginBottom: 2,
    },
    optionLabelSelected: {
      color: colors.orange600,
    },
    optionDescription: {
      fontFamily: theme.fonts.regular,
      fontSize: 12,
      color: colors.textSecondary,
      lineHeight: 16,
    },
    checkCircle: {
      width: 24,
      height: 24,
      borderRadius: theme.radius.full,
      backgroundColor: colors.orange600,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: theme.spacing.sm,
    },
  });
