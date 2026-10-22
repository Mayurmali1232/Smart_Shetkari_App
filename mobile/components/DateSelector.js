import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS, FONTS } from '../constants/theme';
import { useTranslation } from 'react-i18next';

export default function DateSelector({ currentDate, onDateChange }) {
  const { t } = useTranslation();

  const handlePrevDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 1);
    onDateChange(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 1);
    onDateChange(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    onDateChange(new Date().toISOString().split('T')[0]);
  };

  const isToday = currentDate === new Date().toISOString().split('T')[0];

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.arrowButton}
        onPress={handlePrevDay}
        activeOpacity={0.7}
      >
        <Text style={styles.arrowText}>‹</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.dateDisplay}
        onPress={handleToday}
        activeOpacity={0.7}
      >
        <Text style={styles.calendarIcon}>📅</Text>
        <Text style={styles.dateText}>{currentDate}</Text>
        {isToday && (
          <View style={styles.todayBadge}>
            <Text style={styles.todayText}>Today</Text>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.arrowButton}
        onPress={handleNextDay}
        activeOpacity={0.7}
      >
        <Text style={styles.arrowText}>›</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.xs,
    paddingVertical: SPACING.xs,
    marginVertical: SPACING.sm
  },
  arrowButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center'
  },
  arrowText: {
    fontSize: 26,
    color: COLORS.primaryDark,
    lineHeight: 28,
    fontWeight: 'bold'
  },
  dateDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md
  },
  calendarIcon: {
    fontSize: 18,
    marginRight: SPACING.xs
  },
  dateText: {
    fontSize: FONTS.medium,
    fontWeight: '700',
    color: COLORS.textPrimary
  },
  todayBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.xs + 4,
    paddingVertical: 2,
    marginLeft: SPACING.sm
  },
  todayText: {
    color: '#ffffff',
    fontSize: FONTS.small,
    fontWeight: '600'
  }
});
