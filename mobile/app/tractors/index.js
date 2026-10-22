import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONTS } from '../../constants/theme';
import { tractorService } from '../../services/tractorService';
import { useTranslation } from 'react-i18next';
import AppHeader from '../../components/AppHeader';
import AppButton from '../../components/AppButton';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';

export default function TractorListScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [tractors, setTractors] = useState([]);
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

  const renderTractorCard = ({ item }) => {
    const isAvail = item.availabilityStatus === 'AVAILABLE';
    const isBusy = item.availabilityStatus === 'BUSY';

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/tractors/${item.id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.iconBox}>
            <Text style={{ fontSize: 24 }}>🚜</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.modelName}>{item.modelName}</Text>
            <Text style={styles.subtext}>
              {item.registrationNumber ? `Reg: ${item.registrationNumber}` : 'No Reg Number'} • {item.ownershipType}
            </Text>
          </View>
          <View style={[
            styles.statusBadge,
            isAvail && { backgroundColor: COLORS.primaryLight },
            isBusy && { backgroundColor: '#fef3c7' },
            !isAvail && !isBusy && { backgroundColor: COLORS.dangerLight }
          ]}>
            <Text style={[
              styles.statusText,
              isAvail && { color: COLORS.primaryDark },
              isBusy && { color: '#b45309' },
              !isAvail && !isBusy && { color: COLORS.danger }
            ]}>
              {item.availabilityStatus}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.ratesRow}>
          <View style={styles.rateCol}>
            <Text style={styles.rateLabel}>Hourly Rate</Text>
            <Text style={styles.rateVal}>{item.defaultHourlyRate ? `₹${item.defaultHourlyRate}/hr` : '—'}</Text>
          </View>
          <View style={styles.rateCol}>
            <Text style={styles.rateLabel}>Per Acre Rate</Text>
            <Text style={styles.rateVal}>{item.defaultPerAcreRate ? `₹${item.defaultPerAcreRate}/acre` : '—'}</Text>
          </View>
          <View style={styles.rateCol}>
            <Text style={styles.rateLabel}>Per Day Rate</Text>
            <Text style={styles.rateVal}>{item.defaultPerDayRate ? `₹${item.defaultPerDayRate}/day` : '—'}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title={t('tractors.title')} showBack showLanguage={false} />

      {error ? <ErrorMessage message={error} onRetry={fetchTractors} /> : null}

      {loading && !refreshing ? (
        <LoadingIndicator message={t('common.loading')} />
      ) : (
        <FlatList
          data={tractors}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderTractorCard}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
          ListEmptyComponent={
            <EmptyState
              title={t('tractors.title')}
              message="No tractors registered yet. Add your tractors and agricultural machinery."
              actionTitle={t('tractors.addNew')}
              onAction={() => router.push('/tractors/add')}
            />
          }
        />
      )}

      {/* Floating Add Tractor Button */}
      <View style={styles.floatingContainer}>
        <AppButton
          title={`+ ${t('tractors.addNew')}`}
          onPress={() => router.push('/tractors/add')}
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
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: '#ffedd5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md
  },
  headerInfo: {
    flex: 1
  },
  modelName: {
    fontSize: FONTS.large,
    fontWeight: '700',
    color: COLORS.textPrimary
  },
  subtext: {
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
    fontWeight: '800'
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.sm
  },
  ratesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  rateCol: {
    alignItems: 'center'
  },
  rateLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  rateVal: {
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
