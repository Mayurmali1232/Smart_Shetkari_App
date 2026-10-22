import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONTS } from '../constants/theme';
import { useTranslation } from 'react-i18next';

export default function LoadingIndicator({ message }) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.text}>{message || t('common.loading')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl
  },
  text: {
    marginTop: SPACING.md,
    fontSize: FONTS.medium,
    color: COLORS.textSecondary,
    fontWeight: '500'
  }
});
