import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Alert, ScrollView, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONTS } from '../../constants/theme';
import { wageService } from '../../services/wageService';
import { employeeService } from '../../services/employeeService';
import { useTranslation } from 'react-i18next';
import AppHeader from '../../components/AppHeader';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';

export default function WageManagementScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [balances, setBalances] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Calculate & Record Wage Modal state
  const [calcModalVisible, setCalcModalVisible] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [startDate, setStartDate] = useState(new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [calcResult, setCalcResult] = useState(null);
  const [finalAgreedWage, setFinalAgreedWage] = useState('');
  const [wageNotes, setWageNotes] = useState('');
  const [calcLoading, setCalcLoading] = useState(false);
  const [autoRecordAtt, setAutoRecordAtt] = useState(true);

  // Wage Records History Modal state
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [historyEmp, setHistoryEmp] = useState(null);
  const [workerRecords, setWorkerRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [deletingRecordId, setDeletingRecordId] = useState(null);

  // Pay Modal state
  const [payModalVisible, setPayModalVisible] = useState(false);
  const [payEmpId, setPayEmpId] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('CASH');
  const [payRef, setPayRef] = useState('');
  const [payNotes, setPayNotes] = useState('');
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [payLoading, setPayLoading] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setError('');
      const [balRes, empRes, payRes] = await Promise.all([
        wageService.getBalances(),
        employeeService.list('ACTIVE'),
        wageService.getPayments()
      ]);

      if (balRes.success && balRes.data) setBalances(balRes.data);
      if (empRes.success && empRes.data) setEmployees(empRes.data);
      if (payRes.success && payRes.data) setPayments(payRes.data);
    } catch (e) {
      setError(e.message || 'Failed to load wage data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Helper: select worker in Calculate Modal and intelligently pick start date
  const handleSelectCalcWorker = (emp) => {
    if (!emp) return;
    const empIdStr = emp.id.toString();
    setSelectedEmpId(empIdStr);

    const empBal = balances.find((b) => b.employeeId?.toString() === empIdStr);
    if (empBal && empBal.latestWageEndDate) {
      // Intelligently start from day after the latest settled wage end date!
      const nextDate = new Date(new Date(empBal.latestWageEndDate).getTime() + 86400000)
        .toISOString().split('T')[0];
      setStartDate(nextDate);
    } else if (emp.joiningDate) {
      setStartDate(emp.joiningDate);
    } else {
      setStartDate(new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]);
    }

    setEndDate(new Date().toISOString().split('T')[0]);
    setCalcResult(null);
    setFinalAgreedWage('');
    setAutoRecordAtt(true);
  };

  // Helper: Open Calculate Modal pre-populated with worker and dates
  const openCalcModal = (empId) => {
    let targetEmp = null;
    if (empId) {
      targetEmp = employees.find((e) => e.id.toString() === empId.toString());
    }
    if (!targetEmp && employees.length > 0) {
      targetEmp = employees[0];
    }
    if (targetEmp) {
      handleSelectCalcWorker(targetEmp);
    } else {
      setStartDate(new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]);
      setEndDate(new Date().toISOString().split('T')[0]);
      setCalcResult(null);
      setFinalAgreedWage('');
    }
    setWageNotes('');
    setAutoRecordAtt(true);
    setCalcModalVisible(true);
  };

  // Helper: Open History Modal to view and delete previous wage records
  const openHistoryModal = async (empId) => {
    const emp = employees.find((e) => e.id.toString() === empId.toString())
      || balances.find((b) => b.employeeId?.toString() === empId.toString());
    setHistoryEmp(emp);
    setHistoryModalVisible(true);
    setLoadingRecords(true);
    try {
      const res = await wageService.getRecords(empId);
      if (res.success && res.data) {
        setWorkerRecords(res.data);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to load wage records');
    } finally {
      setLoadingRecords(false);
    }
  };

  const handleDeleteRecord = async (recordId) => {
    Alert.alert(
      'Delete Wage Record',
      'Are you sure you want to delete this wage record? The outstanding balance will be reduced accordingly.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeletingRecordId(recordId);
            try {
              const res = await wageService.deleteRecord(recordId);
              if (res.success) {
                setWorkerRecords((prev) => prev.filter((r) => r.id !== recordId));
                loadData();
              }
            } catch (e) {
              Alert.alert('Error', e.message || 'Failed to delete record');
            } finally {
              setDeletingRecordId(null);
            }
          }
        }
      ]
    );
  };

  // Step 1: Calculate suggested wage based on attendance or date range
  const handleCalculate = async () => {
    if (!selectedEmpId) {
      Alert.alert('Selection Required', 'Please select a worker');
      return;
    }
    setCalcLoading(true);
    try {
      const res = await wageService.calculateSuggested({
        employeeId: Number(selectedEmpId),
        startDate,
        endDate
      });
      if (res.success && res.data) {
        setCalcResult(res.data);
        setFinalAgreedWage(res.data.suggestedWage != null ? res.data.suggestedWage.toString() : '0');
      }
    } catch (e) {
      Alert.alert(t('common.error'), e.message || 'Failed to calculate wage');
    } finally {
      setCalcLoading(false);
    }
  };

  // Step 2: Save Wage Record with manual override and auto-attendance support
  const handleSaveWageRecord = async () => {
    const finalAmount = parseFloat(finalAgreedWage);
    if (isNaN(finalAmount) || finalAmount < 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid agreed wage amount');
      return;
    }

    setCalcLoading(true);
    try {
      const res = await wageService.createRecord({
        employeeId: Number(selectedEmpId),
        startDate,
        endDate,
        suggestedWage: calcResult.suggestedWage,
        finalAgreedWage: finalAmount,
        notes: wageNotes.trim() || undefined,
        autoRecordAttendance: autoRecordAtt
      });

      if (res.success) {
        const msg = calcResult?.alreadyCalculated
          ? 'Wage record updated successfully! Duplicate was prevented.'
          : 'Wage record saved. Outstanding balance updated.';
        Alert.alert(t('common.success'), msg);
        setCalcModalVisible(false);
        setCalcResult(null);
        loadData();
      }
    } catch (e) {
      Alert.alert(t('common.error'), e.message || 'Failed to save wage record');
    } finally {
      setCalcLoading(false);
    }
  };

  // Record Payment
  const handleRecordPayment = async () => {
    const amount = parseFloat(payAmount);
    if (!payEmpId) {
      Alert.alert('Worker Required', 'Please select a worker');
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a payment amount greater than 0');
      return;
    }

    setPayLoading(true);
    try {
      const res = await wageService.recordPayment({
        employeeId: Number(payEmpId),
        amount,
        paymentDate: payDate,
        paymentMethod: payMethod,
        referenceNumber: payRef.trim() || undefined,
        notes: payNotes.trim() || undefined
      });

      if (res.success) {
        Alert.alert(t('common.success'), `Payment of ₹${amount} recorded successfully.`);
        setPayModalVisible(false);
        setPayAmount('');
        setPayRef('');
        setPayNotes('');
        loadData();
      }
    } catch (e) {
      Alert.alert(t('common.error'), e.message || 'Failed to record payment');
    } finally {
      setPayLoading(false);
    }
  };

  const handleSelectPayWorker = (empId) => {
    if (!empId) {
      setPayEmpId('');
      setPayAmount('');
      return;
    }
    const idStr = empId.toString();
    setPayEmpId(idStr);
    const workerBal = balances.find((b) => b.employeeId?.toString() === idStr);
    if (workerBal && workerBal.outstandingBalance > 0) {
      setPayAmount(workerBal.outstandingBalance.toString());
    } else {
      setPayAmount('');
    }
  };

  const openPayForWorker = (empId, balance) => {
    const idStr = empId.toString();
    setPayEmpId(idStr);
    const workerBal = balances.find((b) => b.employeeId?.toString() === idStr);
    const amountToFill = (balance !== undefined && balance !== null) ? balance : workerBal?.outstandingBalance;
    setPayAmount(amountToFill > 0 ? amountToFill.toString() : '');
    setPayModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title={t('wages.title')} showBack showLanguage={false} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        {/* Action Buttons Header */}
        <View style={styles.topActions}>
          <AppButton
            title={`🧮 ${t('wages.calculateSuggested')}`}
            onPress={() => openCalcModal()}
            style={{ flex: 1, marginRight: SPACING.xs }}
          />
          <AppButton
            title={`💸 ${t('wages.recordPayment')}`}
            variant="secondary"
            onPress={() => {
              const defaultEmpId = employees[0]?.id?.toString() || '';
              handleSelectPayWorker(defaultEmpId);
              setPayModalVisible(true);
            }}
            style={{ flex: 1, marginLeft: SPACING.xs }}
          />
        </View>

        {error ? <ErrorMessage message={error} onRetry={loadData} /> : null}

        {/* Worker Balances Summary */}
        <Text style={styles.sectionTitle}>{t('wages.balancesTitle')}</Text>

        {loading && !refreshing ? (
          <LoadingIndicator message={t('common.loading')} />
        ) : balances.length === 0 ? (
          <EmptyState
            title={t('wages.title')}
            message="No wage balances found. Calculate wages from attendance records."
            actionTitle={t('wages.calculateSuggested')}
            onAction={() => openCalcModal()}
          />
        ) : (
          balances.map((b) => (
            <View key={b.employeeId} style={styles.balanceCard}>
              <View style={styles.balanceHeader}>
                <View style={{ flex: 1, marginRight: SPACING.xs }}>
                  <Text style={styles.workerName}>{b.employeeName}</Text>
                  {b.mobileNumber && <Text style={styles.workerSub}>📞 {b.mobileNumber}</Text>}
                  {b.latestWageEndDate && (
                    <Text style={styles.workerLastSettled}>
                      📅 Settled up to: {b.latestWageEndDate}
                    </Text>
                  )}
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  {b.totalWageRecordsCount > 0 && (
                    <TouchableOpacity
                      style={styles.historyBtn}
                      onPress={() => openHistoryModal(b.employeeId)}
                    >
                      <Text style={styles.historyBtnText}>📜 ({b.totalWageRecordsCount})</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.quickCalcBtn}
                    onPress={() => openCalcModal(b.employeeId)}
                  >
                    <Text style={styles.quickCalcText}>Calc 🧮</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickPayBtn}
                    onPress={() => openPayForWorker(b.employeeId, b.outstandingBalance)}
                  >
                    <Text style={styles.quickPayText}>Pay ₹</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.balanceRow}>
                <View style={styles.balanceCol}>
                  <Text style={styles.colLabel}>{t('wages.finalAgreedWage')}</Text>
                  <Text style={styles.colVal}>₹{b.totalAgreedWages || 0}</Text>
                </View>
                <View style={styles.balanceCol}>
                  <Text style={styles.colLabel}>{t('employees.totalPaid')}</Text>
                  <Text style={[styles.colVal, { color: COLORS.primary }]}>₹{b.totalPaid || 0}</Text>
                </View>
                <View style={styles.balanceCol}>
                  <Text style={styles.colLabel}>{t('employees.balanceDue')}</Text>
                  <Text style={[styles.colVal, { color: (b.outstandingBalance > 0) ? COLORS.accent : COLORS.primary }]}>
                    ₹{b.outstandingBalance || 0}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}

        {/* Recent Payment Transactions */}
        <Text style={[styles.sectionTitle, { marginTop: SPACING.lg }]}>Recent Payments</Text>
        {payments.length === 0 ? (
          <Text style={styles.emptyText}>No payments recorded yet.</Text>
        ) : (
          payments.slice(0, 10).map((p) => (
            <View key={p.id} style={styles.payCard}>
              <View style={styles.payInfo}>
                <Text style={styles.payName}>{p.employeeName}</Text>
                <Text style={styles.paySub}>
                  📅 {p.paymentDate} • {p.paymentMethod} {p.referenceNumber ? `• Ref: ${p.referenceNumber}` : ''}
                </Text>
              </View>
              <Text style={styles.payAmount}>₹{p.amount}</Text>
            </View>
          ))
        )}
      </ScrollView>

      {/* Calculate & Settle Wage Modal */}
      <Modal visible={calcModalVisible} animationType="slide" transparent onRequestClose={() => setCalcModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🧮 {t('wages.calculateSuggested')}</Text>
              <TouchableOpacity onPress={() => setCalcModalVisible(false)}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Select Worker */}
              <Text style={styles.fieldLabel}>{t('employees.workerName')}</Text>
              <View style={styles.empSelectRow}>
                {employees.map((emp) => {
                  const isSelected = selectedEmpId === emp.id.toString();
                  return (
                    <TouchableOpacity
                      key={emp.id}
                      style={[styles.empPill, isSelected && styles.empPillActive]}
                      onPress={() => handleSelectCalcWorker(emp)}
                    >
                      <Text style={[styles.empPillText, isSelected && styles.empPillTextActive]}>
                        {emp.fullName}
                      </Text>
                      {emp.joiningDate ? (
                        <Text style={[styles.empPillSub, isSelected && styles.empPillSubActive]}>
                          Since {emp.joiningDate}
                        </Text>
                      ) : null}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Selected Worker Info Banner */}
              {(() => {
                const curEmp = employees.find((e) => e.id.toString() === selectedEmpId);
                const curBal = balances.find((b) => b.employeeId?.toString() === selectedEmpId);
                if (!curEmp && !curBal) return null;
                const name = curEmp?.fullName || curBal?.employeeName;
                const joining = curEmp?.joiningDate;
                const rate = curEmp?.dailyWage;
                const latestEnd = curBal?.latestWageEndDate;
                const latestAmt = curBal?.latestWageAmount;
                const isAllSettled = latestEnd && latestEnd >= endDate;

                return (
                  <View style={[styles.selectedWorkerBanner, isAllSettled && styles.selectedWorkerBannerSettled]}>
                    <Text style={styles.selectedWorkerBannerText}>
                      👤 <Text style={{ fontWeight: '700' }}>{name}</Text>
                      {joining ? ` • Joined: ${joining}` : ''}
                      {rate ? ` • ₹${rate}/day` : ''}
                    </Text>
                    {latestEnd ? (
                      <View style={{ marginTop: 4 }}>
                        <Text style={[styles.settledNoteText, isAllSettled && { color: '#047857' }]}>
                          {isAllSettled ? '✅ ' : 'ℹ️ '}
                          Last settled: {curBal.latestWageStartDate || 'start'} to {latestEnd} (₹{latestAmt || 0})
                        </Text>
                        {isAllSettled && (
                          <TouchableOpacity
                            style={styles.recalcChip}
                            onPress={() => {
                              if (curBal.latestWageStartDate) setStartDate(curBal.latestWageStartDate);
                              setEndDate(latestEnd);
                              setCalcResult(null);
                            }}
                          >
                            <Text style={styles.recalcChipText}>
                              🔄 Edit/Recalculate last period ({curBal.latestWageStartDate} to {latestEnd})
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    ) : null}
                  </View>
                );
              })()}

              <View style={styles.row}>
                <AppInput
                  label={t('wages.startDate')}
                  value={startDate}
                  onChangeText={setStartDate}
                  placeholder="YYYY-MM-DD"
                  containerStyle={{ flex: 1, marginRight: SPACING.xs }}
                />
                <AppInput
                  label={t('wages.endDate')}
                  value={endDate}
                  onChangeText={setEndDate}
                  placeholder="YYYY-MM-DD"
                  containerStyle={{ flex: 1, marginLeft: SPACING.xs }}
                />
              </View>

              <AppButton
                title={t('wages.calculateSuggested')}
                onPress={handleCalculate}
                loading={calcLoading}
                variant="secondary"
              />

              {calcResult && (
                <View style={styles.calcResultBox}>
                  {calcResult.alreadyCalculated && (
                    <View style={styles.alreadyCalculatedBanner}>
                      <Text style={styles.alreadyCalculatedTitle}>
                        ⚠️ Period Already Calculated
                      </Text>
                      <Text style={styles.alreadyCalculatedDesc}>
                        A wage record for {calcResult.existingStartDate} to {calcResult.existingEndDate} already exists with Agreed Wage: ₹{calcResult.existingAgreedWage}. Confirming will UPDATE this record without duplicating the amount.
                      </Text>
                    </View>
                  )}

                  <Text style={styles.calcResultTitle}>Attendance Calculation</Text>

                  {calcResult.hasAttendanceRecords ? (
                    <View style={styles.calcAttendanceOk}>
                      <Text style={styles.calcDetail}>
                        Full Days: {calcResult.presentDays} • Half Days: {calcResult.halfDays} ({calcResult.totalDaysWorked} worked days)
                      </Text>
                      <Text style={styles.suggestedWageText}>
                        {t('wages.suggestedWage')}: ₹{calcResult.suggestedWage}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.calcNoAttendanceBox}>
                      <Text style={styles.calcNoAttendanceTitle}>
                        ℹ️ No attendance records logged between {startDate} and {endDate}
                      </Text>
                      <Text style={styles.calcNoAttendanceDesc}>
                        Auto-calculated from work period: {calcResult.calendarDays} days × ₹{calcResult.defaultDailyWage}/day = ₹{calcResult.suggestedWage}
                      </Text>
                      <Text style={styles.suggestedWageText}>
                        {t('wages.suggestedWage')}: ₹{calcResult.suggestedWage}
                      </Text>
                    </View>
                  )}

                  {/* Manual Override section */}
                  <View style={styles.overrideBox}>
                    <Text style={styles.overrideLabel}>✏️ {t('wages.manualOverride')}:</Text>
                    <Text style={styles.overrideHint}>{t('wages.manualOverrideHint')}</Text>
                    <AppInput
                      label={t('wages.finalAgreedWage')}
                      value={finalAgreedWage}
                      onChangeText={setFinalAgreedWage}
                      keyboardType="numeric"
                      leftIcon={<Text style={{ fontSize: 16 }}>₹</Text>}
                    />
                  </View>

                  {!calcResult.hasAttendanceRecords && (
                    <TouchableOpacity
                      style={styles.autoAttRow}
                      onPress={() => setAutoRecordAtt(!autoRecordAtt)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.checkboxEmoji}>{autoRecordAtt ? '☑️' : '⬜'}</Text>
                      <Text style={styles.autoAttText}>
                        Auto-record daily attendance as Present ({calcResult.calendarDays} days) in worker register
                      </Text>
                    </TouchableOpacity>
                  )}

                  <AppInput
                    label={t('common.notes')}
                    placeholder="e.g. Calculated from joining date per mutual agreement"
                    value={wageNotes}
                    onChangeText={setWageNotes}
                  />

                  <AppButton
                    title="Confirm & Save Wage Record"
                    onPress={handleSaveWageRecord}
                    loading={calcLoading}
                    style={{ marginTop: SPACING.sm }}
                  />
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Pay Worker Modal */}
      <Modal visible={payModalVisible} animationType="slide" transparent onRequestClose={() => setPayModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>💸 {t('wages.recordPayment')}</Text>
              <TouchableOpacity onPress={() => setPayModalVisible(false)}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Select Worker */}
              <Text style={styles.fieldLabel}>{t('employees.workerName')}</Text>
              <View style={styles.empSelectRow}>
                {employees.map((emp) => {
                  const empBal = balances.find((b) => b.employeeId?.toString() === emp.id.toString());
                  const hasDue = empBal && empBal.outstandingBalance > 0;
                  const isSelected = payEmpId === emp.id.toString();

                  return (
                    <TouchableOpacity
                      key={emp.id}
                      style={[
                        styles.empPill,
                        isSelected && styles.empPillActive,
                        hasDue && !isSelected && styles.empPillWithDue
                      ]}
                      onPress={() => handleSelectPayWorker(emp.id)}
                    >
                      <Text style={[styles.empPillText, isSelected && styles.empPillTextActive]}>
                        {emp.fullName}
                      </Text>
                      {empBal && (
                        <Text style={[
                          styles.empPillDueBadge,
                          isSelected && styles.empPillDueBadgeActive,
                          !hasDue && styles.empPillZeroDue
                        ]}>
                          {hasDue ? ` ₹${empBal.outstandingBalance}` : ' ₹0'}
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Outstanding Balance Banner for Selected Worker */}
              {(() => {
                const currentBal = balances.find((b) => b.employeeId?.toString() === payEmpId);
                const currentEmp = employees.find((e) => e.id.toString() === payEmpId);
                if (!currentBal && !currentEmp) return null;

                const due = currentBal ? currentBal.outstandingBalance : 0;
                const totalAgreed = currentBal ? currentBal.totalAgreedWages : 0;
                const totalPaid = currentBal ? currentBal.totalPaid : 0;

                return (
                  <View style={[styles.workerBalanceCard, due > 0 ? styles.balanceCardDue : styles.balanceCardZero]}>
                    <View style={styles.balanceCardTop}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.balanceCardWorkerName}>
                          👤 {currentEmp?.fullName || currentBal?.employeeName}
                        </Text>
                        <Text style={styles.balanceCardStats}>
                          Total Agreed: ₹{totalAgreed} • Already Paid: ₹{totalPaid}
                        </Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.balanceCardDueLabel}>Total Balance Due</Text>
                        <Text style={[styles.balanceCardDueAmount, due > 0 ? { color: COLORS.accent } : { color: COLORS.primary }]}>
                          ₹{due}
                        </Text>
                      </View>
                    </View>

                    {due > 0 ? (
                      <View style={styles.quickFillRow}>
                        <Text style={styles.quickFillLabel}>⚡ Quick Amount:</Text>
                        <TouchableOpacity
                          style={styles.quickFillChip}
                          onPress={() => setPayAmount(due.toString())}
                        >
                          <Text style={styles.quickFillChipText}>Pay Full (₹{due})</Text>
                        </TouchableOpacity>
                        {due >= 200 && (
                          <TouchableOpacity
                            style={styles.quickFillChip}
                            onPress={() => setPayAmount(Math.round(due / 2).toString())}
                          >
                            <Text style={styles.quickFillChipText}>Pay Half (₹{Math.round(due / 2)})</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    ) : (
                      <Text style={styles.allPaidText}>
                        ✅ All wages are currently fully paid for this worker (Balance: ₹0).
                      </Text>
                    )}
                  </View>
                );
              })()}

              <AppInput
                label={t('common.amount') + ' (₹)'}
                placeholder="Enter payment amount"
                value={payAmount}
                onChangeText={setPayAmount}
                keyboardType="numeric"
                leftIcon={<Text style={{ fontSize: 16 }}>₹</Text>}
              />

              {/* Payment Method */}
              <Text style={styles.fieldLabel}>{t('wages.paymentMethod')}</Text>
              <View style={styles.segmentedRow}>
                {['CASH', 'UPI', 'BANK_TRANSFER', 'CHEQUE'].map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[styles.segmentBtn, payMethod === m && styles.segmentBtnActive]}
                    onPress={() => setPayMethod(m)}
                  >
                    <Text style={[styles.segmentText, payMethod === m && styles.segmentTextActive]}>
                      {m === 'CASH' ? 'Cash' : m === 'UPI' ? 'UPI' : m === 'BANK_TRANSFER' ? 'Bank' : 'Cheque'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <AppInput
                label={t('wages.referenceNumber')}
                placeholder="e.g. UPI Ref / Cheque No."
                value={payRef}
                onChangeText={setPayRef}
              />

              <AppInput
                label={t('common.date')}
                value={payDate}
                onChangeText={setPayDate}
                placeholder="YYYY-MM-DD"
              />

              <AppInput
                label={t('common.notes')}
                placeholder="e.g. Advance payment"
                value={payNotes}
                onChangeText={setPayNotes}
              />

              <AppButton
                title={t('wages.recordPayment')}
                onPress={handleRecordPayment}
                loading={payLoading}
                style={{ marginTop: SPACING.md }}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Wage Records History Modal */}
      <Modal visible={historyModalVisible} animationType="slide" transparent onRequestClose={() => setHistoryModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>📜 Wage Records History</Text>
                <Text style={styles.modalSubtitle}>
                  {historyEmp?.fullName || historyEmp?.employeeName || 'Worker'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setHistoryModalVisible(false)}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              {loadingRecords ? (
                <LoadingIndicator message="Loading records..." />
              ) : workerRecords.length === 0 ? (
                <Text style={styles.emptyText}>No wage records found for this worker.</Text>
              ) : (
                workerRecords.map((r) => (
                  <View key={r.id} style={styles.recordItem}>
                    <View style={{ flex: 1, marginRight: SPACING.xs }}>
                      <Text style={styles.recordDates}>
                        📅 {r.startDate} to {r.endDate}
                      </Text>
                      <Text style={styles.recordSub}>
                        {r.totalDaysWorked} days worked • Suggested: ₹{r.suggestedWage}
                      </Text>
                      {r.notes ? <Text style={styles.recordNotes}>Note: {r.notes}</Text> : null}
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 6 }}>
                      <Text style={styles.recordAmount}>₹{r.finalAgreedWage}</Text>
                      <TouchableOpacity
                        style={styles.deleteRecordBtn}
                        onPress={() => handleDeleteRecord(r.id)}
                        disabled={deletingRecordId === r.id}
                      >
                        <Text style={styles.deleteRecordText}>
                          {deletingRecordId === r.id ? 'Deleting...' : '🗑️ Delete'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
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
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl
  },
  topActions: {
    flexDirection: 'row',
    marginBottom: SPACING.md
  },
  sectionTitle: {
    fontSize: FONTS.large,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginBottom: SPACING.sm
  },
  balanceCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  workerName: {
    fontSize: FONTS.large,
    fontWeight: '700',
    color: COLORS.textPrimary
  },
  workerSub: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    marginTop: 2
  },
  quickPayBtn: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#86efac'
  },
  quickPayText: {
    fontSize: FONTS.small,
    fontWeight: '700',
    color: COLORS.primaryDark
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.sm
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  balanceCol: {
    alignItems: 'center'
  },
  colLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  colVal: {
    fontSize: FONTS.medium,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 2
  },
  payCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.xs,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border
  },
  payInfo: {
    flex: 1
  },
  payName: {
    fontSize: FONTS.medium,
    fontWeight: '700',
    color: COLORS.textPrimary
  },
  paySub: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    marginTop: 2
  },
  payAmount: {
    fontSize: FONTS.large,
    fontWeight: '800',
    color: COLORS.primaryDark
  },
  emptyText: {
    color: COLORS.textSecondary,
    padding: SPACING.md
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  modalCard: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    padding: SPACING.lg,
    maxHeight: '85%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  modalTitle: {
    fontSize: FONTS.large,
    fontWeight: '800',
    color: COLORS.primaryDark
  },
  closeText: {
    fontSize: 22,
    color: COLORS.textSecondary
  },
  fieldLabel: {
    fontSize: FONTS.regular,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs
  },
  empSelectRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.md
  },
  empPill: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: COLORS.border
  },
  empPillActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary
  },
  empPillText: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    fontWeight: '600'
  },
  empPillTextActive: {
    color: COLORS.primaryDark,
    fontWeight: '700'
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  calcResultBox: {
    backgroundColor: '#f8fafc',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  calcResultTitle: {
    fontSize: FONTS.medium,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs
  },
  calcDetail: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm
  },
  suggestedWageText: {
    fontSize: FONTS.large,
    fontWeight: '800',
    color: '#2563eb',
    marginBottom: SPACING.sm
  },
  overrideBox: {
    backgroundColor: '#fef3c7',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: '#fde68a'
  },
  overrideLabel: {
    fontSize: FONTS.medium,
    fontWeight: '700',
    color: '#92400e'
  },
  overrideHint: {
    fontSize: FONTS.small,
    color: '#b45309',
    marginBottom: SPACING.xs
  },
  segmentedRow: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: RADIUS.md,
    padding: 3,
    marginBottom: SPACING.md
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: RADIUS.sm
  },
  segmentBtnActive: {
    backgroundColor: COLORS.surface,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  segmentText: {
    fontSize: FONTS.small,
    fontWeight: '600',
    color: COLORS.textSecondary
  },
  segmentTextActive: {
    color: COLORS.primary,
    fontWeight: '700'
  },
  empPillWithDue: {
    borderColor: '#f59e0b',
    backgroundColor: '#fffbeb'
  },
  empPillDueBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#b45309',
    marginLeft: 4
  },
  empPillDueBadgeActive: {
    color: COLORS.primaryDark
  },
  empPillZeroDue: {
    color: '#94a3b8'
  },
  workerBalanceCard: {
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1.5
  },
  balanceCardDue: {
    backgroundColor: '#f0fdf4',
    borderColor: '#86efac'
  },
  balanceCardZero: {
    backgroundColor: '#f8fafc',
    borderColor: COLORS.border
  },
  balanceCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  balanceCardWorkerName: {
    fontSize: FONTS.medium,
    fontWeight: '700',
    color: COLORS.primaryDark
  },
  balanceCardStats: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2
  },
  balanceCardDueLabel: {
    fontSize: 11,
    color: COLORS.textSecondary
  },
  balanceCardDueAmount: {
    fontSize: 22,
    fontWeight: '800'
  },
  quickFillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    paddingTop: SPACING.xs + 2,
    borderTopWidth: 1,
    borderTopColor: '#dcfce7',
    flexWrap: 'wrap',
    gap: SPACING.xs
  },
  quickFillLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginRight: 4
  },
  quickFillChip: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.sm + 4,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#86efac'
  },
  quickFillChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark
  },
  allPaidText: {
    fontSize: 12,
    color: COLORS.primaryDark,
    marginTop: SPACING.xs,
    fontStyle: 'italic'
  },
  quickCalcBtn: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    marginRight: SPACING.xs
  },
  quickCalcText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1d4ed8'
  },
  calcAttendanceOk: {
    marginBottom: SPACING.xs
  },
  calcNoAttendanceBox: {
    backgroundColor: '#eff6ff',
    padding: SPACING.sm + 2,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    marginBottom: SPACING.sm
  },
  calcNoAttendanceTitle: {
    fontSize: FONTS.small,
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: 3
  },
  calcNoAttendanceDesc: {
    fontSize: 12,
    color: '#2563eb',
    marginBottom: SPACING.xs
  },
  autoAttRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm
  },
  checkboxEmoji: {
    fontSize: 18,
    marginRight: SPACING.xs + 2
  },
  autoAttText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.text,
    lineHeight: 16
  },
  empPillSub: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 1
  },
  empPillSubActive: {
    color: '#ffffff'
  },
  selectedWorkerBanner: {
    backgroundColor: '#f0fdf4',
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    marginBottom: SPACING.sm
  },
  selectedWorkerBannerText: {
    fontSize: 12,
    color: COLORS.primaryDark
  },
  selectedWorkerBannerSettled: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0'
  },
  settledNoteText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600'
  },
  recalcChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#cbd5e1'
  },
  recalcChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284c7'
  },
  workerLastSettled: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '600',
    marginTop: 2
  },
  historyBtn: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: '#cbd5e1'
  },
  historyBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569'
  },
  alreadyCalculatedBanner: {
    backgroundColor: '#fffbeb',
    padding: SPACING.sm + 2,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#fcd34d',
    marginBottom: SPACING.sm
  },
  alreadyCalculatedTitle: {
    fontSize: FONTS.small,
    fontWeight: '800',
    color: '#b45309',
    marginBottom: 2
  },
  alreadyCalculatedDesc: {
    fontSize: 12,
    color: '#92400e',
    lineHeight: 16
  },
  modalSubtitle: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    marginTop: 2
  },
  recordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: SPACING.sm + 2,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.xs + 2
  },
  recordDates: {
    fontSize: FONTS.medium,
    fontWeight: '700',
    color: COLORS.primaryDark
  },
  recordSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2
  },
  recordNotes: {
    fontSize: 11,
    color: '#0284c7',
    fontStyle: 'italic',
    marginTop: 2
  },
  recordAmount: {
    fontSize: FONTS.medium,
    fontWeight: '800',
    color: COLORS.primaryDark
  },
  deleteRecordBtn: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: '#fca5a5'
  },
  deleteRecordText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#dc2626'
  }
});
