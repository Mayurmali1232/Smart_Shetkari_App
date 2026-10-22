import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Modal, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONTS } from '../../constants/theme';
import { bookingService } from '../../services/bookingService';
import { expenseService } from '../../services/expenseService';
import { useTranslation } from 'react-i18next';
import AppHeader from '../../components/AppHeader';
import AppButton from '../../components/AppButton';
import AppInput from '../../components/AppInput';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorMessage from '../../components/ErrorMessage';

const PAYMENT_METHODS = [
  { id: 'CASH', label: 'Cash' },
  { id: 'UPI', label: 'UPI / GPay' },
  { id: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { id: 'CHEQUE', label: 'Cheque' }
];

export default function BookingDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { t } = useTranslation();

  const [booking, setBooking] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Complete Work Modal
  const [completeModalVisible, setCompleteModalVisible] = useState(false);
  const [submittingWork, setSubmittingWork] = useState(false);
  const [actualHours, setActualHours] = useState('');
  const [actualArea, setActualArea] = useState('');
  const [completionSummary, setCompletionSummary] = useState('');
  const [completionFinalAmount, setCompletionFinalAmount] = useState('');

  // Record Payment Modal
  const [payModalVisible, setPayModalVisible] = useState(false);
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('CASH');
  const [payRef, setPayRef] = useState('');
  const [payNotes, setPayNotes] = useState('');

  const loadData = useCallback(async () => {
    try {
      setError('');
      const [bRes, pRes] = await Promise.all([
        bookingService.get(id),
        expenseService.listPayments(id).catch(() => ({ data: [] }))
      ]);

      if (bRes.success && bRes.data) {
        setBooking(bRes.data);
        setCompletionFinalAmount((bRes.data.finalAgreedAmount || 0).toString());
        if (bRes.data.estimatedArea) {
          setActualArea(bRes.data.estimatedArea.toString());
        }
      }
      if (pRes.success && pRes.data) {
        setPayments(pRes.data);
      }
    } catch (e) {
      setError(e.message || 'Failed to load booking details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const res = await bookingService.updateStatus(id, newStatus);
      if (res.success && res.data) {
        setBooking(res.data);
        Alert.alert(t('common.success'), `Booking marked as ${newStatus}`);
      }
    } catch (e) {
      Alert.alert(t('common.error'), e.message || 'Failed to update status');
    }
  };

  const handleCompleteWork = async () => {
    if (!completionFinalAmount || isNaN(parseFloat(completionFinalAmount))) {
      Alert.alert(t('common.error'), 'Please enter the final agreed amount');
      return;
    }

    setSubmittingWork(true);
    try {
      const res = await bookingService.completeWork(id, {
        actualHours: actualHours ? parseFloat(actualHours) : null,
        actualAreaAcres: actualArea ? parseFloat(actualArea) : null,
        workSummary: completionSummary.trim() || 'Work completed as agreed',
        finalAgreedAmount: parseFloat(completionFinalAmount),
        completedDate: new Date().toISOString().split('T')[0]
      });

      if (res.success && res.data) {
        setBooking(res.data);
        setCompleteModalVisible(false);
        Alert.alert(t('common.success'), 'Work marked as completed successfully!');
        loadData();
      }
    } catch (e) {
      Alert.alert(t('common.error'), e.message || 'Failed to complete work');
    } finally {
      setSubmittingWork(false);
    }
  };

  const handleRecordPayment = async () => {
    if (!payAmount || isNaN(parseFloat(payAmount)) || parseFloat(payAmount) <= 0) {
      Alert.alert(t('common.error'), 'Please enter a valid payment amount');
      return;
    }

    setSubmittingPayment(true);
    try {
      const res = await expenseService.recordPayment({
        bookingId: Number(id),
        amount: parseFloat(payAmount),
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: payMethod,
        referenceNumber: payRef.trim() || null,
        notes: payNotes.trim() || null
      });

      if (res.success) {
        setPayModalVisible(false);
        setPayAmount('');
        setPayRef('');
        setPayNotes('');
        Alert.alert(t('common.success'), 'Payment received and recorded!');
        loadData();
      }
    } catch (e) {
      Alert.alert(t('common.error'), e.message || 'Failed to record payment');
    } finally {
      setSubmittingPayment(false);
    }
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader title="Booking Details" showBack={true} fallbackRoute="/bookings" />
        <LoadingIndicator />
      </SafeAreaView>
    );
  }

  if (error && !booking) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader title="Booking Details" showBack={true} fallbackRoute="/bookings" />
        <ErrorMessage message={error} onRetry={loadData} />
      </SafeAreaView>
    );
  }

  const isCompleted = booking?.status === 'COMPLETED';
  const isCancelled = booking?.status === 'CANCELLED';

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title="Booking Details"
        subtitle={booking?.customerName ? `Client: ${booking.customerName}` : undefined}
        showBack={true}
        fallbackRoute="/bookings"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        {/* Main Status & Customer Card */}
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.customerTitle}>{booking.customerName}</Text>
              {booking.customerMobile ? (
                <Text style={styles.subtext}>📞 {booking.customerMobile}</Text>
              ) : null}
            </View>
            <View style={[
              styles.statusBadge,
              booking.status === 'COMPLETED' && { backgroundColor: COLORS.primaryLight },
              booking.status === 'CONFIRMED' && { backgroundColor: '#dbeafe' },
              booking.status === 'IN_PROGRESS' && { backgroundColor: '#fef3c7' },
              booking.status === 'CANCELLED' && { backgroundColor: COLORS.dangerLight }
            ]}>
              <Text style={[
                styles.statusBadgeText,
                booking.status === 'COMPLETED' && { color: COLORS.primaryDark },
                booking.status === 'CONFIRMED' && { color: '#1d4ed8' },
                booking.status === 'IN_PROGRESS' && { color: '#b45309' },
                booking.status === 'CANCELLED' && { color: COLORS.danger }
              ]}>
                {booking.status}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoGrid}>
            <View style={styles.infoCol}>
              <Text style={styles.label}>Tractor</Text>
              <Text style={styles.value}>🚜 {booking.tractorModel}</Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.label}>Work Type</Text>
              <Text style={styles.value}>🌱 {booking.customWorkType || booking.workType}</Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.label}>Date & Time</Text>
              <Text style={styles.value}>📅 {booking.workDate} {booking.startTime || ''}</Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.label}>Location</Text>
              <Text style={styles.value}>📍 {booking.workLocation || 'Local Farm'}</Text>
            </View>
          </View>

          {booking.notes ? (
            <View style={styles.notesBox}>
              <Text style={styles.notesText}>Notes: {booking.notes}</Text>
            </View>
          ) : null}
        </View>

        {/* Financial Card */}
        <View style={styles.financialCard}>
          <Text style={styles.cardTitle}>Financial Summary</Text>
          <View style={styles.financeRow}>
            <View style={styles.financeItem}>
              <Text style={styles.financeLabel}>Agreed Amount</Text>
              <Text style={styles.financeValue}>₹{booking.finalAgreedAmount || 0}</Text>
            </View>
            <View style={styles.financeItem}>
              <Text style={styles.financeLabel}>Total Received</Text>
              <Text style={[styles.financeValue, { color: COLORS.secondary }]}>₹{booking.totalReceived || 0}</Text>
            </View>
            <View style={styles.financeItem}>
              <Text style={styles.financeLabel}>Remaining Due</Text>
              <Text style={[styles.financeValue, { color: COLORS.danger }]}>₹{booking.outstandingBalance || 0}</Text>
            </View>
          </View>

          {/* Record Payment Button */}
          {!isCancelled && (
            <TouchableOpacity
              style={styles.payBtn}
              onPress={() => setPayModalVisible(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.payBtnText}>💰 Record Customer Payment</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Work Completion Info if Completed */}
        {isCompleted && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Completed Work Details</Text>
            <View style={styles.infoGrid}>
              <View style={styles.infoCol}>
                <Text style={styles.label}>Actual Hours</Text>
                <Text style={styles.value}>{booking.actualHours ? `${booking.actualHours} hrs` : '—'}</Text>
              </View>
              <View style={styles.infoCol}>
                <Text style={styles.label}>Actual Area</Text>
                <Text style={styles.value}>{booking.actualAreaAcres ? `${booking.actualAreaAcres} acres` : '—'}</Text>
              </View>
              <View style={styles.infoCol}>
                <Text style={styles.label}>Completed Date</Text>
                <Text style={styles.value}>📅 {booking.completedDate || booking.workDate}</Text>
              </View>
            </View>
            {booking.workSummary ? (
              <View style={styles.notesBox}>
                <Text style={styles.notesText}>{booking.workSummary}</Text>
              </View>
            ) : null}
          </View>
        )}

        {/* Status Actions */}
        {!isCompleted && !isCancelled && (
          <View style={styles.actionsCard}>
            <Text style={styles.cardTitle}>Booking Actions</Text>
            <View style={styles.actionButtons}>
              <AppButton
                title="Complete & Log Work"
                onPress={() => setCompleteModalVisible(true)}
                style={{ backgroundColor: COLORS.secondary }}
              />
              {booking.status === 'CONFIRMED' && (
                <AppButton
                  title="Mark In Progress"
                  variant="outline"
                  onPress={() => handleStatusChange('IN_PROGRESS')}
                />
              )}
              <AppButton
                title="Cancel Booking"
                variant="outline"
                onPress={() => handleStatusChange('CANCELLED')}
                style={{ borderColor: COLORS.danger }}
              />
            </View>
          </View>
        )}

        {/* Payments History */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment Transactions ({payments.length})</Text>
          {payments.length === 0 ? (
            <Text style={styles.emptyText}>No payments recorded yet for this booking.</Text>
          ) : (
            payments.map((p) => (
              <View key={p.id} style={styles.paymentItem}>
                <View>
                  <Text style={styles.paymentMethod}>{p.paymentMethod}</Text>
                  <Text style={styles.paymentDate}>📅 {p.paymentDate} {p.referenceNumber ? `• Ref: ${p.referenceNumber}` : ''}</Text>
                </View>
                <Text style={styles.paymentAmount}>+₹{p.amount}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Complete Work Modal */}
      <Modal visible={completeModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Complete Tractor Work</Text>

            <AppInput
              label="Actual Hours Worked (Optional)"
              placeholder="e.g. 4.5"
              keyboardType="numeric"
              value={actualHours}
              onChangeText={setActualHours}
            />

            <AppInput
              label="Actual Area Covered in Acres (Optional)"
              placeholder="e.g. 3.0"
              keyboardType="numeric"
              value={actualArea}
              onChangeText={setActualArea}
            />

            <AppInput
              label="Final Agreed Amount (₹) *"
              placeholder="Enter final mutually agreed amount"
              keyboardType="numeric"
              value={completionFinalAmount}
              onChangeText={setCompletionFinalAmount}
            />

            <AppInput
              label="Work Summary / Notes"
              placeholder="e.g. Completed plowing in lower plot"
              value={completionSummary}
              onChangeText={setCompletionSummary}
            />

            <View style={styles.modalButtons}>
              <AppButton
                title={t('common.cancel')}
                variant="outline"
                onPress={() => setCompleteModalVisible(false)}
                style={{ flex: 1 }}
              />
              <AppButton
                title="Save Completion"
                onPress={handleCompleteWork}
                loading={submittingWork}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Record Payment Modal */}
      <Modal visible={payModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Record Customer Payment</Text>

            <AppInput
              label={`Amount Received (₹) * (Remaining: ₹${booking.outstandingBalance || 0})`}
              placeholder="e.g. 2000"
              keyboardType="numeric"
              value={payAmount}
              onChangeText={setPayAmount}
            />

            <Text style={styles.label}>Payment Method</Text>
            <View style={styles.methodRow}>
              {PAYMENT_METHODS.map((m) => (
                <TouchableOpacity
                  key={m.id}
                  style={[
                    styles.methodChip,
                    payMethod === m.id && styles.methodChipActive
                  ]}
                  onPress={() => setPayMethod(m.id)}
                >
                  <Text style={[
                    styles.methodChipText,
                    payMethod === m.id && styles.methodChipTextActive
                  ]}>
                    {m.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <AppInput
              label="Reference / Transaction ID (Optional)"
              placeholder="UPI Ref / Cheque No."
              value={payRef}
              onChangeText={setPayRef}
            />

            <AppInput
              label="Notes (Optional)"
              placeholder="e.g. Part payment received via PhonePe"
              value={payNotes}
              onChangeText={setPayNotes}
            />

            <View style={styles.modalButtons}>
              <AppButton
                title={t('common.cancel')}
                variant="outline"
                onPress={() => setPayModalVisible(false)}
                style={{ flex: 1 }}
              />
              <AppButton
                title="Save Payment"
                onPress={handleRecordPayment}
                loading={submittingPayment}
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
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  customerTitle: {
    fontSize: FONTS.large,
    fontWeight: '700',
    color: COLORS.primaryDark
  },
  subtext: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    marginTop: 2
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 3,
    borderRadius: RADIUS.full
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700'
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md
  },
  infoCol: {
    width: '45%'
  },
  label: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 2
  },
  value: {
    fontSize: FONTS.small + 1,
    fontWeight: '600',
    color: COLORS.textPrimary
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
  financialCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#bbf7d0'
  },
  cardTitle: {
    fontSize: FONTS.medium + 1,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginBottom: SPACING.sm
  },
  financeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md
  },
  financeItem: {
    alignItems: 'center',
    flex: 1
  },
  financeLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 2
  },
  financeValue: {
    fontSize: FONTS.medium,
    fontWeight: '700',
    color: COLORS.primaryDark
  },
  payBtn: {
    backgroundColor: COLORS.secondary,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.md,
    alignItems: 'center'
  },
  payBtnText: {
    color: '#ffffff',
    fontSize: FONTS.medium,
    fontWeight: '700'
  },
  actionsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  actionButtons: {
    gap: SPACING.sm
  },
  emptyText: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    paddingVertical: SPACING.xs
  },
  paymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  paymentMethod: {
    fontSize: FONTS.small + 1,
    fontWeight: '600',
    color: COLORS.textPrimary
  },
  paymentDate: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2
  },
  paymentAmount: {
    fontSize: FONTS.medium,
    fontWeight: '700',
    color: COLORS.secondary
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
  methodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.md
  },
  methodChip: {
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background
  },
  methodChipActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary
  },
  methodChipText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600'
  },
  methodChipTextActive: {
    color: COLORS.primaryDark,
    fontWeight: '700'
  },
  modalButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md
  }
});
