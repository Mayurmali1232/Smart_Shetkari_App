import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Modal, Alert, ScrollView } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONTS } from '../../constants/theme';
import { expenseService } from '../../services/expenseService';
import { tractorService } from '../../services/tractorService';
import { useTranslation } from 'react-i18next';
import AppHeader from '../../components/AppHeader';
import AppButton from '../../components/AppButton';
import AppInput from '../../components/AppInput';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import BottomNav from '../../components/BottomNav';

const EXPENSE_CATEGORIES = [
  { id: 'ALL', label: 'सर्व खर्च', icon: '📋' },
  { id: 'DIESEL', label: 'इंधन / डिझेल', icon: '⛽' },
  { id: 'FERTILIZER', label: 'खते / औषधे', icon: '🌾' },
  { id: 'SEEDS', label: 'बियाणे', icon: '🌱' },
  { id: 'MAINTENANCE', label: 'सर्व्हिसिंग', icon: '🔧' },
  { id: 'REPAIRS', label: 'दुरुस्ती', icon: '🛠️' },
  { id: 'DRIVER_WAGE', label: 'चालक मजुरी', icon: '👨‍🌾' },
  { id: 'INSURANCE', label: 'विमा व कर', icon: '📄' },
  { id: 'OTHER', label: 'इतर खर्च', icon: '📦' }
];

