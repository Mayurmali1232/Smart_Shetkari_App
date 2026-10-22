import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONTS } from '../../constants/theme';
import { dairyService } from '../../services/dairyService';
import { useTranslation } from 'react-i18next';
import AppHeader from '../../components/AppHeader';
import StatCard from '../../components/StatCard';
import DateSelector from '../../components/DateSelector';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorMessage from '../../components/ErrorMessage';

export default function DairyDashboardScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchDashboard = useCallback(async (dateToFetch) => {
    try {
      setError('');
      const dateStr = dateToFetch || selectedDate;
      const res = await dairyService.getDashboard(dateStr);
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dairy dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedDate]);

  useFocusEffect(
    useCallback(() => {
      fetchDashboard(selectedDate);
    }, [selectedDate, fetchDashboard])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboard(selectedDate);
  };

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    setLoading(true);
  };

  const quickNav = [
    { title: t('dairy.animals') || 'My Animals', icon: '🐄', route: '/dairy/animals', color: '#15803d', sub: `${data?.totalAnimals || 0} Total` },
    { title: t('dairy.addNewAnimal') || 'Add Animal', icon: '➕', route: '/dairy/animals/add', color: '#0f766e', sub: 'Register new' },
    { title: t('dairy.milkProduction') || 'Milk Production', icon: '🥛', route: '/dairy/milk-production', color: '#0284c7', sub: `${data?.todayMilkProductionLiters || 0} L today` },
    { title: t('dairy.milkSales') || 'Milk Sales', icon: '💰', route: '/dairy/milk-sales', color: '#16a34a', sub: `₹${data?.todayMilkSalesIncome || 0} today` },
    { title: t('dairy.expenses') || 'Expenses', icon: '🌾', route: '/dairy/expenses', color: '#ea580c', sub: `₹${data?.todayExpenses || 0} today` },
    { title: t('dairy.health') || 'Health & Vaccines', icon: '💉', route: '/dairy/health', color: '#7c3aed', sub: `${data?.upcomingHealthRemindersCount || 0} reminders` },
    { title: t('dairy.profitLoss') || 'Profit & Loss', icon: '📈', route: '/dairy/profit-loss', color: '#059669', sub: 'Financial analysis' },
    { title: t('dairy.reports') || 'Reports', icon: '📊', route: '/dairy/reports', color: '#475569', sub: 'Summary & trends' }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title={t('dairy.title') || 'Dairy & Livestock'}
        subtitle={t('dairy.subtitle') || 'Animal Husbandry & Milk Management'}
        showBack={true}
        fallbackRoute="/dashboard"
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

        {error ? <ErrorMessage message={error} onRetry={() => fetchDashboard(selectedDate)} /> : null}

        {loading && !refreshing ? (
          <LoadingIndicator message={t('common.loading') || 'Loading dairy data...'} />
        ) : data ? (
          <>
            {/* Quick Actions Hub */}
            <Text style={styles.sectionHeader}>Dairy Modules / दुग्ध विभाग</Text>
            <View style={styles.navGrid}>
              {quickNav.map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.navCard}
                  onPress={() => router.push(item.route)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.navIconBox, { backgroundColor: item.color + '15' }]}>
                    <Text style={styles.navIcon}>{item.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.navTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.navSub}>{item.sub}</Text>
                  </View>
                  <Text style={styles.navArrow}>›</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Today's Dairy Performance */}
            <Text style={styles.sectionHeader}>Today's Performance / आजची स्थिती</Text>
            <View style={styles.grid}>
              <StatCard
                title={t('dairy.todayProduction') || "Today's Milk"}
                value={`${data.todayMilkProductionLiters || 0} L`}
                icon="🥛"
                color="#0284c7"
                bgColor="#e0f2fe"
                style={styles.halfCard}
                onPress={() => router.push('/dairy/milk-production')}
              />
              <StatCard
                title={t('dairy.todaySold') || 'Milk Sold Today'}
                value={`${data.todayMilkSoldLiters || 0} L`}
                icon="🚚"
                color="#16a34a"
                bgColor="#dcfce7"
                style={styles.halfCard}
                onPress={() => router.push('/dairy/milk-sales')}
              />
              <StatCard
                title={t('dairy.todaySalesIncome') || "Today's Income"}
                value={data.todayMilkSalesIncome || 0}
                icon="💵"
                color="#15803d"
                bgColor="#bbf7d0"
                isCurrency
                style={styles.halfCard}
                onPress={() => router.push('/dairy/milk-sales')}
              />
              <StatCard
                title={t('dairy.todayExpenses') || "Today's Expenses"}
                value={data.todayExpenses || 0}
                icon="🌾"
                color="#dc2626"
                bgColor="#fee2e2"
                isCurrency
                style={styles.halfCard}
                onPress={() => router.push('/dairy/expenses')}
              />
              <StatCard
                title={t('dairy.todayProfit') || "Today's Est. Profit"}
                value={data.todayEstimatedProfit || 0}
                icon="📈"
                color={data.todayEstimatedProfit >= 0 ? '#16a34a' : '#dc2626'}
                bgColor={data.todayEstimatedProfit >= 0 ? '#dcfce7' : '#fee2e2'}
                isCurrency
                style={styles.halfCard}
                onPress={() => router.push('/dairy/profit-loss')}
              />
              <StatCard
                title={t('dairy.outstandingReceivables') || 'Milk Payments Due'}
                value={data.outstandingMilkPayments || 0}
                icon="⏳"
                color="#b45309"
                bgColor="#fef3c7"
                isCurrency
                style={styles.halfCard}
                onPress={() => router.push('/dairy/milk-sales')}
              />
            </View>

            {/* Livestock Overview */}
            <Text style={styles.sectionHeader}>Livestock Count / जनावरांची संख्या</Text>
            <View style={styles.animalsRow}>
              <View style={styles.animalCountCard}>
                <Text style={styles.animalCountIcon}>🐄</Text>
                <Text style={styles.animalCountNum}>{data.totalCows || 0}</Text>
                <Text style={styles.animalCountLabel}>{t('dairy.cows') || 'Cows'}</Text>
              </View>
              <View style={styles.animalCountCard}>
                <Text style={styles.animalCountIcon}>🐃</Text>
                <Text style={styles.animalCountNum}>{data.totalBuffaloes || 0}</Text>
                <Text style={styles.animalCountLabel}>{t('dairy.buffaloes') || 'Buffaloes'}</Text>
              </View>
              <View style={styles.animalCountCard}>
                <Text style={styles.animalCountIcon}>🥛</Text>
                <Text style={styles.animalCountNum}>{data.totalMilkingAnimals || 0}</Text>
                <Text style={styles.animalCountLabel}>{t('dairy.milking') || 'Milking'}</Text>
              </View>
              <View style={styles.animalCountCard}>
                <Text style={styles.animalCountIcon}>🐾</Text>
                <Text style={styles.animalCountNum}>{data.totalAnimals || 0}</Text>
                <Text style={styles.animalCountLabel}>{t('dairy.totalAnimals') || 'Total'}</Text>
              </View>
            </View>

            {/* Monthly Summary */}
            <Text style={styles.sectionHeader}>This Month / चालू महिना</Text>
            <View style={styles.monthCard}>
              <View style={styles.monthCol}>
                <Text style={styles.monthLabel}>Monthly Milk</Text>
                <Text style={styles.monthValue}>{data.monthlyMilkProductionLiters || 0} L</Text>
              </View>
              <View style={styles.monthCol}>
                <Text style={styles.monthLabel}>Sales Income</Text>
                <Text style={[styles.monthValue, { color: '#16a34a' }]}>₹{data.monthlySalesIncome || 0}</Text>
              </View>
              <View style={styles.monthCol}>
                <Text style={styles.monthLabel}>Expenses</Text>
                <Text style={[styles.monthValue, { color: '#dc2626' }]}>₹{data.monthlyOperatingExpenses || 0}</Text>
              </View>
              <View style={styles.monthCol}>
                <Text style={styles.monthLabel}>Est. Profit</Text>
                <Text style={[styles.monthValue, { color: COLORS.primaryDark, fontWeight: '700' }]}>
                  ₹{data.monthlyEstimatedOperatingProfit || 0}
                </Text>
              </View>
            </View>

            {/* Upcoming Health Reminders Alert */}
            {data.upcomingReminders && data.upcomingReminders.length > 0 && (
              <View style={styles.reminderBox}>
                <View style={styles.reminderHeader}>
                  <Text style={styles.reminderTitle}>💉 Upcoming Vaccinations & Checkups</Text>
                  <TouchableOpacity onPress={() => router.push('/dairy/health')}>
                    <Text style={styles.reminderLink}>View All ›</Text>
                  </TouchableOpacity>
                </View>
                {data.upcomingReminders.slice(0, 3).map((r, i) => (
                  <View key={i} style={styles.reminderItem}>
                    <Text style={styles.reminderAnimal}>🐄 {r.animalName} ({r.animalTagNumber || 'No Tag'})</Text>
                    <Text style={styles.reminderTreatment}>{r.treatmentName} • Due: {r.nextDueDate}</Text>
                  </View>
                ))}
              </View>
            )}
          </>
        ) : null}
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
    padding: SPACING.md,
    paddingBottom: SPACING.xxl
  },
  sectionHeader: {
    fontSize: FONTS.medium + 1,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm
  },
  navGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.sm
  },
  navCard: {
    width: '48.5%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.sm + 2,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 1,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2
  },
  navIconBox: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.xs + 2
  },
  navIcon: {
    fontSize: 20
  },
  navTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary
  },
  navSub: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 1
  },
  navArrow: {
    fontSize: 18,
    color: COLORS.textMuted,
    marginLeft: 2
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  halfCard: {
    width: '48.5%',
    marginBottom: SPACING.sm
  },
  animalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm
  },
  animalCountCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  animalCountIcon: {
    fontSize: 22,
    marginBottom: 2
  },
  animalCountNum: {
    fontSize: FONTS.large,
    fontWeight: '800',
    color: COLORS.textPrimary
  },
  animalCountLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600'
  },
  monthCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md
  },
  monthCol: {
    alignItems: 'center',
    flex: 1
  },
  monthLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 4
  },
  monthValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary
  },
  reminderBox: {
    backgroundColor: '#faf5ff',
    borderWidth: 1,
    borderColor: '#e9d5ff',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.xs,
    marginBottom: SPACING.md
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs
  },
  reminderTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6b21a8'
  },
  reminderLink: {
    fontSize: 12,
    color: '#9333ea',
    fontWeight: '600'
  },
  reminderItem: {
    marginTop: SPACING.xs,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: '#f3e8ff'
  },
  reminderAnimal: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary
  },
  reminderTreatment: {
    fontSize: 11,
    color: COLORS.textSecondary
  }
});
