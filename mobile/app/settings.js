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
import BottomNav from '../components/BottomNav';

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
        title={t('settings.title') || 'सेटिंग्ज'}
        subtitle="खाते व ॲप प्राधान्ये"
        showBack={true}
        showLanguage={false}
        fallbackRoute="/dashboard"
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Panel 13: Farmer Profile Card */}
        {user ? (
          <View style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : '👨‍🌾'}
                </Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.userName}>{user.fullName || 'शेतकरी मित्र'}</Text>
                <Text style={styles.userPhone}>📱 +91 {user.mobileNumber}</Text>
                <Text style={styles.userVillage}>
                  📍 {user.village || 'गाव'}, {user.district || 'जिल्हा'}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.locationGrid}>
              <View style={styles.locationItem}>
                <Text style={styles.locationLabel}>गाव</Text>
                <Text style={styles.locationVal}>{user.village || '—'}</Text>
              </View>
              <View style={styles.locationItem}>
                <Text style={styles.locationLabel}>जिल्हा</Text>
                <Text style={styles.locationVal}>{user.district || '—'}</Text>
              </View>
              <View style={styles.locationItem}>
                <Text style={styles.locationLabel}>राज्य</Text>
                <Text style={styles.locationVal}>{user.state || 'महाराष्ट्र'}</Text>
              </View>
            </View>
          </View>
        ) : null}

        {/* Multilingual Support Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🌐 भाषा निवडा / Change Language</Text>
          <Text style={styles.cardSubtitle}>
            तुमच्या आवडीची भाषा निवडा. संपूर्ण ॲप लगेच निवडलेल्या भाषेत सुरू होईल.
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
          <Text style={styles.cardTitle}>ℹ️ ॲपबद्दल / App Info</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>अनुप्रयोग (App)</Text>
            <Text style={styles.infoValue}>Smart Shetkari 🌱</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>आवृत्ती (Version)</Text>
            <Text style={styles.infoValue}>v2.0.0 (Dairy Enhanced)</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>चलन (Currency)</Text>
            <Text style={styles.infoValue}>₹ INR (भारतीय रुपया)</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>समर्थित भाषा</Text>
            <Text style={styles.infoValue}>मराठी, हिंदी, English सह 8 भाषा</Text>
          </View>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutWrapper}>
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={() => setConfirmLogoutVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.logoutBtnText}>🚪 {t('auth.logout') || 'लॉग आऊट करा'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Logout Confirmation */}
      <ConfirmDialog
        visible={confirmLogoutVisible}
        title={t('auth.logout') || 'लॉग आऊट'}
        message={t('settings.logoutConfirm') || 'तुम्हाला खात्यातून बाहेर पडायचे आहे का?'}
        confirmLabel={t('auth.logout') || 'बाहेर पडा'}
        cancelLabel={t('common.cancel') || 'रद्द करा'}
        isDanger={true}
        onConfirm={handleLogout}
        onCancel={() => setConfirmLogoutVisible(false)}
      />

      {/* Bottom Navigation */}
      <BottomNav active="settings" />
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
    paddingBottom: SPACING.xl
  },
  profileCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#E8F0E9',
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.lightGreen,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#A5D6A7'
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.primaryGreen
  },
  profileInfo: {
    flex: 1,
    marginLeft: SPACING.md
  },
  userName: {
    fontSize: FONTS.large,
    fontWeight: '800',
    color: COLORS.darkText
  },
  userPhone: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    marginTop: 2
  },
  userVillage: {
    fontSize: FONTS.small,
    color: COLORS.primaryGreen,
    fontWeight: '600',
    marginTop: 2
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F4F1',
    marginVertical: SPACING.md
  },
  locationGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  locationItem: {
    alignItems: 'center',
    flex: 1
  },
  locationLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 2
  },
  locationVal: {
    fontSize: FONTS.medium,
    fontWeight: '700',
    color: COLORS.darkText
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#E8F0E9',
    elevation: 1,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3
  },
  cardTitle: {
    fontSize: FONTS.medium + 1,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: 4
  },
  cardSubtitle: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 18
  },
  langGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm
  },
  langCard: {
    width: '48.5%',
    backgroundColor: '#F8FDF6',
    borderWidth: 1,
    borderColor: '#D0E5D5',
    borderRadius: RADIUS.md,
    padding: SPACING.sm + 2
  },
  langCardActive: {
    backgroundColor: COLORS.lightGreen,
    borderColor: COLORS.primaryGreen,
    borderWidth: 2
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
    color: COLORS.darkText,
    fontWeight: '800'
  },
  activeCheck: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.primaryGreen,
    alignItems: 'center',
    justifyContent: 'center'
  },
  langEnglish: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2
  },
  langEnglishActive: {
    color: COLORS.primaryGreen,
    fontWeight: '600'
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F1'
  },
  infoKey: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary
  },
  infoValue: {
    fontSize: FONTS.small,
    fontWeight: '700',
    color: COLORS.darkText
  },
  logoutWrapper: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg
  },
  logoutBtn: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center'
  },
  logoutBtnText: {
    color: COLORS.danger,
    fontSize: FONTS.medium,
    fontWeight: '700'
  }
});