import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, TextInput } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONTS } from '../../constants/theme';
import { employeeService } from '../../services/employeeService';
import { useTranslation } from 'react-i18next';
import AppHeader from '../../components/AppHeader';
import AppButton from '../../components/AppButton';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import BottomNav from '../../components/BottomNav';

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
            <Text style={styles.avatarText}>{item.fullName ? item.fullName.charAt(0) : '👤'}</Text>
          </View>
          <View style={styles.nameContainer}>
            <View style={styles.titleRow}>
              <Text style={styles.workerName} numberOfLines={1}>{item.fullName}</Text>
              <View style={[styles.statusBadge, { backgroundColor: isActive ? COLORS.lightGreen : '#f1f5f9' }]}>
                <Text style={[styles.statusText, { color: isActive ? COLORS.primaryGreen : COLORS.textSecondary }]}>
                  {isActive ? (t('employees.active') || 'सक्रिय') : (t('employees.inactive') || 'बंद')}
                </Text>
              </View>
            </View>
            <View style={styles.metaRow}>
              <View style={styles.roleTag}>
                <Text style={styles.roleTagText}>{item.designation || 'शेती कामगार'}</Text>
              </View>
              {item.mobileNumber ? (
                <Text style={styles.workerPhone}>📞 {item.mobileNumber}</Text>
              ) : null}
            </View>
          </View>
          <View style={styles.chevron}>
            <Text style={styles.chevronText}>›</Text>
          </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.statsRow}>
          <View style={styles.statCol}>
            <Text style={styles.statLabel}>{t('employees.dailyWage') || 'दैनिक मजुरी'}</Text>
            <Text style={styles.statVal}>₹{item.dailyWage || 0}</Text>
          </View>
          <View style={styles.statCol}>
            <Text style={styles.statLabel}>{t('employees.daysWorked') || 'एकूण दिवस'}</Text>
            <Text style={styles.statVal}>{item.totalDaysWorked || 0} दिवस</Text>
          </View>
          <View style={styles.statCol}>
            <Text style={styles.statLabel}>{t('employees.balanceDue') || 'बाकी रक्कम'}</Text>
            <Text style={[styles.statVal, { color: (item.outstandingBalance > 0) ? COLORS.accent : COLORS.primaryGreen }]}>
              ₹{item.outstandingBalance || 0}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title={t('employees.title') || 'कर्मचारी व्यवस्थापन'} showBack fallbackRoute="/dashboard" />

      {/* Top Search & Add Row matching Panel 6 */}
      <View style={styles.topBar}>
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="कर्मचारी शोधा..."
              placeholderTextColor={COLORS.textSecondary}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Text style={styles.clearIcon}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/employees/add')}
            activeOpacity={0.8}
          >
            <Text style={styles.addButtonText}>+ नवीन</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterPill, statusFilter === '' && styles.filterPillActive]}
            onPress={() => setStatusFilter('')}
          >
            <Text style={[styles.filterText, statusFilter === '' && styles.filterTextActive]}>
              {t('common.all') || 'सर्व'} ({employees.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterPill, statusFilter === 'ACTIVE' && styles.filterPillActive]}
            onPress={() => setStatusFilter('ACTIVE')}
          >
            <Text style={[styles.filterText, statusFilter === 'ACTIVE' && styles.filterTextActive]}>
              {t('employees.active') || 'सक्रिय'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterPill, statusFilter === 'INACTIVE' && styles.filterPillActive]}
            onPress={() => setStatusFilter('INACTIVE')}
          >
            <Text style={[styles.filterText, statusFilter === 'INACTIVE' && styles.filterTextActive]}>
              {t('employees.inactive') || 'बंद'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {error ? <ErrorMessage message={error} onRetry={fetchEmployees} /> : null}

      {loading && !refreshing ? (
        <LoadingIndicator message={t('common.loading') || 'लोड होत आहे...'} />
      ) : (
        <FlatList
          data={employees}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderWorkerCard}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primaryGreen]} />}
          ListEmptyComponent={
            <EmptyState
              title={t('employees.title') || 'कर्मचारी सापडले नाहीत'}
              message={search ? 'कोणताही कर्मचारी जुळला नाही.' : 'सध्या कोणतेही कर्मचारी नोंदवलेले नाहीत.'}
              actionTitle="+ नवीन कर्मचारी जोडा"
              onAction={() => router.push('/employees/add')}
            />
          }
        />
      )}

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
  topBar: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xs,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F8F2',
    borderWidth: 1,
    borderColor: '#C8E6C9',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm,
    height: 44
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 6
  },
  searchInput: {
    flex: 1,
    fontSize: FONTS.medium,
    color: COLORS.darkText,
    paddingVertical: 0
  },
  clearIcon: {
    fontSize: 14,
    color: COLORS.textSecondary,
    padding: 4
  },
  addButton: {
    backgroundColor: COLORS.primaryGreen,
    paddingHorizontal: SPACING.md,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primaryGreen,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: FONTS.medium,
    fontWeight: '700'
  },
  filterRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    paddingVertical: SPACING.xs
  },
  filterPill: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: COLORS.border
  },
  filterPillActive: {
    backgroundColor: COLORS.lightGreen,
    borderColor: COLORS.primaryGreen
  },
  filterText: {
    fontSize: FONTS.small,
    fontWeight: '600',
    color: COLORS.textSecondary
  },
  filterTextActive: {
    color: COLORS.darkText,
    fontWeight: '700'
  },
  listContent: {
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.lightGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    borderWidth: 2,
    borderColor: '#A5D6A7'
  },
  avatarText: {
    fontSize: FONTS.title,
    fontWeight: '800',
    color: COLORS.primaryGreen
  },
  nameContainer: {
    flex: 1
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6
  },
  workerName: {
    fontSize: FONTS.large,
    fontWeight: '700',
    color: COLORS.darkText,
    flex: 1
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: 4
  },
  roleTag: {
    backgroundColor: '#F1F8F5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: '#D0E5D5'
  },
  roleTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryGreen
  },
  workerPhone: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700'
  },
  chevron: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F8F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.xs
  },
  chevronText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primaryGreen,
    marginTop: -2
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F0F4F1',
    marginVertical: SPACING.sm
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  statCol: {
    alignItems: 'center',
    flex: 1
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 2
  },
  statVal: {
    fontSize: FONTS.medium,
    fontWeight: '800',
    color: COLORS.darkText
  }
});
