import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONTS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from 'react-i18next';
import AppInput from '../components/AppInput';
import AppButton from '../components/AppButton';
import AppHeader from '../components/AppHeader';
import ErrorMessage from '../components/ErrorMessage';
import LanguageSelector from '../components/LanguageSelector';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const { currentLanguage } = useLanguage();
  const { t } = useTranslation();

  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [village, setVillage] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('Maharashtra');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [langModalVisible, setLangModalVisible] = useState(false);

  const handleRegister = async () => {
    setError('');

    if (!fullName.trim()) {
      setError(t('auth.fullNamePlaceholder'));
      return;
    }
    const cleanMobile = mobileNumber.trim();
    if (!cleanMobile || !/^[6-9]\d{9}$/.test(cleanMobile)) {
      setError('Please enter a valid 10-digit Indian mobile number');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    const result = await register({
      fullName: fullName.trim(),
      mobileNumber: cleanMobile,
      email: email.trim() || undefined,
      password,
      confirmPassword,
      village: village.trim() || undefined,
      district: district.trim() || undefined,
      state: state.trim() || 'Maharashtra',
      preferredLanguage: currentLanguage
    });
    setLoading(false);

    if (result.success) {
      router.replace('/dashboard');
    } else {
      setError(result.message || 'Registration failed');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title={t('auth.register')}
        showBack
        fallbackRoute="/login"
        onLanguagePress={() => setLangModalVisible(true)}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.title}>{t('auth.register')}</Text>
            <Text style={styles.subtitle}>{t('auth.welcomeSubtitle')}</Text>
          </View>

          {error ? <ErrorMessage message={error} /> : null}

          <View style={styles.form}>
            <AppInput
              label={t('auth.fullName')}
              placeholder={t('auth.fullNamePlaceholder')}
              value={fullName}
              onChangeText={setFullName}
              leftIcon={<Text style={styles.inputEmoji}>👤</Text>}
            />

            <AppInput
              label={t('auth.mobileNumber')}
              placeholder={t('auth.mobilePlaceholder')}
              value={mobileNumber}
              onChangeText={setMobileNumber}
              keyboardType="phone-pad"
              leftIcon={<Text style={styles.inputEmoji}>📱</Text>}
            />

            <AppInput
              label="Email (Optional)"
              placeholder="e.g. farmer@gmail.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              leftIcon={<Text style={styles.inputEmoji}>✉️</Text>}
            />

            <View style={styles.row}>
              <AppInput
                label={t('auth.village')}
                placeholder="e.g. Baramati"
                value={village}
                onChangeText={setVillage}
                containerStyle={{ flex: 1, marginRight: SPACING.xs }}
              />
              <AppInput
                label={t('auth.district')}
                placeholder="e.g. Pune"
                value={district}
                onChangeText={setDistrict}
                containerStyle={{ flex: 1, marginLeft: SPACING.xs }}
              />
            </View>

            <AppInput
              label={t('auth.password')}
              placeholder={t('auth.passwordPlaceholder')}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              leftIcon={<Text style={styles.inputEmoji}>🔒</Text>}
            />

            <AppInput
              label={t('auth.confirmPassword')}
              placeholder={t('auth.confirmPassword')}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              leftIcon={<Text style={styles.inputEmoji}>🔒</Text>}
            />

            <AppButton
              title={t('auth.registerButton')}
              onPress={handleRegister}
              loading={loading}
              style={styles.submitBtn}
            />

            <View style={styles.loginPrompt}>
              <Text style={styles.promptText}>{t('auth.alreadyHaveAccount')} </Text>
              <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={styles.loginLink}>{t('auth.login')}</Text>
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
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl
  },
  header: {
    marginVertical: SPACING.md
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
    marginTop: SPACING.xs
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  inputEmoji: {
    fontSize: 18
  },
  submitBtn: {
    marginTop: SPACING.md
  },
  loginPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.lg
  },
  promptText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.regular
  },
  loginLink: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: FONTS.regular
  }
});
