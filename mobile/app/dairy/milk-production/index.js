import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Modal, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONTS } from '../../../constants/theme';
import { dairyService } from '../../../services/dairyService';
import { useTranslation } from 'react-i18next';
import AppHeader from '../../../components/AppHeader';
import AppInput from '../../../components/AppInput';
import AppButton from '../../../components/AppButton';
import DateSelector from '../../../components/DateSelector';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorMessage from '../../../components/ErrorMessage';
import EmptyState from '../../../components/EmptyState';

export default function MilkProductionScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [productions, setProductions] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAnimalId, setSelectedAnimalId] = useState(null);
  const [morningLiters, setMorningLiters] = useState('');
  const [eveningLiters, setEveningLiters] = useState('');
  const [totalLiters, setTotalLiters] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const loadData = useCallback(async (dateToLoad) => {
    try {
      setError('');
      const dateStr = dateToLoad || selectedDate;
      const [prodRes, animalRes] = await Promise.all([
        dairyService.listMilkProduction({ startDate: dateStr, endDate: dateStr }),
        dairyService.listAnimals({ status: 'ACTIVE' })
      ]);

      if (prodRes.success && prodRes.data) setProductions(prodRes.data);
      if (animalRes.success && animalRes.data) {
        setAnimals(animalRes.data);
        if (!selectedAnimalId && animalRes.data.length > 0) {
          setSelectedAnimalId(animalRes.data[0].id);
        }
      }
    } catch (e) {
      setError(e.message || 'Failed to load milk production');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedDate, selectedAnimalId]);

  useFocusEffect(
    useCallback(() => {
      loadData(selectedDate);
    }, [selectedDate, loadData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData(selectedDate);
  };

  const handleMorningChange = (val) => {
    setMorningLiters(val);
    const m = parseFloat(val) || 0;
    const e = parseFloat(eveningLiters) || 0;
    setTotalLiters((m + e).toFixed(2));
  };

  const handleEveningChange = (val) => {
    setEveningLiters(val);
    const m = parseFloat(morningLiters) || 0;
    const e = parseFloat(val) || 0;
    setTotalLiters((m + e).toFixed(2));
  };

  const openAddModal = (existing = null) => {
    if (existing) {
      setEditingId(existing.id);
      setSelectedAnimalId(existing.animalId);
      setMorningLiters(existing.morningLiters?.toString() || '');
      setEveningLiters(existing.eveningLiters?.toString() || '');
      setTotalLiters(existing.totalLiters?.toString() || '');
      setNotes(existing.notes || '');
    } else {
      setEditingId(null);
      setMorningLiters('');
      setEveningLiters('');
      setTotalLiters('');
      setNotes('');
      if (animals.length > 0) {
        setSelectedAnimalId(animals[0].id);
      }
    }
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!selectedAnimalId) {
      Alert.alert('Required', 'Please select an animal / जनावर निवडा');
      return;
    }

    const m = parseFloat(morningLiters) || 0;
    const e = parseFloat(eveningLiters) || 0;
    const tLiters = totalLiters ? parseFloat(totalLiters) : (m + e);

    if (tLiters <= 0) {
      Alert.alert('Invalid', 'Total milk must be greater than 0 / दुधाचे प्रमाण ० पेक्षा जास्त असावे');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        animalId: selectedAnimalId,
        productionDate: selectedDate,
        morningLiters: m,
        eveningLiters: e,
        totalLiters: tLiters,
        notes: notes.trim() || undefined
      };

      const res = await dairyService.recordMilkProduction(payload);
      if (res.success) {
        setModalVisible(false);
        loadData(selectedDate);
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to save milk production');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (prodId) => {
    Alert.alert(
      'Delete Record / नोंद हटवा',
      'Are you sure you want to delete this milk production entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await dairyService.deleteMilkProduction(prodId);
              if (res.success) {
                loadData(selectedDate);
              }
            } catch (e) {
              Alert.alert('Error', e.message || 'Failed to delete record');
            }
          }
        }
      ]
    );
  };

  // Aggregations for the date
  const totalDayLiters = productions.reduce((acc, p) => acc + (parseFloat(p.totalLiters) || 0), 0);
  const totalMorning = productions.reduce((acc, p) => acc + (parseFloat(p.morningLiters) || 0), 0);
  const totalEvening = productions.reduce((acc, p) => acc + (parseFloat(p.eveningLiters) || 0), 0);
  const avgPerAnimal = productions.length > 0 ? (totalDayLiters / productions.length).toFixed(1) : '0';

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.animalTitle}>
            {item.animalType === 'BUFFALO' ? '🐃' : item.animalType === 'GOAT' ? '🐐' : '🐄'} {item.animalName}
            {item.animalTagNumber ? ` (#${item.animalTagNumber})` : ''}
          </Text>
          <View style={styles.shiftBadgesRow}>
            <View style={styles.morningBadge}>
              <Text style={styles.morningBadgeText}>🌅 Morning: {item.morningLiters || 0} L</Text>
            </View>
            <View style={styles.eveningBadge}>
              <Text style={styles.eveningBadgeText}>🌙 Evening: {item.eveningLiters || 0} L</Text>
            </View>
          </View>
        </View>
        <View style={styles.totalBadgeContainer}>
          <Text style={styles.totalBadgeLabel}>Daily Total</Text>
          <Text style={styles.totalBadge}>{item.totalLiters} L</Text>
        </View>
      </View>

      {item.notes ? <Text style={styles.notesText}>Notes: {item.notes}</Text> : null}

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => openAddModal(item)}>
          <Text style={styles.actionText}>✏️ Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { marginLeft: SPACING.md }]} onPress={() => handleDelete(item.id)}>
          <Text style={[styles.actionText, { color: '#dc2626' }]}>🗑️ Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title={t('dairy.milkProduction') || 'Milk Production'}
        subtitle="Daily milking records & totals"
        showBack={true}
        fallbackRoute="/dairy"
      />

      <DateSelector
        currentDate={selectedDate}
        onDateChange={(d) => {
          setSelectedDate(d);
          setLoading(true);
        }}
      />

      {/* Summary Box */}
      <View style={styles.summaryBox}>
        <View style={styles.summaryCol}>
          <Text style={styles.summaryLabel}>Total Today</Text>
          <Text style={styles.summaryVal}>{totalDayLiters.toFixed(1)} L</Text>
        </View>
        <View style={styles.summaryCol}>
          <Text style={styles.summaryLabel}>🌅 Morning</Text>
          <Text style={[styles.summaryVal, { color: '#d97706' }]}>{totalMorning.toFixed(1)} L</Text>
        </View>
        <View style={styles.summaryCol}>
          <Text style={styles.summaryLabel}>🌙 Evening</Text>
          <Text style={[styles.summaryVal, { color: '#4f46e5' }]}>{totalEvening.toFixed(1)} L</Text>
        </View>
        <View style={styles.summaryCol}>
          <Text style={styles.summaryLabel}>Avg/Animal</Text>
          <Text style={styles.summaryVal}>{avgPerAnimal} L</Text>
        </View>
      </View>

      <View style={styles.actionHeader}>
        <Text style={styles.sectionTitle}>Recorded Milking ({productions.length})</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => openAddModal()}>
          <Text style={styles.addBtnText}>+ Log Milk / दूध नोंदवा</Text>
        </TouchableOpacity>
      </View>

      {error ? <ErrorMessage message={error} onRetry={() => loadData(selectedDate)} /> : null}

      {loading && !refreshing ? (
        <LoadingIndicator message="Loading records..." />
      ) : (
        <FlatList
          data={productions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
          ListEmptyComponent={
            <EmptyState
              icon="🥛"
              title="No milk logged for this date"
              message="Tap below to record morning (🌅) and evening (🌙) milk for your animals."
              actionTitle="+ Log Milk Now"
              onAction={() => openAddModal()}
            />
          }
        />
      )}

      {/* Add / Edit Milk Modal */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingId ? 'Edit Milk Record' : 'Record Milk Production / दूध नोंद'}
            </Text>
            <Text style={styles.modalSubtitle}>Date: {selectedDate}</Text>

            {/* Animal Selection */}
            <Text style={styles.fieldLabel}>Select Animal / जनावर निवडा *</Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={animals}
              keyExtractor={(item) => item.id.toString()}
              style={{ marginBottom: SPACING.md }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.animalChip,
                    selectedAnimalId === item.id && styles.animalChipActive
                  ]}
                  onPress={() => setSelectedAnimalId(item.id)}
                >
                  <Text style={[styles.animalChipText, selectedAnimalId === item.id && styles.animalChipTextActive]}>
                    {item.animalType === 'BUFFALO' ? '🐃' : '🐄'} {item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <AppInput
                  label="🌅 Morning (L) / सकाळ *"
                  placeholder="e.g. 7.5"
                  keyboardType="numeric"
                  value={morningLiters}
                  onChangeText={handleMorningChange}
                />
              </View>
              <View style={{ flex: 1, marginLeft: SPACING.md }}>
                <AppInput
                  label="🌙 Evening (L) / संध्याकाळ *"
                  placeholder="e.g. 6.0"
                  keyboardType="numeric"
                  value={eveningLiters}
                  onChangeText={handleEveningChange}
                />
              </View>
            </View>

            <AppInput
              label="Total Liters / एकूण (L) *"
              placeholder="Total"
              keyboardType="numeric"
              value={totalLiters}
              onChangeText={setTotalLiters}
            />

            <AppInput
              label="Notes (Optional)"
              placeholder="e.g. Fed extra minerals today"
              value={notes}
              onChangeText={setNotes}
            />

            <View style={styles.modalActions}>
              <AppButton
                title="Cancel"
                variant="outline"
                onPress={() => setModalVisible(false)}
                style={{ flex: 1, marginRight: SPACING.sm }}
              />
              <AppButton
                title={saving ? 'Saving...' : 'Save Milk / जतन करा'}
                onPress={handleSave}
                loading={saving}
                disabled={saving}
                style={{ flex: 2 }}
              />
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
  summaryBox: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.sm + 4,
    paddingHorizontal: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  summaryCol: {
    alignItems: 'center',
    flex: 1
  },
  summaryLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 2
  },
  summaryVal: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primaryDark
  },
  actionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xs
  },
  sectionTitle: {
    fontSize: FONTS.medium,
    fontWeight: '700',
    color: COLORS.textPrimary
  },
  addBtn: {
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 1
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  animalTitle: {
    fontSize: FONTS.medium,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4
  },
  shiftBadgesRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginTop: 2
  },
  morningBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: '#fde047'
  },
  morningBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#b45309'
  },
  eveningBadge: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: '#c7d2fe'
  },
  eveningBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4338ca'
  },
  totalBadgeContainer: {
    alignItems: 'flex-end'
  },
  totalBadgeLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '600'
  },
  totalBadge: {
    fontSize: FONTS.large,
    fontWeight: '800',
    color: COLORS.primary
  },
  notesText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    marginTop: 4
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: SPACING.sm,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight
  },
  actionBtn: {
    paddingVertical: 2
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primaryDark
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md
  },
  modalContent: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    elevation: 5
  },
  modalTitle: {
    fontSize: FONTS.large,
    fontWeight: '700',
    color: COLORS.textPrimary
  },
  modalSubtitle: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 6
  },
  animalChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.xs
  },
  animalChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryDark
  },
  animalChipText: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: '600'
  },
  animalChipTextActive: {
    color: '#ffffff',
    fontWeight: '700'
  },
  row: {
    flexDirection: 'row'
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: SPACING.md
  }
});
