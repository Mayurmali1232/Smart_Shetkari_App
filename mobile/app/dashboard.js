import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONTS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { reportService } from '../services/reportService';
import { notificationService } from '../services/notificationService';
import AppHeader from '../components/AppHeader';
import StatCard from '../components/StatCard';
import DateSelector from '../components/DateSelector';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorMessage from '../components/ErrorMessage';
import LanguageSelector from '../components/LanguageSelector';

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslation();

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [langModalVisible, setLangModalVisible] = useState(false);

  const fetchDashboardData = useCallback(async (dateToFetch) => {
    try {
      setError('');
      const dateStr = dateToFetch || selectedDate;
      const [statsRes, notifRes] = await Promise.all([
        reportService.getDashboard(dateStr),
        notificationService.list(true).catch(() => ({ data: [] }))
      ]);

      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
      if (notifRes.success && notifRes.data) {
        setUnreadCount(notifRes.data.length);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedDate]);

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData(selectedDate);
    }, [selectedDate, fetchDashboardData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData(selectedDate);
  };

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    setLoading(true);
  };

  const quickActions = [
    { title: t('dairy.title') || 'Dairy & Livestock', icon: '🐄', route: '/dairy', color: '#059669' },
    { title: t('dashboard.addWorker'), icon: '👤➕', route: '/employees/add', color: COLORS.primary },
    { title: t('dashboard.markAttendance'), icon: '📋', route: '/attendance', color: '#0284c7' },
    { title: t('dashboard.payWages'), icon: '💸', route: '/wages', color: '#16a34a' },
    { title: t('dashboard.addTractor'), icon: '🚜➕', route: '/tractors/add', color: '#d97706' },
    { title: t('dashboard.bookTractor'), icon: '📅', route: '/bookings/add', color: '#9333ea' },
    { title: t('dashboard.addExpense'), icon: '⛽', route: '/expenses', color: '#dc2626' },
    { title: t('dashboard.viewReports'), icon: '📊', route: '/reports', color: '#475569' }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title={t('common.appName')}
        subtitle={user ? `🌾 ${user.fullName} (${user.village || 'Farm'})` : undefined}
        showBack={false}
        unreadCount={unreadCount}
        onLanguagePress={() => setLangModalVisible(true)}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Date Selector */}
        <DateSelector
          currentDate={selectedDate}
          onDateChange={handleDateChange}
        />

        {error ? <ErrorMessage message={error} onRetry={() => fetchDashboardData(selectedDate)} /> : null}

        {loading && !refreshing ? (
          <LoadingIndicator message={t('common.loading')} />
        ) : stats ? (
          <>
            {/* Today's Overview Section */}
            <Text style={styles.sectionHeader}>{t('dashboard.todayOverview')}</Text>
            <View style={styles.grid}>
              <StatCard
                title={t('dashboard.activeWorkers')}
                value={stats.totalActiveWorkers}
                icon="👥"
                color="#0f766e"
                bgColor="#ccfbf1"
                style={styles.halfCard}
                onPress={() => router.push('/employees')}
              />
              <StatCard
                title={t('dashboard.presentToday')}
                value={stats.workersPresentToday}
                icon="✅"
                color={COLORS.secondary}
                bgColor={COLORS.primaryLight}
                style={styles.halfCard}
                onPress={() => router.push('/attendance')}
              />
              <StatCard
                title={t('dashboard.absentToday')}
                value={stats.workersAbsentToday}
                icon="❌"
                color={COLORS.danger}
                bgColor={COLORS.dangerLight}
                style={styles.halfCard}
                onPress={() => router.push('/attendance')}
              />
              <StatCard
                title={t('dashboard.todayWages')}
                value={stats.todayWageAmount}
                icon="💵"
                color="#2563eb"
                bgColor="#dbeafe"
                isCurrency
                style={styles.halfCard}
                onPress={() => router.push('/wages')}
              />
            </View>

            {/* Tractors & Financial Balance Overview */}
            <Text style={styles.sectionHeader}>Tractor & Financial Overview</Text>
            <View style={styles.grid}>
              <StatCard
                title={t('dashboard.tractorsCount')}
                value={stats.totalTractors}
                icon="🚜"
                color="#ea580c"
                bgColor="#ffedd5"
                style={styles.halfCard}
                onPress={() => router.push('/tractors')}
              />
              <StatCard
                title={t('dashboard.todayBookings')}
                value={stats.todayTractorBookings}
                icon="📅"
                color="#7c3aed"
                bgColor="#ede9fe"
                style={styles.halfCard}
                onPress={() => router.push('/bookings')}
              />
              <StatCard
                title={t('dashboard.monthlyIncome')}
                value={stats.monthlyIncome}
                icon="📈"
                color="#16a34a"
                bgColor="#dcfce7"
                isCurrency
                style={styles.halfCard}
                onPress={() => router.push('/expenses')}
              />
              <StatCard
                title={t('dashboard.monthlyExpenses')}
                value={stats.monthlyExpenses}
                icon="📉"
                color="#dc2626"
                bgColor="#fee2e2"
                isCurrency
                style={styles.halfCard}
                onPress={() => router.push('/expenses')}
              />
              <StatCard
                title={t('dashboard.outstandingWages')}
                value={stats.outstandingWorkerWages}
                icon="⚠️"
                color="#b45309"
                bgColor="#fef3c7"
                isCurrency
                style={styles.halfCard}
                onPress={() => router.push('/wages')}
              />
              <StatCard
                title={t('dashboard.outstandingReceivables')}
                value={stats.outstandingCustomerPayments}
                icon="⏳"
                color="#0369a1"
                bgColor="#e0f2fe"
                isCurrency
                style={styles.halfCard}
                onPress={() => router.push('/bookings')}
              />
            </View>

            {/* Dairy & Livestock Module Banner */}
            <TouchableOpacity
              style={styles.dairyBannerCard}
              onPress={() => router.push('/dairy')}
              activeOpacity={0.85}
            >
              <View style={styles.dairyBannerLeft}>
                <View style={styles.dairyBannerIconContainer}>
                  <Text style={styles.dairyBannerIcon}>🐄</Text>
                </View>
                <View style={styles.dairyBannerTexts}>
                  <Text style={styles.dairyBannerTitle}>{t('dairy.title') || 'Dairy & Livestock Management'}</Text>
                  <Text style={styles.dairyBannerSubtitle}>
                    {t('dairy.subtitle') || 'Manage animals, milk sales & dairy profit'}
                  </Text>
                </View>
              </View>
              <View style={styles.dairyBannerBadge}>
                <Text style={styles.dairyBannerBadgeText}>Open ➔</Text>
              </View>
            </TouchableOpacity>

            {/* Quick Actions */}
            <Text style={styles.sectionHeader}>{t('dashboard.quickActions')}</Text>
            <View style={styles.actionsGrid}>
              {quickActions.map((action, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.actionPill}
                  onPress={() => router.push(action.route)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.actionIconBox, { backgroundColor: action.color }]}>
                    <Text style={styles.actionIcon}>{action.icon}</Text>
                  </View>
                  <Text style={styles.actionTitle} numberOfLines={2}>
                    {action.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : null}
      </ScrollView>

      <LanguageSelector
        visible={langModalVisible}
        onClose={() => setLangModalVisible(false)}
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
  sectionHeader: {
    fontSize: FONTS.large,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: SPACING.sm
  },
  halfCard: {
    width: '48%',
    marginBottom: SPACING.xs
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    justifyContent: 'space-between',
    marginTop: SPACING.xs
  },
  actionPill: {
    width: '31%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 90,
    justifyContent: 'center',
    elevation: 1,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2
  },
  actionIconBox: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs
  },
  actionIcon: {
    fontSize: 18
  },
  actionTitle: {
    fontSize: FONTS.small,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center'
  },
  dairyBannerCard: {
    marginTop: SPACING.md,
    backgroundColor: '#ecfdf5',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1.5,
    borderColor: '#a7f3d0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2
  },
  dairyBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: SPACING.sm
  },
  dairyBannerIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm
  },
  dairyBannerIcon: {
    fontSize: 24
  },
  dairyBannerTexts: {
    flex: 1
  },
  dairyBannerTitle: {
    fontSize: FONTS.medium,
    fontWeight: '800',
    color: '#065f46'
  },
  dairyBannerSubtitle: {
    fontSize: FONTS.small,
    color: '#047857',
    marginTop: 2
  },
  dairyBannerBadge: {
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full
  },
  dairyBannerBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold'
  }
});
