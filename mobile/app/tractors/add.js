import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONTS } from '../../constants/theme';
import { tractorService } from '../../services/tractorService';
import { useTranslation } from 'react-i18next';
import AppHeader from '../../components/AppHeader';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import ErrorMessage from '../../components/ErrorMessage';

export default function AddTractorScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [modelName, setModelName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [ownershipType, setOwnershipType] = useState('OWNED'); // OWNED, RENTED, LEASED
  const [tractorType, setTractorType] = useState('45 HP');
  const [defaultHourlyRate, setDefaultHourlyRate] = useState('800');
  const [defaultPerAcreRate, setDefaultPerAcreRate] = useState('1200');
  const [defaultPerDayRate, setDefaultPerDayRate] = useState('6000');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const scrollRef = useRef(null);

  const handleSave = async () => {
    setError('');
    setSuccessMessage('');
    if (!modelName.trim()) {
      const msg = 'Please enter the tractor model name / ट्रॅक्टरचे नाव टाका';
      setError(msg);
      Alert.alert(t('common.error') || 'Error', msg);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }

    setLoading(true);
    try {
      const res = await tractorService.create({
        modelName: modelName.trim(),
        registrationNumber: registrationNumber.trim() || undefined,
        ownershipType,
        tractorType: tractorType.trim() || undefined,
        defaultHourlyRate: defaultHourlyRate ? parseFloat(defaultHourlyRate) : undefined,
        defaultPerAcreRate: defaultPerAcreRate ? parseFloat(defaultPerAcreRate) : undefined,
        defaultPerDayRate: defaultPerDayRate ? parseFloat(defaultPerDayRate) : undefined,
        availabilityStatus: 'AVAILABLE',
        notes: notes.trim() || undefined
      });

      if (res.success) {
        setSuccessMessage(`Tractor "${modelName.trim()}" added successfully!`);
        Alert.alert(
          t('common.success') || 'Success',
          `Tractor "${modelName.trim()}" added successfully!\nट्रॅक्टर यशस्वीरित्या जोडला गेला!`,
          [
            { text: 'OK', onPress: () => (router.canGoBack() ? router.back() : router.replace('/tractors')) }
          ]
        );
      } else {
        const errorMsg = res.message || 'Failed to add tractor';
        setError(errorMsg);
        Alert.alert(t('common.error') || 'Error', errorMsg);
        scrollRef.current?.scrollTo({ y: 0, animated: true });
      }
    } catch (e) {
      const errorMsg = e.message || 'Failed to add tractor';
      setError(errorMsg);
      Alert.alert(t('common.error') || 'Error', errorMsg);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title={t('tractors.addNew')} showBack fallbackRoute="/tractors" showLanguage={false} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView ref={scrollRef} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {error ? <ErrorMessage message={error} /> : null}
          {successMessage ? (
            <View style={styles.successBox}>
              <Text style={styles.successIcon}>✅</Text>
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
            <AppInput
              label={t('tractors.modelName')}
              placeholder="e.g. Mahindra 575 DI / John Deere 5050"
              value={modelName}
              onChangeText={setModelName}
              leftIcon={<Text style={{ fontSize: 18 }}>🚜</Text>}
            />

            <AppInput
              label={t('tractors.regNumber')}
              placeholder="e.g. MH 12 AB 1234"
              value={registrationNumber}
              onChangeText={setRegistrationNumber}
              leftIcon={<Text style={{ fontSize: 18 }}>🔢</Text>}
            />

            {/* Ownership Type */}
            <Text style={styles.fieldLabel}>{t('tractors.ownership')}</Text>
            <View style={styles.segmentedRow}>
              {['OWNED', 'RENTED', 'LEASED'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.segmentBtn, ownershipType === type && styles.segmentBtnActive]}
                  onPress={() => setOwnershipType(type)}
                >
                  <Text style={[styles.segmentText, ownershipType === type && styles.segmentTextActive]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <AppInput
              label="Tractor Capacity / Type"
              placeholder="e.g. 45 HP 2WD / 50 HP 4WD"
              value={tractorType}
              onChangeText={setTractorType}
            />

            <View style={styles.row}>
              <AppInput
                label={t('tractors.hourlyRate')}
                placeholder="800"
                value={defaultHourlyRate}
                onChangeText={setDefaultHourlyRate}
                keyboardType="numeric"
                containerStyle={{ flex: 1, marginRight: SPACING.xs }}
              />
              <AppInput
                label={t('tractors.acreRate')}
                placeholder="1200"
                value={defaultPerAcreRate}
                onChangeText={setDefaultPerAcreRate}
                keyboardType="numeric"
                containerStyle={{ flex: 1, marginLeft: SPACING.xs }}
              />
            </View>

            <AppInput
              label={t('tractors.dayRate')}
              placeholder="6000"
              value={defaultPerDayRate}
              onChangeText={setDefaultPerDayRate}
              keyboardType="numeric"
            />

            <AppInput
              label={t('common.notes')}
              placeholder="e.g. Rotavator attachment included"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />

            <AppButton
              title={loading ? 'Saving Tractor...' : (t('common.save') || 'Save')}
              onPress={handleSave}
              loading={loading}
              disabled={loading}
              style={{ marginTop: SPACING.md }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  successBox: {
    backgroundColor: '#dcfce7',
    borderWidth: 1,
    borderColor: '#4ade80',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md
  },
  successIcon: {
    fontSize: 20,
    marginRight: SPACING.sm
  },
  successText: {
    fontSize: FONTS.small,
    color: '#15803d',
    lineHeight: 18,
    flex: 1,
    fontWeight: '700'
  },
  form: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  fieldLabel: {
    fontSize: FONTS.regular,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs
  },
  segmentedRow: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: RADIUS.md,
    padding: 3,
    marginBottom: SPACING.md
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: RADIUS.sm
  },
  segmentBtnActive: {
    backgroundColor: COLORS.surface,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  segmentText: {
    fontSize: FONTS.small,
    fontWeight: '600',
    color: COLORS.textSecondary
  },
  segmentTextActive: {
    color: COLORS.primary,
    fontWeight: '700'
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  }
});
