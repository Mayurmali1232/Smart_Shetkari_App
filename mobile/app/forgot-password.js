import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONTS } from '../constants/theme';
import { authService } from '../services/authService';
import { useTranslation } from 'react-i18next';
import AppInput from '../components/AppInput';
import AppButton from '../components/AppButton';
import AppHeader from '../components/AppHeader';
import ErrorMessage from '../components/ErrorMessage';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1); // 1: request OTP, 2: verify & set new password
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSendOtp = async () => {
    setError('');
    const clean = mobileNumber.trim();
    if (!clean || !/^[6-9]\d{9}$/.test(clean)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.forgotPassword(clean);
      setSuccessMsg(res.message || 'OTP sent successfully! (Use test code: 123456)');
      setStep(2);
    } catch (e) {
      setError(e.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setError('');
    if (!otp.trim()) {
      setError('Please enter the verification code');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword({
        mobileNumber: mobileNumber.trim(),
        otp: otp.trim(),
        newPassword
      });
      Alert.alert(
        t('common.success'),
        'Password reset successful. Please sign in with your new password.',
        [{ text: 'OK', onPress: () => router.replace('/login') }]
      );
    } catch (e) {
      setError(e.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title={t('auth.resetPassword')}
        showBack
        fallbackRoute="/login"
        onBack={step === 2 ? () => setStep(1) : undefined}
        showLanguage={false}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('auth.resetPassword')}</Text>
          <Text style={styles.subtitle}>
            {step === 1
              ? 'Enter your registered mobile number to receive a verification code.'
              : 'Enter the code sent to your phone and your new password.'}
          </Text>
        </View>

        {error ? <ErrorMessage message={error} /> : null}
        {successMsg ? (
          <View style={styles.successBox}>
            <Text style={styles.successText}>✅ {successMsg}</Text>
          </View>
        ) : null}

        {step === 1 ? (
          <View style={styles.form}>
            <AppInput
              label={t('auth.mobileNumber')}
              placeholder={t('auth.mobilePlaceholder')}
              value={mobileNumber}
              onChangeText={setMobileNumber}
              keyboardType="phone-pad"
              leftIcon={<Text style={styles.inputEmoji}>📱</Text>}
            />

            <AppButton
              title={t('auth.sendOtp')}
              onPress={handleSendOtp}
              loading={loading}
              style={styles.submitBtn}
            />
          </View>
        ) : (
          <View style={styles.form}>
            <AppInput
              label={t('auth.otp')}
              placeholder={t('auth.otpPlaceholder')}
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              leftIcon={<Text style={styles.inputEmoji}>🔢</Text>}
            />

            <AppInput
              label={t('auth.newPassword')}
              placeholder={t('auth.passwordPlaceholder')}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              leftIcon={<Text style={styles.inputEmoji}>🔒</Text>}
            />

            <AppButton
              title={t('auth.resetPassword')}
              onPress={handleResetPassword}
              loading={loading}
              style={styles.submitBtn}
            />
          </View>
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
    padding: SPACING.lg
  },
  header: {
    marginVertical: SPACING.lg
  },
  title: {
    fontSize: FONTS.header,
    fontWeight: '800',
    color: COLORS.primaryDark
  },
  subtitle: {
    fontSize: FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs
  },
  form: {
    marginTop: SPACING.sm
  },
  inputEmoji: {
    fontSize: 18
  },
  submitBtn: {
    marginTop: SPACING.md
  },
  successBox: {
    backgroundColor: COLORS.primaryLight,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#86efac'
  },
  successText: {
    color: COLORS.primaryDark,
    fontWeight: '600',
    fontSize: FONTS.regular
  }
});
