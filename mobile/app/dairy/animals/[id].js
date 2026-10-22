import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONTS } from '../../../constants/theme';
import { dairyService } from '../../../services/dairyService';
import { useTranslation } from 'react-i18next';
import AppHeader from '../../../components/AppHeader';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorMessage from '../../../components/ErrorMessage';

export default function AnimalDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { t } = useTranslation();

  const [animal, setAnimal] = useState(null);
  const [milkRecords, setMilkRecords] = useState([]);
  const [healthRecords, setHealthRecords] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const [activeTab, setActiveTab] = useState('milk'); // 'milk' | 'health' | 'expenses'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadAnimalData = useCallback(async () => {
    if (!id) return;
    try {
      setError('');
      const [animalRes, milkRes, healthRes, expRes] = await Promise.all([
        dairyService.getAnimal(id),
        dairyService.listMilkProduction({ animalId: id }),
        dairyService.listHealthRecords({ animalId: id }),
        dairyService.listExpenses({ animalId: id })
      ]);

      if (animalRes.success && animalRes.data) setAnimal(animalRes.data);
      if (milkRes.success && milkRes.data) setMilkRecords(milkRes.data);
      if (healthRes.success && healthRes.data) setHealthRecords(healthRes.data);
      if (expRes.success && expRes.data) setExpenses(expRes.data);
    } catch (e) {
      setError(e.message || 'Failed to load animal profile');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadAnimalData();
    }, [loadAnimalData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadAnimalData();
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Animal / जनावर काढून टाका',
      `Are you sure you want to remove "${animal?.name}"? Historical milk and financial records will be preserved.`,
      [
        { text: 'Cancel / रद्द करा', style: 'cancel' },
        {
          text: 'Delete / काढून टाका',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await dairyService.deleteAnimal(id);
              if (res.success) {
                Alert.alert('Deleted', 'Animal record removed successfully', [
                  { text: 'OK', onPress: () => router.replace('/dairy/animals') }
                ]);
              }
            } catch (err) {
              Alert.alert('Error', err.message || 'Failed to delete animal');
            }
          }
        }
      ]
    );
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader title="Animal Profile" showBack fallbackRoute="/dairy/animals" />
        <LoadingIndicator message="Loading profile..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title={animal?.name || 'Animal Profile'}
        subtitle={animal?.tagNumber ? `Tag #${animal.tagNumber}` : 'Livestock Profile'}
        showBack={true}
        fallbackRoute="/dairy/animals"
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {error ? <ErrorMessage message={error} onRetry={loadAnimalData} /> : null}

        {animal && (
          <>
            {/* Animal Header Card */}
            <View style={styles.profileCard}>
              <View style={styles.avatarRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarEmoji}>
                    {animal.animalType === 'COW' ? '🐄' : animal.animalType === 'BUFFALO' ? '🐃' : '🐐'}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.animalName}>{animal.name}</Text>
                  <Text style={styles.animalSub}>
                    {animal.breed || animal.animalType} • {animal.gender === 'FEMALE' ? 'Female' : 'Male'}
                    {animal.ageYears ? ` • ${animal.ageYears} yrs` : ''}
                  </Text>
                  <View style={styles.badgesRow}>
                    <View style={[styles.badge, { backgroundColor: '#dcfce7' }]}>
                      <Text style={[styles.badgeText, { color: '#15803d' }]}>
                        {animal.milkingStatus === 'MILKING' ? '🥛 Milking' : animal.milkingStatus}
                      </Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: '#ecfdf5' }]}>
                      <Text style={[styles.badgeText, { color: '#059669' }]}>
                        💚 {animal.healthStatus}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Feed & Notes */}
              {animal.dailyFeedRequirement ? (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>🌾 Daily Feed:</Text>
                  <Text style={styles.infoValue}>{animal.dailyFeedRequirement}</Text>
                </View>
              ) : null}

              {animal.purchaseCost > 0 ? (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>💰 Purchase Cost:</Text>
                  <Text style={styles.infoValue}>₹{animal.purchaseCost} ({animal.purchaseDate || 'N/A'})</Text>
                </View>
              ) : null}

              {/* Stats Box */}
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statNum}>{animal.totalMilkProducedLiters || 0} L</Text>
                  <Text style={styles.statLabel}>Lifetime Milk</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={[styles.statNum, { color: '#dc2626' }]}>₹{animal.totalExpensesIncurred || 0}</Text>
                  <Text style={styles.statLabel}>Total Expenses</Text>
                </View>
              </View>
            </View>

            {/* Sub-Navigation Tabs */}
            <View style={styles.tabBar}>
              {[
                { id: 'milk', label: `🥛 Milk (${milkRecords.length})` },
                { id: 'health', label: `💉 Health (${healthRecords.length})` },
                { id: 'expenses', label: `🌾 Expenses (${expenses.length})` }
              ].map((tab) => (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.tabBtn, activeTab === tab.id && styles.tabBtnActive]}
                  onPress={() => setActiveTab(tab.id)}
                >
                  <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Tab 1: Milk Production Records */}
            {activeTab === 'milk' && (
              <View>
                {milkRecords.length === 0 ? (
                  <View style={styles.emptyBox}>
                    <Text style={styles.emptyText}>No milk production records logged yet.</Text>
                  </View>
                ) : (
                  milkRecords.map((m) => (
                    <View key={m.id} style={styles.recordCard}>
                      <View style={styles.recordHeader}>
                        <Text style={styles.recordDate}>📅 {m.productionDate}</Text>
                        <Text style={styles.recordTotal}>{m.totalLiters} Liters</Text>
                      </View>
                      <Text style={styles.recordSub}>
                        Morning: {m.morningLiters} L • Evening: {m.eveningLiters} L
                        {m.notes ? ` • ${m.notes}` : ''}
                      </Text>
                    </View>
                  ))
                )}
              </View>
            )}

            {/* Tab 2: Health & Vaccination Records */}
            {activeTab === 'health' && (
              <View>
                {healthRecords.length === 0 ? (
                  <View style={styles.emptyBox}>
                    <Text style={styles.emptyText}>No health records logged yet.</Text>
                  </View>
                ) : (
                  healthRecords.map((h) => (
                    <View key={h.id} style={styles.recordCard}>
                      <View style={styles.recordHeader}>
                        <Text style={styles.recordDate}>💉 {h.treatmentName}</Text>
                        <Text style={styles.recordTotal}>₹{h.cost || 0}</Text>
                      </View>
                      <Text style={styles.recordSub}>
                        Date: {h.recordDate} • Type: {h.recordType}
                        {h.doctorName ? ` • Dr. ${h.doctorName}` : ''}
                      </Text>
                      {h.nextDueDate ? (
                        <Text style={[styles.recordSub, { color: '#9333ea', fontWeight: '600', marginTop: 2 }]}>
                          ⏰ Next Booster Due: {h.nextDueDate}
                        </Text>
                      ) : null}
                    </View>
                  ))
                )}
              </View>
            )}

            {/* Tab 3: Expenses Records */}
            {activeTab === 'expenses' && (
              <View>
                {expenses.length === 0 ? (
                  <View style={styles.emptyBox}>
                    <Text style={styles.emptyText}>No animal expenses logged yet.</Text>
                  </View>
                ) : (
                  expenses.map((e) => (
                    <View key={e.id} style={styles.recordCard}>
                      <View style={styles.recordHeader}>
                        <Text style={styles.recordDate}>🌾 {e.category}</Text>
                        <Text style={[styles.recordTotal, { color: '#dc2626' }]}>₹{e.amount}</Text>
                      </View>
                      <Text style={styles.recordSub}>
                        Date: {e.expenseDate}
                        {e.quantity ? ` • Qty: ${e.quantity} ${e.unit || ''}` : ''}
                        {e.description ? ` • ${e.description}` : ''}
                      </Text>
                    </View>
                  ))
                )}
              </View>
            )}

            {/* Danger Zone: Delete Animal */}
            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
              <Text style={styles.deleteBtnText}>🗑️ Delete Animal Record</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
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
  profileCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.lg,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md
  },
  avatarEmoji: {
    fontSize: 34
  },
  animalName: {
    fontSize: FONTS.large,
    fontWeight: '800',
    color: COLORS.textPrimary
  },
  animalSub: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    marginTop: 2
  },
  badgesRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginTop: 6
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.sm
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700'
  },
  infoRow: {
    marginTop: SPACING.xs + 2,
    paddingTop: SPACING.xs + 2,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary
  },
  infoValue: {
    fontSize: 13,
    color: COLORS.textPrimary,
    marginTop: 2
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight
  },
  statBox: {
    flex: 1,
    alignItems: 'center'
  },
  statNum: {
    fontSize: FONTS.large,
    fontWeight: '800',
    color: COLORS.primary
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: RADIUS.md,
    padding: 3,
    marginBottom: SPACING.md
  },
  tabBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: RADIUS.sm
  },
  tabBtnActive: {
    backgroundColor: COLORS.surface,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary
  },
  tabTextActive: {
    color: COLORS.primaryDark,
    fontWeight: '700'
  },
  recordCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.xs + 4,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  recordDate: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary
  },
  recordTotal: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary
  },
  recordSub: {
    fontSize: 12,
    color: COLORS.textSecondary
  },
  emptyBox: {
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border
  },
  emptyText: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary
  },
  deleteBtn: {
    marginTop: SPACING.xl,
    paddingVertical: SPACING.md,
    backgroundColor: '#fee2e2',
    borderRadius: RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fca5a5'
  },
  deleteBtnText: {
    color: '#dc2626',
    fontWeight: '700',
    fontSize: 13
  }
});
