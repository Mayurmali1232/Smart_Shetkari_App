import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONTS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import AppInput from '../components/AppInput';
import AppButton from '../components/AppButton';
import AppHeader from '../components/AppHeader';
import ErrorMessage from '../components/ErrorMessage';
import LanguageSelector from '../components/LanguageSelector';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const { t } = useTranslation();

  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [langModalVisible, setLangModalVisible] = useState(false);

  const handleLogin = async () => {
    setError('');
    const cleanMobile = mobileNumber.trim();
    if (!cleanMobile) {
      setError(t('auth.mobilePlaceholder'));
      return;
    }
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!password) {
      setError(t('auth.passwordPlaceholder'));
      return;
    }

    setLoading(true);
    const result = await login(cleanMobile, password);
    setLoading(false);

    if (result.success) {
      router.replace('/dashboard');
    } else {
      setError(result.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title={t('auth.login')}
        showBack
        fallbackRoute="/"
        onLanguagePress={() => setLangModalVisible(true)}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.title}>{t('auth.login')}</Text>
            <Text style={styles.subtitle}>{t('auth.welcomeSubtitle')}</Text>
          </View>

          {error ? <ErrorMessage message={error} /> : null}

          <View style={styles.form}>
            <AppInput
              label={t('auth.mobileNumber')}
              placeholder={t('auth.mobilePlaceholder')}
              value={mobileNumber}
              onChangeText={setMobileNumber}
              keyboardType="phone-pad"
              leftIcon={<Text style={styles.inputEmoji}>📱</Text>}
            />

            <AppInput
              label={t('auth.password')}
              placeholder={t('auth.passwordPlaceholder')}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              leftIcon={<Text style={styles.inputEmoji}>🔒</Text>}
            />

            <TouchableOpacity
              style={styles.forgotPassBtn}
              onPress={() => router.push('/forgot-password')}
            >
              <Text style={styles.forgotPassText}>{t('auth.forgotPassword')}</Text>
            </TouchableOpacity>

            <AppButton
              title={t('auth.loginButton')}
              onPress={handleLogin}
              loading={loading}
              style={styles.submitBtn}
            />

            <View style={styles.registerPrompt}>
              <Text style={styles.promptText}>{t('auth.dontHaveAccount')} </Text>
              <TouchableOpacity onPress={() => router.push('/register')}>
                <Text style={styles.registerLink}>{t('auth.registerButton')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <LanguageSelector
        visible={langModalVisible}
        onClose={() => setLangModalVisible(false)}
      />
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
  forgotPassBtn: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.lg
  },
  forgotPassText: {
    color: COLORS.primary,
    fontSize: FONTS.regular,
    fontWeight: '600'
  },
  submitBtn: {
    marginTop: SPACING.xs
  },
  registerPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xl
  },
  promptText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.regular
  },
  registerLink: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: FONTS.regular
  }
});
