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
import BottomNav from '../../components/BottomNav';

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
        Alert.alert(t('common.success') || 'यशस्वी', 'CSV अहवाल यशस्वीरीत्या डाऊनलोड झाला!');
      } else {
        await Share.share({
          title: `Smart Shetkari Report (${startDate} to ${endDate})`,
          message: csvContent
        });
      }
    } catch (e) {
      Alert.alert(t('common.error') || 'त्रुटी', e.message || 'अहवाल डाउनलोड करताना त्रुटी आली');
    } finally {
      setExporting(false);
    }
  };

  const reportCategories = [
    { title: 'दैनिक अहवाल', icon: '📅', color: '#0284C7', bg: '#E0F2FE', sub: 'रोजचा हिशोब', onPress: () => handlePresetSelect('month') },
    { title: 'मासिक अहवाल', icon: '📊', color: '#16A34A', bg: '#DCFCE7', sub: 'महिन्याची ताळेबंद', onPress: () => handlePresetSelect('lastMonth') },
    { title: 'खर्च अहवाल', icon: '🌾', color: '#EA580C', bg: '#FFEDD5', sub: 'खर्च तपशील', onPress: () => router.push('/expenses') },
    { title: 'दूध अहवाल', icon: '🥛', color: '#0D9488', bg: '#CCFBF1', sub: 'डेअरी उत्पादन', onPress: () => router.push('/dairy/reports') }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title={t('reports.title') || 'अहवाल व ताळेबंद'}
        subtitle="शेती, कामगार व ट्रॅक्टर संपूर्ण हिशोब"
        showBack={true}
        fallbackRoute="/dashboard"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primaryGreen]} />}
      >
        {/* Panel 12: 4 Report Category Cards */}
        <Text style={styles.sectionHeading}>अहवाल प्रकार / Report Modules</Text>
        <View style={styles.reportGrid}>
          {reportCategories.map((r, i) => (
            <TouchableOpacity
              key={i}
              style={styles.reportCard}
              onPress={r.onPress}
              activeOpacity={0.7}
            >
              <View style={[styles.reportIconBox, { backgroundColor: r.bg }]}>
                <Text style={styles.reportIcon}>{r.icon}</Text>
              </View>
              <Text style={styles.reportTitle}>{r.title}</Text>
              <Text style={styles.reportSub}>{r.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Preset Range Selector */}
        <Text style={styles.sectionHeading}>कालावधी निवडा / Select Period</Text>
        <View style={styles.presetRow}>
          {[
            { id: 'month', label: 'चालू महिना' },
            { id: 'lastMonth', label: 'मागील महिना' },
            { id: 'year', label: 'चालू वर्ष' }
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
            अहवाल कालावधी: <Text style={{ fontWeight: '800', color: COLORS.darkText }}>{startDate}</Text> ते <Text style={{ fontWeight: '800', color: COLORS.darkText }}>{endDate}</Text>
          </Text>
        </View>

        {error ? <ErrorMessage message={error} onRetry={() => fetchSummary(startDate, endDate)} /> : null}

        {loading && !refreshing ? (
          <LoadingIndicator message={t('common.loading') || 'अहवाल तयार होत आहे...'} />
        ) : summary ? (
          <>
            {/* Net Farm Cash Flow Card */}
            <View style={[
              styles.netProfitCard,
              (summary.netProfit || 0) >= 0 ? styles.profitBg : styles.lossBg
            ]}>
              <Text style={styles.netProfitLabel}>निव्वळ शेती नफा / निव्वळ रोकड (Net Cash Flow)</Text>
              <Text style={[
                styles.netProfitValue,
                (summary.netProfit || 0) >= 0 ? styles.profitColor : styles.lossColor
              ]}>
                {(summary.netProfit || 0) >= 0 ? `+₹${summary.netProfit}` : `-₹${Math.abs(summary.netProfit)}`}
              </Text>
              <Text style={styles.netProfitHint}>
                (एकूण जमा रक्कम - मजुरी दिलेली - ट्रॅक्टर व शेती खर्च)
              </Text>
            </View>

            {/* Income Breakdown */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>🌾 ट्रॅक्टर कामे व उत्पन्न</Text>

              <View style={styles.statRow}>
                <Text style={styles.statLabel}>एकूण केलेल्या कामांचे मूल्य</Text>
                <Text style={styles.statVal}>₹{summary.totalCompletedWorkValue || 0}</Text>
              </View>

              <View style={styles.statRow}>
                <Text style={[styles.statLabel, { color: COLORS.primaryGreen, fontWeight: '700' }]}>
                  प्रत्यक्ष मिळालेली रक्कम
                </Text>
                <Text style={[styles.statVal, { color: COLORS.primaryGreen, fontWeight: '800' }]}>
                  ₹{summary.totalTractorIncomeCollected || 0}
                </Text>
              </View>

              <View style={styles.statRow}>
                <Text style={[styles.statLabel, { color: COLORS.danger }]}>
                  शेतकऱ्यांकडून येणे बाकी
                </Text>
                <Text style={[styles.statVal, { color: COLORS.danger, fontWeight: '800' }]}>
                  ₹{summary.outstandingCustomerReceivables || 0}
                </Text>
              </View>
            </View>

            {/* Labour & Wage Breakdown */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>👥 कामगार हजेरी व मजुरी</Text>

              <View style={styles.statRow}>
                <Text style={styles.statLabel}>एकूण ठरलेली मजुरी</Text>
                <Text style={styles.statVal}>₹{summary.totalWorkerWagesAgreed || 0}</Text>
              </View>

              <View style={styles.statRow}>
                <Text style={[styles.statLabel, { color: '#0284C7', fontWeight: '700' }]}>
                  आतापर्यंत अदा केलेली मजुरी
                </Text>
                <Text style={[styles.statVal, { color: '#0284C7', fontWeight: '800' }]}>
                  ₹{summary.totalWorkerWagesPaid || 0}
                </Text>
              </View>

              <View style={styles.statRow}>
                <Text style={[styles.statLabel, { color: '#B45309' }]}>
                  कामगारांना देणे बाकी
                </Text>
                <Text style={[styles.statVal, { color: '#B45309', fontWeight: '800' }]}>
                  ₹{summary.outstandingWorkerPayables || 0}
                </Text>
              </View>
            </View>

            {/* Tractor Expenses Breakdown */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>⛽ ट्रॅक्टर व यंत्रसामग्री खर्च</Text>

              <View style={styles.statRow}>
                <Text style={styles.statLabel}>इंधन, सर्व्हिसिंग व दुरुस्ती</Text>
                <Text style={[styles.statVal, { color: COLORS.danger, fontWeight: '800' }]}>
                  ₹{summary.totalTractorExpenses || 0}
                </Text>
              </View>
            </View>

            {/* Export CSV Button */}
            <View style={styles.exportContainer}>
              <AppButton
                title={exporting ? 'अहवाल तयार होत आहे...' : '📥 संपूर्ण CSV अहवाल डाउनलोड करा'}
                onPress={handleExportCsv}
                loading={exporting}
                style={styles.exportBtn}
              />
            </View>
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
  sectionHeading: {
    fontSize: FONTS.medium + 1,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: SPACING.xs + 2,
    marginTop: SPACING.xs
  },
  reportGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md
  },
  reportCard: {
    width: '48.5%',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: '#E8F0E9',
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    alignItems: 'center'
  },
  reportIconBox: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs + 2
  },
  reportIcon: {
    fontSize: 24
  },
  reportTitle: {
    fontSize: FONTS.medium,
    fontWeight: '700',
    color: COLORS.darkText,
    textAlign: 'center'
  },
  reportSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
    textAlign: 'center'
  },
  presetRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.xs + 2
  },
  presetBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border
  },
  presetBtnActive: {
    backgroundColor: COLORS.lightGreen,
    borderColor: COLORS.primaryGreen
  },
  presetText: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    fontWeight: '600'
  },
  presetTextActive: {
    color: COLORS.darkText,
    fontWeight: '800'
  },
  dateLabelRow: {
    paddingVertical: SPACING.xs,
    marginBottom: SPACING.sm
  },
  dateRangeText: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    textAlign: 'center'
  },
  netProfitCard: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    alignItems: 'center',
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4
  },
  profitBg: {
    backgroundColor: COLORS.lightGreen,
    borderColor: '#A5D6A7'
  },
  lossBg: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5'
  },
  netProfitLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  netProfitValue: {
    fontSize: 28,
    fontWeight: '800',
    marginVertical: 4
  },
  profitColor: {
    color: COLORS.primaryGreen
  },
  lossColor: {
    color: COLORS.danger
  },
  netProfitHint: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'center'
  },
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: '#E8F0E9',
    elevation: 1,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3
  },
  sectionTitle: {
    fontSize: FONTS.medium + 1,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: SPACING.sm
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F1'
  },
  statLabel: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary
  },
  statVal: {
    fontSize: FONTS.medium,
    fontWeight: '700',
    color: COLORS.darkText
  },
  exportContainer: {
    marginTop: SPACING.md,
    marginBottom: SPACING.lg
  },
  exportBtn: {
    backgroundColor: COLORS.primaryGreen,
    borderRadius: RADIUS.md
  }
});