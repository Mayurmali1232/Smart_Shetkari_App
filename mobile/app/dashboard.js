import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Image } from 'react-native';
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
import BottomNav from '../components/BottomNav';

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

  // Main Services Grid (Matching Panel 5 in Poster)
  const mainServices = [
    { id: 'employees', title: 'कर्मचारी', sub: 'कामगार व्यवस्थापन', icon: '👥', route: '/employees', color: '#1E88E5', bg: '#E3F2FD' },
    { id: 'attendance', title: 'हजेरी', sub: 'दैनिक हजेरी नोंद', icon: '📅', route: '/attendance', color: '#2E7D32', bg: '#E8F5E9' },
    { id: 'dairy', title: 'दुग्धव्यवसाय', sub: 'दूध व पशुपालन', icon: '🐄', route: '/dairy', color: '#00897B', bg: '#E0F2F1' },
    { id: 'tractors', title: 'ट्रॅक्टर', sub: 'भाडे व कामे', icon: '🚜', route: '/tractors', color: '#EF6C00', bg: '#FFF3E0' },
    { id: 'expenses', title: 'खर्च', sub: 'खते, बियाणे, इंधन', icon: '👛', route: '/expenses', color: '#D81B60', bg: '#FCE4EC' },
    { id: 'bookings', title: 'बुकिंग', sub: 'ट्रॅक्टर बुकिंग', icon: '📝', route: '/bookings', color: '#8E24AA', bg: '#F3E5F5' },
    { id: 'reports', title: 'अहवाल', sub: 'हिशोब व नफा-तोटा', icon: '📊', route: '/reports', color: '#37474F', bg: '#ECEFF1' }
  ];

  const farmerName = user?.fullName || 'शेतकरी मित्र!';
  const farmerDistrict = user?.district || user?.village || 'पुणे जिल्हा';

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title={t('common.appName') || 'Smart Shetkari'}
        subtitle={`शेतकऱ्यांचा स्मार्ट साथी`}
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
        {/* Farmer Greeting Banner Card (Panel 5 in Poster) */}
        <View style={styles.greetingCard}>
          <View style={styles.greetingLeft}>
            <Text style={styles.greetingSub}>नमस्कार,</Text>
            <Text style={styles.greetingTitle}>{farmerName}</Text>
            <Text style={styles.greetingDistrict}>📍 {farmerDistrict}</Text>
          </View>
          <View style={styles.farmerAvatarBadge}>
            <Text style={styles.farmerAvatarEmoji}>👨‍🌾</Text>
          </View>
        </View>

        {/* Weather & Agricultural Conditions Card (Panel 5 in Poster) */}
        <View style={styles.weatherCard}>
          <View style={styles.weatherLeft}>
            <Text style={styles.weatherSunIcon}>☀️</Text>
            <View style={{ marginLeft: SPACING.sm }}>
              <Text style={styles.weatherTemp}>28°C</Text>
              <Text style={styles.weatherLabel}>आजचे हवामान • कडक ऊन</Text>
            </View>
          </View>
          <View style={styles.weatherRight}>
            <Text style={styles.weatherBadgeText}>शेती सल्ला</Text>
            <Text style={styles.weatherHint}>पाण्याची योग्य पाळी द्या</Text>
          </View>
        </View>

        {/* Date Selector */}
        <DateSelector
          currentDate={selectedDate}
          onDateChange={handleDateChange}
        />

        {/* Main Services (मुख्य सुविधा - 2/3 column grid matching Panel 5) */}
        <View style={styles.servicesHeaderRow}>
          <Text style={styles.sectionHeader}>मुख्य सुविधा / Services</Text>
        </View>
        <View style={styles.servicesGrid}>
          {mainServices.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={styles.serviceCard}
              onPress={() => router.push(service.route)}
              activeOpacity={0.7}
            >
              <View style={[styles.serviceIconBox, { backgroundColor: service.bg }]}>
                <Text style={styles.serviceIcon}>{service.icon}</Text>
              </View>
              <Text style={styles.serviceTitle}>{service.title}</Text>
              <Text style={styles.serviceSub} numberOfLines={1}>{service.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {error ? <ErrorMessage message={error} onRetry={() => fetchDashboardData(selectedDate)} /> : null}

        {loading && !refreshing ? (
          <LoadingIndicator message={t('common.loading')} />
        ) : stats ? (
          <>
            {/* Today's Farm Overview Section */}
            <Text style={styles.sectionHeader}>आजची स्थिती / Today's Overview</Text>
            <View style={styles.grid}>
              <StatCard
                title={t('dashboard.activeWorkers') || 'एकूण कामगार'}
                value={stats.totalActiveWorkers}
                icon="👥"
                color="#0f766e"
                bgColor="#ccfbf1"
                style={styles.halfCard}
                onPress={() => router.push('/employees')}
              />
              <StatCard
                title={t('dashboard.presentToday') || 'उपस्थित'}
                value={stats.workersPresentToday}
                icon="✅"
                color={COLORS.secondary}
                bgColor={COLORS.primaryLight}
                style={styles.halfCard}
                onPress={() => router.push('/attendance')}
              />
              <StatCard
                title={t('dashboard.absentToday') || 'अनुपस्थित'}
                value={stats.workersAbsentToday}
                icon="❌"
                color={COLORS.danger}
                bgColor={COLORS.dangerLight}
                style={styles.halfCard}
                onPress={() => router.push('/attendance')}
              />
              <StatCard
                title={t('dashboard.todayWages') || 'आजची मजुरी'}
                value={stats.todayWageAmount}
                icon="💵"
                color="#2563eb"
                bgColor="#dbeafe"
                isCurrency
                style={styles.halfCard}
                onPress={() => router.push('/wages')}
              />
            </View>

            {/* Tractors & Financial Balance */}
            <Text style={styles.sectionHeader}>ट्रॅक्टर व आर्थिक स्थिती / Financial</Text>
            <View style={styles.grid}>
              <StatCard
                title={t('dashboard.tractorsCount') || 'एकूण ट्रॅक्टर्स'}
                value={stats.totalTractors}
                icon="🚜"
                color="#ea580c"
                bgColor="#ffedd5"
                style={styles.halfCard}
                onPress={() => router.push('/tractors')}
              />
              <StatCard
                title={t('dashboard.todayBookings') || 'आजची कामे'}
                value={stats.todayTractorBookings}
                icon="📅"
                color="#7c3aed"
                bgColor="#ede9fe"
                style={styles.halfCard}
                onPress={() => router.push('/bookings')}
              />
              <StatCard
                title={t('dashboard.monthlyIncome') || 'चालू महिना जमा'}
                value={stats.monthlyIncome}
                icon="📈"
                color="#16a34a"
                bgColor="#dcfce7"
                isCurrency
                style={styles.halfCard}
                onPress={() => router.push('/expenses')}
              />
              <StatCard
                title={t('dashboard.monthlyExpenses') || 'चालू महिना खर्च'}
                value={stats.monthlyExpenses}
                icon="📉"
                color="#dc2626"
                bgColor="#fee2e2"
                isCurrency
                style={styles.halfCard}
                onPress={() => router.push('/expenses')}
              />
            </View>
          </>
        ) : null}
      </ScrollView>

      {/* Bottom Unified Navigation Bar */}
      <BottomNav active="home" />

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
    paddingBottom: SPACING.lg
  },
  greetingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: '#C8E6C9',
    marginBottom: SPACING.sm,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2
  },
  greetingLeft: {
    flex: 1
  },
  greetingSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600'
  },
  greetingTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginTop: 2
  },
  greetingDistrict: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '700',
    marginTop: 2
  },
  farmerAvatarBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary
  },
  farmerAvatarEmoji: {
    fontSize: 30
  },
  weatherCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFDE7',
    borderWidth: 1,
    borderColor: '#FFF59D',
    borderRadius: RADIUS.md,
    padding: SPACING.sm + 4,
    marginBottom: SPACING.md
  },
  weatherLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  weatherSunIcon: {
    fontSize: 32
  },
  weatherTemp: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F57F17'
  },
  weatherLabel: {
    fontSize: 11,
    color: '#795548',
    fontWeight: '600'
  },
  weatherRight: {
    alignItems: 'flex-end'
  },
  weatherBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#E65100',
    backgroundColor: '#FFE082',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full
  },
  weatherHint: {
    fontSize: 10,
    color: '#8D6E63',
    marginTop: 2
  },
  servicesHeaderRow: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs
  },
  sectionHeader: {
    fontSize: FONTS.medium + 1,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs + 2
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    justifyContent: 'space-between'
  },
  serviceCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    alignItems: 'flex-start'
  },
  serviceIconBox: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs + 2
  },
  serviceIcon: {
    fontSize: 22
  },
  serviceTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primaryDark
  },
  serviceSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2
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
  }
});
