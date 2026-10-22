import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONTS, RADIUS } from '../constants/theme';
import { useLanguage } from '../context/LanguageContext';

export default function AppHeader({
  title,
  subtitle,
  showBack = false,
  fallbackRoute = '/dashboard',
  onBack,
  onBackPress,
  showLanguage = true,
  showNotifications = true,
  unreadCount = 0,
  onLanguagePress
}) {
  const router = useRouter();
  const { currentLanguage } = useLanguage();

  const handleBack = () => {
    if (typeof onBack === 'function') {
      onBack();
      return;
    }
    if (typeof onBackPress === 'function') {
      onBackPress();
      return;
    }
    try {
      if (typeof router.canGoBack === 'function' && router.canGoBack()) {
        router.back();
        return;
      }
    } catch (e) {
      // Ignore navigation stack error and fall back safely
    }
    if (fallbackRoute) {
      router.replace(fallbackRoute);
    } else {
      router.replace('/dashboard');
    }
  };

  return (
    <View style={styles.header}>
      <View style={styles.leftContainer}>
        {showBack && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
        )}
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.rightContainer}>
        {showLanguage && (
          <TouchableOpacity
            style={styles.langPill}
            onPress={onLanguagePress || (() => router.push('/settings'))}
            activeOpacity={0.7}
          >
            <Text style={styles.langText}>
              🌐 {currentLanguage.toUpperCase()}
            </Text>
          </TouchableOpacity>
        )}

        {showNotifications && (
          <TouchableOpacity
            style={styles.notifButton}
            onPress={() => router.push('/notifications')}
            activeOpacity={0.7}
          >
            <Text style={styles.bellIcon}>🔔</Text>
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  backButton: {
    paddingRight: SPACING.sm,
    paddingLeft: SPACING.xs
  },
  backArrow: {
    fontSize: 32,
    color: COLORS.primaryDark,
    lineHeight: 32,
    fontWeight: '300'
  },
  titleContainer: {
    flex: 1
  },
  title: {
    fontSize: FONTS.title,
    fontWeight: '700',
    color: COLORS.primaryDark
  },
  subtitle: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    marginTop: 2
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm
  },
  langPill: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.sm + 4,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#bbf7d0'
  },
  langText: {
    fontSize: FONTS.small,
    fontWeight: '700',
    color: COLORS.primaryDark
  },
  notifButton: {
    padding: SPACING.xs + 2,
    position: 'relative'
  },
  bellIcon: {
    fontSize: 20
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.danger,
    borderRadius: RADIUS.full,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.surface
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold'
  }
});
