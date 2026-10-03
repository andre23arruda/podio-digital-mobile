import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { Text } from './Text';
import { theme, useAppTheme, useStyles, ThemeColors } from '../constants/theme';

interface RulesAccordionProps {
  regras?: Array<Record<string, string>> | null;
  hasPlayoffs?: boolean;
}

export function RulesAccordion({ regras, hasPlayoffs = false }: RulesAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { colors, shadows } = useAppTheme();
  const styles = useStyles(getStyles);

  return (
    <View style={[styles.container, shadows.card]}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setIsOpen(!isOpen)}
        activeOpacity={0.7}
      >
        <Text style={styles.title}>Regras de classificação</Text>
        {isOpen ? (
          <ChevronUp size={20} color={colors.textSecondary} />
        ) : (
          <ChevronDown size={20} color={colors.textSecondary} />
        )}
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.content}>
          <Text style={styles.description}>
            Classificação no grupo de acordo com número de vitórias{' '}
            <Text style={styles.bold}>(V)</Text>, saldo <Text style={styles.bold}>(S)</Text> e pontos{' '}
            <Text style={styles.bold}>(P)</Text>
          </Text>

          {hasPlayoffs && regras && regras.length > 0 && (
            <View style={styles.rulesList}>
              {regras.map((regraObj, index) => {
                const phase = Object.keys(regraObj)[0];
                const description = regraObj[phase];
                return (
                  <View key={index} style={styles.ruleItem}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.ruleText}>
                      <Text style={styles.bold}>{phase}:</Text> {description}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>
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
    header: {
      padding: theme.spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    title: {
      fontFamily: theme.fonts.bold,
      fontSize: 16,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    content: {
      paddingHorizontal: theme.spacing.md,
      paddingBottom: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.borderLight,
      paddingTop: theme.spacing.sm,
    },
    description: {
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
  });
