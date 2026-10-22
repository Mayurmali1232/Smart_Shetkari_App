import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Modal, Alert, ScrollView } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONTS } from '../../../constants/theme';
import { dairyService } from '../../../services/dairyService';
import { useTranslation } from 'react-i18next';
import AppHeader from '../../../components/AppHeader';
import AppInput from '../../../components/AppInput';
import AppButton from '../../../components/AppButton';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorMessage from '../../../components/ErrorMessage';
import EmptyState from '../../../components/EmptyState';

const RECORD_TYPES = [
  { id: 'VACCINATION', label: 'Vaccination / लस 💉' },
  { id: 'DEWORMING', label: 'Deworming / जंतनाशक 💊' },
  { id: 'TREATMENT', label: 'Medical Treatment / उपचार 🩺' },
  { id: 'CHECKUP', label: 'Vet Checkup / तपासणी 📋' },
  { id: 'ARTIFICIAL_INSEMINATION', label: 'Insemination / रेतन 🧬' }
];

export default function AnimalHealthScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState('reminders'); // 'reminders' | 'history'
  const [reminders, setReminders] = useState([]);
  const [history, setHistory] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAnimalId, setSelectedAnimalId] = useState(null);
  const [recordDate, setRecordDate] = useState(new Date().toISOString().split('T')[0]);
  const [recordType, setRecordType] = useState('VACCINATION');
  const [treatmentName, setTreatmentName] = useState('');
  const [medicineName, setMedicineName] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [cost, setCost] = useState('');
  const [nextDueDate, setNextDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setError('');
      const [remRes, histRes, animalRes] = await Promise.all([
        dairyService.getReminders(30),
        dairyService.listHealthRecords(),
        dairyService.listAnimals({ status: 'ACTIVE' })
      ]);

      if (remRes.success && remRes.data) setReminders(remRes.data);
      if (histRes.success && histRes.data) setHistory(histRes.data);
      if (animalRes.success && animalRes.data) {
        setAnimals(animalRes.data);
        if (!selectedAnimalId && animalRes.data.length > 0) {
          setSelectedAnimalId(animalRes.data[0].id);
        }
      }
    } catch (e) {
      setError(e.message || 'Failed to load health records');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedAnimalId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleSaveHealth = async () => {
    if (!selectedAnimalId) {
      Alert.alert('Required', 'Please select an animal / जनावर निवडा');
      return;
    }
    if (!treatmentName.trim()) {
      Alert.alert('Required', 'Please enter treatment or vaccine name');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        animalId: selectedAnimalId,
        recordDate,
        recordType,
        treatmentName: treatmentName.trim(),
        medicineName: medicineName.trim() || undefined,
        doctorName: doctorName.trim() || undefined,
        cost: cost ? parseFloat(cost) : 0,
        nextDueDate: nextDueDate.trim() || undefined,
        notes: notes.trim() || undefined
      };

      const res = await dairyService.recordHealthEvent(payload);
      if (res.success) {
        setModalVisible(false);
        setTreatmentName('');
        setMedicineName('');
        setDoctorName('');
        setCost('');
        setNextDueDate('');
        setNotes('');
        loadData();
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to record health event');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (recId) => {
    Alert.alert(
      'Delete Health Record / नोंद हटवा',
      'Are you sure you want to delete this medical record?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await dairyService.deleteHealthRecord(recId);
              if (res.success) loadData();
            } catch (e) {
              Alert.alert('Error', e.message || 'Failed to delete record');
            }
          }
        }
      ]
    );
  };

  const renderCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.treatmentTitle}>
            {item.recordType === 'VACCINATION' ? '💉' : '🩺'} {item.treatmentName}
          </Text>
          <Text style={styles.animalSub}>
            🐄 {item.animalName} {item.animalTagNumber ? `(#${item.animalTagNumber})` : ''} • Date: {item.recordDate}
          </Text>
        </View>
        <Text style={styles.costBadge}>₹{item.cost || 0}</Text>
      </View>

      {item.medicineName ? (
        <Text style={styles.detailText}>💊 Medicine: {item.medicineName}</Text>
      ) : null}

      {item.doctorName ? (
        <Text style={styles.detailText}>👨‍⚕️ Doctor: Dr. {item.doctorName}</Text>
      ) : null}

      {item.nextDueDate ? (
        <View style={styles.reminderPill}>
          <Text style={[styles.reminderPillText, item.isOverdue && { color: '#dc2626' }]}>
            {item.isOverdue ? '⚠️ OVERDUE: ' : '⏰ Next Due: '} {item.nextDueDate}
          </Text>
        </View>
      ) : null}

      <View style={styles.cardFooter}>
        <Text style={styles.typeTag}>Type: {item.recordType}</Text>
        <TouchableOpacity onPress={() => handleDelete(item.id)}>
          <Text style={styles.deleteLink}>🗑️ Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title={t('dairy.health') || 'Health & Vaccination'}
        subtitle="Vaccine schedule, treatment log & reminders"
        showBack={true}
        fallbackRoute="/dairy"
      />

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'reminders' && styles.tabBtnActive]}
          onPress={() => setActiveTab('reminders')}
        >
          <Text style={[styles.tabText, activeTab === 'reminders' && styles.tabTextActive]}>
            ⏰ Reminders ({reminders.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'history' && styles.tabBtnActive]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
            📋 All Records ({history.length})
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actionHeader}>
        <Text style={styles.sectionTitle}>
          {activeTab === 'reminders' ? 'Upcoming in Next 30 Days' : 'Medical History'}
        </Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Text style={styles.addBtnText}>+ Log Health / नोंदवा</Text>
        </TouchableOpacity>
      </View>

      {error ? <ErrorMessage message={error} onRetry={loadData} /> : null}

      {loading && !refreshing ? (
        <LoadingIndicator message="Loading health data..." />
      ) : (
        <FlatList
          data={activeTab === 'reminders' ? reminders : history}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderCard}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
          ListEmptyComponent={
            <EmptyState
              icon="💉"
              title={activeTab === 'reminders' ? 'No upcoming vaccination reminders' : 'No health records yet'}
              description="Keep track of vaccinations, artificial insemination, and medical treatments."
              actionLabel="+ Log First Health Event"
              onAction={() => setModalVisible(true)}
            />
          }
        />
      )}

      {/* Add Health Record Modal */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Add Medical Record / आरोग्य नोंद</Text>
              <Text style={styles.modalSubtitle}>Vaccination, Deworming, Insemination or Treatment</Text>

              {/* Animal Select */}
              <Text style={styles.fieldLabel}>Select Animal / जनावर निवडा *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.md }}>
                {animals.map((a) => (
                  <TouchableOpacity
                    key={a.id}
                    style={[styles.chip, selectedAnimalId === a.id && styles.chipActive]}
                    onPress={() => setSelectedAnimalId(a.id)}
                  >
                    <Text style={[styles.chipText, selectedAnimalId === a.id && styles.chipTextActive]}>
                      🐄 {a.name} ({a.tagNumber || 'No Tag'})
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Record Type */}
              <Text style={styles.fieldLabel}>Record Type / प्रकार *</Text>
              <View style={styles.typeChipsRow}>
                {RECORD_TYPES.map((rt) => (
                  <TouchableOpacity
                    key={rt.id}
                    style={[styles.typeChip, recordType === rt.id && styles.typeChipActive]}
                    onPress={() => setRecordType(rt.id)}
                  >
                    <Text style={[styles.typeChipText, recordType === rt.id && styles.typeChipTextActive]}>
                      {rt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <AppInput
                label="Treatment / Vaccine Name (लस किंवा उपचाराचे नाव) *"
                placeholder="e.g. FMD Booster / Brucellosis / Albendazole"
                value={treatmentName}
                onChangeText={setTreatmentName}
              />

              <AppInput
                label="Date of Treatment (YYYY-MM-DD) *"
                value={recordDate}
                onChangeText={setRecordDate}
              />

              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <AppInput
                    label="Medicine / Dose"
                    placeholder="e.g. 5ml sub-cut"
                    value={medicineName}
                    onChangeText={setMedicineName}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: SPACING.md }}>
                  <AppInput
                    label="Doctor / Vet Name"
                    placeholder="e.g. Dr. Deshmukh"
                    value={doctorName}
                    onChangeText={setDoctorName}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <AppInput
                    label="Cost (₹)"
                    placeholder="e.g. 150"
                    keyboardType="numeric"
                    value={cost}
                    onChangeText={setCost}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: SPACING.md }}>
                  <AppInput
                    label="Next Booster Due Date"
                    placeholder="YYYY-MM-DD"
                    value={nextDueDate}
                    onChangeText={setNextDueDate}
                  />
                </View>
              </View>

              <AppInput
                label="Notes (Optional)"
                placeholder="Observation or next steps"
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
                  title={saving ? 'Saving...' : 'Save Record / जतन करा'}
                  onPress={handleSaveHealth}
                  loading={saving}
                  disabled={saving}
                  style={{ flex: 2 }}
                />
              </View>
            </ScrollView>
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  tabBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: RADIUS.md
  },
  tabBtnActive: {
    backgroundColor: COLORS.primaryLight
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  treatmentTitle: {
    fontSize: FONTS.medium,
    fontWeight: '700',
    color: COLORS.textPrimary
  },
  animalSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2
  },
  costBadge: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary
  },
  detailText: {
    fontSize: 12,
    color: COLORS.textPrimary,
    marginTop: 2
  },
  reminderPill: {
    backgroundColor: '#faf5ff',
    borderWidth: 1,
    borderColor: '#e9d5ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
    alignSelf: 'flex-start',
    marginTop: 6
  },
  reminderPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7c3aed'
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.xs + 2,
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight
  },
  typeTag: {
    fontSize: 10,
    color: COLORS.textMuted
  },
  deleteLink: {
    fontSize: 11,
    color: '#dc2626',
    fontWeight: '600'
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
    maxWidth: 450,
    maxHeight: '90%',
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
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4
  },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.xs
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryDark
  },
  chipText: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: '600'
  },
  chipTextActive: {
    color: '#ffffff',
    fontWeight: '700'
  },
  typeChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.md
  },
  typeChip: {
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 5,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#f8fafc'
  },
  typeChipActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary
  },
  typeChipText: {
    fontSize: 11,
    color: COLORS.textPrimary,
    fontWeight: '600'
  },
  typeChipTextActive: {
    color: COLORS.primaryDark,
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
