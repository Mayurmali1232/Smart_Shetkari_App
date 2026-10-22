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
      const msg = 'कृपया कर्मचाऱ्याचे पूर्ण नाव टाका / Please enter the worker full name';
      setError(msg);
      Alert.alert(t('common.error') || 'त्रुटी', msg);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    const wageNum = parseFloat(dailyWage);
    if (isNaN(wageNum) || wageNum <= 0) {
      const msg = 'कृपया योग्य दैनिक मजुरी दर टाका / Please enter a valid daily wage rate';
      setError(msg);
      Alert.alert(t('common.error') || 'त्रुटी', msg);
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
        setSuccessMessage(`कर्मचारी "${fullName.trim()}" यशस्वीरीत्या जोडला गेला!`);
        Alert.alert(
          t('common.success') || 'यशस्वी',
          `कर्मचारी "${fullName.trim()}" यशस्वीरित्या जोडला गेला!\nWorker added successfully!`,
          [
            {
              text: 'ठीक आहे',
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
        const errorMsg = res.message || 'कर्मचारी जोडताना त्रुटी आली';
        setError(errorMsg);
        Alert.alert(t('common.error') || 'त्रुटी', errorMsg);
        scrollRef.current?.scrollTo({ y: 0, animated: true });
      }
    } catch (e) {
      const errorMsg = e.message || 'कर्मचारी जोडताना त्रुटी आली';
      setError(errorMsg);
      Alert.alert(t('common.error') || 'त्रुटी', errorMsg);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title="कर्मचारी जोडा"
        subtitle="नवीन शेतमजूर माहिती नोंदवा"
        showBack
        fallbackRoute="/employees"
        showLanguage={false}
      />

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
            <Text style={styles.infoText}>
              कर्मचारी जोडल्यानंतर हजेरी पटावर लगेच नाव दिसेल आणि दैनिक मजुरी आपोआप हिशोबात जोडली जाईल.
            </Text>
          </View>

          <View style={styles.form}>
            <AppInput
              label="कर्मचाऱ्याचे पूर्ण नाव *"
              placeholder="उदा. रामदास पाटील"
              value={fullName}
              onChangeText={setFullName}
              leftIcon={<Text style={styles.inputEmoji}>👤</Text>}
            />

            <AppInput
              label="संपर्क क्रमांक (मोबाईल)"
              placeholder="10 अंकी मोबाईल नंबर"
              value={mobileNumber}
              onChangeText={setMobileNumber}
              keyboardType="phone-pad"
              leftIcon={<Text style={styles.inputEmoji}>📞</Text>}
            />

            <AppInput
              label="पत्ता / गाव"
              placeholder="उदा. वडगाव, ता. बारामती"
              value={villageAddress}
              onChangeText={setVillageAddress}
              leftIcon={<Text style={styles.inputEmoji}>📍</Text>}
            />

            <AppInput
              label="दैनिक मजुरी दर (₹) *"
              placeholder="उदा. 500"
              value={dailyWage}
              onChangeText={setDailyWage}
              keyboardType="numeric"
              leftIcon={<Text style={styles.inputEmoji}>₹</Text>}
            />

            {/* Wage Type Selector */}
            <Text style={styles.fieldLabel}>मजुरीचा प्रकार (Wage Type)</Text>
            <View style={styles.segmentedRow}>
              {[
                { id: 'DAILY', label: 'दैनिक (Daily)' },
                { id: 'MONTHLY', label: 'मासिक (Monthly)' },
                { id: 'PIECE_RATE', label: 'काम आधारित' }
              ].map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.segmentBtn, wageType === item.id && styles.segmentBtnActive]}
                  onPress={() => setWageType(item.id)}
                >
                  <Text style={[styles.segmentText, wageType === item.id && styles.segmentTextActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <AppInput
              label="रुजू झाल्याची तारीख"
              value={joiningDate}
              onChangeText={setJoiningDate}
              placeholder="YYYY-MM-DD"
              leftIcon={<Text style={styles.inputEmoji}>📅</Text>}
            />

            <AppInput
              label="विशेष काम / टीप (Notes)"
              placeholder="उदा. ऊस तोडणी किंवा फवारणी तज्ज्ञ"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />

            <AppButton
              title={loading ? 'जतन होत आहे...' : 'जतन करा'}
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
    backgroundColor: COLORS.lightGreen,
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
    color: COLORS.primaryGreen,
    lineHeight: 18,
    flex: 1,
    fontWeight: '700'
  },
  infoBox: {
    backgroundColor: COLORS.lightGreen,
    borderWidth: 1,
    borderColor: '#A5D6A7',
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
    color: COLORS.darkText,
    lineHeight: 18,
    flex: 1,
    fontWeight: '500'
  },
  form: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: '#E8F0E9',
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4
  },
  inputEmoji: {
    fontSize: 16
  },
  fieldLabel: {
    fontSize: FONTS.small,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: SPACING.xs
  },
  segmentedRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.md
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border
  },
  segmentBtnActive: {
    backgroundColor: COLORS.lightGreen,
    borderColor: COLORS.primaryGreen
  },
  segmentText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600'
  },
  segmentTextActive: {
    color: COLORS.darkText,
    fontWeight: '800'
  },
  submitBtn: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.primaryGreen,
    borderRadius: RADIUS.md
  }
});