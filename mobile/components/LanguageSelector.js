import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { COLORS, SPACING, RADIUS, FONTS } from '../constants/theme';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from 'react-i18next';

export default function LanguageSelector({ visible, onClose, isInline = false }) {
  const { currentLanguage, changeLanguage, supportedLanguages } = useLanguage();
  const { t } = useTranslation();

  const handleSelect = async (code) => {
    await changeLanguage(code);
    if (onClose) onClose();
  };

  const renderLanguageOptions = () => (
    <View style={styles.grid}>
      {supportedLanguages.map((lang) => {
        const isSelected = currentLanguage === lang.code;
        return (
          <TouchableOpacity
            key={lang.code}
            style={[
              styles.langCard,
              isSelected && styles.langCardSelected
            ]}
            onPress={() => handleSelect(lang.code)}
            activeOpacity={0.7}
          >
            <View style={styles.langHeader}>
              <Text style={[styles.nativeText, isSelected && styles.selectedText]}>
                {lang.name}
              </Text>
              {isSelected && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={[styles.englishLabel, isSelected && styles.selectedSubtext]}>
              {lang.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  if (isInline) {
    return (
      <View style={styles.inlineContainer}>
        <Text style={styles.sectionTitle}>{t('auth.chooseLanguage')}</Text>
        {renderLanguageOptions()}
      </View>
    );
  }

  return (
    <Modal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.headerRow}>
            <Text style={styles.modalTitle}>{t('auth.chooseLanguage')}</Text>
            {onClose && (
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {renderLanguageOptions()}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  inlineContainer: {
    marginVertical: SPACING.md
  },
  sectionTitle: {
    fontSize: FONTS.medium,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    padding: SPACING.lg,
    maxHeight: '80%'
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  modalTitle: {
    fontSize: FONTS.large,
    fontWeight: '700',
    color: COLORS.primaryDark
  },
  closeBtn: {
    padding: SPACING.xs
  },
  closeText: {
    fontSize: 20,
    color: COLORS.textSecondary
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    justifyContent: 'space-between'
  },
  langCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.xs
  },
  langCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight
  },
  langHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  nativeText: {
    fontSize: FONTS.large,
    fontWeight: '700',
    color: COLORS.textPrimary
  },
  selectedText: {
    color: COLORS.primaryDark
  },
  checkmark: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: 'bold'
  },
  englishLabel: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    marginTop: 2
  },
  selectedSubtext: {
    color: COLORS.primaryDark,
    fontWeight: '500'
  }
});
