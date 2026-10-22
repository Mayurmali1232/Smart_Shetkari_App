import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert, Share, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONTS } from '../../constants/theme';
import { reportService } from '../../services/reportService';
import { useTranslation } from 'react-i18next';
import AppHeader from '../../components/AppHeader';
import AppButton from '../../components/AppButton';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorMessage from '../../components/ErrorMessage';

export default function ReportsScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  // Date range defaults: first day of current month to today
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const todayStr = now.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(firstDayOfMonth);
  const [endDate, setEndDate] = useState(todayStr);
  const [selectedPreset, setSelectedPreset] = useState('month'); // 'month' | 'lastMonth' | 'year'

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');

  const fetchSummary = useCallback(async (start, end) => {
    try {
      setError('');
      const res = await reportService.getFinancialSummary(start || startDate, end || endDate);
      if (res.success && res.data) {
        setSummary(res.data);
      }
    } catch (e) {
      setError(e.message || 'Failed to generate financial summary');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchSummary(startDate, endDate);
  }, [fetchSummary, startDate, endDate]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSummary(startDate, endDate);
  };

  const handlePresetSelect = (preset) => {
    setSelectedPreset(preset);
    const curr = new Date();
    if (preset === 'month') {
      const s = new Date(curr.getFullYear(), curr.getMonth(), 1).toISOString().split('T')[0];
      const e = curr.toISOString().split('T')[0];
      setStartDate(s);
      setEndDate(e);
      fetchSummary(s, e);
    } else if (preset === 'lastMonth') {
      const s = new Date(curr.getFullYear(), curr.getMonth() - 1, 1).toISOString().split('T')[0];
      const e = new Date(curr.getFullYear(), curr.getMonth(), 0).toISOString().split('T')[0];
      setStartDate(s);
      setEndDate(e);
      fetchSummary(s, e);
    } else if (preset === 'year') {
      const s = new Date(curr.getFullYear(), 0, 1).toISOString().split('T')[0];
      const e = curr.toISOString().split('T')[0];
      setStartDate(s);
      setEndDate(e);
      fetchSummary(s, e);
    }
  };

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const res = await reportService.exportCsv(startDate, endDate);
      const csvContent = typeof res === 'string' ? res : (res?.data || JSON.stringify(res));

      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `smartshetkari-report-${startDate}-to-${endDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        Alert.alert(t('common.success'), 'CSV report downloaded successfully!');
      } else {
        await Share.share({
          title: `Smart Shetkari Report (${startDate} to ${endDate})`,
          message: csvContent
        });
      }
    } catch (e) {
      Alert.alert(t('common.error'), e.message || 'Failed to export CSV');
    } finally {
      setExporting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title={t('reports.title')}
        subtitle="Operational & Financial Statements"
        showBack={true}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        {/* Preset Range Selector */}
        <View style={styles.presetRow}>
          {[
            { id: 'month', label: 'This Month' },
            { id: 'lastMonth', label: 'Last Month' },
            { id: 'year', label: 'This Year' }
          ].map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[styles.presetBtn, selectedPreset === p.id && styles.presetBtnActive]}
              onPress={() => handlePresetSelect(p.id)}
            >
              <Text style={[styles.presetText, selectedPreset === p.id && styles.presetTextActive]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.dateLabelRow}>
          <Text style={styles.dateRangeText}>
            Showing report: <Text style={{ fontWeight: '700' }}>{startDate}</Text> to <Text style={{ fontWeight: '700' }}>{endDate}</Text>
          </Text>
        </View>

        {error ? <ErrorMessage message={error} onRetry={() => fetchSummary(startDate, endDate)} /> : null}

        {loading && !refreshing ? (
          <LoadingIndicator />
        ) : summary ? (
          <>
            {/* Net Farm Cash Flow Card */}
            <View style={[
              styles.netProfitCard,
              (summary.netProfit || 0) >= 0 ? styles.profitBg : styles.lossBg
            ]}>
              <Text style={styles.netProfitLabel}>Realized Net Farm Cash Flow</Text>
              <Text style={[
                styles.netProfitValue,
                (summary.netProfit || 0) >= 0 ? styles.profitColor : styles.lossColor
              ]}>
                {(summary.netProfit || 0) >= 0 ? `+₹${summary.netProfit}` : `-₹${Math.abs(summary.netProfit)}`}
              </Text>
              <Text style={styles.netProfitHint}>
                (Cash Collected - Worker Wages Paid - Tractor Expenses)
              </Text>
            </View>

            {/* Income Breakdown */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>🌾 Tractor Operations & Revenue</Text>

              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Completed Work Value</Text>
                <Text style={styles.statVal}>₹{summary.totalCompletedWorkValue || 0}</Text>
              </View>

              <View style={styles.statRow}>
                <Text style={[styles.statLabel, { color: COLORS.secondary, fontWeight: '700' }]}>
                  Actual Cash Collected
                </Text>
                <Text style={[styles.statVal, { color: COLORS.secondary, fontWeight: '700' }]}>
                  ₹{summary.totalTractorIncomeCollected || 0}
                </Text>
              </View>

              <View style={styles.statRow}>
                <Text style={[styles.statLabel, { color: COLORS.danger }]}>
                  Customer Outstanding Receivables
                </Text>
                <Text style={[styles.statVal, { color: COLORS.danger, fontWeight: '700' }]}>
                  ₹{summary.outstandingCustomerReceivables || 0}
                </Text>
              </View>
            </View>

            {/* Labour & Wage Breakdown */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>👥 Worker Wages & Labour</Text>

              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Total Agreed Labour Wages</Text>
                <Text style={styles.statVal}>₹{summary.totalWorkerWagesAgreed || 0}</Text>
              </View>

              <View style={styles.statRow}>
                <Text style={[styles.statLabel, { color: '#2563eb', fontWeight: '700' }]}>
                  Wages Paid to Date
                </Text>
                <Text style={[styles.statVal, { color: '#2563eb', fontWeight: '700' }]}>
                  ₹{summary.totalWorkerWagesPaid || 0}
                </Text>
              </View>

              <View style={styles.statRow}>
                <Text style={[styles.statLabel, { color: '#b45309' }]}>
                  Outstanding Worker Wages Payable
                </Text>
                <Text style={[styles.statVal, { color: '#b45309', fontWeight: '700' }]}>
                  ₹{summary.outstandingWorkerPayables || 0}
                </Text>
              </View>
            </View>

            {/* Tractor Expenses Breakdown */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>⛽ Tractor & Machinery Expenses</Text>

              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Total Fuel, Servicing & Repairs</Text>
                <Text style={[styles.statVal, { color: COLORS.danger, fontWeight: '700' }]}>
                  ₹{summary.totalTractorExpenses || 0}
                </Text>
              </View>
            </View>

            {/* Export CSV Button */}
            <View style={styles.exportContainer}>
              <AppButton
                title={exporting ? 'Generating CSV...' : '📥 Export Detailed CSV Report'}
                onPress={handleExportCsv}
                loading={exporting}
                variant="primary"
                style={{ backgroundColor: COLORS.primaryDark }}
              />
            </View>
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
  presetRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm
  },
  presetBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border
  },
  presetBtnActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary
  },
  presetText: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    fontWeight: '600'
  },
  presetTextActive: {
    color: COLORS.primaryDark,
    fontWeight: '700'
  },
  dateLabelRow: {
    alignItems: 'center',
    marginBottom: SPACING.md
  },
  dateRangeText: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary
  },
  netProfitCard: {
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1.5
  },
  profitBg: {
    backgroundColor: '#dcfce7',
    borderColor: '#86efac'
  },
  lossBg: {
    backgroundColor: '#fee2e2',
    borderColor: '#fca5a5'
  },
  netProfitLabel: {
    fontSize: FONTS.small,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  netProfitValue: {
    fontSize: 34,
    fontWeight: '800',
    marginVertical: SPACING.xs
  },
  profitColor: {
    color: COLORS.secondary
  },
  lossColor: {
    color: COLORS.danger
  },
  netProfitHint: {
    fontSize: 11,
    color: COLORS.textSecondary
  },
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 1,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2
  },
  sectionTitle: {
    fontSize: FONTS.medium,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: SPACING.xs
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f1f5f9'
  },
  statLabel: {
    fontSize: FONTS.small + 1,
    color: COLORS.textPrimary,
    flex: 1
  },
  statVal: {
    fontSize: FONTS.medium,
    fontWeight: '600',
    color: COLORS.textPrimary
  },
  exportContainer: {
    marginTop: SPACING.md,
    marginBottom: SPACING.xl
  }
});
