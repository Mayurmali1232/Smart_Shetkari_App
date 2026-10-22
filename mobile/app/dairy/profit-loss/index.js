import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, TextInput } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONTS } from '../../../constants/theme';
import { dairyService } from '../../../services/dairyService';
import { useTranslation } from 'react-i18next';
import AppHeader from '../../../components/AppHeader';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorMessage from '../../../components/ErrorMessage';

export default function DairyProfitLossScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const todayStr = now.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(firstDayOfMonth);
  const [endDate, setEndDate] = useState(todayStr);
  const [selectedPreset, setSelectedPreset] = useState('month'); // 'today' | 'week' | 'month' | 'lastMonth' | 'custom'

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchReport = useCallback(async (start, end) => {
    try {
      setError('');
      const res = await dairyService.getProfitLossReport({
        startDate: start || startDate,
        endDate: end || endDate
      });
      if (res.success && res.data) {
        setReport(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load Profit & Loss report');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [startDate, endDate]);

  useFocusEffect(
    useCallback(() => {
      fetchReport(startDate, endDate);
    }, [startDate, endDate, fetchReport])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchReport(startDate, endDate);
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
      fetchReport(s, e);
    }
  };

  const handleApplyCustomDates = () => {
    setLoading(true);
    fetchReport(startDate, endDate);
  };

  const getCategoryLabel = (cat) => {
    const map = {
      FEED_FODDER: 'Animal Feed / पशुखाद्य',
      DRY_GRASS: 'Dry Grass / वाळलेला चारा',
      VETERINARY: 'Veterinary / पशुवैद्यकीय',
      MEDICINE: 'Medicine & Vaccines / औषधे',
      INSEMINATION_BREEDING: 'Breeding / कृत्रिम रेतन',
      TRANSPORTATION: 'Transport / वाहतूक',
      EQUIPMENT_MAINTENANCE: 'Equipment / साहित्य',
      INSURANCE: 'Insurance / विमा',
      ANIMAL_PURCHASE: 'Animal Purchase / जनावरे खरेदी',
      OTHER: 'Other / इतर'
    };
    return map[cat] || cat;
  };

  const operatingProfit = report?.operatingProfit != null ? Number(report.operatingProfit) : 0;
  const netCashFlow = report?.netCashFlow != null ? Number(report.netCashFlow) : 0;
  const isOperatingProfitPositive = operatingProfit >= 0;
  const isCashFlowPositive = netCashFlow >= 0;

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title={t('dairy.profitLoss') || 'Profit & Loss'}
        subtitle="Financial Analysis / नफा-तोटा विश्लेषण"
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
            <Text style={[styles.presetText, selectedPreset === 'today' && styles.presetTextActive]}>
              Today
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.presetButton, selectedPreset === 'week' && styles.presetButtonActive]}
            onPress={() => handlePresetSelect('week')}
          >
            <Text style={[styles.presetText, selectedPreset === 'week' && styles.presetTextActive]}>
              7 Days
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.presetButton, selectedPreset === 'month' && styles.presetButtonActive]}
            onPress={() => handlePresetSelect('month')}
          >
            <Text style={[styles.presetText, selectedPreset === 'month' && styles.presetTextActive]}>
              This Month
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.presetButton, selectedPreset === 'lastMonth' && styles.presetButtonActive]}
            onPress={() => handlePresetSelect('lastMonth')}
          >
            <Text style={[styles.presetText, selectedPreset === 'lastMonth' && styles.presetTextActive]}>
              Last Month
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.presetButton, selectedPreset === 'custom' && styles.presetButtonActive]}
            onPress={() => handlePresetSelect('custom')}
          >
            <Text style={[styles.presetText, selectedPreset === 'custom' && styles.presetTextActive]}>
              Custom
            </Text>
          </TouchableOpacity>
        </View>

        {/* Custom Date Inputs */}
        {selectedPreset === 'custom' && (
          <View style={styles.customDateCard}>
            <View style={styles.dateInputsRow}>
              <View style={styles.dateCol}>
                <Text style={styles.dateLabel}>From (YYYY-MM-DD)</Text>
                <TextInput
                  style={styles.dateInput}
                  value={startDate}
                  onChangeText={setStartDate}
                  placeholder="YYYY-MM-DD"
                />
              </View>
              <View style={styles.dateCol}>
                <Text style={styles.dateLabel}>To (YYYY-MM-DD)</Text>
                <TextInput
                  style={styles.dateInput}
                  value={endDate}
                  onChangeText={setEndDate}
                  placeholder="YYYY-MM-DD"
                />
              </View>
            </View>
            <TouchableOpacity style={styles.applyBtn} onPress={handleApplyCustomDates}>
              <Text style={styles.applyBtnText}>Apply Dates / लागू करा</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Selected Period Badge */}
        <View style={styles.periodBadge}>
          <Text style={styles.periodText}>
            📅 {startDate} ➔ {endDate}
          </Text>
        </View>

        {error ? <ErrorMessage message={error} onRetry={() => fetchReport(startDate, endDate)} /> : null}

        {loading && !refreshing ? (
          <LoadingIndicator message="Calculating financial metrics..." />
        ) : report ? (
          <>
            {/* Primary Hero Cards: Profit & Cash Flow */}
            <View style={styles.heroRow}>
              <View style={[styles.heroCard, isOperatingProfitPositive ? styles.heroCardGreen : styles.heroCardRed]}>
                <Text style={styles.heroTitle}>Operating Profit / नफा</Text>
                <Text style={[styles.heroValue, { color: isOperatingProfitPositive ? '#166534' : '#991b1b' }]}>
                  {isOperatingProfitPositive ? '+' : ''}₹{operatingProfit.toLocaleString('en-IN')}
                </Text>
                <Text style={styles.heroSubtitle}>Sales Income − Operating Costs</Text>
              </View>

              <View style={[styles.heroCard, isCashFlowPositive ? styles.heroCardBlue : styles.heroCardOrange]}>
                <Text style={styles.heroTitle}>Net Cash Flow / निव्वळ रोकड</Text>
                <Text style={[styles.heroValue, { color: isCashFlowPositive ? '#1e40af' : '#9a3412' }]}>
                  {isCashFlowPositive ? '+' : ''}₹{netCashFlow.toLocaleString('en-IN')}
                </Text>
                <Text style={styles.heroSubtitle}>Cash Collected − Expenses Paid</Text>
              </View>
            </View>

            {/* Income & Receivables Section */}
            <View style={styles.sectionCard}>
              <Text style={styles.cardHeaderTitle}>🥛 Milk Sales & Revenue / दुग्ध उत्पन्न</Text>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Total Recorded Sales (Accrual)</Text>
                <Text style={styles.metricValueBold}>₹{Number(report.totalMilkSalesIncome || 0).toLocaleString('en-IN')}</Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Cash Received from Buyers</Text>
                <Text style={[styles.metricValue, { color: '#16a34a' }]}>
                  ₹{Number(report.cashReceivedFromSales || 0).toLocaleString('en-IN')}
                </Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Outstanding Customer Receivables</Text>
                <Text style={[styles.metricValue, { color: '#d97706', fontWeight: 'bold' }]}>
                  ₹{Number(report.outstandingReceivables || 0).toLocaleString('en-IN')}
                </Text>
              </View>
              <Text style={styles.noteHint}>
                * Unpaid customer dues are accounted in Operating Profit but excluded from Cash Flow until collected.
              </Text>
            </View>

            {/* Expenses Breakdown */}
            <View style={styles.sectionCard}>
              <Text style={styles.cardHeaderTitle}>🌾 Expenses / खर्च</Text>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Recurring Operating Expenses</Text>
                <Text style={[styles.metricValueBold, { color: '#dc2626' }]}>
                  ₹{Number(report.totalOperatingExpenses || 0).toLocaleString('en-IN')}
                </Text>
              </View>

              {/* Category Breakdown */}
              {report.expensesByCategory && Object.keys(report.expensesByCategory).length > 0 ? (
                <View style={styles.categoryList}>
                  {Object.entries(report.expensesByCategory).map(([cat, amount]) => {
                    const amtNum = Number(amount || 0);
                    const totalOp = Number(report.totalOperatingExpenses || 1);
                    const pct = Math.min(100, Math.round((amtNum / totalOp) * 100));
                    return (
                      <View key={cat} style={styles.categoryItem}>
                        <View style={styles.categoryRow}>
                          <Text style={styles.categoryName}>{getCategoryLabel(cat)}</Text>
                          <Text style={styles.categoryAmount}>₹{amtNum.toLocaleString('en-IN')}</Text>
                        </View>
                        <View style={styles.progressTrack}>
                          <View style={[styles.progressBar, { width: `${pct}%` }]} />
                        </View>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <Text style={styles.emptyNotice}>No operating expenses recorded for this date range.</Text>
              )}

              {/* Capital Investment (Separate) */}
              <View style={styles.capitalRow}>
                <View>
                  <Text style={styles.capitalTitle}>Capital Investment (Animal Purchases)</Text>
                  <Text style={styles.capitalSub}>Kept separate from recurring operational costs</Text>
                </View>
                <Text style={styles.capitalAmount}>
                  ₹{Number(report.capitalInvestment || 0).toLocaleString('en-IN')}
                </Text>
              </View>
            </View>

            {/* Milk Volume Reconciliation */}
            <View style={styles.sectionCard}>
              <Text style={styles.cardHeaderTitle}>⚖️ Milk Volume Reconciliation / दुधाचा ताळमेळ</Text>
              <View style={styles.grid2Col}>
                <View style={styles.miniMetric}>
                  <Text style={styles.miniLabel}>Total Produced</Text>
                  <Text style={styles.miniValue}>{Number(report.totalMilkProducedLiters || 0).toFixed(1)} L</Text>
                </View>
                <View style={styles.miniMetric}>
                  <Text style={styles.miniLabel}>Sold to Buyers</Text>
                  <Text style={[styles.miniValue, { color: '#16a34a' }]}>
                    {Number(report.totalMilkSoldLiters || 0).toFixed(1)} L
                  </Text>
                </View>
                <View style={styles.miniMetric}>
                  <Text style={styles.miniLabel}>Home / Calf Usage</Text>
                  <Text style={[styles.miniValue, { color: '#0284c7' }]}>
                    {Number(report.totalMilkUsedLiters || 0).toFixed(1)} L
                  </Text>
                </View>
                <View style={styles.miniMetric}>
                  <Text style={styles.miniLabel}>Unsold / Difference</Text>
                  <Text style={[styles.miniValue, { color: Number(report.unsoldMilkLiters) > 0 ? '#d97706' : '#64748b' }]}>
                    {Number(report.unsoldMilkLiters || 0).toFixed(1)} L
                  </Text>
                </View>
              </View>
            </View>

            {/* Production by Animal Type */}
            {report.productionByAnimalType && Object.keys(report.productionByAnimalType).length > 0 && (
              <View style={styles.sectionCard}>
                <Text style={styles.cardHeaderTitle}>🐄 Production by Livestock Type / प्रकारानुसार दूध</Text>
                <View style={styles.typeRow}>
                  {Object.entries(report.productionByAnimalType).map(([type, liters]) => (
                    <View key={type} style={styles.typeCard}>
                      <Text style={styles.typeIcon}>
                        {type === 'COW' ? '🐄' : type === 'BUFFALO' ? '🐃' : type === 'GOAT' ? '🐐' : '🐑'}
                      </Text>
                      <Text style={styles.typeName}>{type}</Text>
                      <Text style={styles.typeValue}>{Number(liters || 0).toFixed(1)} Liters</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Animal-wise Profitability Breakdown */}
            <View style={styles.sectionCard}>
              <Text style={styles.cardHeaderTitle}>📋 Animal-wise Profitability / जनावरांनुसार नफा</Text>
              {report.animalProfitability && report.animalProfitability.length > 0 ? (
                <View style={styles.animalList}>
                  {report.animalProfitability.map((item) => {
                    const profitNum = Number(item.netProfit || 0);
                    const isProfit = profitNum >= 0;
                    return (
                      <TouchableOpacity
                        key={item.animalId}
                        style={styles.animalItem}
                        onPress={() => router.push(`/dairy/animals/${item.animalId}`)}
                      >
                        <View style={styles.animalTopRow}>
                          <View>
                            <Text style={styles.animalNameText}>{item.name}</Text>
                            <Text style={styles.animalTagText}>
                              🏷️ {item.tagNumber || 'No Tag'} • {item.animalType}
                            </Text>
                          </View>
                          <View style={styles.profitBadge}>
                            <Text style={[styles.profitBadgeText, { color: isProfit ? '#16a34a' : '#dc2626' }]}>
                              {isProfit ? '+' : ''}₹{profitNum.toLocaleString('en-IN')}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.animalStatsRow}>
                          <Text style={styles.animalStatItem}>
                            🥛 {Number(item.milkLiters || 0).toFixed(1)} L
                          </Text>
                          <Text style={styles.animalStatItem}>
                            💰 ₹{Number(item.milkIncome || 0).toLocaleString('en-IN')} inc.
                          </Text>
                          <Text style={styles.animalStatItem}>
                            🌾 ₹{Number(item.expenses || 0).toLocaleString('en-IN')} exp.
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : (
                <Text style={styles.emptyNotice}>No individual animal records found.</Text>
              )}
            </View>

            {/* Farmer Transparency Footnote */}
            <View style={styles.footnoteCard}>
              <Text style={styles.footnoteTitle}>ℹ️ Important Financial Note</Text>
              <Text style={styles.footnoteText}>
                Profit calculations are estimates based solely on the milk production, sales, and expense records entered. Unrecorded home feeds or unpaid dues are reflected based on farmer entries.
              </Text>
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
  periodBadge: {
    alignSelf: 'center',
    backgroundColor: '#e0f2fe',
    paddingHorizontal: SPACING.md,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: SPACING.md
  },
  periodText: {
    fontSize: 12,
    color: '#0369a1',
    fontWeight: '600'
  },
  heroRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md
  },
  heroCard: {
    flex: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  heroCardGreen: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0'
  },
  heroCardRed: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca'
  },
  heroCardBlue: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe'
  },
  heroCardOrange: {
    backgroundColor: '#fff7ed',
    borderColor: '#fed7aa'
  },
  heroTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 4
  },
  heroValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4
  },
  heroSubtitle: {
    fontSize: 10,
    color: '#64748b'
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
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc'
  },
  metricLabel: {
    fontSize: 13,
    color: '#475569'
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600'
  },
  metricValueBold: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0f172a'
  },
  noteHint: {
    fontSize: 11,
    color: '#94a3b8',
    fontStyle: 'italic',
    marginTop: 6
  },
  categoryList: {
    marginTop: SPACING.xs
  },
  categoryItem: {
    marginBottom: 8
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2
  },
  categoryName: {
    fontSize: 12,
    color: '#334155'
  },
  categoryAmount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0f172a'
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 3,
    overflow: 'hidden'
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#f97316',
    borderRadius: 3
  },
  capitalRow: {
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  capitalTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b'
  },
  capitalSub: {
    fontSize: 10,
    color: '#94a3b8'
  },
  capitalAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#475569'
  },
  grid2Col: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm
  },
  miniMetric: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f8fafc',
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    alignItems: 'center'
  },
  miniLabel: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 2
  },
  miniValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a'
  },
  typeRow: {
    flexDirection: 'row',
    gap: SPACING.sm
  },
  typeCard: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  typeIcon: {
    fontSize: 22,
    marginBottom: 4
  },
  typeName: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600'
  },
  typeValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
    marginTop: 2
  },
  animalList: {
    marginTop: SPACING.xs
  },
  animalItem: {
    backgroundColor: '#f8fafc',
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    marginBottom: SPACING.xs,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  animalTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  animalNameText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0f172a'
  },
  animalTagText: {
    fontSize: 11,
    color: '#64748b'
  },
  profitBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    backgroundColor: '#ffffff'
  },
  profitBadgeText: {
    fontSize: 13,
    fontWeight: 'bold'
  },
  animalStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0'
  },
  animalStatItem: {
    fontSize: 11,
    color: '#475569'
  },
  emptyNotice: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    paddingVertical: SPACING.sm
  },
  footnoteCard: {
    backgroundColor: '#f1f5f9',
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    borderLeftWidth: 3,
    borderLeftColor: '#94a3b8'
  },
  footnoteTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#475569',
    marginBottom: 2
  },
  footnoteText: {
    fontSize: 10,
    color: '#64748b',
    lineHeight: 14
  }
});