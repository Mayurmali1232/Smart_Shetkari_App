import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, SPACING, RADIUS, FONTS } from '../constants/theme';

export default function AppButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon
}) {
  const getBackgroundColor = () => {
    if (disabled) return '#cbd5e1';
    switch (variant) {
      case 'primary':
        return COLORS.primary;
      case 'secondary':
        return COLORS.surface;
      case 'danger':
        return COLORS.danger;
      case 'accent':
        return COLORS.accent;
      default:
        return COLORS.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return '#64748b';
    switch (variant) {
      case 'secondary':
        return COLORS.primary;
      default:
        return '#ffffff';
    }
  };

  const isOutline = variant === 'secondary';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        isOutline && styles.outlineBorder,
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {icon}
          <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: RADIUS.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3
  },
  outlineBorder: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    elevation: 0,
    shadowOpacity: 0
  },
  text: {
    fontSize: FONTS.medium,
    fontWeight: '600',
    textAlign: 'center'
  }
});
