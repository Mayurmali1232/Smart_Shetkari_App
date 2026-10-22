import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONTS } from '../constants/theme';
import AppButton from './AppButton';

export default function EmptyState({
  title,
  message,
  icon = '🌾',
  actionTitle,
  onAction
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
      {actionTitle && onAction && (
        <AppButton
          title={actionTitle}
          onPress={onAction}
          style={styles.button}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    marginVertical: SPACING.lg
  },
  icon: {
    fontSize: 54,
    marginBottom: SPACING.md
  },
  title: {
    fontSize: FONTS.large,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.xs
  },
  message: {
    fontSize: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.md
  },
  button: {
    marginTop: SPACING.sm
  }
});