export default function ExpensesScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState('expenses'); // 'expenses' | 'income'
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [expenses, setExpenses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [tractors, setTractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Add Expense Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTractorId, setSelectedTractorId] = useState(null);
  const [category, setCategory] = useState('DIESEL');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');

  const loadAll = useCallback(async () => {
    try {
      setError('');
      const categoryParam = selectedCategory === 'ALL' ? null : selectedCategory;
      const [expRes, payRes, tracRes] = await Promise.all([
        expenseService.listExpenses(null, categoryParam),
        expenseService.listPayments(null).catch(() => ({ data: [] })),
        tractorService.list().catch(() => ({ data: [] }))
      ]);

      if (expRes.success && expRes.data) {
        setExpenses(expRes.data);
      }
      if (payRes.success && payRes.data) {
        setPayments(payRes.data);
      }
      if (tracRes.success && tracRes.data) {
        setTractors(tracRes.data);
        if (tracRes.data.length > 0 && !selectedTractorId) {
          setSelectedTractorId(tracRes.data[0].id);
        }
      }
    } catch (e) {
      setError(e.message || 'Failed to load finances');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory, selectedTractorId]);

  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, [loadAll])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadAll();
  };

  const handleAddExpense = async () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Alert.alert(t('common.error') || 'त्रुटी', 'कृपया खर्चाची योग्य रक्कम प्रविष्ट करा');
      return;
    }

    setSubmitting(true);
    try {
      const res = await expenseService.recordExpense({
        tractorId: selectedTractorId,
        category,
        amount: parseFloat(amount),
        expenseDate,
        description: description.trim() || null
      });

      if (res.success) {
        setModalVisible(false);
        setAmount('');
        setDescription('');
        Alert.alert(t('common.success') || 'यशस्वी', 'खर्च यशस्वीरीत्या नोंदवला गेला');
        loadAll();
      }
    } catch (e) {
      Alert.alert(t('common.error') || 'त्रुटी', e.message || 'खर्च नोंदवण्यात त्रुटी आली');
    } finally {
      setSubmitting(false);
    }
  };

  const totalExpense = expenses.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const totalIncome = payments.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const netCashFlow = totalIncome - totalExpense;

  const getCategoryMeta = (cat) => {
    const found = EXPENSE_CATEGORIES.find(c => c.id === cat);
    return found || { icon: '📦', label: cat || 'खर्च' };
  };

  const renderExpenseItem = ({ item }) => {
    const meta = getCategoryMeta(item.category);
    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.iconCircle}>
            <Text style={styles.categoryIcon}>{meta.icon}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.categoryTitle}>{meta.label}</Text>
            <Text style={styles.subtext}>
              {item.tractorModel ? `🚜 ${item.tractorModel} • ` : ''}📅 {item.expenseDate}
            </Text>
          </View>
          <Text style={styles.expenseAmount}>-₹{item.amount}</Text>
        </View>
        {item.description ? (
          <Text style={styles.descText}>{item.description}</Text>
        ) : null}
      </View>
    );
  };

  const renderPaymentItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={[styles.iconCircle, { backgroundColor: COLORS.lightGreen }]}>
          <Text style={styles.categoryIcon}>💰</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.incomeTitle}>{item.customerName || 'शेतकरी जमा रक्कम'}</Text>
          <Text style={styles.subtext}>
            💳 {item.paymentMethod || 'रोख'} • 📅 {item.paymentDate} {item.referenceNumber ? `• Ref: ${item.referenceNumber}` : ''}
          </Text>
        </View>
        <Text style={styles.incomeAmount}>+₹{item.amount}</Text>
      </View>
      {item.notes ? (
        <Text style={styles.descText}>{item.notes}</Text>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title={t('expenses.title') || 'खर्च व उत्पन्न व्यवस्थापन'}
        subtitle="शेती व ट्रॅक्टर हिशोब"
        showBack={true}
        fallbackRoute="/dashboard"
      />

      {/* Top Action Bar matching Panel 10 */}
      <View style={styles.topActionBar}>
        <View style={styles.balanceInfo}>
          <Text style={styles.balanceLabel}>निव्वळ शिल्लक (Net Balance)</Text>
          <Text style={[styles.balanceValue, { color: netCashFlow >= 0 ? COLORS.darkText : COLORS.danger }]}>
            {netCashFlow >= 0 ? `+₹${netCashFlow}` : `-₹${Math.abs(netCashFlow)}`}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addExpenseBtn}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.addExpenseBtnText}>+ खर्च नोंदवा</Text>
        </TouchableOpacity>
      </View>

      {/* Summary KPI Cards */}
      <View style={styles.kpiContainer}>
        <View style={[styles.kpiCard, { backgroundColor: COLORS.lightGreen }]}>
          <Text style={styles.kpiLabel}>एकूण उत्पन्न</Text>
          <Text style={[styles.kpiValue, { color: COLORS.primaryGreen }]}>₹{totalIncome}</Text>
        </View>
        <View style={[styles.kpiCard, { backgroundColor: '#FEE2E2' }]}>
          <Text style={styles.kpiLabel}>एकूण खर्च</Text>
          <Text style={[styles.kpiValue, { color: COLORS.danger }]}>₹{totalExpense}</Text>
        </View>
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'expenses' && styles.tabActive]}
          onPress={() => setActiveTab('expenses')}
        >
          <Text style={[styles.tabText, activeTab === 'expenses' && styles.tabTextActive]}>
            खर्च ({expenses.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'income' && styles.tabActive]}
          onPress={() => setActiveTab('income')}
        >
          <Text style={[styles.tabText, activeTab === 'income' && styles.tabTextActive]}>
            जमा उत्पन्न ({payments.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Category Pills (Expenses Only) */}
      {activeTab === 'expenses' && (
        <View style={styles.filtersWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterList}>
            {EXPENSE_CATEGORIES.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={[
                  styles.filterChip,
                  selectedCategory === c.id && styles.filterChipActive
                ]}
                onPress={() => setSelectedCategory(c.id)}
              >
                <Text style={[
                  styles.filterChipText,
                  selectedCategory === c.id && styles.filterChipTextActive
                ]}>
                  {c.icon} {c.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Main List */}
      <View style={styles.content}>
        {error ? <ErrorMessage message={error} onRetry={loadAll} /> : null}

        {loading && !refreshing ? (
          <LoadingIndicator message={t('common.loading') || 'हिशोब लोड होत आहे...'} />
        ) : activeTab === 'expenses' ? (
          expenses.length === 0 ? (
            <EmptyState
              icon="⛽"
              title="कोणताही खर्च नाही"
              message="डिझेल, खत, बियाणे, मजुरी किंवा दुरुस्ती खर्चाची नोंद करा."
              actionTitle="+ खर्च नोंदवा"
              onAction={() => setModalVisible(true)}
            />
          ) : (
            <FlatList
              data={expenses}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderExpenseItem}
              contentContainerStyle={styles.listPadding}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primaryGreen]} />}
            />
          )
        ) : (
          payments.length === 0 ? (
            <EmptyState
              icon="💰"
              title="कोणतेही उत्पन्न नाही"
              message="ट्रॅक्टर काम पूर्ण झाल्यावर शेतकऱ्याकडून मिळालेली रक्कम येथे दिसेल."
              actionTitle="बुकिंग पहा"
              onAction={() => router.push('/bookings')}
            />
          ) : (
            <FlatList
              data={payments}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderPaymentItem}
              contentContainerStyle={styles.listPadding}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primaryGreen]} />}
            />
          )
        )}
      </View>

      {/* Add Expense Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>नवीन खर्च नोंदवा</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            {tractors.length > 0 && (
              <>
                <Text style={styles.fieldLabel}>ट्रॅक्टर निवडा (ऐच्छिक)</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.sm }}>
                  {tractors.map((t) => (
                    <TouchableOpacity
                      key={t.id}
                      style={[
                        styles.tracPill,
                        selectedTractorId === t.id && styles.tracPillActive
                      ]}
                      onPress={() => setSelectedTractorId(t.id)}
                    >
                      <Text style={[
                        styles.tracPillText,
                        selectedTractorId === t.id && styles.tracPillTextActive
                      ]}>
                        🚜 {t.modelName}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}

            <Text style={styles.fieldLabel}>खर्चाचा प्रकार *</Text>
            <View style={styles.catGrid}>
              {EXPENSE_CATEGORIES.filter(c => c.id !== 'ALL').map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[
                    styles.catChip,
                    category === c.id && styles.catChipActive
                  ]}
                  onPress={() => setCategory(c.id)}
                >
                  <Text style={[
                    styles.catChipText,
                    category === c.id && styles.catChipTextActive
                  ]}>
                    {c.icon} {c.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <AppInput
              label="खर्च रक्कम (₹) *"
              placeholder="उदा. 2500"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />

            <AppInput
              label="तारीख (YYYY-MM-DD)"
              value={expenseDate}
              onChangeText={setExpenseDate}
            />

            <AppInput
              label="तपशील / टीप"
              placeholder="उदा. 50 लिटर डिझेल भरले"
              value={description}
              onChangeText={setDescription}
            />

            <View style={styles.modalActions}>
              <AppButton
                title="रद्द करा"
                variant="outline"
                onPress={() => setModalVisible(false)}
                style={{ flex: 1 }}
              />
              <AppButton
                title={submitting ? "जतन होत आहे..." : "जतन करा"}
                onPress={handleAddExpense}
                loading={submitting}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>

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
  topActionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  balanceInfo: {
    flex: 1
  },
  balanceLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  balanceValue: {
    fontSize: FONTS.large,
    fontWeight: '800',
    marginTop: 2
  },
  addExpenseBtn: {
    backgroundColor: COLORS.primaryGreen,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primaryGreen,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2
  },
  addExpenseBtnText: {
    color: '#ffffff',
    fontSize: FONTS.medium,
    fontWeight: '700'
  },
  kpiContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    gap: SPACING.sm
  },
  kpiCard: {
    flex: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.sm + 2,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8F0E9'
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary
  },
  kpiValue: {
    fontSize: FONTS.large,
    fontWeight: '800',
    marginTop: 2
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xs,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent'
  },
  tabActive: {
    borderBottomColor: COLORS.primaryGreen
  },
  tabText: {
    fontSize: FONTS.medium,
    fontWeight: '600',
    color: COLORS.textSecondary
  },
  tabTextActive: {
    color: COLORS.darkText,
    fontWeight: '800'
  },
  filtersWrapper: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.xs
  },
  filterList: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.xs
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: COLORS.border
  },
  filterChipActive: {
    backgroundColor: COLORS.lightGreen,
    borderColor: COLORS.primaryGreen
  },
  filterChipText: {
    fontSize: FONTS.small,
    fontWeight: '600',
    color: COLORS.textSecondary
  },
  filterChipTextActive: {
    color: COLORS.darkText,
    fontWeight: '700'
  },
  content: {
    flex: 1
  },
  listPadding: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: '#E8F0E9',
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: '#FFF3E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    borderWidth: 1,
    borderColor: '#FFE0B2'
  },
  categoryIcon: {
    fontSize: 22
  },
  categoryTitle: {
    fontSize: FONTS.medium + 1,
    fontWeight: '700',
    color: COLORS.darkText
  },
  incomeTitle: {
    fontSize: FONTS.medium + 1,
    fontWeight: '700',
    color: COLORS.darkText
  },
  subtext: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    marginTop: 2
  },
  expenseAmount: {
    fontSize: FONTS.large,
    fontWeight: '800',
    color: COLORS.danger
  },
  incomeAmount: {
    fontSize: FONTS.large,
    fontWeight: '800',
    color: COLORS.primaryGreen
  },
  descText: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: '#F0F4F1'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: SPACING.lg
  },
  modalContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    maxHeight: '90%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md
  },
  modalTitle: {
    fontSize: FONTS.title,
    fontWeight: '800',
    color: COLORS.darkText
  },
  closeBtn: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textSecondary,
    padding: 4
  },
  fieldLabel: {
    fontSize: FONTS.small,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: SPACING.xs
  },
  tracPill: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.xs,
    backgroundColor: COLORS.background
  },
  tracPillActive: {
    borderColor: COLORS.primaryGreen,
    backgroundColor: COLORS.lightGreen
  },
  tracPillText: {
    fontSize: 12,
    color: COLORS.textSecondary
  },
  tracPillTextActive: {
    color: COLORS.darkText,
    fontWeight: '700'
  },
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.md
  },
  catChip: {
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background
  },
  catChipActive: {
    backgroundColor: COLORS.lightGreen,
    borderColor: COLORS.primaryGreen
  },
  catChipText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600'
  },
  catChipTextActive: {
    color: COLORS.darkText,
    fontWeight: '700'
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md
  }
});