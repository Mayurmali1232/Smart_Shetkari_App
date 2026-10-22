import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONTS } from '../../constants/theme';
import { attendanceService } from '../../services/attendanceService';
import { employeeService } from '../../services/employeeService';
import { useTranslation } from 'react-i18next';
import AppHeader from '../../components/AppHeader';
import AppButton from '../../components/AppButton';
import DateSelector from '../../components/DateSelector';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';

export default function AttendanceScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [employees, setEmployees] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({}); // empId -> { status: 'PRESENT'|'ABSENT'|'HALF_DAY'|'LEAVE', dailyWageRate, notes }
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadData = useCallback(async (dateToLoad) => {
    try {
      setError('');
      const dateStr = dateToLoad || selectedDate;
      const [empRes, attRes, sumRes] = await Promise.all([
        employeeService.list('ACTIVE'),
        attendanceService.getByDate(dateStr),
        attendanceService.getSummary(dateStr)
      ]);

      const activeEmps = empRes.data || [];
      setEmployees(activeEmps);
      setSummary(sumRes.data || null);

      // Build map from existing records
      const existingRecords = attRes.data || [];
      const map = {};

      activeEmps.forEach((emp) => {
        const found = existingRecords.find((r) => r.employeeId === emp.id);
        if (found) {
          map[emp.id] = {
            status: found.status,
            dailyWageRate: found.dailyWageRate,
            notes: found.notes || ''
          };
        } else {
          // Default to PRESENT for easy marking
          map[emp.id] = {
            status: 'PRESENT',
            dailyWageRate: emp.dailyWage,
            notes: ''
          };
        }
      });

      setAttendanceMap(map);
    } catch (e) {
      setError(e.message || 'Failed to load attendance');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedDate]);

  useFocusEffect(
    useCallback(() => {
      loadData(selectedDate);
    }, [selectedDate, loadData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData(selectedDate);
  };

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    setLoading(true);
  };

  const setWorkerStatus = (empId, status) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [empId]: {
        ...prev[empId],
        status
      }
    }));
  };

  const markAllStatus = (status) => {
    setAttendanceMap((prev) => {
      const updated = { ...prev };
      employees.forEach((emp) => {
        if (updated[emp.id]) {
          updated[emp.id] = { ...updated[emp.id], status };
        }
      });
      return updated;
    });
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setError('');
    try {
      const records = employees.map((emp) => {
        const entry = attendanceMap[emp.id] || { status: 'PRESENT', dailyWageRate: emp.dailyWage };
        return {
          employeeId: emp.id,
          status: entry.status,
          dailyWageRate: entry.dailyWageRate || emp.dailyWage,
          notes: entry.notes || undefined
        };
      });

      const res = await attendanceService.recordBulk({
        workDate: selectedDate,
        records
      });

      if (res.success) {
        Alert.alert(t('common.success'), 'Attendance saved successfully for ' + selectedDate);
        loadData(selectedDate);
      }
    } catch (e) {
      setError(e.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const renderWorkerAttendanceRow = ({ item }) => {
    const entry = attendanceMap[item.id] || { status: 'PRESENT' };
    const currentStatus = entry.status;

    return (
      <View style={styles.workerRow}>
        <View style={styles.workerInfo}>
          <Text style={styles.workerName}>{item.fullName}</Text>
          <Text style={styles.workerSub}>
            Rate: ₹{item.dailyWage} {item.villageAddress ? `• ${item.villageAddress}` : ''}
          </Text>
        </View>

        {/* Status Toggle Buttons: P / H / A / L */}
        <View style={styles.toggleGroup}>
          <TouchableOpacity
            style={[styles.toggleBtn, currentStatus === 'PRESENT' && styles.presentActive]}
            onPress={() => setWorkerStatus(item.id, 'PRESENT')}
          >
            <Text style={[styles.toggleText, currentStatus === 'PRESENT' && styles.toggleTextActive]}>
              P
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleBtn, currentStatus === 'HALF_DAY' && styles.halfDayActive]}
            onPress={() => setWorkerStatus(item.id, 'HALF_DAY')}
          >
            <Text style={[styles.toggleText, currentStatus === 'HALF_DAY' && styles.toggleTextActive]}>
              ½
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleBtn, currentStatus === 'ABSENT' && styles.absentActive]}
            onPress={() => setWorkerStatus(item.id, 'ABSENT')}
          >
            <Text style={[styles.toggleText, currentStatus === 'ABSENT' && styles.toggleTextActive]}>
              A
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleBtn, currentStatus === 'LEAVE' && styles.leaveActive]}
            onPress={() => setWorkerStatus(item.id, 'LEAVE')}
          >
            <Text style={[styles.toggleText, currentStatus === 'LEAVE' && styles.toggleTextActive]}>
              L
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title={t('attendance.title')} showBack showLanguage={false} />

      <View style={styles.topContainer}>
        <DateSelector
          currentDate={selectedDate}
          onDateChange={handleDateChange}
        />

        {/* Daily Summary Card */}
        {summary && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryCol}>
              <Text style={styles.summaryLabel}>{t('attendance.present')}</Text>
              <Text style={[styles.summaryVal, { color: COLORS.primary }]}>{summary.presentCount}</Text>
            </View>
            <View style={styles.summaryCol}>
              <Text style={styles.summaryLabel}>{t('attendance.halfDay')}</Text>
              <Text style={[styles.summaryVal, { color: '#b45309' }]}>{summary.halfDayCount}</Text>
            </View>
            <View style={styles.summaryCol}>
              <Text style={styles.summaryLabel}>{t('attendance.absent')}</Text>
              <Text style={[styles.summaryVal, { color: COLORS.danger }]}>{summary.absentCount}</Text>
            </View>
            <View style={styles.summaryCol}>
              <Text style={styles.summaryLabel}>{t('attendance.estimatedWages')}</Text>
              <Text style={[styles.summaryVal, { color: '#2563eb' }]}>₹{summary.estimatedWagesToday || 0}</Text>
            </View>
          </View>
        )}

        {/* Quick Mark All Row */}
        <View style={styles.markAllRow}>
          <Text style={styles.markAllLabel}>{t('attendance.markAll')}:</Text>
          <TouchableOpacity onPress={() => markAllStatus('PRESENT')} style={styles.markAllBtn}>
            <Text style={styles.markAllBtnText}>✅ All Present</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => markAllStatus('ABSENT')} style={styles.markAllBtn}>
            <Text style={styles.markAllBtnText}>❌ All Absent</Text>
          </TouchableOpacity>
        </View>
      </View>

      {error ? <ErrorMessage message={error} onRetry={() => loadData(selectedDate)} /> : null}

      {loading && !refreshing ? (
        <LoadingIndicator message={t('common.loading')} />
      ) : (
        <FlatList
          data={employees}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderWorkerAttendanceRow}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
          ListEmptyComponent={
            <EmptyState
              title={t('employees.title')}
              message="No active farm workers found. Please add workers first."
              actionTitle={t('employees.addNew')}
              onAction={() => router.push('/employees/add')}
            />
          }
        />
      )}

      {/* Floating Save Attendance Button */}
      {employees.length > 0 && (
        <View style={styles.saveContainer}>
          <AppButton
            title={`💾 ${t('attendance.saveAttendance')}`}
            onPress={handleSaveAll}
            loading={saving}
            style={styles.saveBtn}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  topContainer: {
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: SPACING.sm
  },
  summaryCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.primaryLight,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#86efac',
    marginBottom: SPACING.xs
  },
  summaryCol: {
    alignItems: 'center'
  },
  summaryLabel: {
    fontSize: 11,
    color: COLORS.primaryDark,
    fontWeight: '600'
  },
  summaryVal: {
    fontSize: FONTS.large,
    fontWeight: '800',
    marginTop: 2
  },
  markAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.xs
  },
  markAllLabel: {
    fontSize: FONTS.small,
    fontWeight: '600',
    color: COLORS.textSecondary
  },
  markAllBtn: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  markAllBtnText: {
    fontSize: FONTS.small,
    fontWeight: '600',
    color: COLORS.textPrimary
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: 100
  },
  workerRow: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 1,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2
  },
  workerInfo: {
    flex: 1,
    paddingRight: SPACING.sm
  },
  workerName: {
    fontSize: FONTS.medium,
    fontWeight: '700',
    color: COLORS.textPrimary
  },
  workerSub: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    marginTop: 2
  },
  toggleGroup: {
    flexDirection: 'row',
    gap: SPACING.xs
  },
  toggleBtn: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.sm,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border
  },
  toggleText: {
    fontSize: FONTS.medium,
    fontWeight: '700',
    color: COLORS.textSecondary
  },
  presentActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryDark
  },
  halfDayActive: {
    backgroundColor: '#f59e0b',
    borderColor: '#d97706'
  },
  absentActive: {
    backgroundColor: COLORS.danger,
    borderColor: '#b91c1c'
  },
  leaveActive: {
    backgroundColor: '#8b5cf6',
    borderColor: '#7c3aed'
  },
  toggleTextActive: {
    color: '#ffffff'
  },
  saveContainer: {
    position: 'absolute',
    bottom: SPACING.lg,
    left: SPACING.lg,
    right: SPACING.lg
  },
  saveBtn: {
    elevation: 6,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6
  }
});
