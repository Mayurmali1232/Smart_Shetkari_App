import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert, Image, Modal } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONTS } from '../../../constants/theme';
import { dairyService } from '../../../services/dairyService';
import { useTranslation } from 'react-i18next';
import AppHeader from '../../../components/AppHeader';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorMessage from '../../../components/ErrorMessage';
import ImageAttachment from '../../../components/ImageAttachment';

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

  const [photoEditing, setPhotoEditing] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [selectedPreviewImage, setSelectedPreviewImage] = useState(null);

  const handleUpdatePhoto = async (photo) => {
    try {
      const updated = {
        name: animal.name,
        animalType: animal.animalType,
        tagNumber: animal.tagNumber,
        breed: animal.breed,
        gender: animal.gender,
        ageYears: animal.ageYears,
        healthStatus: animal.healthStatus,
        milkingStatus: animal.milkingStatus,
        status: animal.status,
        dailyFeedRequirement: animal.dailyFeedRequirement,
        photoUrl: photo,
        notes: animal.notes
      };
      const res = await dairyService.updateAnimal(id, updated);
      if (res.success && res.data) {
        setAnimal(res.data);
        setPhotoEditing(false);
        Alert.alert('Success', 'Animal photo updated successfully!');
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to update photo');
    }
  };

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
                <View style={[styles.avatar, animal.photoUrl ? styles.avatarWithPhoto : null]}>
                  {animal.photoUrl ? (
                    <Image source={{ uri: animal.photoUrl }} style={styles.avatarImg} resizeMode="cover" />
                  ) : (
                    <Text style={styles.avatarEmoji}>
                      {animal.animalType === 'COW' ? '🐄' : animal.animalType === 'BUFFALO' ? '🐃' : animal.animalType === 'GOAT' ? '🐐' : '🐑'}
                    </Text>
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.animalName}>{animal.name}</Text>
                  <Text style={styles.animalSub}>
                    {animal.breed || animal.animalType} • {animal.gender === 'FEMALE' ? 'Female (मादी)' : 'Male (नर)'}
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
                    <TouchableOpacity
                      style={styles.photoActionBadge}
                      onPress={() => {
                        setNewPhotoUrl(animal.photoUrl || '');
                        setPhotoEditing(!photoEditing);
                      }}
                    >
                      <Text style={styles.photoActionText}>📷 {animal.photoUrl ? 'Change' : 'Add Photo'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {photoEditing && (
                <View style={styles.photoEditBox}>
                  <ImageAttachment
                    value={newPhotoUrl}
                    onChange={(photo) => {
                      setNewPhotoUrl(photo);
                      handleUpdatePhoto(photo);
                    }}
                    label="Animal Photo / जनावराचा फोटो"
                    placeholderIcon="📷"
                    hint="Snap or upload animal photo"
                  />
                </View>
              )}

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
                      {h.documentUrl ? (
                        <TouchableOpacity
                          style={styles.attachmentPill}
                          onPress={() => setSelectedPreviewImage({ uri: h.documentUrl, title: `${h.treatmentName} Prescription` })}
                        >
                          <Text style={styles.attachmentPillText}>📋 View Prescription / पावती पहा</Text>
                        </TouchableOpacity>
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
                      {e.receiptUrl ? (
                        <TouchableOpacity
                          style={styles.attachmentPill}
                          onPress={() => setSelectedPreviewImage({ uri: e.receiptUrl, title: `${e.category} Receipt` })}
                        >
                          <Text style={styles.attachmentPillText}>🧾 View Bill / पावती पहा</Text>
                        </TouchableOpacity>
                      ) : null}
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

      {/* Image Preview Modal for Prescriptions and Receipts */}
      <Modal
        visible={!!selectedPreviewImage}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedPreviewImage(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedPreviewImage?.title || 'Document'}</Text>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setSelectedPreviewImage(null)}
              >
                <Text style={styles.closeBtnText}>✕ Close</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.fullImageContainer}>
              {selectedPreviewImage?.uri && (
                <Image
                  source={{ uri: selectedPreviewImage.uri }}
                  style={styles.fullImage}
                  resizeMode="contain"
                />
              )}
            </View>
          </View>
        </View>
      </Modal>
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
    marginRight: SPACING.md,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#cbd5e1'
  },
  avatarWithPhoto: {
    borderColor: COLORS.primary
  },
  avatarImg: {
    width: '100%',
    height: '100%'
  },
  avatarEmoji: {
    fontSize: 34
  },
  photoActionBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: '#bfdbfe'
  },
  photoActionText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563eb'
  },
  photoEditBox: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight
  },
  attachmentPill: {
    marginTop: SPACING.xs + 2,
    alignSelf: 'flex-start',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: '#bfdbfe'
  },
  attachmentPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1d4ed8'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md
  },
  modalContent: {
    width: '100%',
    maxWidth: 600,
    maxHeight: '90%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    overflow: 'hidden'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight
  },
  modalTitle: {
    fontSize: FONTS.medium,
    fontWeight: 'bold',
    color: COLORS.textPrimary
  },
  closeBtn: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.sm
  },
  closeBtnText: {
    fontSize: FONTS.small,
    fontWeight: 'bold',
    color: COLORS.textPrimary
  },
  fullImageContainer: {
    width: '100%',
    height: 420,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center'
  },
  fullImage: {
    width: '100%',
    height: '100%'
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
