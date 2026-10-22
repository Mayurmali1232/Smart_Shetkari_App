import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONTS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from 'react-i18next';
import AppHeader from '../components/AppHeader';
import AppButton from '../components/AppButton';
import ConfirmDialog from '../components/ConfirmDialog';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { currentLanguage, changeLanguage, supportedLanguages } = useLanguage();
  const { t } = useTranslation();

  const [confirmLogoutVisible, setConfirmLogoutVisible] = useState(false);

  const handleLogout = async () => {
    setConfirmLogoutVisible(false);
    await logout();
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title={t('settings.title')}
        subtitle="Manage account & preferences"
        showBack={true}
        showLanguage={false}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Farmer Profile Card */}
        {user ? (
          <View style={styles.card}>
            <View style={styles.profileHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : '👨‍🌾'}
                </Text>
              </View>
              <View style={{ flex: 1, marginLeft: SPACING.md }}>
                <Text style={styles.userName}>{user.fullName}</Text>
                <Text style={styles.userPhone}>📱 +91 {user.mobileNumber}</Text>
                {user.email ? <Text style={styles.userEmail}>✉️ {user.email}</Text> : null}
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.locationGrid}>
              <View style={styles.locationItem}>
                <Text style={styles.locationLabel}>{t('auth.village')}</Text>
                <Text style={styles.locationVal}>{user.village || '—'}</Text>
              </View>
              <View style={styles.locationItem}>
                <Text style={styles.locationLabel}>{t('auth.district')}</Text>
                <Text style={styles.locationVal}>{user.district || '—'}</Text>
              </View>
              <View style={styles.locationItem}>
                <Text style={styles.locationLabel}>{t('auth.state')}</Text>
                <Text style={styles.locationVal}>{user.state || 'Maharashtra'}</Text>
              </View>
            </View>
          </View>
        ) : null}

        {/* Multilingual Support Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🌐 {t('settings.changeLanguage')}</Text>
          <Text style={styles.cardSubtitle}>
            Select your preferred language. The entire application interface will switch immediately.
          </Text>

          <View style={styles.langGrid}>
            {supportedLanguages.map((lang) => {
              const isActive = currentLanguage === lang.code;
              return (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.langCard,
                    isActive && styles.langCardActive
                  ]}
                  onPress={() => changeLanguage(lang.code)}
                  activeOpacity={0.7}
                >
                  <View style={styles.langRow}>
                    <Text style={[styles.langNative, isActive && styles.langNativeActive]}>
                      {lang.nativeName}
                    </Text>
                    {isActive && (
                      <View style={styles.activeCheck}>
                        <Text style={{ color: '#ffffff', fontSize: 10, fontWeight: 'bold' }}>✓</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.langEnglish, isActive && styles.langEnglishActive]}>
                    {lang.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* App Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>ℹ️ {t('settings.appVersion')}</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Application</Text>
            <Text style={styles.infoValue}>Smart Shetkari 🌱</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Version</Text>
            <Text style={styles.infoValue}>v1.0.0 (Release)</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Currency</Text>
            <Text style={styles.infoValue}>₹ INR (Indian Rupee)</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Supported Languages</Text>
            <Text style={styles.infoValue}>8 Indian Languages</Text>
          </View>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutWrapper}>
          <AppButton
            title={`🚪 ${t('auth.logout')}`}
            variant="outline"
            onPress={() => setConfirmLogoutVisible(true)}
            style={{ borderColor: COLORS.danger }}
          />
        </View>
      </ScrollView>

      {/* Logout Confirmation */}
      <ConfirmDialog
        visible={confirmLogoutVisible}
        title={t('auth.logout')}
        message={t('settings.logoutConfirm')}
        confirmLabel={t('auth.logout')}
        cancelLabel={t('common.cancel')}
        isDanger={true}
        onConfirm={handleLogout}
        onCancel={() => setConfirmLogoutVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 1,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#86efac'
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primaryDark
  },
  userName: {
    fontSize: FONTS.large,
    fontWeight: '700',
    color: COLORS.primaryDark
  },
  userPhone: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    marginTop: 2
  },
  userEmail: {
    fontSize: 12,
    color: COLORS.textSecondary
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md
  },
  locationGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  locationItem: {
    flex: 1,
    alignItems: 'center'
  },
  locationLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 2
  },
  locationVal: {
    fontSize: FONTS.small + 1,
    fontWeight: '600',
    color: COLORS.textPrimary
  },
  cardTitle: {
    fontSize: FONTS.medium + 1,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginBottom: 4
  },
  cardSubtitle: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md
  },
  langGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs
  },
  langCard: {
    width: '48.5%',
    padding: SPACING.sm + 2,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border
  },
  langCardActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary
  },
  langRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  langNative: {
    fontSize: FONTS.medium,
    fontWeight: '700',
    color: COLORS.textPrimary
  },
  langNativeActive: {
    color: COLORS.primaryDark
  },
  langEnglish: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2
  },
  langEnglishActive: {
    color: COLORS.primaryDark
  },
  activeCheck: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs + 2,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f1f5f9'
  },
  infoKey: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary
  },
  infoValue: {
    fontSize: FONTS.small,
    fontWeight: '600',
    color: COLORS.textPrimary
  },
  logoutWrapper: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.xl
  }
});
