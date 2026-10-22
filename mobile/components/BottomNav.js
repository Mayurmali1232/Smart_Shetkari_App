import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { COLORS, SPACING, RADIUS, FONTS } from '../constants/theme';
import { useTranslation } from 'react-i18next';

export default function BottomNav({ active = 'home' }) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();

  const isHomeActive = active === 'home' || pathname === '/dashboard' || pathname === '/';
  const isRecordsActive = active === 'records' || pathname?.includes('/attendance') || pathname?.includes('/employees') || pathname?.includes('/dairy') || pathname?.includes('/tractors') || pathname?.includes('/bookings') || pathname?.includes('/expenses');
  const isSettingsActive = active === 'settings' || pathname === '/settings';

  const navItems = [
    {
      id: 'home',
      label: t('navigation.home') || 'होम',
      icon: '🏠',
      isActive: isHomeActive,
      onPress: () => router.push('/dashboard')
    },
    {
      id: 'records',
      label: t('navigation.records') || 'नोंदी',
      icon: '📋',
      isActive: isRecordsActive && !isHomeActive,
      onPress: () => router.push('/attendance')
    },
    {
      id: 'settings',
      label: t('navigation.settings') || 'सेटिंग्ज',
      icon: '⚙️',
      isActive: isSettingsActive,
      onPress: () => router.push('/settings')
    }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        {navItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.navItem, item.isActive && styles.navItemActive]}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            {item.isActive && <View style={styles.activeIndicator} />}
            <Text style={[styles.navIcon, item.isActive && styles.navIconActive]}>
              {item.icon}
            </Text>
            <Text style={[styles.navLabel, item.isActive && styles.navLabelActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 8
  },
  navBar: {
    flexDirection: 'row',
    height: Platform.OS === 'ios' ? 68 : 58,
    paddingBottom: Platform.OS === 'ios' ? 14 : 4,
    alignItems: 'center',
    justifyContent: 'space-around'
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: '100%'
  },
  navItemActive: {},
  activeIndicator: {
    position: 'absolute',
    top: 0,
    width: 36,
    height: 3,
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 2,
    opacity: 0.7
  },
  navIconActive: {
    opacity: 1
  },
  navLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary
  },
  navLabelActive: {
    color: COLORS.primary,
    fontWeight: '800'
  }
});
