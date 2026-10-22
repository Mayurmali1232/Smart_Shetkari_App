import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Modal, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONTS } from '../../constants/theme';
import { tractorService } from '../../services/tractorService';
import { bookingService } from '../../services/bookingService';
import { expenseService } from '../../services/expenseService';
import { useTranslation } from 'react-i18next';
import AppHeader from '../../components/AppHeader';
import AppButton from '../../components/AppButton';
import AppInput from '../../components/AppInput';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';

export default function TractorDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { t } = useTranslation();

  const [tractor, setTractor] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' | 'expenses'

  // Status Modal
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Expense Modal
  const [expenseModalVisible, setExpenseModalVisible] = useState(false);
  const [submittingExpense, setSubmittingExpense] = useState(false);
  const [expenseCategory, setExpenseCategory] = useState('MAINTENANCE');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDesc, setExpenseDesc] = useState('');

  const loadTractorDetails = useCallback(async () => {
    try {
      setError('');
      const [tractorRes, bookingsRes, expensesRes] = await Promise.all([
        tractorService.get(id),
        bookingService.list(null, id).catch(() => ({ data: [] })),
        expenseService.listExpenses(id, null).catch(() => ({ data: [] }))
      ]);

      if (tractorRes.success && tractorRes.data) {
        setTractor(tractorRes.data);
      }
      if (bookingsRes.success && bookingsRes.data) {
        setBookings(bookingsRes.data);
      }
      if (expensesRes.success && expensesRes.data) {
        setExpenses(expensesRes.data);
      }
    } catch (e) {
      setError(e.message || 'Failed to load tractor details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    loadTractorDetails();
  }, [loadTractorDetails]);

  const onRefresh = () => {
    setRefreshing(true);
    loadTractorDetails();
  };

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      const res = await tractorService.updateStatus(id, newStatus);
      if (res.success && res.data) {
        setTractor(res.data);
        setStatusModalVisible(false);
      }
    } catch (e) {
      Alert.alert(t('common.error'), e.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddExpense = async () => {
    if (!expenseAmount || isNaN(parseFloat(expenseAmount)) || parseFloat(expenseAmount) <= 0) {
      Alert.alert(t('common.error'), 'Please enter a valid amount');
      return;
    }

    setSubmittingExpense(true);
    try {
      const res = await expenseService.recordExpense({
        tractorId: Number(id),
        category: expenseCategory,
        amount: parseFloat(expenseAmount),
        expenseDate: new Date().toISOString().split('T')[0],
        description: expenseDesc || 'Tractor maintenance'
      });

      if (res.success) {
        setExpenseModalVisible(false);
        setExpenseAmount('');
        setExpenseDesc('');
        loadTractorDetails();
      }
    } catch (e) {
      Alert.alert(t('common.error'), e.message || 'Failed to record expense');
    } finally {
      setSubmittingExpense(false);
    }
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader title={t('tractors.title')} showBack={true} fallbackRoute="/tractors" />
        <LoadingIndicator />
      </SafeAreaView>
    );
  }

  if (error && !tractor) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader title={t('tractors.title')} showBack={true} fallbackRoute="/tractors" />
        <ErrorMessage message={error} onRetry={loadTractorDetails} />
      </SafeAreaView>
    );
  }

  const isAvail = tractor?.availabilityStatus === 'AVAILABLE';
  const isBusy = tractor?.availabilityStatus === 'BUSY';

  const totalExpenseAmount = expenses.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title={tractor ? tractor.modelName : t('tractors.title')}
        subtitle={tractor?.registrationNumber ? `Reg: ${tractor.registrationNumber}` : 'Machinery Details'}
        showBack={true}
        fallbackRoute="/tractors"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        {/* Main Tractor Info Card */}
        <View style={styles.mainCard}>
          <View style={styles.topRow}>
            <View style={styles.tractorBadgeIcon}>
              <Text style={{ fontSize: 32 }}>🚜</Text>
            </View>
            <View style={{ flex: 1, marginLeft: SPACING.md }}>
              <Text style={styles.modelTitle}>{tractor.modelName}</Text>
              <Text style={styles.modelSubtitle}>
                {tractor.ownershipType} • {tractor.registrationNumber || 'No Plate'}
              </Text>
              <TouchableOpacity
                style={[
                  styles.statusPill,
                  isAvail && { backgroundColor: COLORS.primaryLight },
                  isBusy && { backgroundColor: '#fef3c7' },
                  !isAvail && !isBusy && { backgroundColor: COLORS.dangerLight }
                ]}
                onPress={() => setStatusModalVisible(true)}
              >
                <Text style={[
                  styles.statusPillText,
                  isAvail && { color: COLORS.primaryDark },
                  isBusy && { color: '#b45309' },
                  !isAvail && !isBusy && { color: COLORS.danger }
                ]}>
                  ● {tractor.availabilityStatus} (Tap to change)
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {tractor.notes ? (
            <View style={styles.notesBox}>
              <Text style={styles.notesText}>{tractor.notes}</Text>
            </View>
          ) : null}

          {/* Rates Grid */}
          <View style={styles.ratesContainer}>
            <View style={styles.rateBox}>
              <Text style={styles.rateType}>{t('tractors.hourlyRate')}</Text>
              <Text style={styles.rateNumber}>
                {tractor.defaultHourlyRate ? `₹${tractor.defaultHourlyRate}/hr` : '—'}
              </Text>
            </View>
            <View style={styles.rateBox}>
              <Text style={styles.rateType}>{t('tractors.acreRate')}</Text>
              <Text style={styles.rateNumber}>
                {tractor.defaultPerAcreRate ? `₹${tractor.defaultPerAcreRate}/ac` : '—'}
              </Text>
            </View>
            <View style={styles.rateBox}>
              <Text style={styles.rateType}>{t('tractors.dayRate')}</Text>
              <Text style={styles.rateNumber}>
                {tractor.defaultPerDayRate ? `₹${tractor.defaultPerDayRate}/day` : '—'}
              </Text>
            </View>
          </View>

          {/* Quick Action Buttons */}
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={[styles.quickBtn, { backgroundColor: COLORS.primary }]}
              onPress={() => router.push({ pathname: '/bookings/add', params: { tractorId: tractor.id } })}
              activeOpacity={0.8}
            >
              <Text style={styles.quickBtnText}>📅 {t('dashboard.bookTractor')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickBtn, { backgroundColor: '#dc2626' }]}
              onPress={() => setExpenseModalVisible(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.quickBtnText}>⛽ Add Expense</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab Selection */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'bookings' && styles.activeTabButton]}
            onPress={() => setActiveTab('bookings')}
          >
            <Text style={[styles.tabText, activeTab === 'bookings' && styles.activeTabText]}>
              Bookings & Work ({bookings.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'expenses' && styles.activeTabButton]}
            onPress={() => setActiveTab('expenses')}
          >
            <Text style={[styles.tabText, activeTab === 'expenses' && styles.activeTabText]}>
              Expenses (₹{totalExpenseAmount})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'bookings' ? (
          bookings.length === 0 ? (
            <EmptyState
              icon="📅"
              title="No Bookings Yet"
              message="Book this tractor for ploughing, harvesting or transport."
              actionLabel={t('dashboard.bookTractor')}
              onAction={() => router.push({ pathname: '/bookings/add', params: { tractorId: tractor.id } })}
            />
          ) : (
            bookings.map((booking) => (
              <TouchableOpacity
                key={booking.id}
                style={styles.bookingCard}
                onPress={() => router.push(`/bookings/${booking.id}`)}
                activeOpacity={0.7}
              >
                <View style={styles.bookingTop}>
                  <Text style={styles.customerName}>{booking.customerName}</Text>
                  <View style={[
                    styles.bookingBadge,
                    booking.bookingStatus === 'COMPLETED' && { backgroundColor: COLORS.primaryLight },
                    booking.bookingStatus === 'CONFIRMED' && { backgroundColor: '#dbeafe' },
                    booking.bookingStatus === 'IN_PROGRESS' && { backgroundColor: '#fef3c7' },
                    booking.bookingStatus === 'CANCELLED' && { backgroundColor: COLORS.dangerLight }
                  ]}>
                    <Text style={[
                      styles.bookingBadgeText,
                      booking.bookingStatus === 'COMPLETED' && { color: COLORS.primaryDark },
                      booking.bookingStatus === 'CONFIRMED' && { color: '#1d4ed8' },
                      booking.bookingStatus === 'IN_PROGRESS' && { color: '#b45309' },
                      booking.bookingStatus === 'CANCELLED' && { color: COLORS.danger }
                    ]}>
                      {booking.bookingStatus}
                    </Text>
                  </View>
                </View>

                <Text style={styles.bookingSub}>
                  📅 {booking.bookingDate} • {booking.startTime || '00:00'} - {booking.endTime || '00:00'}
                </Text>
                <Text style={styles.bookingDetail}>
                  📍 {booking.workLocation || 'Local Farm'} • {booking.customWorkType || booking.workType}
                </Text>

                <View style={styles.bookingFooter}>
                  <Text style={styles.bookingPrice}>
                    Agreed: ₹{booking.agreedAmount || booking.agreedRate || 0}
                  </Text>
                  <Text style={styles.viewDetailLink}>View Details ›</Text>
                </View>
              </TouchableOpacity>
            ))
          )
        ) : (
          expenses.length === 0 ? (
            <EmptyState
              icon="⛽"
              title="No Expenses Recorded"
              message="Record diesel, oil, servicing and repair costs for this tractor."
              actionLabel="Add Expense"
              onAction={() => setExpenseModalVisible(true)}
            />
          ) : (
            expenses.map((expense) => (
              <View key={expense.id} style={styles.expenseCard}>
                <View style={styles.expenseTop}>
                  <View>
                    <Text style={styles.expenseCat}>{expense.category}</Text>
                    <Text style={styles.expenseDate}>📅 {expense.expenseDate}</Text>
                  </View>
                  <Text style={styles.expenseAmount}>₹{expense.amount}</Text>
                </View>
                {expense.description ? (
                  <Text style={styles.expenseDesc}>{expense.description}</Text>
                ) : null}
              </View>
            ))
          )
        )}
      </ScrollView>

      {/* Status Modal */}
      <Modal visible={statusModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Change Tractor Status</Text>
            {['AVAILABLE', 'BUSY', 'UNDER_MAINTENANCE', 'INACTIVE'].map((st) => (
              <TouchableOpacity
                key={st}
                style={[
                  styles.statusOption,
                  tractor.availabilityStatus === st && styles.statusOptionActive
                ]}
                onPress={() => handleStatusChange(st)}
                disabled={updatingStatus}
              >
                <Text style={[
                  styles.statusOptionText,
                  tractor.availabilityStatus === st && styles.statusOptionTextActive
                ]}>
                  {st}
                </Text>
              </TouchableOpacity>
            ))}
            <AppButton
              title={t('common.cancel')}
              variant="outline"
              onPress={() => setStatusModalVisible(false)}
              style={{ marginTop: SPACING.md }}
            />
          </View>
        </View>
      </Modal>

      {/* Add Expense Modal */}
      <Modal visible={expenseModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Record Tractor Expense</Text>

            <Text style={styles.inputLabel}>{t('expenses.category')}</Text>
            <View style={styles.catRow}>
              {['DIESEL', 'MAINTENANCE', 'REPAIRS', 'DRIVER_WAGE', 'OTHER'].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.catPill,
                    expenseCategory === cat && styles.catPillActive
                  ]}
                  onPress={() => setExpenseCategory(cat)}
                >
                  <Text style={[
                    styles.catPillText,
                    expenseCategory === cat && styles.catPillTextActive
                  ]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <AppInput
              label="Amount (₹)"
              placeholder="e.g. 1500"
              keyboardType="numeric"
              value={expenseAmount}
              onChangeText={setExpenseAmount}
            />

            <AppInput
              label="Description / Notes"
              placeholder="e.g. 20 Litres diesel filled at HP pump"
              value={expenseDesc}
              onChangeText={setExpenseDesc}
            />

            <View style={styles.modalButtons}>
              <AppButton
                title={t('common.cancel')}
                variant="outline"
                onPress={() => setExpenseModalVisible(false)}
                style={{ flex: 1 }}
              />
              <AppButton
                title={t('common.save')}
                onPress={handleAddExpense}
                loading={submittingExpense}
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
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl
  },
  mainCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  tractorBadgeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ffedd5',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modelTitle: {
    fontSize: FONTS.large,
    fontWeight: '700',
    color: COLORS.primaryDark
  },
  modelSubtitle: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    marginTop: 2
  },
  statusPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    marginTop: SPACING.xs
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '700'
  },
  notesBox: {
    backgroundColor: COLORS.background,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    marginTop: SPACING.md
  },
  notesText: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    fontStyle: 'italic'
  },
  ratesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginTop: SPACING.md
  },
  rateBox: {
    alignItems: 'center',
    flex: 1
  },
  rateType: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 2
  },
  rateNumber: {
    fontSize: FONTS.medium,
    fontWeight: '700',
    color: COLORS.primaryDark
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md
  },
  quickBtn: {
    flex: 1,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center'
  },
  quickBtnText: {
    color: '#ffffff',
    fontSize: FONTS.medium,
    fontWeight: '700'
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: 4,
    marginBottom: SPACING.md
  },
  tabButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: RADIUS.sm
  },
  activeTabButton: {
    backgroundColor: COLORS.primaryLight
  },
  tabText: {
    fontSize: FONTS.small,
    fontWeight: '600',
    color: COLORS.textSecondary
  },
  activeTabText: {
    color: COLORS.primaryDark,
    fontWeight: '700'
  },
  bookingCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  bookingTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  customerName: {
    fontSize: FONTS.medium,
    fontWeight: '700',
    color: COLORS.textPrimary
  },
  bookingBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full
  },
  bookingBadgeText: {
    fontSize: 11,
    fontWeight: '700'
  },
  bookingSub: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    marginTop: 4
  },
  bookingDetail: {
    fontSize: FONTS.small,
    color: COLORS.textPrimary,
    marginTop: 2
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.border
  },
  bookingPrice: {
    fontSize: FONTS.medium,
    fontWeight: '700',
    color: COLORS.secondary
  },
  viewDetailLink: {
    fontSize: FONTS.small,
    fontWeight: '600',
    color: COLORS.primary
  },
  expenseCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  expenseTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  expenseCat: {
    fontSize: FONTS.medium,
    fontWeight: '700',
    color: COLORS.textPrimary
  },
  expenseDate: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    marginTop: 2
  },
  expenseAmount: {
    fontSize: FONTS.large,
    fontWeight: '700',
    color: COLORS.danger
  },
  expenseDesc: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs
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
  statusOption: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.xs
  },
  statusOptionActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight
  },
  statusOptionText: {
    fontSize: FONTS.medium,
    color: COLORS.textPrimary,
    fontWeight: '600'
  },
  statusOptionTextActive: {
    color: COLORS.primaryDark,
    fontWeight: '700'
  },
  inputLabel: {
    fontSize: FONTS.small,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs
  },
  catRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.md
  },
  catPill: {
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background
  },
  catPillActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight
  },
  catPillText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600'
  },
  catPillTextActive: {
    color: COLORS.primaryDark,
    fontWeight: '700'
  },
  modalButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md
  }
});
