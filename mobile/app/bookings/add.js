import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, RADIUS, FONTS } from '../../constants/theme';
import { bookingService } from '../../services/bookingService';
import { tractorService } from '../../services/tractorService';
import { useTranslation } from 'react-i18next';
import AppHeader from '../../components/AppHeader';
import AppButton from '../../components/AppButton';
import AppInput from '../../components/AppInput';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorMessage from '../../components/ErrorMessage';

const STORAGE_KEY_CUSTOM_WORK = '@custom_tractor_work_types';

const BUILTIN_WORK_TYPES = [
  { id: 'PLOWING', label: 'Plowing / नांगरणी' },
  { id: 'ROTAVATOR', label: 'Rotavator / रोटाव्हेटर' },
  { id: 'CULTIVATOR', label: 'Cultivator / कल्टीवेटर' },
  { id: 'LEVELLING', label: 'Levelling / जमीन सपाटीकरण' },
  { id: 'RIDGING', label: 'Ridging / सरी पाडणे' },
  { id: 'SOWING', label: 'Sowing / पेरणी' },
  { id: 'HARVESTING', label: 'Harvesting / कापणी' },
  { id: 'THRESHING', label: 'Threshing / मळणी' },
  { id: 'BUNDING', label: 'Bunding / बांध बंदिस्ती' },
  { id: 'SPRAYING', label: 'Spraying / फवारणी' },
  { id: 'TRANSPORT', label: 'Transport / वाहतूक' },
  { id: 'OTHER', label: 'Other / इतर' }
];

