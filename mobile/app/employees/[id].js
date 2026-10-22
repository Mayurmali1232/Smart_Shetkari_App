import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONTS } from '../../constants/theme';
import { employeeService } from '../../services/employeeService';
import { useTranslation } from 'react-i18next';
import AppHeader from '../../components/AppHeader';
import AppButton from '../../components/AppButton';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorMessage from '../../components/ErrorMessage';

export default function EmployeeDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { t } = useTranslation();

  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('attendance'); // 'attendance' or 'payments'

  const fetchHistory = useCallback(async () => {
    try {
      setError('');
      const res = await employeeService.getHistory(id);
      if (res.success && res.data) {
        setHistoryData(res.data);
      }
    } catch (e) {
      setError(e.message || 'Failed to load worker history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  const handleToggleStatus = async () => {
    if (!historyData?.employee) return;
    const currentStatus = historyData.employee.status;
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    try {
      const res = await employeeService.toggleStatus(id, newStatus);
      if (res.success) {
        Alert.alert(t('common.success'), `Status updated to ${newStatus}`);
        fetchHistory();
      }
    } catch (e) {
      Alert.alert(t('common.error'), e.message || 'Failed to update status');
    }
  };

  if (loading && !refreshing) {
    return <LoadingIndicator message={t('common.loading')} />;
  }

  const employee = historyData?.employee;
  const attendanceList = historyData?.attendanceRecords || [];
  const paymentList = historyData?.paymentRecords || [];

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title={employee?.fullName || t('employees.title')}
        showBack
        fallbackRoute="/employees"
        showLanguage={false}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        {error ? <ErrorMessage message={error} onRetry={fetchHistory} /> : null}

        {employee && (
          <>
            {/* Worker Summary Card */}
            <View style={styles.profileCard}>
              <View style={styles.avatarRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{employee.fullName.charAt(0)}</Text>
                </View>
                <View style={styles.infoCol}>
                  <Text style={styles.name}>{employee.fullName}</Text>
                  <Text style={styles.subtext}>
                    📍 {employee.villageAddress || 'Farm Worker'}
                  </Text>
                  {employee.mobileNumber && (
                    <Text style={styles.subtext}>📞 {employee.mobileNumber}</Text>
                  )}
                </View>
                <TouchableOpacity
                  style={[
                    styles.statusPill,
                    { backgroundColor: employee.status === 'ACTIVE' ? COLORS.primaryLight : '#f1f5f9' }
                  ]}
                  onPress={handleToggleStatus}
                >
                  <Text style={[
                    styles.statusPillText,
                    { color: employee.status === 'ACTIVE' ? COLORS.primaryDark : COLORS.textSecondary }
                  ]}>
                    {employee.status} ⇄
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.divider} />

              {/* Financial & Working Statistics */}
              <View style={styles.metricGrid}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>{t('employees.dailyWage')}</Text>
                  <Text style={styles.metricVal}>₹{employee.dailyWage}</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>{t('employees.daysWorked')}</Text>
                  <Text style={styles.metricVal}>{employee.totalDaysWorked || 0} days</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>{t('employees.totalPaid')}</Text>
                  <Text style={styles.metricVal}>₹{employee.totalPaid || 0}</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>{t('employees.balanceDue')}</Text>
                  <Text style={[styles.metricVal, { color: (employee.outstandingBalance > 0) ? COLORS.accent : COLORS.primary }]}>
                    ₹{employee.outstandingBalance || 0}
                  </Text>
                </View>
              </View>

              {/* Quick Action to Pay Wages */}
              <AppButton
                title={`💸 ${t('dashboard.payWages')}`}
                onPress={() => router.push('/wages')}
                style={styles.payBtn}
              />
            </View>

            {/* History Tabs */}
            <View style={styles.tabBar}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'attendance' && styles.tabActive]}
                onPress={() => setActiveTab('attendance')}
              >
                <Text style={[styles.tabText, activeTab === 'attendance' && styles.tabTextActive]}>
                  📋 {t('attendance.title')} ({attendanceList.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'payments' && styles.tabActive]}
                onPress={() => setActiveTab('payments')}
              >
                <Text style={[styles.tabText, activeTab === 'payments' && styles.tabTextActive]}>
                  💵 {t('wages.recordPayment')} ({paymentList.length})
                </Text>
              </TouchableOpacity>
            </View>

            {/* Tab Contents */}
            {activeTab === 'attendance' ? (
              <View style={styles.historyList}>
                {attendanceList.length === 0 ? (
                  <Text style={styles.emptyText}>{t('common.noData')}</Text>
                ) : (
                  attendanceList.map((att) => (
                    <View key={att.id} style={styles.recordItem}>
                      <View style={styles.recordLeft}>
                        <Text style={styles.recordDate}>📅 {att.workDate}</Text>
                        <Text style={styles.recordSub}>
                          Rate: ₹{att.dailyWageRate} {att.notes ? `• ${att.notes}` : ''}
                        </Text>
                      </View>
                      <View style={[
                        styles.attBadge,
                        att.status === 'PRESENT' && { backgroundColor: COLORS.primaryLight },
                        att.status === 'HALF_DAY' && { backgroundColor: '#fef3c7' },
                        att.status === 'ABSENT' && { backgroundColor: COLORS.dangerLight }
                      ]}>
                        <Text style={[
                          styles.attBadgeText,
                          att.status === 'PRESENT' && { color: COLORS.primaryDark },
                          att.status === 'HALF_DAY' && { color: '#b45309' },
                          att.status === 'ABSENT' && { color: COLORS.danger }
                        ]}>
                          {att.status}
                        </Text>
                      </View>
                    </View>
                  ))
                )}
              </View>
            ) : (
              <View style={styles.historyList}>
                {paymentList.length === 0 ? (
                  <Text style={styles.emptyText}>{t('common.noData')}</Text>
                ) : (
                  paymentList.map((p) => (
                    <View key={p.id} style={styles.recordItem}>
                      <View style={styles.recordLeft}>
                        <Text style={styles.recordDate}>📅 {p.paymentDate}</Text>
                        <Text style={styles.recordSub}>
                          Method: {p.paymentMethod} {p.referenceNumber ? `• Ref: ${p.referenceNumber}` : ''}
                        </Text>
                      </View>
                      <Text style={styles.payAmount}>₹{p.amount}</Text>
                    </View>
                  ))
                )}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl
  },
  profileCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    borderWidth: 1.5,
    borderColor: '#86efac'
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primaryDark
  },
  infoCol: {
    flex: 1
  },
  name: {
    fontSize: FONTS.large,
    fontWeight: '700',
    color: COLORS.textPrimary
  },
  subtext: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    marginTop: 2
  },
  statusPill: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  statusPillText: {
    fontSize: FONTS.small,
    fontWeight: '700'
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.md
  },
  metricGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md
  },
  metricItem: {
    alignItems: 'center'
  },
  metricLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  metricVal: {
    fontSize: FONTS.medium,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 2
  },
  payBtn: {
    marginTop: SPACING.xs
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: RADIUS.md,
    padding: 3,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm + 2,
    alignItems: 'center',
    borderRadius: RADIUS.sm
  },
  tabActive: {
    backgroundColor: COLORS.surface,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  tabText: {
    fontSize: FONTS.small,
    fontWeight: '600',
    color: COLORS.textSecondary
  },
  tabTextActive: {
    color: COLORS.primaryDark,
    fontWeight: '700'
  },
  historyList: {
    marginTop: SPACING.xs
  },
  recordItem: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border
  },
  recordLeft: {
    flex: 1
  },
  recordDate: {
    fontSize: FONTS.regular,
    fontWeight: '700',
    color: COLORS.textPrimary
  },
  recordSub: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    marginTop: 2
  },
  attBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full
  },
  attBadgeText: {
    fontSize: FONTS.small,
    fontWeight: '800'
  },
  payAmount: {
    fontSize: FONTS.large,
    fontWeight: '800',
    color: COLORS.primaryDark
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    padding: SPACING.xl,
    fontSize: FONTS.regular
  }
});
