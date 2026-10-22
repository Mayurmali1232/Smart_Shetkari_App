import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, RADIUS, FONTS } from '../constants/theme';

export default function AppInput({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry,
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  editable = true,
  leftIcon,
  rightIcon,
  style,
  containerStyle
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.focusedBorder,
          error ? styles.errorBorder : null,
          !editable && styles.disabledBackground,
          multiline && { minHeight: 80, alignItems: 'flex-start' },
          style
        ]}
      >
        {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={editable}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[
            styles.input,
            multiline && { textAlignVertical: 'top', paddingTop: SPACING.sm }
          ]}
        />

        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.eyeButton}
          >
            <Text style={styles.eyeText}>
              {isPasswordVisible ? '🙈 Hide' : '👁️ Show'}
            </Text>
          </TouchableOpacity>
        )}

        {rightIcon && !secureTextEntry && (
          <View style={styles.iconContainer}>{rightIcon}</View>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
    width: '100%'
  },
  label: {
    fontSize: FONTS.regular,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    minHeight: 48
  },
  focusedBorder: {
    borderColor: COLORS.primary
  },
  errorBorder: {
    borderColor: COLORS.danger
  },
  disabledBackground: {
    backgroundColor: '#f1f5f9'
  },
  input: {
    flex: 1,
    fontSize: FONTS.medium,
    color: COLORS.textPrimary,
    paddingVertical: SPACING.sm
  },
  iconContainer: {
    marginRight: SPACING.sm
  },
  eyeButton: {
    padding: SPACING.xs
  },
  eyeText: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    fontWeight: '500'
  },
  errorText: {
    color: COLORS.danger,
    fontSize: FONTS.small,
    marginTop: SPACING.xs,
    marginLeft: SPACING.xs
  }
});
