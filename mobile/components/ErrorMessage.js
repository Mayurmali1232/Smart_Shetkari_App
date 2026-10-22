import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, RADIUS, FONTS } from '../constants/theme';
import { useTranslation } from 'react-i18next';

export default function ErrorMessage({ message, onRetry }) {
  const { t } = useTranslation();

  if (!message) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⚠️</Text>
      <View style={styles.textContainer}>
        <Text style={styles.errorText}>{message}</Text>
        {onRetry && (
          <TouchableOpacity onPress={onRetry} style={styles.retryButton}>
            <Text style={styles.retryText}>{t('common.refresh')}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.dangerLight,
    borderWidth: 1,
    borderColor: '#fca5a5',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center'
  },
  icon: {
    fontSize: 22,
    marginRight: SPACING.sm
  },
  textContainer: {
    flex: 1
  },
  errorText: {
    color: COLORS.danger,
    fontSize: FONTS.regular,
    fontWeight: '500'
  },
  retryButton: {
    marginTop: SPACING.xs
  },
  retryText: {
    color: COLORS.primaryDark,
    fontSize: FONTS.small,
    fontWeight: '700',
    textDecorationLine: 'underline'
  }
});
