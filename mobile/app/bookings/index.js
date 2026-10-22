import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ScrollView } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONTS } from '../../constants/theme';
import { bookingService } from '../../services/bookingService';
import { useTranslation } from 'react-i18next';
import AppHeader from '../../components/AppHeader';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import BottomNav from '../../components/BottomNav';

const STATUS_FILTERS = [
  { id: 'ALL', label: 'सर्व' },
  { id: 'PENDING', label: 'प्रलंबित' },
  { id: 'CONFIRMED', label: 'निश्चित' },
  { id: 'IN_PROGRESS', label: 'चालू काम' },
  { id: 'COMPLETED', label: 'पूर्ण' },
  { id: 'CANCELLED', label: 'रद्द' }
];

export default function BookingsListScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [bookings, setBookings] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchBookings = useCallback(async () => {
    try {
      setError('');
      const statusParam = selectedStatus === 'ALL' ? null : selectedStatus;
      const res = await bookingService.list(statusParam);
      if (res.success && res.data) {
        setBookings(res.data);
      }
    } catch (e) {
      setError(e.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedStatus]);

  useFocusEffect(
    useCallback(() => {
      fetchBookings();
    }, [fetchBookings])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const getStatusMeta = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return { bg: '#DBEAFE', text: '#1D4ED8', label: 'निश्चित' };
      case 'IN_PROGRESS':
        return { bg: '#FEF3C7', text: '#B45309', label: 'चालू काम' };
      case 'COMPLETED':
        return { bg: COLORS.lightGreen, text: COLORS.primaryGreen, label: 'पूर्ण' };
      case 'CANCELLED':
        return { bg: COLORS.dangerLight, text: COLORS.danger, label: 'रद्द' };
      case 'PENDING':
      default:
        return { bg: '#F1F5F9', text: '#475569', label: 'प्रलंबित' };
    }
  };

  const renderBookingItem = ({ item }) => {
    const meta = getStatusMeta(item.status);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/bookings/${item.id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.avatarBox}>
            <Text style={styles.avatarIcon}>👨‍🌾</Text>
          </View>
          <View style={styles.headerInfo}>
            <View style={styles.titleRow}>
              <Text style={styles.customerName} numberOfLines={1}>{item.customerName}</Text>
              <View style={[styles.statusBadge, { backgroundColor: meta.bg }]}>
                <Text style={[styles.statusText, { color: meta.text }]}>
                  {meta.label}
                </Text>
              </View>
            </View>
            <Text style={styles.tractorModel}>
              🚜 {item.tractorModel || 'ट्रॅक्टर'} • 🌱 {item.customWorkType || item.workType || 'शेती काम'}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailsRow}>
          <Text style={styles.detailText}>
            📅 {item.workDate} {item.startTime ? `• ${item.startTime}` : ''}
          </Text>
          {item.workLocation ? (
            <Text style={styles.locationText} numberOfLines={1}>
              📍 {item.workLocation}
            </Text>
          ) : null}
        </View>

        <View style={styles.footerRow}>
          <View>
            <Text style={styles.amountLabel}>ठरलेली रक्कम</Text>
            <Text style={styles.amountValue}>₹{item.finalAgreedAmount || 0}</Text>
          </View>

          {item.outstandingBalance !== undefined && item.outstandingBalance > 0 ? (
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.dueLabel}>बाकी रक्कम</Text>
              <Text style={styles.dueValue}>₹{item.outstandingBalance}</Text>
            </View>
          ) : (
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.paidLabel}>प्राप्त रक्कम</Text>
              <Text style={styles.paidValue}>₹{item.totalReceived || 0}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title={t('bookings.title') || 'ट्रॅक्टर बुकिंग'}
        subtitle="शेतकऱ्यांची ट्रॅक्टर कामांची बुकिंग"
        showBack={true}
        fallbackRoute="/dashboard"
      />

      {/* Top Action Bar matching Panel 11 */}
      <View style={styles.topBar}>
        <View style={styles.headerTextCol}>
          <Text style={styles.bookingCountText}>
            एकूण बुकिंग: <Text style={styles.bookingCountNum}>{bookings.length}</Text>
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/bookings/add')}
          activeOpacity={0.8}
        >
          <Text style={styles.addButtonText}>+ नवी बुकिंग</Text>
        </TouchableOpacity>
      </View>

      {/* Status Filter Scroll */}
      <View style={styles.filtersWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterList}>
          {STATUS_FILTERS.map((f) => (
            <TouchableOpacity
              key={f.id}
              style={[
                styles.filterChip,
                selectedStatus === f.id && styles.filterChipActive
              ]}
              onPress={() => setSelectedStatus(f.id)}
            >
              <Text style={[
                styles.filterChipText,
                selectedStatus === f.id && styles.filterChipTextActive
              ]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.content}>
        {error ? <ErrorMessage message={error} onRetry={fetchBookings} /> : null}

        {loading && !refreshing ? (
          <LoadingIndicator message={t('common.loading') || 'बुकिंग लोड होत आहे...'} />
        ) : bookings.length === 0 ? (
          <EmptyState
            icon="🚜"
            title="कोणतीही बुकिंग नाही"
            message={selectedStatus === 'ALL' ? 'अद्याप कोणतीही ट्रॅक्टर काम बुकिंग नोंदवलेली नाही.' : `"${selectedStatus}" स्थिती असलेली कोणतीही बुकिंग नाही.`}
            actionTitle="+ नवी बुकिंग करा"
            onAction={() => router.push('/bookings/add')}
          />
        ) : (
          <FlatList
            data={bookings}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderBookingItem}
            contentContainerStyle={styles.listContainer}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primaryGreen]} />}
          />
        )}
      </View>

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  headerTextCol: {
    flex: 1
  },
  bookingCountText: {
    fontSize: FONTS.medium,
    color: COLORS.textSecondary,
    fontWeight: '600'
  },
  bookingCountNum: {
    fontWeight: '800',
    color: COLORS.darkText
  },
  addButton: {
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
  addButtonText: {
    color: '#ffffff',
    fontSize: FONTS.medium,
    fontWeight: '700'
  },
  filtersWrapper: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  filterList: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.xs
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#F1F5F9',
    marginRight: SPACING.xs
  },
  filterChipActive: {
    backgroundColor: COLORS.lightGreen,
    borderColor: COLORS.primaryGreen
  },
  filterChipText: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    fontWeight: '600'
  },
  filterChipTextActive: {
    color: COLORS.darkText,
    fontWeight: '700'
  },
  content: {
    flex: 1
  },
  listContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#E8F0E9'
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.lightGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    borderWidth: 1,
    borderColor: '#A5D6A7'
  },
  avatarIcon: {
    fontSize: 22
  },
  headerInfo: {
    flex: 1
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 6
  },
  customerName: {
    fontSize: FONTS.large,
    fontWeight: '700',
    color: COLORS.darkText,
    flex: 1
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
  tractorModel: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    marginTop: 2
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F4F1',
    marginVertical: SPACING.sm
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  detailText: {
    fontSize: FONTS.small,
    color: COLORS.darkText,
    fontWeight: '500'
  },
  locationText: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    marginBottom: 6
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#F0F4F1',
    paddingTop: SPACING.xs + 2,
    marginTop: 4
  },
  amountLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  amountValue: {
    fontSize: FONTS.medium + 1,
    fontWeight: '800',
    color: COLORS.darkText,
    marginTop: 2
  },
  dueLabel: {
    fontSize: 10,
    color: COLORS.danger,
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  dueValue: {
    fontSize: FONTS.medium + 1,
    fontWeight: '800',
    color: COLORS.danger,
    marginTop: 2
  },
  paidLabel: {
    fontSize: 10,
    color: COLORS.primaryGreen,
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  paidValue: {
    fontSize: FONTS.medium + 1,
    fontWeight: '800',
    color: COLORS.primaryGreen,
    marginTop: 2
  }
});