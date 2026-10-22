import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONTS } from '../../../constants/theme';
import { dairyService } from '../../../services/dairyService';
import { useTranslation } from 'react-i18next';
import AppHeader from '../../../components/AppHeader';
import AppInput from '../../../components/AppInput';
import AppButton from '../../../components/AppButton';
import ErrorMessage from '../../../components/ErrorMessage';
import ImageAttachment from '../../../components/ImageAttachment';

const ANIMAL_TYPES = [
  { id: 'COW', label: 'Cow / गाय 🐄' },
  { id: 'BUFFALO', label: 'Buffalo / म्हैस 🐃' },
  { id: 'GOAT', label: 'Goat / शेळी 🐐' },
  { id: 'SHEEP', label: 'Sheep / मेंढी 🐑' },
  { id: 'OTHER', label: 'Other / इतर' }
];

const MILKING_STATUSES = [
  { id: 'MILKING', label: 'Milking / दुभती 🥛' },
  { id: 'DRY', label: 'Dry / आटलेली' },
  { id: 'PREGNANT', label: 'Pregnant / गाभण' },
  { id: 'NOT_APPLICABLE', label: 'N/A' }
];

const HEALTH_STATUSES = [
  { id: 'HEALTHY', label: 'Healthy / निरोगी 💚' },
  { id: 'UNDER_TREATMENT', label: 'Treatment / उपचार' },
  { id: 'SICK', label: 'Sick / आजारी ⚠️' }
];

