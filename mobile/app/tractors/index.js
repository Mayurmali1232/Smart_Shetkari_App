import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONTS } from '../../constants/theme';
import { tractorService } from '../../services/tractorService';
import { useTranslation } from 'react-i18next';
import AppHeader from '../../components/AppHeader';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import BottomNav from '../../components/BottomNav';

export default function TractorListScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [tractors, setTractors] = useState([]);
  const [filter, setFilter] = useState('ALL'); // 'ALL', 'AVAILABLE', 'BUSY'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchTractors = useCallback(async () => {
    try {
      setError('');
      const res = await tractorService.list();
      if (res.success && res.data) {
        setTractors(res.data);
      }
    } catch (e) {
      setError(e.message || 'Failed to load tractors');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchTractors();
    }, [fetchTractors])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchTractors();
  };

  const availableCount = useMemo(() => {
    return tractors.filter(item => item.availabilityStatus === 'AVAILABLE').length;
  }, [tractors]);

  const busyCount = useMemo(() => {
    return tractors.filter(item => item.availabilityStatus === 'BUSY').length;
  }, [tractors]);

  const filteredTractors = useMemo(() => {
    if (filter === 'AVAILABLE') {
      return tractors.filter(item => item.availabilityStatus === 'AVAILABLE');
    }
    if (filter === 'BUSY') {
      return tractors.filter(item => item.availabilityStatus === 'BUSY');
    }
    return tractors;
  }, [tractors, filter]);

  const renderTractorCard = ({ item }) => {
    const isAvail = item.availabilityStatus === 'AVAILABLE';
    const isBusy = item.availabilityStatus === 'BUSY';

    const statusLabel = isAvail
      ? (t('tractors.available') || 'उपलब्ध')
      : isBusy
      ? (t('tractors.busy') || 'कामावर')
      : (item.availabilityStatus || 'अनुपलब्ध');

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/tractors/${item.id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.iconBox}>
            <Text style={{ fontSize: 26 }}>🚜</Text>
          </View>
          <View style={styles.headerInfo}>
            <View style={styles.titleRow}>
              <Text style={styles.modelName} numberOfLines={1}>{item.modelName}</Text>
              <View style={[
                styles.statusBadge,
                isAvail && { backgroundColor: COLORS.lightGreen },
                isBusy && { backgroundColor: '#fef3c7' },
                !isAvail && !isBusy && { backgroundColor: COLORS.dangerLight }
              ]}>
                <Text style={[
                  styles.statusText,
                  isAvail && { color: COLORS.primaryGreen },
                  isBusy && { color: '#b45309' },
                  !isAvail && !isBusy && { color: COLORS.danger }
                ]}>
                  {statusLabel}
                </Text>
              </View>
            </View>
            <Text style={styles.subtext}>
              {item.registrationNumber ? `नोंदणी: ${item.registrationNumber}` : 'क्रमांक नाही'} • {item.ownershipType || 'मालकीचे'}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.ratesRow}>
          <View style={styles.rateCol}>
            <Text style={styles.rateLabel}>प्रति तास दर</Text>
            <Text style={styles.rateVal}>{item.defaultHourlyRate ? `₹${item.defaultHourlyRate}/तास` : '—'}</Text>
          </View>
          <View style={styles.rateCol}>
            <Text style={styles.rateLabel}>प्रति एकर दर</Text>
            <Text style={styles.rateVal}>{item.defaultPerAcreRate ? `₹${item.defaultPerAcreRate}/एकर` : '—'}</Text>
          </View>
          <View style={styles.rateCol}>
            <Text style={styles.rateLabel}>प्रति दिवस दर</Text>
            <Text style={styles.rateVal}>{item.defaultPerDayRate ? `₹${item.defaultPerDayRate}/दिवस` : '—'}</Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.bookBtn}
            onPress={() => router.push(`/bookings/add?tractorId=${item.id}`)}
            activeOpacity={0.8}
          >
            <Text style={styles.bookBtnText}>📅 बुकिंग करा</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.detailBtn}
            onPress={() => router.push(`/tractors/${item.id}`)}
            activeOpacity={0.8}
          >
            <Text style={styles.detailBtnText}>तपशील ›</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title={t('tractors.title') || 'ट्रॅक्टर व्यवस्थापन'}
        showBack
        fallbackRoute="/dashboard"
      />

      {/* Top Banner Card matching Panel 9 */}
      <View style={styles.topBanner}>
        <View style={styles.bannerRow}>
          <View style={styles.bannerIconBox}>
            <Text style={styles.bannerIcon}>🚜</Text>
          </View>
          <View style={styles.bannerTextCol}>
            <Text style={styles.bannerTitle}>उपलब्ध ट्रॅक्टर्स</Text>
            <Text style={styles.bannerCount}>
              {availableCount} <Text style={styles.bannerTotal}>/ {tractors.length} उपलब्ध</Text>
            </Text>
            <Text style={styles.bannerSub}>
              {busyCount > 0 ? `${busyCount} ट्रॅक्टर शेतात कार्यरत आहेत` : 'सर्व ट्रॅक्टर बुकिंगसाठी उपलब्ध'}
            </Text>
          </View>
        </View>

        <View style={styles.bannerBtnRow}>
          <TouchableOpacity
            style={styles.bannerPrimaryBtn}
            onPress={() => router.push('/bookings/add')}
            activeOpacity={0.85}
          >
            <Text style={styles.bannerPrimaryBtnText}>+ ट्रॅक्टर बुक करा</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bannerSecondaryBtn}
            onPress={() => router.push('/tractors/add')}
            activeOpacity={0.85}
          >
            <Text style={styles.bannerSecondaryBtnText}>+ नवीन ट्रॅक्टर</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterBar}>
        <TouchableOpacity
          style={[styles.filterPill, filter === 'ALL' && styles.filterPillActive]}
          onPress={() => setFilter('ALL')}
        >
          <Text style={[styles.filterText, filter === 'ALL' && styles.filterTextActive]}>
            सर्व ({tractors.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterPill, filter === 'AVAILABLE' && styles.filterPillActive]}
          onPress={() => setFilter('AVAILABLE')}
        >
          <Text style={[styles.filterText, filter === 'AVAILABLE' && styles.filterTextActive]}>
            उपलब्ध ({availableCount})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterPill, filter === 'BUSY' && styles.filterPillActive]}
          onPress={() => setFilter('BUSY')}
        >
          <Text style={[styles.filterText, filter === 'BUSY' && styles.filterTextActive]}>
            कामावर ({busyCount})
          </Text>
        </TouchableOpacity>
      </View>

      {error ? <ErrorMessage message={error} onRetry={fetchTractors} /> : null}

      {loading && !refreshing ? (
        <LoadingIndicator message={t('common.loading') || 'ट्रॅक्टर माहिती लोड होत आहे...'} />
      ) : (
        <FlatList
          data={filteredTractors}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderTractorCard}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primaryGreen]} />}
          ListEmptyComponent={
            <EmptyState
              title={t('tractors.title') || 'ट्रॅक्टर सापडले नाहीत'}
              message="अद्याप कोणतेही ट्रॅक्टर नोंदवलेले नाहीत. नवीन ट्रॅक्टर जोडा."
              actionTitle="+ नवीन ट्रॅक्टर जोडा"
              onAction={() => router.push('/tractors/add')}
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
  topBanner: {
    backgroundColor: COLORS.primaryGreen,
    margin: SPACING.md,
    marginBottom: SPACING.xs,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    shadowColor: COLORS.primaryGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md
  },
  bannerIconBox: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.full,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md
  },
  bannerIcon: {
    fontSize: 28
  },
  bannerTextCol: {
    flex: 1
  },
  bannerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E8F5E9',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  bannerCount: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 2
  },
  bannerTotal: {
    fontSize: 15,
    fontWeight: '600',
    color: '#C8E6C9'
  },
  bannerSub: {
    fontSize: 12,
    color: '#E8F5E9',
    marginTop: 2
  },
  bannerBtnRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    paddingTop: SPACING.sm
  },
  bannerPrimaryBtn: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center'
  },
  bannerPrimaryBtnText: {
    color: COLORS.primaryGreen,
    fontSize: FONTS.medium,
    fontWeight: '800'
  },
  bannerSecondaryBtn: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center'
  },
  bannerSecondaryBtnText: {
    color: '#ffffff',
    fontSize: FONTS.medium,
    fontWeight: '700'
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    gap: SPACING.xs
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
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: '#FFF3E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    borderWidth: 1,
    borderColor: '#FFE0B2'
  },
  headerInfo: {
    flex: 1
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6
  },
  modelName: {
    fontSize: FONTS.large,
    fontWeight: '700',
    color: COLORS.darkText,
    flex: 1
  },
  subtext: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    marginTop: 2
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800'
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F4F1',
    marginVertical: SPACING.sm
  },
  ratesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm
  },
  rateCol: {
    alignItems: 'center',
    flex: 1
  },
  rateLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 2
  },
  rateVal: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.darkText
  },
  actionRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: '#F0F4F1',
    paddingTop: SPACING.xs + 2
  },
  bookBtn: {
    flex: 1,
    backgroundColor: COLORS.lightGreen,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#A5D6A7'
  },
  bookBtnText: {
    fontSize: FONTS.small,
    fontWeight: '700',
    color: COLORS.darkText
  },
  detailBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9'
  },
  detailBtnText: {
    fontSize: FONTS.small,
    fontWeight: '700',
    color: COLORS.textSecondary
  }
});
