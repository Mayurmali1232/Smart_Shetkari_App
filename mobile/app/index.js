import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONTS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import AppButton from '../components/AppButton';
import LanguageSelector from '../components/LanguageSelector';
import LoadingIndicator from '../components/LoadingIndicator';

const { width } = Dimensions.get('window');

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
        {/* Farm Hero Illustration Header */}
        <View style={styles.heroBannerContainer}>
          <Image
            source={require('../assets/farm_header_illustration.png')}
            style={styles.heroBannerImage}
            resizeMode="cover"
          />
          <View style={styles.heroBannerOverlay} />
        </View>

        {/* Brand Card overlapping illustration */}
        <View style={styles.brandCard}>
          <View style={styles.logoBadge}>
            <Image
              source={require('../assets/smart_shetkari_logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.brandTitle}>Smart Shetkari</Text>
          <Text style={styles.brandTagline}>शेतकऱ्यांचा स्मार्ट साथी</Text>
          <Text style={styles.brandSubtitle}>Your Farm • Our Support • Better Tomorrow</Text>
        </View>

        {/* Quick Highlights Grid */}
        <View style={styles.highlightsGrid}>
          <View style={styles.highlightItem}>
            <Text style={styles.highlightIcon}>👥</Text>
            <Text style={styles.highlightText}>कर्मचारी व हजेरी</Text>
          </View>
          <View style={styles.highlightItem}>
            <Text style={styles.highlightIcon}>🐄</Text>
            <Text style={styles.highlightText}>दुग्ध व पशुपालन</Text>
          </View>
          <View style={styles.highlightItem}>
            <Text style={styles.highlightIcon}>🚜</Text>
            <Text style={styles.highlightText}>ट्रॅक्टर व कामे</Text>
          </View>
          <View style={styles.highlightItem}>
            <Text style={styles.highlightIcon}>💰</Text>
            <Text style={styles.highlightText}>खर्च व नफा-तोटा</Text>
          </View>
        </View>

        {/* Language Selection */}
        <View style={styles.langSection}>
          <Text style={styles.langSectionTitle}>भाषा निवडा / Choose Language</Text>
          <LanguageSelector isInline />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <AppButton
            title="लॉग इन / Log In"
            onPress={() => router.push('/login')}
            style={styles.loginBtn}
          />
          <AppButton
            title="नवीन खाते तयार करा / Register"
            variant="secondary"
            onPress={() => router.push('/register')}
            style={styles.registerBtn}
          />
        </View>

        {/* Footer Quote */}
        <View style={styles.footerQuoteBox}>
          <Text style={styles.footerQuoteText}>
            🌾 शेतकऱ्यांच्या प्रगतीसाठी - स्मार्ट शेती, स्मार्ट भविष्य! 🚜
          </Text>
          <Text style={styles.footerSubText}>
            Empowering Farmers for a Better Tomorrow
          </Text>
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
    paddingBottom: SPACING.xxl
  },
  heroBannerContainer: {
    width: '100%',
    height: 220,
    position: 'relative',
    backgroundColor: COLORS.primaryLight
  },
  heroBannerImage: {
    width: '100%',
    height: '100%'
  },
  heroBannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(27, 94, 32, 0.15)'
  },
  brandCard: {
    marginTop: -50,
    marginHorizontal: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#C8E6C9'
  },
  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: COLORS.primary
  },
  logoImage: {
    width: 68,
    height: 68,
    borderRadius: 34
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.primaryDark,
    textAlign: 'center'
  },
  brandTagline: {
    fontSize: FONTS.medium,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 2
  },
  brandSubtitle: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center'
  },
  highlightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg
  },
  highlightItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.sm + 2,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1
  },
  highlightIcon: {
    fontSize: 24,
    marginBottom: 4
  },
  highlightText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center'
  },
  langSection: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg
  },
  langSectionTitle: {
    fontSize: FONTS.regular,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs
  },
  actionsContainer: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    gap: SPACING.sm
  },
  loginBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    paddingVertical: 14
  },
  registerBtn: {
    borderRadius: RADIUS.full,
    paddingVertical: 14,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1.5,
    borderColor: COLORS.primary
  },
  footerQuoteBox: {
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center'
  },
  footerQuoteText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primaryDark,
    textAlign: 'center'
  },
  footerSubText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center'
  }
});
