import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, RADIUS, FONTS } from '../constants/theme';

export default function StatCard({
  title,
  value,
  icon,
  color = COLORS.primary,
  bgColor,
  isCurrency = false,
  onPress,
  style
}) {
  const CardContainer = onPress ? TouchableOpacity : View;

  return (
    <CardContainer
      style={[
        styles.card,
        { borderLeftColor: color },
        style
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.topRow}>
        <View style={[styles.iconBox, { backgroundColor: bgColor || COLORS.primaryLight }]}>
          <Text style={styles.icon}>{icon}</Text>
        </View>
        <Text style={[styles.title, { color: COLORS.textSecondary }]} numberOfLines={1}>
          {title}
        </Text>
      </View>
      <View style={styles.bottomRow}>
        <Text style={[styles.value, { color }]}>
          {isCurrency ? `₹${Number(value || 0).toLocaleString('en-IN')}` : value}
        </Text>
      </View>
    </CardContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm
  },
  icon: {
    fontSize: 16
  },
  title: {
    fontSize: FONTS.small,
    fontWeight: '600',
    flex: 1
  },
  bottomRow: {
    marginTop: 2
  },
  value: {
    fontSize: FONTS.header,
    fontWeight: '800'
  }
});
