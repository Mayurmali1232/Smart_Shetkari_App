import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ScrollView } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONTS } from '../../constants/theme';
import { bookingService } from '../../services/bookingService';
import { useTranslation } from 'react-i18next';
import AppHeader from '../../components/AppHeader';
import AppButton from '../../components/AppButton';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';

const STATUS_FILTERS = [
  { id: 'ALL', label: 'All' },
  { id: 'CONFIRMED', label: 'Confirmed' },
  { id: 'IN_PROGRESS', label: 'In Progress' },
  { id: 'PENDING', label: 'Pending' },
  { id: 'COMPLETED', label: 'Completed' },
  { id: 'CANCELLED', label: 'Cancelled' }
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return { bg: '#dbeafe', text: '#1d4ed8' };
      case 'IN_PROGRESS':
        return { bg: '#fef3c7', text: '#b45309' };
      case 'COMPLETED':
        return { bg: COLORS.primaryLight, text: COLORS.primaryDark };
      case 'CANCELLED':
        return { bg: COLORS.dangerLight, text: COLORS.danger };
      case 'PENDING':
      default:
        return { bg: '#f1f5f9', text: '#475569' };
    }
  };

  const renderBookingItem = ({ item }) => {
    const statusStyle = getStatusColor(item.status);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/bookings/${item.id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.customerName}>{item.customerName}</Text>
            <Text style={styles.tractorModel}>🚜 {item.tractorModel || 'Tractor'}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {item.status}
            </Text>
          </View>
        </View>

        <View style={styles.detailsRow}>
          <Text style={styles.detailText}>
            📅 {item.workDate} {item.startTime ? `• ${item.startTime}` : ''}
          </Text>
          <Text style={styles.detailText}>
            🌱 {item.customWorkType ? item.customWorkType : item.workType}
          </Text>
        </View>

        {item.workLocation ? (
          <Text style={styles.locationText} numberOfLines={1}>
            📍 {item.workLocation}
          </Text>
        ) : null}

        <View style={styles.footerRow}>
          <View>
            <Text style={styles.amountLabel}>Agreed Amount</Text>
            <Text style={styles.amountValue}>₹{item.finalAgreedAmount || 0}</Text>
          </View>
          {item.outstandingBalance !== undefined && item.outstandingBalance > 0 ? (
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.dueLabel}>Due from Customer</Text>
              <Text style={styles.dueValue}>₹{item.outstandingBalance}</Text>
            </View>
          ) : (
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.paidLabel}>Received</Text>
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
        title={t('bookings.title')}
        subtitle="Manage farm machinery jobs"
        showBack={true}
      />

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
          <LoadingIndicator />
        ) : bookings.length === 0 ? (
          <EmptyState
            icon="🚜"
            title="No Bookings Found"
            message={selectedStatus === 'ALL' ? 'No tractor work bookings recorded yet.' : `No bookings with status "${selectedStatus}".`}
            actionLabel={t('bookings.newBooking')}
            onAction={() => router.push('/bookings/add')}
          />
        ) : (
          <FlatList
            data={bookings}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderBookingItem}
            contentContainerStyle={styles.listContainer}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
          />
        )}
      </View>

      <View style={styles.footerBtnContainer}>
        <AppButton
          title={`+ ${t('bookings.newBooking')}`}
          onPress={() => router.push('/bookings/add')}
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
  filtersWrapper: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  filterList: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.xs
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
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
    fontSize: FONTS.small,
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
  listContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  customerName: {
    fontSize: FONTS.medium + 1,
    fontWeight: '700',
    color: COLORS.textPrimary
  },
  tractorModel: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    marginTop: 2
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 3,
    borderRadius: RADIUS.full
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700'
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm
  },
  detailText: {
    fontSize: FONTS.small,
    color: COLORS.textPrimary,
    fontWeight: '500'
  },
  locationText: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    marginTop: 4
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border
  },
  amountLabel: {
    fontSize: 11,
    color: COLORS.textSecondary
  },
  amountValue: {
    fontSize: FONTS.medium,
    fontWeight: '700',
    color: COLORS.secondary
  },
  dueLabel: {
    fontSize: 11,
    color: COLORS.danger
  },
  dueValue: {
    fontSize: FONTS.medium,
    fontWeight: '700',
    color: COLORS.danger
  },
  paidLabel: {
    fontSize: 11,
    color: COLORS.textSecondary
  },
  paidValue: {
    fontSize: FONTS.medium,
    fontWeight: '700',
    color: COLORS.primaryDark
  },
  footerBtnContainer: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border
  }
});
