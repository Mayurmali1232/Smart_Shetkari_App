import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, TextInput, Alert, Share, Platform } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONTS } from '../../../constants/theme';
import { dairyService } from '../../../services/dairyService';
import { useTranslation } from 'react-i18next';
import AppHeader from '../../../components/AppHeader';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorMessage from '../../../components/ErrorMessage';

export default function DairyReportsScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const todayStr = now.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(firstDayOfMonth);
  const [endDate, setEndDate] = useState(todayStr);
  const [selectedPreset, setSelectedPreset] = useState('month');

  const [report, setReport] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');

  const fetchAllData = useCallback(async (start, end) => {
    try {
      setError('');
      const [plRes, dashRes, remRes] = await Promise.all([
        dairyService.getProfitLossReport({ startDate: start || startDate, endDate: end || endDate }),
        dairyService.getDashboard(todayStr).catch(() => ({ data: null })),
        dairyService.getReminders(30).catch(() => ({ data: [] }))
      ]);

      if (plRes.success && plRes.data) {
        setReport(plRes.data);
      }
      if (dashRes.success && dashRes.data) {
        setDashboard(dashRes.data);
      }
      if (remRes.success && remRes.data) {
        setReminders(remRes.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dairy reports');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [startDate, endDate, todayStr]);

  useFocusEffect(
    useCallback(() => {
      fetchAllData(startDate, endDate);
    }, [startDate, endDate, fetchAllData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchAllData(startDate, endDate);
  };

  const handlePresetSelect = (preset) => {
    setSelectedPreset(preset);
    const curr = new Date();
    let s = startDate;
    let e = todayStr;

    if (preset === 'today') {
      s = curr.toISOString().split('T')[0];
      e = s;
    } else if (preset === 'week') {
      const past = new Date(curr);
      past.setDate(curr.getDate() - 7);
      s = past.toISOString().split('T')[0];
      e = curr.toISOString().split('T')[0];
    } else if (preset === 'month') {
      s = new Date(curr.getFullYear(), curr.getMonth(), 1).toISOString().split('T')[0];
      e = curr.toISOString().split('T')[0];
    } else if (preset === 'lastMonth') {
      s = new Date(curr.getFullYear(), curr.getMonth() - 1, 1).toISOString().split('T')[0];
      e = new Date(curr.getFullYear(), curr.getMonth(), 0).toISOString().split('T')[0];
    }

    if (preset !== 'custom') {
      setStartDate(s);
      setEndDate(e);
      setLoading(true);
      fetchAllData(s, e);
    }
  };

  const handleApplyCustomDates = () => {
    setLoading(true);
    fetchAllData(startDate, endDate);
  };

  const handleExportCsv = async () => {
    if (!report) return;
    setExporting(true);
    try {
      // Build comprehensive CSV format
      let csv = `SMART SHETKARI - DAIRY & LIVESTOCK REPORT\n`;
      csv += `Report Period: ${startDate} to ${endDate}\n`;
      csv += `Generated On: ${new Date().toISOString()}\n\n`;

      csv += `--- FINANCIAL & PRODUCTION SUMMARY ---\n`;
      csv += `Metric,Value\n`;
      csv += `Total Animals Registered,${dashboard?.totalAnimals || 0}\n`;
      csv += `Milking Animals,${dashboard?.milkingAnimalsCount || 0}\n`;
      csv += `Total Milk Produced (L),${Number(report.totalMilkProducedLiters || 0).toFixed(1)}\n`;
      csv += `Total Milk Sold (L),${Number(report.totalMilkSoldLiters || 0).toFixed(1)}\n`;
      csv += `Total Milk Used (Home/Calf) (L),${Number(report.totalMilkUsedLiters || 0).toFixed(1)}\n`;
      csv += `Unsold / Balance Milk (L),${Number(report.unsoldMilkLiters || 0).toFixed(1)}\n`;
      csv += `Total Milk Sales (Accrual) (INR),${Number(report.totalMilkSalesIncome || 0)}\n`;
      csv += `Cash Received From Sales (INR),${Number(report.cashReceivedFromSales || 0)}\n`;
      csv += `Outstanding Customer Receivables (INR),${Number(report.outstandingReceivables || 0)}\n`;
      csv += `Operating Expenses (INR),${Number(report.totalOperatingExpenses || 0)}\n`;
      csv += `Estimated Operating Profit (INR),${Number(report.operatingProfit || 0)}\n`;
      csv += `Net Cash Flow (INR),${Number(report.netCashFlow || 0)}\n`;
      csv += `Capital Investment (Animal Purchases) (INR),${Number(report.capitalInvestment || 0)}\n\n`;

      if (report.expensesByCategory && Object.keys(report.expensesByCategory).length > 0) {
        csv += `--- OPERATING EXPENSES BY CATEGORY ---\n`;
        csv += `Category,Amount (INR)\n`;
        Object.entries(report.expensesByCategory).forEach(([k, v]) => {
          csv += `"${k}",${v}\n`;
        });
        csv += `\n`;
      }

      if (report.animalProfitability && report.animalProfitability.length > 0) {
        csv += `--- ANIMAL PROFITABILITY & MILK PRODUCTION ---\n`;
        csv += `Tag Number,Animal Name,Type,Milk Produced (L),Est Milk Income (INR),Expenses (INR),Net Profit (INR)\n`;
        report.animalProfitability.forEach((a) => {
          csv += `"${a.tagNumber || ''}","${a.name || ''}","${a.animalType || ''}",${a.milkLiters || 0},${a.milkIncome || 0},${a.expenses || 0},${a.netProfit || 0}\n`;
        });
      }

      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `dairy-report-${startDate}-to-${endDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        Alert.alert('Success', 'Dairy CSV report downloaded successfully!');
      } else {
        await Share.share({
          title: `Smart Shetkari Dairy Report (${startDate} to ${endDate})`,
          message: csv
        });
      }
    } catch (err) {
      Alert.alert('Export Failed', err.message || 'Could not export dairy report');
    } finally {
      setExporting(false);
    }
  };

  const operatingProfit = report?.operatingProfit != null ? Number(report.operatingProfit) : 0;
  const netCashFlow = report?.netCashFlow != null ? Number(report.netCashFlow) : 0;
  const isOperatingProfitPositive = operatingProfit >= 0;

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title={t('dairy.reports') || 'Dairy Reports'}
        subtitle="Analytics & Summaries / अहवाल"
        showBack={true}
        fallbackRoute="/dairy"
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
        {/* Preset Selector */}
        <View style={styles.presetContainer}>
          <TouchableOpacity
            style={[styles.presetButton, selectedPreset === 'today' && styles.presetButtonActive]}
            onPress={() => handlePresetSelect('today')}
          >
            <Text style={[styles.presetText, selectedPreset === 'today' && styles.presetTextActive]}>Today</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.presetButton, selectedPreset === 'week' && styles.presetButtonActive]}
            onPress={() => handlePresetSelect('week')}
          >
            <Text style={[styles.presetText, selectedPreset === 'week' && styles.presetTextActive]}>7 Days</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.presetButton, selectedPreset === 'month' && styles.presetButtonActive]}
            onPress={() => handlePresetSelect('month')}
          >
            <Text style={[styles.presetText, selectedPreset === 'month' && styles.presetTextActive]}>This Month</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.presetButton, selectedPreset === 'lastMonth' && styles.presetButtonActive]}
            onPress={() => handlePresetSelect('lastMonth')}
          >
            <Text style={[styles.presetText, selectedPreset === 'lastMonth' && styles.presetTextActive]}>Last Month</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.presetButton, selectedPreset === 'custom' && styles.presetButtonActive]}
            onPress={() => handlePresetSelect('custom')}
          >
            <Text style={[styles.presetText, selectedPreset === 'custom' && styles.presetTextActive]}>Custom</Text>
          </TouchableOpacity>
        </View>

        {/* Custom Date Inputs */}
        {selectedPreset === 'custom' && (
          <View style={styles.customDateCard}>
            <View style={styles.dateInputsRow}>
              <View style={styles.dateCol}>
                <Text style={styles.dateLabel}>Start Date (YYYY-MM-DD)</Text>
                <TextInput
                  style={styles.dateInput}
                  value={startDate}
                  onChangeText={setStartDate}
                  placeholder="YYYY-MM-DD"
                />
              </View>
              <View style={styles.dateCol}>
                <Text style={styles.dateLabel}>End Date (YYYY-MM-DD)</Text>
                <TextInput
                  style={styles.dateInput}
                  value={endDate}
                  onChangeText={setEndDate}
                  placeholder="YYYY-MM-DD"
                />
              </View>
            </View>
            <TouchableOpacity style={styles.applyBtn} onPress={handleApplyCustomDates}>
              <Text style={styles.applyBtnText}>Apply Filter / लागू करा</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Export Button & Range display */}
        <View style={styles.topActionsRow}>
          <View style={styles.periodBadge}>
            <Text style={styles.periodText}>📅 {startDate} ➔ {endDate}</Text>
          </View>
          <TouchableOpacity
            style={[styles.exportBtn, exporting && styles.exportBtnDisabled]}
            onPress={handleExportCsv}
            disabled={exporting}
          >
            <Text style={styles.exportBtnText}>
              {exporting ? 'Exporting...' : '📥 Export CSV'}
            </Text>
          </TouchableOpacity>
        </View>

        {error ? <ErrorMessage message={error} onRetry={() => fetchAllData(startDate, endDate)} /> : null}

        {loading && !refreshing ? (
          <LoadingIndicator message="Generating reports..." />
        ) : report ? (
          <>
            {/* Financial Overview Card */}
            <View style={styles.sectionCard}>
              <Text style={styles.cardHeaderTitle}>📊 Financial Performance Summary</Text>
              <View style={styles.grid2Col}>
                <View style={styles.statBox}>
                  <Text style={styles.statBoxLabel}>Total Milk Income</Text>
                  <Text style={[styles.statBoxVal, { color: '#16a34a' }]}>
                    ₹{Number(report.totalMilkSalesIncome || 0).toLocaleString('en-IN')}
                  </Text>
                  <Text style={styles.statBoxSub}>
                    Cash: ₹{Number(report.cashReceivedFromSales || 0).toLocaleString('en-IN')}
                  </Text>
                </View>

                <View style={styles.statBox}>
                  <Text style={styles.statBoxLabel}>Operating Expenses</Text>
                  <Text style={[styles.statBoxVal, { color: '#dc2626' }]}>
                    ₹{Number(report.totalOperatingExpenses || 0).toLocaleString('en-IN')}
                  </Text>
                  <Text style={styles.statBoxSub}>Recurring costs</Text>
                </View>

                <View style={[styles.statBox, isOperatingProfitPositive ? styles.statBoxGreen : styles.statBoxRed]}>
                  <Text style={styles.statBoxLabel}>Operating Profit</Text>
                  <Text style={[styles.statBoxVal, { color: isOperatingProfitPositive ? '#15803d' : '#b91c1c' }]}>
                    {isOperatingProfitPositive ? '+' : ''}₹{operatingProfit.toLocaleString('en-IN')}
                  </Text>
                  <Text style={styles.statBoxSub}>Income − Expenses</Text>
                </View>

                <View style={styles.statBox}>
                  <Text style={styles.statBoxLabel}>Outstanding Dues</Text>
                  <Text style={[styles.statBoxVal, { color: '#d97706' }]}>
                    ₹{Number(report.outstandingReceivables || 0).toLocaleString('en-IN')}
                  </Text>
                  <Text style={styles.statBoxSub}>Unpaid buyer credit</Text>
                </View>
              </View>
            </View>

            {/* Milk Production Breakdown */}
            <View style={styles.sectionCard}>
              <Text style={styles.cardHeaderTitle}>🥛 Milk Production & Distribution</Text>
              <View style={styles.volumeBarContainer}>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>Total Milk Produced</Text>
                  <Text style={styles.metricBold}>{Number(report.totalMilkProducedLiters || 0).toFixed(1)} L</Text>
                </View>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>Milk Sold to Buyers</Text>
                  <Text style={[styles.metricBold, { color: '#16a34a' }]}>
                    {Number(report.totalMilkSoldLiters || 0).toFixed(1)} L
                  </Text>
                </View>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>Home Consumption & Calves</Text>
                  <Text style={[styles.metricBold, { color: '#0284c7' }]}>
                    {Number(report.totalMilkUsedLiters || 0).toFixed(1)} L
                  </Text>
                </View>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>Unsold / Variance</Text>
                  <Text style={[styles.metricBold, { color: Number(report.unsoldMilkLiters) > 0 ? '#ea580c' : '#64748b' }]}>
                    {Number(report.unsoldMilkLiters || 0).toFixed(1)} L
                  </Text>
                </View>
              </View>
            </View>

            {/* Livestock Overview */}
            <View style={styles.sectionCard}>
              <Text style={styles.cardHeaderTitle}>🐄 Herd & Livestock Status</Text>
              <View style={styles.grid2Col}>
                <View style={styles.statBox}>
                  <Text style={styles.statBoxLabel}>Total Livestock</Text>
                  <Text style={styles.statBoxVal}>{dashboard?.totalAnimals || 0}</Text>
                  <Text style={styles.statBoxSub}>Registered animals</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statBoxLabel}>Milking Animals</Text>
                  <Text style={[styles.statBoxVal, { color: '#16a34a' }]}>{dashboard?.milkingAnimalsCount || 0}</Text>
                  <Text style={styles.statBoxSub}>Currently lactating</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statBoxLabel}>Cows / गायी</Text>
                  <Text style={styles.statBoxVal}>{dashboard?.totalCows || 0}</Text>
                  <Text style={styles.statBoxSub}>In herd</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statBoxLabel}>Buffaloes / म्हशी</Text>
                  <Text style={styles.statBoxVal}>{dashboard?.totalBuffaloes || 0}</Text>
                  <Text style={styles.statBoxSub}>In herd</Text>
                </View>
              </View>
            </View>

            {/* Upcoming Health Reminders */}
            {reminders && reminders.length > 0 && (
              <View style={styles.sectionCard}>
                <Text style={styles.cardHeaderTitle}>💉 Upcoming Medical Reminders (Next 30 Days)</Text>
                {reminders.slice(0, 5).map((rem) => (
                  <View key={rem.id} style={styles.reminderRow}>
                    <View>
                      <Text style={styles.reminderAnimal}>{rem.animalName} ({rem.animalTagNumber || 'No Tag'})</Text>
                      <Text style={styles.reminderDetails}>{rem.treatmentName} • {rem.medicineName || 'Booster'}</Text>
                    </View>
                    <View style={styles.reminderBadge}>
                      <Text style={styles.reminderDateText}>Due: {rem.nextDueDate}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Quick Action Links */}
            <View style={styles.linksRow}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => router.push('/dairy/profit-loss')}
              >
                <Text style={styles.actionBtnText}>📈 View Detailed Profit & Loss</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: '#0f766e' }]}
                onPress={() => router.push('/dairy/animals')}
              >
                <Text style={styles.actionBtnText}>🐄 Manage Livestock Records</Text>
              </TouchableOpacity>
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
    backgroundColor: '#f8fafc'
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 40
  },
  presetContainer: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    borderRadius: RADIUS.md,
    padding: 3,
    marginBottom: SPACING.sm
  },
  presetButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: RADIUS.sm
  },
  presetButtonActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  presetText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600'
  },
  presetTextActive: {
    color: COLORS.primary,
    fontWeight: 'bold'
  },
  customDateCard: {
    backgroundColor: '#ffffff',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  dateInputsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm
  },
  dateCol: {
    flex: 1
  },
  dateLabel: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 4,
    fontWeight: '500'
  },
  dateInput: {
    backgroundColor: '#f1f5f9',
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    fontSize: 13,
    color: '#0f172a',
    borderWidth: 1,
    borderColor: '#cbd5e1'
  },
  applyBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
    alignItems: 'center'
  },
  applyBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold'
  },
  topActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md
  },
  periodBadge: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: 20
  },
  periodText: {
    fontSize: 11,
    color: '#0369a1',
    fontWeight: '600'
  },
  exportBtn: {
    backgroundColor: '#15803d',
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.sm
  },
  exportBtnDisabled: {
    opacity: 0.6
  },
  exportBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold'
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  cardHeaderTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 6
  },
  grid2Col: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f8fafc',
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  statBoxGreen: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0'
  },
  statBoxRed: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca'
  },
  statBoxLabel: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 2
  },
  statBoxVal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a'
  },
  statBoxSub: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 2
  },
  volumeBarContainer: {
    marginTop: SPACING.xs
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc'
  },
  metricLabel: {
    fontSize: 13,
    color: '#475569'
  },
  metricBold: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a'
  },
  reminderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  reminderAnimal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a'
  },
  reminderDetails: {
    fontSize: 11,
    color: '#64748b'
  },
  reminderBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm
  },
  reminderDateText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#b45309'
  },
  linksRow: {
    gap: SPACING.sm,
    marginTop: SPACING.xs
  },
  actionBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    alignItems: 'center'
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold'
  }
});