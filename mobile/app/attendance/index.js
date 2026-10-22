import React, { useState, useCallback } from 'react';
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
import BottomNav from '../../components/BottomNav';

export default function AttendanceScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [employees, setEmployees] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
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
      const next = { ...prev };
      Object.keys(next).forEach((id) => {
        next[id] = { ...next[id], status };
      });
      return next;
    });
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    try {
      const records = Object.keys(attendanceMap).map((empId) => ({
        employeeId: parseInt(empId, 10),
        status: attendanceMap[empId].status,
        dailyWageRate: attendanceMap[empId].dailyWageRate,
        notes: attendanceMap[empId].notes
      }));

      const res = await attendanceService.saveBulk({
        date: selectedDate,
        records
      });

      if (res.success) {
        Alert.alert(
          'यशस्वी! / Saved',
          'हजेरी यशस्वीरित्या जतन झाली!\nAttendance saved successfully for ' + selectedDate
        );
        loadData(selectedDate);
      } else {
        Alert.alert('Error', res.message || 'Failed to save attendance');
      }
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  // Aggregates
  const totalEmployees = employees.length;
  const presentCount = Object.values(attendanceMap).filter((a) => a.status === 'PRESENT' || a.status === 'HALF_DAY').length;
  const absentCount = Object.values(attendanceMap).filter((a) => a.status === 'ABSENT' || a.status === 'LEAVE').length;

  const renderWorkerAttendanceRow = ({ item }) => {
    const current = attendanceMap[item.id] || { status: 'PRESENT' };
    const isPresent = current.status === 'PRESENT' || current.status === 'HALF_DAY';

    return (
      <View style={styles.workerCard}>
        <View style={styles.workerAvatar}>
          <Text style={styles.workerAvatarEmoji}>👨‍🌾</Text>
        </View>

        <View style={styles.workerInfo}>
          <Text style={styles.workerName}>{item.fullName}</Text>
          <Text style={[styles.workerStatusText, { color: isPresent ? COLORS.primary : COLORS.danger }]}>
            {isPresent ? '✔ उपस्थित (Present)' : '✖ अनुपस्थित (Absent)'}
          </Text>
          <Text style={styles.workerSub}>
            दर: ₹{item.dailyWage}/दिवस • {item.role || 'शेती कामगार'}
          </Text>
        </View>

        {/* Toggle Button (Matching Panel 7 checkmark/cross) */}
        <TouchableOpacity
          style={[styles.statusToggleBtn, isPresent ? styles.btnPresent : styles.btnAbsent]}
          onPress={() => setWorkerStatus(item.id, isPresent ? 'ABSENT' : 'PRESENT')}
          activeOpacity={0.7}
        >
          <Text style={[styles.statusToggleText, { color: isPresent ? '#FFFFFF' : '#FFFFFF' }]}>
            {isPresent ? '✔' : '✖'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title="हजेरी (Attendance)"
        subtitle="दैनंदिन कामगार हजेरी"
        showBack
        fallbackRoute="/dashboard"
      />

      {/* Date Selector */}
      <DateSelector
        currentDate={selectedDate}
        onDateChange={handleDateChange}
      />

      {/* 3 Summary KPI Cards (Matching Panel 7 in Poster) */}
      <View style={styles.kpiRow}>
        <View style={[styles.kpiCard, styles.kpiTotal]}>
          <Text style={styles.kpiLabel}>एकूण कर्मचारी</Text>
          <Text style={styles.kpiValue}>{totalEmployees}</Text>
        </View>
        <View style={[styles.kpiCard, styles.kpiPresent]}>
          <Text style={styles.kpiLabel}>उपस्थित</Text>
          <Text style={[styles.kpiValue, { color: COLORS.primary }]}>{presentCount}</Text>
        </View>
        <View style={[styles.kpiCard, styles.kpiAbsent]}>
          <Text style={styles.kpiLabel}>अनुपस्थित</Text>
          <Text style={[styles.kpiValue, { color: COLORS.danger }]}>{absentCount}</Text>
        </View>
      </View>

      {/* Quick Mark All Bar */}
      <View style={styles.quickBar}>
        <Text style={styles.quickBarLabel}>सर्व हजेरी:</Text>
        <TouchableOpacity onPress={() => markAllStatus('PRESENT')} style={styles.quickBtn}>
          <Text style={styles.quickBtnText}>✔ सर्व उपस्थित</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => markAllStatus('ABSENT')} style={[styles.quickBtn, styles.quickBtnRed]}>
          <Text style={[styles.quickBtnText, { color: COLORS.danger }]}>✖ सर्व अनुपस्थित</Text>
        </TouchableOpacity>
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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="👥"
              title="कामगार सापडले नाहीत"
              message="प्रथम कर्मचारी जोडा जेणेकरून त्यांची रोजची हजेरी नोंदवता येईल."
              actionTitle="+ नवीन कामगार जोडा"
              onAction={() => router.push('/employees/add')}
            />
          }
        />
      )}

      {/* Save Button */}
      {employees.length > 0 && (
        <View style={styles.bottomSaveBar}>
          <AppButton
            title={saving ? 'जतन करत आहे...' : 'जतन करा / Save Attendance'}
            onPress={handleSaveAttendance}
            loading={saving}
            disabled={saving}
            style={styles.saveBtn}
          />
        </View>
      )}

      <BottomNav active="records" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  kpiRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.xs,
    marginBottom: SPACING.xs + 2
  },
  kpiCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm + 2,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    elevation: 1
  },
  kpiTotal: {
    borderColor: '#C8E6C9',
    backgroundColor: '#F1F8E9'
  },
  kpiPresent: {
    borderColor: '#A5D6A7',
    backgroundColor: '#E8F5E9'
  },
  kpiAbsent: {
    borderColor: '#FFCDD2',
    backgroundColor: '#FFEBEE'
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginTop: 2
  },
  quickBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    gap: SPACING.sm
  },
  quickBarLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary
  },
  quickBtn: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#A5D6A7'
  },
  quickBtnRed: {
    borderColor: '#FFCDD2'
  },
  quickBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary
  },
  listContent: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.xxl
  },
  workerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  workerAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#F1F8E9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#C8E6C9',
    marginRight: SPACING.sm + 2
  },
  workerAvatarEmoji: {
    fontSize: 24
  },
  workerInfo: {
    flex: 1
  },
  workerName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary
  },
  workerStatusText: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 1
  },
  workerSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2
  },
  statusToggleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2
  },
  btnPresent: {
    backgroundColor: '#2E7D32'
  },
  btnAbsent: {
    backgroundColor: '#E53935'
  },
  statusToggleText: {
    fontSize: 18,
    fontWeight: '900'
  },
  bottomSaveBar: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    paddingVertical: 12
  }
});
