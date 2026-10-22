import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Image } from 'react-native';
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
      setError(t('auth.fullNamePlaceholder') || 'Please enter full name / पूर्ण नाव टाका');
      return;
    }
    const cleanMobile = mobileNumber.trim();
    if (!cleanMobile || !/^[6-9]\d{9}$/.test(cleanMobile)) {
      setError('Please enter a valid 10-digit Indian mobile number / 10-अंकी मोबाईल नंबर टाका');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long / पासवर्ड किमान 6 अक्षरांचा असावा');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match / दोन्ही पासवर्ड जुळत नाहीत');
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
      setError(result.message || 'Registration failed / नोंदणी अयशस्वी झाली');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title={t('auth.register') || 'नोंदणी करा'}
        showBack
        fallbackRoute="/login"
        onLanguagePress={() => setLangModalVisible(true)}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Header Card */}
          <View style={styles.headerBox}>
            <Text style={styles.title}>नोंदणी करा</Text>
            <Text style={styles.subtitle}>आपली माहिती भरा / Enter Farmer Information</Text>
          </View>

          {error ? <ErrorMessage message={error} /> : null}

          <View style={styles.formCard}>
            <AppInput
              label="पूर्ण नाव (Full Name) *"
              placeholder="उदा. राहुल पाटील"
              value={fullName}
              onChangeText={setFullName}
              leftIcon={<Text style={styles.inputEmoji}>👤</Text>}
            />

            <AppInput
              label="मोबाईल नंबर (Mobile Number) *"
              placeholder="10-digit Indian mobile number"
              value={mobileNumber}
              onChangeText={setMobileNumber}
              keyboardType="phone-pad"
              leftIcon={<Text style={styles.inputEmoji}>📱</Text>}
            />

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: SPACING.xs }}>
                <AppInput
                  label="गाव (Village)"
                  placeholder="उदा. बारामती"
                  value={village}
                  onChangeText={setVillage}
                  leftIcon={<Text style={styles.inputEmoji}>📍</Text>}
                />
              </View>
              <View style={{ flex: 1, marginLeft: SPACING.xs }}>
                <AppInput
                  label="जिल्हा (District)"
                  placeholder="उदा. पुणे"
                  value={district}
                  onChangeText={setDistrict}
                  leftIcon={<Text style={styles.inputEmoji}>🏛️</Text>}
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.langSelectorBtn}
              onPress={() => setLangModalVisible(true)}
            >
              <View style={styles.langSelectorLeft}>
                <Text style={styles.inputEmoji}>🌐</Text>
                <View style={{ marginLeft: SPACING.sm }}>
                  <Text style={styles.langLabel}>भाषा निवडा (Selected Language)</Text>
                  <Text style={styles.langVal}>
                    {currentLanguage === 'mr' ? 'मराठी' : currentLanguage === 'hi' ? 'हिंदी' : 'English'}
                  </Text>
                </View>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            <AppInput
              label="पासवर्ड (Password) *"
              placeholder="Min 6 characters"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              leftIcon={<Text style={styles.inputEmoji}>🔒</Text>}
            />

            <AppInput
              label="पासवर्ड पुष्टी (Confirm Password) *"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              leftIcon={<Text style={styles.inputEmoji}>🔒</Text>}
            />

            <AppButton
              title="नोंदणी करा / Register"
              onPress={handleRegister}
              loading={loading}
              style={styles.submitBtn}
            />

            <View style={styles.loginPrompt}>
              <Text style={styles.promptText}>आधीच खाते आहे? / Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={styles.loginLink}>लॉग इन करा (Log In)</Text>
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
  headerBox: {
    marginBottom: SPACING.md,
    marginTop: SPACING.xs
  },
  title: {
    fontSize: FONTS.header,
    fontWeight: '800',
    color: COLORS.primaryDark
  },
  subtitle: {
    fontSize: FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: 2
  },
  formCard: {
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  inputEmoji: {
    fontSize: 18
  },
  langSelectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.sm + 2,
    marginBottom: SPACING.md
  },
  langSelectorLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  langLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500'
  },
  langVal: {
    fontSize: 14,
    color: COLORS.primaryDark,
    fontWeight: '700'
  },
  chevron: {
    fontSize: 20,
    color: COLORS.textSecondary
  },
  submitBtn: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    paddingVertical: 14
  },
  loginPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.lg,
    flexWrap: 'wrap'
  },
  promptText: {
    color: COLORS.textSecondary,
    fontSize: 12
  },
  loginLink: {
    color: COLORS.primary,
    fontWeight: '800',
    fontSize: 12
  }
});
