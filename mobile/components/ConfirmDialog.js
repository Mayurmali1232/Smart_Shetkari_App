import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, RADIUS, FONTS } from '../constants/theme';
import AppButton from './AppButton';
import { useTranslation } from 'react-i18next';

export default function ConfirmDialog({
  visible,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  isDestructive = false
}) {
  const { t } = useTranslation();

  if (!visible) return null;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.buttonRow}>
            <AppButton
              title={cancelText || t('common.cancel')}
              variant="secondary"
              onPress={onCancel}
              style={[styles.btn, styles.cancelBtn]}
            />
            <AppButton
              title={confirmText || t('common.confirm')}
              variant={isDestructive ? 'danger' : 'primary'}
              onPress={onConfirm}
              style={styles.btn}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg
  },
  dialog: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 380,
    elevation: 8,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10
  },
  title: {
    fontSize: FONTS.large,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm
  },
  message: {
    fontSize: FONTS.regular,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.xl
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.md
  },
  btn: {
    minHeight: 44,
    paddingHorizontal: SPACING.md
  },
  cancelBtn: {
    borderWidth: 1,
    borderColor: COLORS.border
  }
});
