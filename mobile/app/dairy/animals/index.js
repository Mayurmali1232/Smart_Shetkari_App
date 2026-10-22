import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, TextInput, Image } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONTS } from '../../../constants/theme';
import { dairyService } from '../../../services/dairyService';
import { useTranslation } from 'react-i18next';
import AppHeader from '../../../components/AppHeader';
import AppButton from '../../../components/AppButton';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorMessage from '../../../components/ErrorMessage';
import EmptyState from '../../../components/EmptyState';

const ANIMAL_TYPE_FILTERS = [
  { id: 'ALL', label: 'All / सर्व' },
  { id: 'COW', label: 'Cows / गाई 🐄' },
  { id: 'BUFFALO', label: 'Buffaloes / म्हशी 🐃' },
  { id: 'GOAT', label: 'Goats / शेळ्या 🐐' },
  { id: 'SHEEP', label: 'Sheep / मेंढ्या 🐑' },
  { id: 'OTHER', label: 'Other / इतर 🐾' }
];

export default function AnimalListScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [animals, setAnimals] = useState([]);
  const [selectedType, setSelectedType] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchAnimals = useCallback(async () => {
    try {
      setError('');
      const typeParam = selectedType === 'ALL' ? null : selectedType;
      const res = await dairyService.listAnimals({ type: typeParam, status: 'ACTIVE' });
      if (res.success && res.data) {
        setAnimals(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load animals');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedType]);

  useFocusEffect(
    useCallback(() => {
      fetchAnimals();
    }, [fetchAnimals])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchAnimals();
  };

  const filteredAnimals = animals.filter((a) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const nameMatch = a.name && a.name.toLowerCase().includes(q);
    const tagMatch = a.tagNumber && a.tagNumber.toLowerCase().includes(q);
    const breedMatch = a.breed && a.breed.toLowerCase().includes(q);
    return nameMatch || tagMatch || breedMatch;
  });

  const getAnimalEmoji = (type) => {
    switch (type) {
      case 'COW': return '🐄';
      case 'BUFFALO': return '🐃';
      case 'GOAT': return '🐐';
      case 'SHEEP': return '🐑';
      default: return '🐾';
    }
  };

  const getAnimalBadgeStyle = (type) => {
    switch (type) {
      case 'COW': return { bg: '#dcfce7', border: '#86efac', text: '#15803d' };
      case 'BUFFALO': return { bg: '#e0f2fe', border: '#7dd3fc', text: '#0284c7' };
      case 'GOAT': return { bg: '#fef3c7', border: '#fde047', text: '#b45309' };
      case 'SHEEP': return { bg: '#ede9fe', border: '#d8b4fe', text: '#7c3aed' };
      default: return { bg: '#f1f5f9', border: '#cbd5e1', text: '#475569' };
    }
  };

  const renderAnimalCard = ({ item }) => {
    const isMilking = item.milkingStatus === 'MILKING';
    const isHealthy = item.healthStatus === 'HEALTHY';
    const badgeStyle = getAnimalBadgeStyle(item.animalType);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/dairy/animals/${item.id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.cardTop}>
          <View style={[styles.avatarBox, { backgroundColor: badgeStyle.bg, borderColor: badgeStyle.border }]}>
            {item.photoUrl ? (
              <Image source={{ uri: item.photoUrl }} style={styles.avatarPhoto} resizeMode="cover" />
            ) : (
              <Text style={styles.avatarEmoji}>{getAnimalEmoji(item.animalType)}</Text>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.nameRow}>
              <Text style={styles.animalName}>{item.name}</Text>
              {item.tagNumber ? (
                <View style={styles.tagBadge}>
                  <Text style={styles.tagText}>🏷️ #{item.tagNumber}</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.animalSub}>
              {item.breed || item.animalType} • {item.gender === 'FEMALE' ? 'Female (मादी)' : 'Male (नर)'}
              {item.ageYears ? ` • ${item.ageYears} yrs` : ''}
            </Text>
          </View>
        </View>

        <View style={styles.badgeRow}>
          <View style={[styles.statusBadge, { backgroundColor: isMilking ? '#dcfce7' : '#f1f5f9' }]}>
            <Text style={[styles.statusBadgeText, { color: isMilking ? '#15803d' : '#64748b' }]}>
              {item.milkingStatus === 'MILKING' ? '🥛 Milking (दुभती)' : item.milkingStatus}
            </Text>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: isHealthy ? '#ecfdf5' : '#fee2e2' }]}>
            <Text style={[styles.statusBadgeText, { color: isHealthy ? '#059669' : '#dc2626' }]}>
              {item.healthStatus === 'HEALTHY' ? '💚 Healthy' : `⚠️ ${item.healthStatus}`}
            </Text>
          </View>

          {item.photoUrl ? (
            <View style={[styles.statusBadge, { backgroundColor: '#eff6ff' }]}>
              <Text style={[styles.statusBadgeText, { color: '#2563eb' }]}>📷 Photo</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.statLabel}>Lifetime Milk</Text>
            <Text style={styles.statVal}>{item.totalMilkProducedLiters || 0} L</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.statLabel}>Expenses</Text>
            <Text style={[styles.statVal, { color: '#dc2626' }]}>₹{item.totalExpensesIncurred || 0}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title={t('dairy.animals') || 'My Animals'}
        subtitle={`${filteredAnimals.length} Livestock registered`}
        showBack={true}
        fallbackRoute="/dairy"
      />

      <View style={styles.searchBarBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, tag #, breed... / शोधा"
          placeholderTextColor={COLORS.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity
          style={styles.addBtnSmall}
          onPress={() => router.push('/dairy/animals/add')}
        >
          <Text style={styles.addBtnSmallText}>+ Add Animal</Text>
        </TouchableOpacity>
      </View>

      {/* Type Filters */}
      <View style={styles.filterScrollBox}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={ANIMAL_TYPE_FILTERS}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedType === item.id && styles.filterChipActive
              ]}
              onPress={() => setSelectedType(item.id)}
            >
              <Text style={[
                styles.filterChipText,
                selectedType === item.id && styles.filterChipTextActive
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {error ? <ErrorMessage message={error} onRetry={fetchAnimals} /> : null}

      {loading && !refreshing ? (
        <LoadingIndicator message={t('common.loading') || 'Loading livestock...'} />
      ) : (
        <FlatList
          data={filteredAnimals}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderAnimalCard}
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
              icon="🐄"
              title={t('dairy.noAnimals') || 'No animals found'}
              message="Register your cows, buffaloes, and livestock to start tracking milk and health."
              actionTitle={t('dairy.addNewAnimal') || 'Add New Animal'}
              onAction={() => router.push('/dairy/animals/add')}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  searchBarBox: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    gap: SPACING.sm
  },
  searchInput: {
    flex: 1,
    height: 42,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    fontSize: FONTS.regular,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.textPrimary
  },
  addBtnSmall: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center'
  },
  addBtnSmallText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13
  },
  filterScrollBox: {
    marginTop: SPACING.xs + 2,
    marginBottom: SPACING.xs
  },
  filterList: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.xs
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryDark
  },
  filterChipText: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: '600'
  },
  filterChipTextActive: {
    color: '#ffffff',
    fontWeight: '700'
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm + 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs + 2
  },
  avatarBox: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm + 2,
    borderWidth: 1.5,
    overflow: 'hidden'
  },
  avatarPhoto: {
    width: '100%',
    height: '100%'
  },
  avatarEmoji: {
    fontSize: 26
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  animalName: {
    fontSize: FONTS.medium + 1,
    fontWeight: '700',
    color: COLORS.textPrimary
  },
  tagBadge: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.sm
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0369a1'
  },
  animalSub: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    marginTop: 2
  },
  badgeRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
    marginBottom: SPACING.sm
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600'
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: SPACING.xs + 4,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary
  },
  statVal: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 1
  }
});
