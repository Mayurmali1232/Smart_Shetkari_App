import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONTS } from '../../constants/theme';
import { employeeService } from '../../services/employeeService';
import { useTranslation } from 'react-i18next';
import AppHeader from '../../components/AppHeader';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';

export default function EmployeeListScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // '' for All, 'ACTIVE', 'INACTIVE'
  const [error, setError] = useState('');

  const fetchEmployees = useCallback(async () => {
    try {
      setError('');
      const res = await employeeService.list(statusFilter || undefined, search || undefined);
      if (res.success && res.data) {
        setEmployees(res.data);
      }
    } catch (e) {
      setError(e.message || 'Failed to load workers');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter, search]);

  useFocusEffect(
    useCallback(() => {
      fetchEmployees();
    }, [fetchEmployees])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchEmployees();
  };

  const renderWorkerCard = ({ item }) => {
    const isActive = item.status === 'ACTIVE';

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/employees/${item.id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.fullName.charAt(0)}</Text>
          </View>
          <View style={styles.nameContainer}>
            <Text style={styles.workerName}>{item.fullName}</Text>
            <Text style={styles.workerVillage}>
              📍 {item.villageAddress || 'Farm Worker'} {item.mobileNumber ? `• 📞 ${item.mobileNumber}` : ''}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: isActive ? COLORS.primaryLight : '#f1f5f9' }]}>
            <Text style={[styles.statusText, { color: isActive ? COLORS.primaryDark : COLORS.textSecondary }]}>
              {isActive ? t('employees.active') : t('employees.inactive')}
            </Text>
          </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.statsRow}>
          <View style={styles.statCol}>
            <Text style={styles.statLabel}>{t('employees.dailyWage')}</Text>
            <Text style={styles.statVal}>₹{item.dailyWage}</Text>
          </View>
          <View style={styles.statCol}>
            <Text style={styles.statLabel}>{t('employees.daysWorked')}</Text>
            <Text style={styles.statVal}>{item.totalDaysWorked || 0} days</Text>
          </View>
          <View style={styles.statCol}>
            <Text style={styles.statLabel}>{t('employees.balanceDue')}</Text>
            <Text style={[styles.statVal, { color: (item.outstandingBalance > 0) ? COLORS.accent : COLORS.primary }]}>
              ₹{item.outstandingBalance || 0}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title={t('employees.title')} showBack />

      <View style={styles.topBar}>
        <AppInput
          placeholder={t('common.search')}
          value={search}
          onChangeText={setSearch}
          leftIcon={<Text style={{ fontSize: 16 }}>🔍</Text>}
          containerStyle={styles.searchContainer}
        />

        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterPill, statusFilter === '' && styles.filterPillActive]}
            onPress={() => setStatusFilter('')}
          >
            <Text style={[styles.filterText, statusFilter === '' && styles.filterTextActive]}>
              {t('common.all')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterPill, statusFilter === 'ACTIVE' && styles.filterPillActive]}
            onPress={() => setStatusFilter('ACTIVE')}
          >
            <Text style={[styles.filterText, statusFilter === 'ACTIVE' && styles.filterTextActive]}>
              {t('employees.active')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterPill, statusFilter === 'INACTIVE' && styles.filterPillActive]}
            onPress={() => setStatusFilter('INACTIVE')}
          >
            <Text style={[styles.filterText, statusFilter === 'INACTIVE' && styles.filterTextActive]}>
              {t('employees.inactive')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {error ? <ErrorMessage message={error} onRetry={fetchEmployees} /> : null}

      {loading && !refreshing ? (
        <LoadingIndicator message={t('common.loading')} />
      ) : (
        <FlatList
          data={employees}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderWorkerCard}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
          ListEmptyComponent={
            <EmptyState
              title={t('employees.title')}
              message={t('common.noData')}
              actionTitle={t('employees.addNew')}
              onAction={() => router.push('/employees/add')}
            />
          }
        />
      )}

      {/* Floating Add Worker Button */}
      <View style={styles.floatingContainer}>
        <AppButton
          title={`+ ${t('employees.addNew')}`}
          onPress={() => router.push('/employees/add')}
          style={styles.floatingBtn}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  topBar: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  searchContainer: {
    marginBottom: SPACING.xs
  },
  filterRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingBottom: SPACING.sm
  },
  filterPill: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: COLORS.border
  },
  filterPillActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary
  },
  filterText: {
    fontSize: FONTS.small,
    fontWeight: '600',
    color: COLORS.textSecondary
  },
  filterTextActive: {
    color: COLORS.primaryDark,
    fontWeight: '700'
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: 100
  },
  card: {
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    borderWidth: 1,
    borderColor: '#86efac'
  },
  avatarText: {
    fontSize: FONTS.title,
    fontWeight: '800',
    color: COLORS.primaryDark
  },
  nameContainer: {
    flex: 1
  },
  workerName: {
    fontSize: FONTS.large,
    fontWeight: '700',
    color: COLORS.textPrimary
  },
  workerVillage: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    marginTop: 2
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full
  },
  statusText: {
    fontSize: FONTS.small,
    fontWeight: '700'
  },
  cardDivider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.sm
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  statCol: {
    alignItems: 'center'
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  statVal: {
    fontSize: FONTS.medium,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 2
  },
  floatingContainer: {
    position: 'absolute',
    bottom: SPACING.lg,
    left: SPACING.lg,
    right: SPACING.lg
  },
  floatingBtn: {
    elevation: 6,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6
  }
});
