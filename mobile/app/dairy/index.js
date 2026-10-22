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
import BottomNav from '../../components/BottomNav';

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
    { title: t('dairy.animals') || 'जनावरे', icon: '🐄', route: '/dairy/animals', color: COLORS.primaryGreen, sub: `${data?.totalAnimals || 0} एकूण` },
    { title: t('dairy.addNewAnimal') || 'नवीन जनावर', icon: '➕', route: '/dairy/animals/add', color: '#0f766e', sub: 'नोंद करा' },
    { title: t('dairy.milkProduction') || 'दूध संकलन', icon: '🥛', route: '/dairy/milk-production', color: '#0284c7', sub: `${data?.todayMilkProductionLiters || 0} L आज` },
    { title: t('dairy.milkSales') || 'दूध विक्री', icon: '💰', route: '/dairy/milk-sales', color: '#16a34a', sub: `₹${data?.todayMilkSalesIncome || 0} उत्पन्न` },
    { title: t('dairy.expenses') || 'डेअरी खर्च', icon: '🌾', route: '/dairy/expenses', color: '#ea580c', sub: `₹${data?.todayExpenses || 0} आज` },
    { title: t('dairy.health') || 'आरोग्य व लस', icon: '💉', route: '/dairy/health', color: '#7c3aed', sub: `${data?.upcomingHealthRemindersCount || 0} सूचना` },
    { title: t('dairy.profitLoss') || 'नफा व तोटा', icon: '📈', route: '/dairy/profit-loss', color: '#059669', sub: 'हिशोब विश्लेषण' },
    { title: t('dairy.reports') || 'अहवाल', icon: '📊', route: '/dairy/reports', color: '#475569', sub: 'मासिक तपशील' }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title={t('dairy.title') || 'दूध व पशुसंवर्धन'}
        subtitle={t('dairy.subtitle') || 'दैनिक दूध व जनावरे व्यवस्थापन'}
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
            colors={[COLORS.primaryGreen]}
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
          <LoadingIndicator message={t('common.loading') || 'डेअरी माहिती लोड होत आहे...'} />
        ) : data ? (
          <>
            {/* Panel 8 Top Cow Banner Hero Card */}
            <View style={styles.heroBanner}>
              <View style={styles.heroTopRow}>
                <View style={styles.heroIconBox}>
                  <Text style={styles.heroIcon}>🐄</Text>
                </View>
                <View style={styles.heroTextCol}>
                  <Text style={styles.heroBadge}>आजचे दूध संकलन</Text>
                  <Text style={styles.heroLiters}>
                    {data.todayMilkProductionLiters || 0} <Text style={styles.heroUnit}>लिटर</Text>
                  </Text>
                  <Text style={styles.heroIncome}>
                    उत्पन्न: ₹{data.todayMilkSalesIncome || 0} • खर्च: ₹{data.todayExpenses || 0}
                  </Text>
                </View>
              </View>

              <View style={styles.heroActionRow}>
                <TouchableOpacity
                  style={styles.heroBtnPrimary}
                  onPress={() => router.push('/dairy/milk-production')}
                  activeOpacity={0.85}
                >
                  <Text style={styles.heroBtnPrimaryText}>+ दूध नोंद करा</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.heroBtnSecondary}
                  onPress={() => router.push('/dairy/milk-sales')}
                  activeOpacity={0.85}
                >
                  <Text style={styles.heroBtnSecondaryText}>💰 दूध विक्री</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Quick Actions Hub */}
            <Text style={styles.sectionHeader}>डेअरी विभाग / Modules</Text>
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
            <Text style={styles.sectionHeader}>आजची स्थिती / Performance</Text>
            <View style={styles.grid}>
              <StatCard
                title={t('dairy.todayProduction') || "आजचे दूध"}
                value={`${data.todayMilkProductionLiters || 0} L`}
                icon="🥛"
                color="#0284c7"
                bgColor="#e0f2fe"
                style={styles.halfCard}
                onPress={() => router.push('/dairy/milk-production')}
              />
              <StatCard
                title={t('dairy.todaySold') || 'विक्री झालेले दूध'}
                value={`${data.todayMilkSoldLiters || 0} L`}
                icon="🚚"
                color="#16a34a"
                bgColor="#dcfce7"
                style={styles.halfCard}
                onPress={() => router.push('/dairy/milk-sales')}
              />
              <StatCard
                title={t('dairy.todaySalesIncome') || "दूध विक्री उत्पन्न"}
                value={data.todayMilkSalesIncome || 0}
                icon="💵"
                color={COLORS.primaryGreen}
                bgColor={COLORS.lightGreen}
                isCurrency
                style={styles.halfCard}
                onPress={() => router.push('/dairy/milk-sales')}
              />
              <StatCard
                title={t('dairy.todayExpenses') || "आजचा खर्च"}
                value={data.todayExpenses || 0}
                icon="🌾"
                color="#dc2626"
                bgColor="#fee2e2"
                isCurrency
                style={styles.halfCard}
                onPress={() => router.push('/dairy/expenses')}
              />
              <StatCard
                title={t('dairy.todayProfit') || "अंदाजे नफा"}
                value={data.todayEstimatedProfit || 0}
                icon="📈"
                color={data.todayEstimatedProfit >= 0 ? COLORS.primaryGreen : '#dc2626'}
                bgColor={data.todayEstimatedProfit >= 0 ? COLORS.lightGreen : '#fee2e2'}
                isCurrency
                style={styles.halfCard}
                onPress={() => router.push('/dairy/profit-loss')}
              />
              <StatCard
                title={t('dairy.outstandingReceivables') || 'येणे बाकी रक्कम'}
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
            <Text style={styles.sectionHeader}>जनावरांची संख्या / Livestock</Text>
            <View style={styles.animalsRow}>
              <TouchableOpacity
                style={styles.animalCountCard}
                onPress={() => router.push('/dairy/animals')}
                activeOpacity={0.7}
              >
                <Text style={styles.animalCountIcon}>🐄</Text>
                <Text style={styles.animalCountNum}>{data.totalCows || 0}</Text>
                <Text style={styles.animalCountLabel}>{t('dairy.cows') || 'गाई'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.animalCountCard}
                onPress={() => router.push('/dairy/animals')}
                activeOpacity={0.7}
              >
                <Text style={styles.animalCountIcon}>🐃</Text>
                <Text style={styles.animalCountNum}>{data.totalBuffaloes || 0}</Text>
                <Text style={styles.animalCountLabel}>{t('dairy.buffaloes') || 'म्हशी'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.animalCountCard}
                onPress={() => router.push('/dairy/animals')}
                activeOpacity={0.7}
              >
                <Text style={styles.animalCountIcon}>🥛</Text>
                <Text style={styles.animalCountNum}>{data.totalMilkingAnimals || 0}</Text>
                <Text style={styles.animalCountLabel}>{t('dairy.milking') || 'दूध देणाऱ्या'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.animalCountCard}
                onPress={() => router.push('/dairy/animals')}
                activeOpacity={0.7}
              >
                <Text style={styles.animalCountIcon}>🐾</Text>
                <Text style={styles.animalCountNum}>{data.totalAnimals || 0}</Text>
                <Text style={styles.animalCountLabel}>{t('dairy.totalAnimals') || 'एकूण'}</Text>
              </TouchableOpacity>
            </View>

            {/* Monthly Summary */}
            <Text style={styles.sectionHeader}>चालू महिना / This Month</Text>
            <View style={styles.monthCard}>
              <View style={styles.monthCol}>
                <Text style={styles.monthLabel}>एकूण दूध</Text>
                <Text style={styles.monthValue}>{data.monthlyMilkProductionLiters || 0} L</Text>
              </View>
              <View style={styles.monthCol}>
                <Text style={styles.monthLabel}>विक्री उत्पन्न</Text>
                <Text style={[styles.monthValue, { color: COLORS.primaryGreen }]}>₹{data.monthlySalesIncome || 0}</Text>
              </View>
              <View style={styles.monthCol}>
                <Text style={styles.monthLabel}>एकूण खर्च</Text>
                <Text style={[styles.monthValue, { color: '#dc2626' }]}>₹{data.monthlyOperatingExpenses || 0}</Text>
              </View>
              <View style={styles.monthCol}>
                <Text style={styles.monthLabel}>अंदाजे नफा</Text>
                <Text style={[styles.monthValue, { color: COLORS.darkText, fontWeight: '800' }]}>
                  ₹{data.monthlyEstimatedOperatingProfit || 0}
                </Text>
              </View>
            </View>

            {/* Upcoming Health Reminders Alert */}
            {data.upcomingReminders && data.upcomingReminders.length > 0 && (
              <View style={styles.reminderBox}>
                <View style={styles.reminderHeader}>
                  <Text style={styles.reminderTitle}>💉 आगामी लसीकरण व तपासणी</Text>
                  <TouchableOpacity onPress={() => router.push('/dairy/health')}>
                    <Text style={styles.reminderLink}>सर्व पहा ›</Text>
                  </TouchableOpacity>
                </View>
                {data.upcomingReminders.slice(0, 3).map((r, i) => (
                  <View key={i} style={styles.reminderItem}>
                    <Text style={styles.reminderAnimal}>🐄 {r.animalName} ({r.animalTagNumber || 'टॅग नाही'})</Text>
                    <Text style={styles.reminderTreatment}>{r.treatmentName} • तारीख: {r.nextDueDate}</Text>
                  </View>
                ))}
              </View>
            )}
          </>
        ) : null}
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNav active="records" />
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
  heroBanner: {
    backgroundColor: COLORS.primaryGreen,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: COLORS.primaryGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md
  },
  heroIconBox: {
    width: 54,
    height: 54,
    borderRadius: RADIUS.full,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  heroIcon: {
    fontSize: 28
  },
  heroTextCol: {
    flex: 1
  },
  heroBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E8F5E9',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  heroLiters: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 2
  },
  heroUnit: {
    fontSize: 16,
    fontWeight: '600',
    color: '#C8E6C9'
  },
  heroIncome: {
    fontSize: 12,
    color: '#E8F5E9',
    marginTop: 2,
    fontWeight: '500'
  },
  heroActionRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    paddingTop: SPACING.sm
  },
  heroBtnPrimary: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center'
  },
  heroBtnPrimaryText: {
    color: COLORS.primaryGreen,
    fontSize: FONTS.medium,
    fontWeight: '800'
  },
  heroBtnSecondary: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center'
  },
  heroBtnSecondaryText: {
    color: '#ffffff',
    fontSize: FONTS.medium,
    fontWeight: '700'
  },
  sectionHeader: {
    fontSize: FONTS.medium + 1,
    fontWeight: '700',
    color: COLORS.darkText,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs + 2
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
    borderColor: '#E8F0E9',
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
    color: COLORS.darkText
  },
  navSub: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 1
  },
  navArrow: {
    fontSize: 18,
    color: COLORS.textSecondary,
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
    borderColor: '#E8F0E9'
  },
  animalCountIcon: {
    fontSize: 22,
    marginBottom: 2
  },
  animalCountNum: {
    fontSize: FONTS.large,
    fontWeight: '800',
    color: COLORS.darkText
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
    borderColor: '#E8F0E9',
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
    color: COLORS.darkText
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
    color: COLORS.darkText
  },
  reminderTreatment: {
    fontSize: 11,
    color: COLORS.textSecondary
  }
});
