import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONTS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import AppButton from '../components/AppButton';
import LanguageSelector from '../components/LanguageSelector';
import LoadingIndicator from '../components/LoadingIndicator';

export default function WelcomeScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return <LoadingIndicator message={t('common.loading')} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Branding Header */}
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoEmoji}>🌱</Text>
          </View>
          <Text style={styles.brandTitle}>{t('common.appName')}</Text>
          <Text style={styles.brandTagline}>{t('common.tagline')}</Text>
        </View>

        {/* Feature Highlights */}
        <View style={styles.featuresCard}>
          <View style={styles.featureRow}>
            <Text style={styles.featureIcon}>👥</Text>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>{t('employees.title')}</Text>
              <Text style={styles.featureDesc}>{t('employees.wageIntegrityNote')}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.featureRow}>
            <Text style={styles.featureIcon}>🚜</Text>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>{t('tractors.title')}</Text>
              <Text style={styles.featureDesc}>{t('bookings.title')}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.featureRow}>
            <Text style={styles.featureIcon}>💰</Text>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>{t('wages.title')}</Text>
              <Text style={styles.featureDesc}>{t('wages.manualOverrideHint')}</Text>
            </View>
          </View>
        </View>

        {/* Language Selection Section */}
        <View style={styles.langSection}>
          <LanguageSelector isInline />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <AppButton
            title={t('auth.loginButton')}
            onPress={() => router.push('/login')}
            style={styles.loginBtn}
          />
          <AppButton
            title={t('auth.registerButton')}
            variant="secondary"
            onPress={() => router.push('/register')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl
  },
  brandContainer: {
    alignItems: 'center',
    marginVertical: SPACING.lg
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
    borderWidth: 2,
    borderColor: '#86efac'
  },
  logoEmoji: {
    fontSize: 40
  },
  brandTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: COLORS.primaryDark,
    textAlign: 'center'
  },
  brandTagline: {
    fontSize: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs
  },
  featuresCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm
  },
  featureIcon: {
    fontSize: 28,
    marginRight: SPACING.md
  },
  featureTextContainer: {
    flex: 1
  },
  featureTitle: {
    fontSize: FONTS.medium,
    fontWeight: '700',
    color: COLORS.textPrimary
  },
  featureDesc: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    marginTop: 2
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.xs
  },
  langSection: {
    marginVertical: SPACING.sm
  },
  actionsContainer: {
    marginTop: SPACING.md,
    gap: SPACING.sm
  },
  loginBtn: {
    backgroundColor: COLORS.primary
  }
});