export default function AddAnimalScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const scrollRef = useRef(null);

  const [name, setName] = useState('');
  const [tagNumber, setTagNumber] = useState('');
  const [animalType, setAnimalType] = useState('COW');
  const [breed, setBreed] = useState('');
  const [gender, setGender] = useState('FEMALE');
  const [ageYears, setAgeYears] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [purchaseCost, setPurchaseCost] = useState('');
  const [healthStatus, setHealthStatus] = useState('HEALTHY');
  const [milkingStatus, setMilkingStatus] = useState('MILKING');
  const [dailyFeedRequirement, setDailyFeedRequirement] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSave = async () => {
    setError('');
    setSuccessMessage('');

    if (!name.trim()) {
      const msg = 'Please enter the animal name / जनावराचे नाव टाका';
      setError(msg);
      Alert.alert(t('common.error') || 'Error', msg);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        tagNumber: tagNumber.trim() || undefined,
        animalType,
        breed: breed.trim() || undefined,
        gender,
        ageYears: ageYears ? parseFloat(ageYears) : undefined,
        dateOfBirth: dateOfBirth.trim() || undefined,
        purchaseDate: purchaseDate.trim() || undefined,
        purchaseCost: purchaseCost ? parseFloat(purchaseCost) : 0,
        healthStatus,
        milkingStatus,
        status: 'ACTIVE',
        dailyFeedRequirement: dailyFeedRequirement.trim() || undefined,
        photoUrl: photoUrl.trim() || undefined,
        notes: notes.trim() || undefined
      };

      const res = await dairyService.createAnimal(payload);
      if (res.success) {
        setSuccessMessage(`Animal "${name.trim()}" registered successfully!`);
        Alert.alert(
          t('common.success') || 'Success',
          `Animal "${name.trim()}" registered successfully!\nजनावर यशस्वीरित्या नोंदवले गेले!`,
          [
            {
              text: 'OK',
              onPress: () => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace('/dairy/animals');
                }
              }
            }
          ]
        );
      } else {
        const errorMsg = res.message || 'Failed to register animal';
        setError(errorMsg);
        Alert.alert(t('common.error') || 'Error', errorMsg);
        scrollRef.current?.scrollTo({ y: 0, animated: true });
      }
    } catch (e) {
      const errorMsg = e.message || 'Failed to register animal';
      setError(errorMsg);
      Alert.alert(t('common.error') || 'Error', errorMsg);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title={t('dairy.addNewAnimal') || 'Add New Animal'}
        subtitle="Register cow, buffalo, or livestock"
        showBack={true}
        fallbackRoute="/dairy/animals"
      />

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
            {/* Animal Type */}
            <Text style={styles.fieldLabel}>Animal Type / प्रकार *</Text>
            <View style={styles.chipsRow}>
              {ANIMAL_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[styles.typeChip, animalType === type.id && styles.typeChipActive]}
                  onPress={() => setAnimalType(type.id)}
                >
                  <Text style={[styles.typeChipText, animalType === type.id && styles.typeChipTextActive]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Animal Photo Attachment */}
            <ImageAttachment
              value={photoUrl}
              onChange={setPhotoUrl}
              label="Animal Photo / जनावराचा फोटो (Optional)"
              placeholderIcon={
                animalType === 'COW' ? '🐄' : animalType === 'BUFFALO' ? '🐃' : animalType === 'GOAT' ? '🐐' : '🐑'
              }
              hint="Snap photo of animal or ear tag to identify quickly"
            />

            <AppInput
              label="Animal Identification / Name (नाव) *"
              placeholder="e.g. Kapila, Radha, Ganga"
              value={name}
              onChangeText={setName}
            />

            <AppInput
              label="Ear Tag Number / बिल्ला क्रमांक (Optional)"
              placeholder="e.g. TAG-104, MH-45"
              value={tagNumber}
              onChangeText={setTagNumber}
            />

            <AppInput
              label="Breed / जात (Optional)"
              placeholder="e.g. Gir, Murrah, Jersey, HF, Osmanabadi"
              value={breed}
              onChangeText={setBreed}
            />

            {/* Gender */}
            <Text style={styles.fieldLabel}>Gender / लिंग</Text>
            <View style={styles.segmentedRow}>
              {[
                { id: 'FEMALE', label: 'Female / मादी' },
                { id: 'MALE', label: 'Male / नर' }
              ].map((g) => (
                <TouchableOpacity
                  key={g.id}
                  style={[styles.segmentBtn, gender === g.id && styles.segmentBtnActive]}
                  onPress={() => setGender(g.id)}
                >
                  <Text style={[styles.segmentText, gender === g.id && styles.segmentTextActive]}>
                    {g.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Milking Status */}
            <Text style={styles.fieldLabel}>Milking Status / दुभतेपण</Text>
            <View style={styles.chipsRow}>
              {MILKING_STATUSES.map((m) => (
                <TouchableOpacity
                  key={m.id}
                  style={[styles.typeChip, milkingStatus === m.id && styles.typeChipActive]}
                  onPress={() => setMilkingStatus(m.id)}
                >
                  <Text style={[styles.typeChipText, milkingStatus === m.id && styles.typeChipTextActive]}>
                    {m.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Health Status */}
            <Text style={styles.fieldLabel}>Health Status / आरोग्य स्थिती</Text>
            <View style={styles.chipsRow}>
              {HEALTH_STATUSES.map((h) => (
                <TouchableOpacity
                  key={h.id}
                  style={[styles.typeChip, healthStatus === h.id && styles.typeChipActive]}
                  onPress={() => setHealthStatus(h.id)}
                >
                  <Text style={[styles.typeChipText, healthStatus === h.id && styles.typeChipTextActive]}>
                    {h.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <AppInput
                  label="Age (Years)"
                  placeholder="e.g. 4.5"
                  keyboardType="numeric"
                  value={ageYears}
                  onChangeText={setAgeYears}
                />
              </View>
              <View style={{ flex: 1, marginLeft: SPACING.md }}>
                <AppInput
                  label="Purchase Cost (₹)"
                  placeholder="e.g. 65000"
                  keyboardType="numeric"
                  value={purchaseCost}
                  onChangeText={setPurchaseCost}
                />
              </View>
            </View>

            <AppInput
              label="Purchase Date (YYYY-MM-DD)"
              placeholder="YYYY-MM-DD"
              value={purchaseDate}
              onChangeText={setPurchaseDate}
            />

            <AppInput
              label="Daily Feed Requirement / खुराक (Optional)"
              placeholder="e.g. 20kg green grass, 5kg cattle feed, 30L water"
              value={dailyFeedRequirement}
              onChangeText={setDailyFeedRequirement}
            />

            <AppInput
              label="Additional Notes / इतर माहिती (Optional)"
              placeholder="e.g. 2nd lactation, high yield milk"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />

            <AppButton
              title={loading ? 'Registering Animal...' : 'Save Animal / जनावर जतन करा'}
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
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.md
  },
  typeChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface
  },
  typeChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryDark
  },
  typeChipText: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: '600'
  },
  typeChipTextActive: {
    color: '#ffffff',
    fontWeight: '700'
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
    flexDirection: 'row'
  }
});
