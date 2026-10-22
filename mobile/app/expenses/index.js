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

const EXPENSE_CATEGORIES = [
  { id: 'ALL', label: 'All Expenses' },
  { id: 'DIESEL', label: 'Diesel / Fuel' },
  { id: 'MAINTENANCE', label: 'Servicing & Maint.' },
  { id: 'REPAIRS', label: 'Repairs' },
  { id: 'DRIVER_WAGE', label: 'Driver Wage' },
  { id: 'INSURANCE', label: 'Insurance & Tax' },
  { id: 'OTHER', label: 'Other' }
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
      Alert.alert(t('common.error'), 'Please enter a valid expense amount');
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
        Alert.alert(t('common.success'), 'Expense recorded successfully');
        loadAll();
      }
    } catch (e) {
      Alert.alert(t('common.error'), e.message || 'Failed to record expense');
    } finally {
      setSubmitting(false);
    }
  };

  const totalExpense = expenses.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const totalIncome = payments.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const netCashFlow = totalIncome - totalExpense;

  const renderExpenseItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.categoryTitle}>{item.category}</Text>
          <Text style={styles.subtext}>
            🚜 {item.tractorModel || 'General Farm'} • 📅 {item.expenseDate}
          </Text>
        </View>
        <Text style={styles.expenseAmount}>-₹{item.amount}</Text>
      </View>
      {item.description ? (
        <Text style={styles.descText}>{item.description}</Text>
      ) : null}
    </View>
  );

  const renderPaymentItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.incomeTitle}>{item.customerName || 'Customer Payment'}</Text>
          <Text style={styles.subtext}>
            💳 {item.paymentMethod} • 📅 {item.paymentDate} {item.referenceNumber ? `• Ref: ${item.referenceNumber}` : ''}
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
        title={t('expenses.title')}
        subtitle="Farm operations cash flow"
        showBack={true}
      />

      {/* Summary KPI Cards */}
      <View style={styles.kpiContainer}>
        <View style={[styles.kpiCard, { backgroundColor: '#dcfce7' }]}>
          <Text style={styles.kpiLabel}>Total Income</Text>
          <Text style={[styles.kpiValue, { color: COLORS.secondary }]}>₹{totalIncome}</Text>
        </View>
        <View style={[styles.kpiCard, { backgroundColor: '#fee2e2' }]}>
          <Text style={styles.kpiLabel}>Total Expenses</Text>
          <Text style={[styles.kpiValue, { color: COLORS.danger }]}>₹{totalExpense}</Text>
        </View>
        <View style={[styles.kpiCard, { backgroundColor: '#eff6ff' }]}>
          <Text style={styles.kpiLabel}>Net Flow</Text>
          <Text style={[styles.kpiValue, { color: netCashFlow >= 0 ? COLORS.secondary : COLORS.danger }]}>
            {netCashFlow >= 0 ? `+₹${netCashFlow}` : `-₹${Math.abs(netCashFlow)}`}
          </Text>
        </View>
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'expenses' && styles.tabActive]}
          onPress={() => setActiveTab('expenses')}
        >
          <Text style={[styles.tabText, activeTab === 'expenses' && styles.tabTextActive]}>
            Expenses ({expenses.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'income' && styles.tabActive]}
          onPress={() => setActiveTab('income')}
        >
          <Text style={[styles.tabText, activeTab === 'income' && styles.tabTextActive]}>
            Income & Payments ({payments.length})
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
                  {c.label}
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
          <LoadingIndicator />
        ) : activeTab === 'expenses' ? (
          expenses.length === 0 ? (
            <EmptyState
              icon="⛽"
              title="No Expenses"
              message="Record diesel, maintenance, driver wages and repairs."
              actionLabel="Add Expense"
              onAction={() => setModalVisible(true)}
            />
          ) : (
            <FlatList
              data={expenses}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderExpenseItem}
              contentContainerStyle={styles.listPadding}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
            />
          )
        ) : (
          payments.length === 0 ? (
            <EmptyState
              icon="💰"
              title="No Income Recorded"
              message="Record customer payments when completing tractor jobs."
              actionLabel="Go to Bookings"
              onAction={() => router.push('/bookings')}
            />
          ) : (
            <FlatList
              data={payments}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderPaymentItem}
              contentContainerStyle={styles.listPadding}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
            />
          )
        )}
      </View>

      {/* Footer Add Button */}
      <View style={styles.footer}>
        <AppButton
          title="+ Add Expense"
          onPress={() => setModalVisible(true)}
          style={{ backgroundColor: COLORS.danger }}
        />
      </View>

      {/* Add Expense Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Record Farm Expense</Text>

            {tractors.length > 0 && (
              <>
                <Text style={styles.fieldLabel}>Select Tractor (Optional)</Text>
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

            <Text style={styles.fieldLabel}>Expense Category *</Text>
            <View style={styles.catGrid}>
              {['DIESEL', 'MAINTENANCE', 'REPAIRS', 'DRIVER_WAGE', 'INSURANCE', 'OTHER'].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.catChip,
                    category === cat && styles.catChipActive
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[
                    styles.catChipText,
                    category === cat && styles.catChipTextActive
                  ]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <AppInput
              label="Amount (₹) *"
              placeholder="e.g. 2500"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />

            <AppInput
              label="Date (YYYY-MM-DD)"
              value={expenseDate}
              onChangeText={setExpenseDate}
            />

            <AppInput
              label="Description / Notes"
              placeholder="e.g. Engine oil change & filter replace"
              value={description}
              onChangeText={setDescription}
            />

            <View style={styles.modalActions}>
              <AppButton
                title={t('common.cancel')}
                variant="outline"
                onPress={() => setModalVisible(false)}
                style={{ flex: 1 }}
              />
              <AppButton
                title="Save Expense"
                onPress={handleAddExpense}
                loading={submitting}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  kpiContainer: {
    flexDirection: 'row',
    padding: SPACING.md,
    gap: SPACING.sm,
    backgroundColor: COLORS.surface
  },
  kpiCard: {
    flex: 1,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    alignItems: 'center'
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 2
  },
  kpiValue: {
    fontSize: FONTS.medium,
    fontWeight: '700'
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm + 2,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent'
  },
  tabActive: {
    borderBottomColor: COLORS.primary
  },
  tabText: {
    fontSize: FONTS.small + 1,
    fontWeight: '600',
    color: COLORS.textSecondary
  },
  tabTextActive: {
    color: COLORS.primaryDark,
    fontWeight: '700'
  },
  filtersWrapper: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  filterList: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.xs
  },
  filterChip: {
    paddingHorizontal: SPACING.sm + 4,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    marginRight: SPACING.xs
  },
  filterChipActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary
  },
  filterChipText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600'
  },
  filterChipTextActive: {
    color: COLORS.primaryDark,
    fontWeight: '700'
  },
  content: {
    flex: 1
  },
  listPadding: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  categoryTitle: {
    fontSize: FONTS.medium,
    fontWeight: '700',
    color: COLORS.textPrimary
  },
  incomeTitle: {
    fontSize: FONTS.medium,
    fontWeight: '700',
    color: COLORS.secondary
  },
  subtext: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    marginTop: 2
  },
  expenseAmount: {
    fontSize: FONTS.large,
    fontWeight: '700',
    color: COLORS.danger
  },
  incomeAmount: {
    fontSize: FONTS.large,
    fontWeight: '700',
    color: COLORS.secondary
  },
  descText: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    fontStyle: 'italic'
  },
  footer: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: SPACING.lg
  },
  modalContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg
  },
  modalTitle: {
    fontSize: FONTS.title,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginBottom: SPACING.md
  },
  fieldLabel: {
    fontSize: FONTS.small,
    fontWeight: '600',
    color: COLORS.textPrimary,
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
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight
  },
  tracPillText: {
    fontSize: 12,
    color: COLORS.textSecondary
  },
  tracPillTextActive: {
    color: COLORS.primaryDark,
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
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background
  },
  catChipActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary
  },
  catChipText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600'
  },
  catChipTextActive: {
    color: COLORS.primaryDark,
    fontWeight: '700'
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md
  }
});