export default function AddBookingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { t } = useTranslation();

  const [tractors, setTractors] = useState([]);
  const [loadingTractors, setLoadingTractors] = useState(true);

  // Form Fields
  const [selectedTractorId, setSelectedTractorId] = useState(params.tractorId ? Number(params.tractorId) : null);
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [workDate, setWorkDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('12:00');
  const [workLocation, setWorkLocation] = useState('');

  // Work Types & Custom work types
  const [workType, setWorkType] = useState('PLOWING');
  const [customWorkType, setCustomWorkType] = useState('');
  const [customWorkTypesList, setCustomWorkTypesList] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newWorkName, setNewWorkName] = useState('');

  const [estimatedArea, setEstimatedArea] = useState('');
  const [agreedRate, setAgreedRate] = useState('');
  const [finalAgreedAmount, setFinalAgreedAmount] = useState('');
  const [bookingStatus, setBookingStatus] = useState('CONFIRMED');
  const [notes, setNotes] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadCustomWorkTypes() {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY_CUSTOM_WORK);
        if (stored) {
          const list = JSON.parse(stored);
          if (Array.isArray(list)) {
            setCustomWorkTypesList(list);
          }
        }
      } catch (err) {
        console.warn('Could not load custom work types:', err);
      }
    }
    loadCustomWorkTypes();
  }, []);

  useEffect(() => {
    async function loadTractors() {
      try {
        const res = await tractorService.list();
        if (res.success && res.data) {
          setTractors(res.data);
          if (!selectedTractorId && res.data.length > 0) {
            setSelectedTractorId(res.data[0].id);
            if (res.data[0].defaultHourlyRate) {
              setAgreedRate(res.data[0].defaultHourlyRate.toString());
              setFinalAgreedAmount((res.data[0].defaultHourlyRate * 4).toString());
            }
          }
        }
      } catch (err) {
        setError('Could not load tractor list');
      } finally {
        setLoadingTractors(false);
      }
    }
    loadTractors();
  }, [selectedTractorId]);

  const handleTractorSelect = (tractor) => {
    setSelectedTractorId(tractor.id);
    if (tractor.defaultHourlyRate) {
      setAgreedRate(tractor.defaultHourlyRate.toString());
      setFinalAgreedAmount((tractor.defaultHourlyRate * 4).toString());
    } else if (tractor.defaultPerAcreRate) {
      setAgreedRate(tractor.defaultPerAcreRate.toString());
    }
  };

  const handleAreaChange = (val) => {
    setEstimatedArea(val);
    const selectedTractor = tractors.find((t) => t.id === selectedTractorId);
    if (selectedTractor?.defaultPerAcreRate && val && !isNaN(val)) {
      const calculated = parseFloat(val) * parseFloat(selectedTractor.defaultPerAcreRate);
      setFinalAgreedAmount(calculated.toString());
    }
  };

  const handleSelectBuiltin = (typeId) => {
    setWorkType(typeId);
    if (typeId !== 'OTHER') {
      setCustomWorkType('');
    }
  };

  const handleSelectCustom = (customName) => {
    setWorkType('OTHER');
    setCustomWorkType(customName);
  };

  const handleAddNewWork = async () => {
    const trimmed = newWorkName.trim();
    if (!trimmed) {
      Alert.alert(t('common.error') || 'Error', 'Please enter a work name / कामाचे नाव लिहा');
      return;
    }
    let updated = customWorkTypesList;
    if (!customWorkTypesList.includes(trimmed)) {
      updated = [...customWorkTypesList, trimmed];
      setCustomWorkTypesList(updated);
      try {
        await AsyncStorage.setItem(STORAGE_KEY_CUSTOM_WORK, JSON.stringify(updated));
      } catch (err) {
        console.warn('Failed to save work type:', err);
      }
    }
    setWorkType('OTHER');
    setCustomWorkType(trimmed);
    setNewWorkName('');
    setModalVisible(false);
  };

  const handleRemoveCustomWork = (itemToRemove) => {
    Alert.alert(
      'Remove Work Type / काम काढून टाका',
      `Do you want to remove "${itemToRemove}" from saved work types?`,
      [
        { text: 'Cancel / रद्द करा', style: 'cancel' },
        {
          text: 'Remove / काढून टाका',
          style: 'destructive',
          onPress: async () => {
            const updated = customWorkTypesList.filter((item) => item !== itemToRemove);
            setCustomWorkTypesList(updated);
            if (customWorkType === itemToRemove) {
              setWorkType('PLOWING');
              setCustomWorkType('');
            }
            try {
              await AsyncStorage.setItem(STORAGE_KEY_CUSTOM_WORK, JSON.stringify(updated));
            } catch (err) {
              console.warn('Failed to delete work type:', err);
            }
          }
        }
      ]
    );
  };

  const handleSubmit = async () => {
    if (!selectedTractorId) {
      Alert.alert(t('common.error'), 'Please select a tractor');
      return;
    }
    if (!customerName.trim()) {
      Alert.alert(t('common.error'), 'Customer or farmer name is required');
      return;
    }
    if (!workDate) {
      Alert.alert(t('common.error'), 'Work date is required');
      return;
    }
    if (workType === 'OTHER' && !customWorkType.trim()) {
      Alert.alert(t('common.error') || 'Error', 'Please specify or select the work name / कृपया इतर कामाचे नाव टाका');
      return;
    }
    if (!finalAgreedAmount || isNaN(parseFloat(finalAgreedAmount))) {
      Alert.alert(t('common.error'), 'Please enter the final agreed amount');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const payload = {
        tractorId: selectedTractorId,
        customerName: customerName.trim(),
        customerMobile: customerMobile.trim() || null,
        workDate,
        startTime: startTime.trim() ? `${startTime.trim()}:00` : null,
        endTime: endTime.trim() ? `${endTime.trim()}:00` : null,
        workLocation: workLocation.trim() || null,
        workType,
        customWorkType: (workType === 'OTHER' && customWorkType.trim()) ? customWorkType.trim() : null,
        estimatedArea: estimatedArea ? parseFloat(estimatedArea) : null,
        agreedRate: agreedRate ? parseFloat(agreedRate) : null,
        finalAgreedAmount: parseFloat(finalAgreedAmount),
        status: bookingStatus,
        notes: notes.trim() || null
      };

      const res = await bookingService.create(payload);
      if (res.success) {
        Alert.alert(t('common.success'), 'Tractor booking scheduled successfully!', [
          { text: 'OK', onPress: () => router.replace('/bookings') }
        ]);
      }
    } catch (err) {
      // Overlap conflict detection or validation error
      const msg = err.message || 'Failed to create booking';
      setError(msg);
      Alert.alert('Booking Error', msg);
    } finally {
      setSaving(false);
    }
  };

  if (loadingTractors) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader title={t('bookings.newBooking')} showBack={true} fallbackRoute="/bookings" />
        <LoadingIndicator />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title={t('bookings.newBooking')}
        subtitle="Schedule agricultural machinery"
        showBack={true}
        fallbackRoute="/bookings"
      />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {error ? <ErrorMessage message={error} /> : null}

        {/* Tractor Selector */}
        <Text style={styles.sectionTitle}>1. Select Tractor</Text>
        {tractors.length === 0 ? (
          <View style={styles.noTractorBox}>
            <Text style={styles.noTractorText}>No tractors registered yet.</Text>
            <AppButton
              title="Add Tractor First"
              onPress={() => router.push('/tractors/add')}
              variant="outline"
              size="small"
              style={{ marginTop: SPACING.sm }}
            />
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tractorScroll}>
            {tractors.map((t) => (
              <TouchableOpacity
                key={t.id}
                style={[
                  styles.tractorPill,
                  selectedTractorId === t.id && styles.tractorPillActive
                ]}
                onPress={() => handleTractorSelect(t)}
              >
                <Text style={styles.tractorPillIcon}>🚜</Text>
                <View>
                  <Text style={[styles.tractorPillTitle, selectedTractorId === t.id && styles.tractorPillTitleActive]}>
                    {t.modelName}
                  </Text>
                  <Text style={styles.tractorPillSub}>
                    {t.registrationNumber || t.ownershipType}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Customer & Location */}
        <Text style={styles.sectionTitle}>2. Customer & Location Details</Text>
        <AppInput
          label="Customer / Farmer Name *"
          placeholder="e.g. Balasaheb Shinde"
          value={customerName}
          onChangeText={setCustomerName}
        />

        <AppInput
          label="Customer Mobile (Optional)"
          placeholder="10-digit mobile number"
          keyboardType="phone-pad"
          value={customerMobile}
          onChangeText={setCustomerMobile}
        />

        <AppInput
          label="Work Location / Field Village"
          placeholder="e.g. Shivajinagar Farm, Plot No 4"
          value={workLocation}
          onChangeText={setWorkLocation}
        />

        {/* Work Type Header with + Add Work Button */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>3. Work Type / कामाचा प्रकार</Text>
          <TouchableOpacity
            style={styles.addWorkBtn}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.addWorkBtnText}>+ Add Work / नवीन जोडा</Text>
          </TouchableOpacity>
        </View>

        {/* Built-in Agricultural Work Types */}
        <View style={styles.workTypeGrid}>
          {BUILTIN_WORK_TYPES.map((wt) => {
            const isSelected = workType === wt.id && (wt.id !== 'OTHER' || !customWorkTypesList.includes(customWorkType));
            return (
              <TouchableOpacity
                key={wt.id}
                style={[
                  styles.workTypeChip,
                  isSelected && styles.workTypeChipActive
                ]}
                onPress={() => handleSelectBuiltin(wt.id)}
              >
                <Text style={[
                  styles.workTypeText,
                  isSelected && styles.workTypeTextActive
                ]}>
                  {wt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* User Added Custom Work Chips */}
        {customWorkTypesList.length > 0 && (
          <View style={styles.customTypesSection}>
            <Text style={styles.subSectionTitle}>Custom Work Types / इतर जोडलेली कामे:</Text>
            <View style={styles.workTypeGrid}>
              {customWorkTypesList.map((cName) => {
                const isSelected = workType === 'OTHER' && customWorkType === cName;
                return (
                  <View
                    key={cName}
                    style={[
                      styles.customChipWrapper,
                      isSelected && styles.customChipWrapperActive
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.customChipTouch}
                      onPress={() => handleSelectCustom(cName)}
                    >
                      <Text style={[
                        styles.workTypeText,
                        isSelected && styles.workTypeTextActive
                      ]}>
                        ⭐ {cName}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.removeChipTouch}
                      onPress={() => handleRemoveCustomWork(cName)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Text style={[styles.removeChipText, isSelected && { color: '#ffffff' }]}>✕</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Text Input when 'OTHER' is active or user wants to specify directly */}
        {workType === 'OTHER' && (
          <View style={styles.customWorkBox}>
            <AppInput
              label="Specify Custom Work Type / कामाचे नाव *"
              placeholder="e.g. उस सरी, बेड तयार करणे, सबसॉइलर (Subsoiler)"
              value={customWorkType}
              onChangeText={setCustomWorkType}
            />
            <Text style={styles.hintText}>
              💡 Type the exact agricultural work or implement used for this booking.
            </Text>
          </View>
        )}

        {/* Date & Time Slot */}
        <Text style={styles.sectionTitle}>4. Schedule & Time Slot</Text>
        <AppInput
          label="Work Date (YYYY-MM-DD) *"
          placeholder="2026-10-21"
          value={workDate}
          onChangeText={setWorkDate}
        />

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <AppInput
              label="Start Time (HH:mm)"
              placeholder="08:00"
              value={startTime}
              onChangeText={setStartTime}
            />
          </View>
          <View style={{ flex: 1, marginLeft: SPACING.md }}>
            <AppInput
              label="End Time (HH:mm)"
              placeholder="12:00"
              value={endTime}
              onChangeText={setEndTime}
            />
          </View>
        </View>

        {/* Pricing & Manual Override */}
        <Text style={styles.sectionTitle}>5. Pricing & Agreed Amount</Text>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <AppInput
              label="Est. Area (Acres)"
              placeholder="e.g. 2.5"
              keyboardType="numeric"
              value={estimatedArea}
              onChangeText={handleAreaChange}
            />
          </View>
          <View style={{ flex: 1, marginLeft: SPACING.md }}>
            <AppInput
              label="Rate (₹/hr or ₹/acre)"
              placeholder="e.g. 800"
              keyboardType="numeric"
              value={agreedRate}
              onChangeText={setAgreedRate}
            />
          </View>
        </View>

        <AppInput
          label="Final Agreed Amount (₹) *"
          placeholder="Enter agreed total amount"
          keyboardType="numeric"
          value={finalAgreedAmount}
          onChangeText={setFinalAgreedAmount}
        />
        <Text style={styles.hintText}>
          💡 You can manually adjust the agreed amount here to match what you and the farmer agreed upon.
        </Text>

        {/* Initial Status */}
        <Text style={styles.sectionTitle}>6. Booking Status</Text>
        <View style={styles.statusRow}>
          {['CONFIRMED', 'PENDING'].map((st) => (
            <TouchableOpacity
              key={st}
              style={[
                styles.statusBtn,
                bookingStatus === st && styles.statusBtnActive
              ]}
              onPress={() => setBookingStatus(st)}
            >
              <Text style={[
                styles.statusBtnText,
                bookingStatus === st && styles.statusBtnTextActive
              ]}>
                {st}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <AppInput
          label="Additional Notes"
          placeholder="Special attachments needed, field conditions, etc."
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
        />

        <AppButton
          title={saving ? 'Scheduling Booking...' : 'Save & Confirm Booking'}
          onPress={handleSubmit}
          loading={saving}
          style={{ marginTop: SPACING.lg, marginBottom: SPACING.xl }}
        />
      </ScrollView>

      {/* Modal to Add New Custom Work Type */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Add Custom Work Type</Text>
            <Text style={styles.modalSubtitle}>नवीन शेती कामाचे नाव जोडा</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="e.g. उस सरी, बेड तयार करणे, सबसॉइलर"
              placeholderTextColor={COLORS.textSecondary}
              value={newWorkName}
              onChangeText={setNewWorkName}
              autoFocus
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => {
                  setNewWorkName('');
                  setModalVisible(false);
                }}
              >
                <Text style={styles.modalCancelText}>Cancel / रद्द करा</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalAddBtn}
                onPress={handleAddNewWork}
              >
                <Text style={styles.modalAddText}>Save / जोडा</Text>
              </TouchableOpacity>
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
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.xs
  },
  sectionTitle: {
    fontSize: FONTS.medium + 1,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs
  },
  addWorkBtn: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.sm + 4,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.primary
  },
  addWorkBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark
  },
  noTractorBox: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border
  },
  noTractorText: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary
  },
  tractorScroll: {
    marginBottom: SPACING.sm
  },
  tractorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  tractorPillActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight
  },
  tractorPillIcon: {
    fontSize: 24,
    marginRight: SPACING.sm
  },
  tractorPillTitle: {
    fontSize: FONTS.medium,
    fontWeight: '700',
    color: COLORS.textPrimary
  },
  tractorPillTitleActive: {
    color: COLORS.primaryDark
  },
  tractorPillSub: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary
  },
  workTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.sm
  },
  workTypeChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface
  },
  workTypeChipActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary
  },
  workTypeText: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: '600'
  },
  workTypeTextActive: {
    color: '#ffffff',
    fontWeight: '700'
  },
  customTypesSection: {
    marginTop: SPACING.xs,
    marginBottom: SPACING.xs
  },
  subSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 6
  },
  customChipWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingLeft: SPACING.sm + 4,
    paddingRight: 6,
    paddingVertical: SPACING.xs
  },
  customChipWrapperActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryDark
  },
  customChipTouch: {
    marginRight: 6
  },
  removeChipTouch: {
    padding: 2,
    paddingHorizontal: 4
  },
  removeChipText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: 'bold'
  },
  customWorkBox: {
    marginTop: SPACING.xs,
    marginBottom: SPACING.xs
  },
  row: {
    flexDirection: 'row'
  },
  hintText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: -SPACING.xs,
    marginBottom: SPACING.sm,
    fontStyle: 'italic'
  },
  statusRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md
  },
  statusBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    backgroundColor: COLORS.surface
  },
  statusBtnActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary
  },
  statusBtnText: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    fontWeight: '600'
  },
  statusBtnTextActive: {
    color: COLORS.primaryDark,
    fontWeight: '700'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg
  },
  modalBox: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4
  },
  modalTitle: {
    fontSize: FONTS.medium + 2,
    fontWeight: '700',
    color: COLORS.textPrimary
  },
  modalSubtitle: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md
  },
  modalInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    fontSize: FONTS.medium,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.background,
    marginBottom: SPACING.lg
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm
  },
  modalCancelBtn: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md
  },
  modalCancelText: {
    fontSize: FONTS.medium,
    color: COLORS.textSecondary,
    fontWeight: '600'
  },
  modalAddBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md
  },
  modalAddText: {
    fontSize: FONTS.medium,
    color: '#ffffff',
    fontWeight: '700'
  }
});
