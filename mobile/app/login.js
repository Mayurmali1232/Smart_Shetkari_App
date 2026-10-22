import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Image } from 'react-native';
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
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [langModalVisible, setLangModalVisible] = useState(false);

  const handleLogin = async () => {
    setError('');
    const cleanMobile = mobileNumber.trim();
    if (!cleanMobile) {
      setError(t('auth.mobilePlaceholder') || 'Please enter mobile number');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      setError('Please enter a valid 10-digit mobile number / वैध 10-अंकी मोबाईल नंबर टाका');
      return;
    }
    if (!password) {
      setError(t('auth.passwordPlaceholder') || 'Please enter password');
      return;
    }

    setLoading(true);
    const result = await login(cleanMobile, password);
    setLoading(false);

    if (result.success) {
      router.replace('/dashboard');
    } else {
      setError(result.message || 'Login failed. Please check credentials / मोबाईल किंवा पासवर्ड तपासा.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title={t('auth.login') || 'लॉग इन'}
        showBack
        fallbackRoute="/"
        onLanguagePress={() => setLangModalVisible(true)}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Farm Header Illustration */}
          <View style={styles.bannerBox}>
            <Image
              source={require('../assets/farm_header_illustration.png')}
              style={styles.bannerImg}
              resizeMode="cover"
            />
            <View style={styles.bannerOverlay} />
          </View>

          {/* Logo & Greeting Box */}
          <View style={styles.brandBox}>
            <View style={styles.logoBadge}>
              <Image
                source={require('../assets/smart_shetkari_logo.png')}
                style={styles.logoImg}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.brandTitle}>Smart Shetkari</Text>
            <Text style={styles.brandSubtitle}>शेतकऱ्यांचा स्मार्ट साथी</Text>
          </View>

          {error ? <ErrorMessage message={error} /> : null}

          <View style={styles.formCard}>
            <AppInput
              label={t('auth.mobileNumber') || 'मोबाईल नंबर *'}
              placeholder="10-digit mobile number"
              value={mobileNumber}
              onChangeText={setMobileNumber}
              keyboardType="phone-pad"
              leftIcon={<Text style={styles.inputEmoji}>📱</Text>}
            />

            <View style={styles.passwordContainer}>
              <AppInput
                label={t('auth.password') || 'पासवर्ड *'}
                placeholder="Enter password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                leftIcon={<Text style={styles.inputEmoji}>🔒</Text>}
              />
              <TouchableOpacity
                style={styles.eyeToggle}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '🙈'}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.forgotPassBtn}
              onPress={() => router.push('/forgot-password')}
            >
              <Text style={styles.forgotPassText}>पासवर्ड विसरलात? / Forgot Password?</Text>
            </TouchableOpacity>

            <AppButton
              title="लॉग इन / Log In"
              onPress={handleLogin}
              loading={loading}
              style={styles.submitBtn}
            />

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>किंवा / OR</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Register New Account */}
            <TouchableOpacity
              style={styles.registerBtn}
              onPress={() => router.push('/register')}
              activeOpacity={0.8}
            >
              <Text style={styles.registerBtnText}>नवीन खाते तयार करा / Create Account</Text>
            </TouchableOpacity>
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
    paddingBottom: SPACING.xxl
  },
  bannerBox: {
    width: '100%',
    height: 140,
    backgroundColor: COLORS.primaryLight,
    position: 'relative'
  },
  bannerImg: {
    width: '100%',
    height: '100%'
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(27, 94, 32, 0.1)'
  },
  brandBox: {
    alignItems: 'center',
    marginTop: -35,
    marginBottom: SPACING.md
  },
  logoBadge: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  logoImg: {
    width: 60,
    height: 60,
    borderRadius: 30
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginTop: 6
  },
  brandSubtitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 2
  },
  formCard: {
    marginHorizontal: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2
  },
  inputEmoji: {
    fontSize: 18
  },
  passwordContainer: {
    position: 'relative'
  },
  eyeToggle: {
    position: 'absolute',
    right: 12,
    top: 36,
    padding: 6
  },
  eyeIcon: {
    fontSize: 16
  },
  forgotPassBtn: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.md,
    marginTop: 2
  },
  forgotPassText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600'
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    paddingVertical: 14
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border
  },
  dividerText: {
    marginHorizontal: SPACING.sm,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary
  },
  registerBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.full,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.primary
  },
  registerBtnText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700'
  }
});
