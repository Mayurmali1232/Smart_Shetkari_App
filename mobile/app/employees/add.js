import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONTS } from '../../constants/theme';
import { employeeService } from '../../services/employeeService';
import { useTranslation } from 'react-i18next';
import AppHeader from '../../components/AppHeader';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import ErrorMessage from '../../components/ErrorMessage';

export default function AddEmployeeScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [villageAddress, setVillageAddress] = useState('');
  const [dailyWage, setDailyWage] = useState('500');
  const [wageType, setWageType] = useState('DAILY'); // DAILY, MONTHLY, PIECE_RATE
  const [joiningDate, setJoiningDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const scrollRef = useRef(null);

  const handleSave = async () => {
    setError('');
    setSuccessMessage('');

    if (!fullName.trim()) {
      const msg = 'Please enter the worker full name / कृपया मजुराचे नाव टाका';
      setError(msg);
      Alert.alert(t('common.error') || 'Error', msg);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    const wageNum = parseFloat(dailyWage);
    if (isNaN(wageNum) || wageNum <= 0) {
      const msg = 'Please enter a valid daily wage rate greater than 0 / रोजंदारी योग्य टाका';
      setError(msg);
      Alert.alert(t('common.error') || 'Error', msg);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }

    setLoading(true);
    try {
      const res = await employeeService.create({
        fullName: fullName.trim(),
        mobileNumber: mobileNumber.trim() || undefined,
        villageAddress: villageAddress.trim() || undefined,
        dailyWage: wageNum,
        wageType,
        joiningDate,
        notes: notes.trim() || undefined
      });

      if (res.success) {
        setSuccessMessage(`Worker "${fullName.trim()}" added successfully!`);
        Alert.alert(
          t('common.success') || 'Success',
          `Worker "${fullName.trim()}" added successfully!\nमजूर यशस्वीरित्या जोडला गेला!`,
          [
            {
              text: 'OK',
              onPress: () => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace('/employees');
                }
              }
            }
          ]
        );
      } else {
        const errorMsg = res.message || 'Failed to add worker';
        setError(errorMsg);
        Alert.alert(t('common.error') || 'Error', errorMsg);
        scrollRef.current?.scrollTo({ y: 0, animated: true });
      }
    } catch (e) {
      const errorMsg = e.message || 'Failed to add worker';
      setError(errorMsg);
      Alert.alert(t('common.error') || 'Error', errorMsg);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title={t('employees.addNew')} showBack fallbackRoute="/employees" showLanguage={false} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView ref={scrollRef} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {error ? <ErrorMessage message={error} /> : null}
          {successMessage ? (
            <View style={styles.successBox}>
              <Text style={styles.successIcon}>✅</Text>
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          ) : null}

          {/* Wage Integrity Banner */}
          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>💡</Text>
            <Text style={styles.infoText}>{t('employees.wageIntegrityNote')}</Text>
          </View>

          <View style={styles.form}>
            <AppInput
              label={t('employees.workerName')}
              placeholder="e.g. Tukaram Jadhav"
              value={fullName}
              onChangeText={setFullName}
              leftIcon={<Text style={styles.inputEmoji}>👤</Text>}
            />

            <AppInput
              label={t('employees.contactNumber')}
              placeholder="10-digit mobile number"
              value={mobileNumber}
              onChangeText={setMobileNumber}
              keyboardType="phone-pad"
              leftIcon={<Text style={styles.inputEmoji}>📞</Text>}
            />

            <AppInput
              label={t('employees.address')}
              placeholder="e.g. Koregaon, Baramati"
              value={villageAddress}
              onChangeText={setVillageAddress}
              leftIcon={<Text style={styles.inputEmoji}>📍</Text>}
            />

            <AppInput
              label={t('employees.dailyWage')}
              placeholder="e.g. 500"
              value={dailyWage}
              onChangeText={setDailyWage}
              keyboardType="numeric"
              leftIcon={<Text style={styles.inputEmoji}>₹</Text>}
            />

            {/* Wage Type Selector */}
            <Text style={styles.fieldLabel}>{t('employees.wageType')}</Text>
            <View style={styles.segmentedRow}>
              {['DAILY', 'MONTHLY', 'PIECE_RATE'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.segmentBtn, wageType === type && styles.segmentBtnActive]}
                  onPress={() => setWageType(type)}
                >
                  <Text style={[styles.segmentText, wageType === type && styles.segmentTextActive]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <AppInput
              label={t('employees.joiningDate')}
              value={joiningDate}
              onChangeText={setJoiningDate}
              placeholder="YYYY-MM-DD"
              leftIcon={<Text style={styles.inputEmoji}>📅</Text>}
            />

            <AppInput
              label={t('common.notes')}
              placeholder="e.g. Specializes in sugarcane harvesting"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />

            <AppButton
              title={loading ? 'Saving Worker...' : (t('common.save') || 'Save')}
              onPress={handleSave}
              loading={loading}
              disabled={loading}
              style={styles.submitBtn}
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
  infoBox: {
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: '#86efac',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md
  },
  infoIcon: {
    fontSize: 20,
    marginRight: SPACING.sm
  },
  infoText: {
    fontSize: FONTS.small,
    color: COLORS.primaryDark,
    lineHeight: 18,
    flex: 1,
    fontWeight: '500'
  },
  form: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  inputEmoji: {
    fontSize: 16
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
  submitBtn: {
    marginTop: SPACING.md
  }
});
