import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Modal, Alert, ScrollView, Image } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONTS } from '../../../constants/theme';
import { dairyService } from '../../../services/dairyService';
import { useTranslation } from 'react-i18next';
import AppHeader from '../../../components/AppHeader';
import AppInput from '../../../components/AppInput';
import AppButton from '../../../components/AppButton';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorMessage from '../../../components/ErrorMessage';
import EmptyState from '../../../components/EmptyState';
import ImageAttachment from '../../../components/ImageAttachment';

const EXPENSE_CATEGORIES = [
  { id: 'FEED_FODDER', label: 'Cattle Feed / खुराक 🌾' },
  { id: 'DRY_GRASS', label: 'Dry Grass / वाळलेला चारा 🌿' },
  { id: 'VETERINARY', label: 'Doctor Visit / पशुवैद्यकीय 🩺' },
  { id: 'MEDICINE_VACCINE', label: 'Medicine & Vaccine / औषधे 💉' },
  { id: 'BREEDING_INSEMINATION', label: 'Insemination / कृत्रिम रेतन 🧬' },
  { id: 'TRANSPORT', label: 'Transport / जनावरे वाहतूक 🚛' },
  { id: 'EQUIPMENT_MAINTENANCE', label: 'Equipment / साहित्य दुरुस्ती ⚙️' },
  { id: 'INSURANCE', label: 'Livestock Insurance / विमा 📜' },
  { id: 'PURCHASE_COST', label: 'Animal Purchase / जनावर खरेदी 💰' },
  { id: 'OTHER', label: 'Other / इतर खर्च 📝' }
];

export default function DairyExpensesScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [expenses, setExpenses] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAnimalId, setSelectedAnimalId] = useState(null); // null = Shared Herd
  const [category, setCategory] = useState('FEED_FODDER');
  const [amount, setAmount] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('KG');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [selectedPreviewReceipt, setSelectedPreviewReceipt] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setError('');
      const [expRes, animalRes] = await Promise.all([
        dairyService.listExpenses(),
        dairyService.listAnimals({ status: 'ACTIVE' })
      ]);

      if (expRes.success && expRes.data) setExpenses(expRes.data);
      if (animalRes.success && animalRes.data) setAnimals(animalRes.data);
    } catch (e) {
      setError(e.message || 'Failed to load dairy expenses');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleSaveExpense = async () => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      Alert.alert('Required', 'Please enter a valid expense amount greater than 0');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        animalId: selectedAnimalId || null,
        category,
        amount: amt,
        quantity: quantity ? parseFloat(quantity) : undefined,
        unit: unit.trim() || undefined,
        expenseDate,
        isCapitalExpense: category === 'PURCHASE_COST',
        description: description.trim() || undefined,
        receiptUrl: receiptUrl.trim() || undefined
      };

      const res = await dairyService.recordExpense(payload);
      if (res.success) {
        setModalVisible(false);
        setAmount('');
        setQuantity('');
        setDescription('');
        setReceiptUrl('');
        setSelectedAnimalId(null);
        loadData();
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to save expense');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (expId) => {
    Alert.alert(
      'Delete Expense / खर्च हटवा',
      'Are you sure you want to delete this expense record?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await dairyService.deleteExpense(expId);
              if (res.success) loadData();
            } catch (e) {
              Alert.alert('Error', e.message || 'Failed to delete expense');
            }
          }
        }
      ]
    );
  };

  // Financial sums
  const totalOperating = expenses
    .filter((e) => !e.capitalExpense)
    .reduce((acc, e) => acc + (parseFloat(e.amount) || 0), 0);

  const totalCapital = expenses
    .filter((e) => e.capitalExpense)
    .reduce((acc, e) => acc + (parseFloat(e.amount) || 0), 0);

  const filteredExpenses = expenses.filter((e) => {
    if (selectedCategory === 'ALL') return true;
    return e.category === selectedCategory;
  });

  const renderExpenseCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.categoryTitle}>{item.category}</Text>
          <Text style={styles.expenseSub}>
            📅 {item.expenseDate} • {item.animalName ? `🐄 ${item.animalName}` : '👥 Entire Herd (सर्व जनावरे)'}
          </Text>
        </View>
        <Text style={[styles.amountVal, item.capitalExpense && { color: '#0369a1' }]}>
          ₹{item.amount}
        </Text>
      </View>

      {item.description ? <Text style={styles.descText}>{item.description}</Text> : null}

      {item.receiptUrl ? (
        <TouchableOpacity
          style={styles.receiptPill}
          onPress={() => setSelectedPreviewReceipt({ uri: item.receiptUrl, title: `${item.category} Receipt` })}
        >
          <Text style={styles.receiptPillText}>🧾 View Bill / Receipt (पावती पहा)</Text>
        </TouchableOpacity>
      ) : null}

      <View style={styles.cardFooter}>
        <Text style={styles.typeTag}>
          {item.capitalExpense ? '🏛️ Capital Investment' : '🌾 Operating Cost'}
          {item.quantity ? ` • ${item.quantity} ${item.unit || ''}` : ''}
        </Text>
        <TouchableOpacity onPress={() => handleDelete(item.id)}>
          <Text style={styles.deleteLink}>🗑️ Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title={t('dairy.expenses') || 'Dairy Expenses'}
        subtitle="Feed, veterinary, breeding & maintenance costs"
        showBack={true}
        fallbackRoute="/dairy"
      />

      {/* Top Financial Breakdown */}
      <View style={styles.summaryBox}>
        <View style={styles.summaryCol}>
          <Text style={styles.summaryLabel}>Operating Expenses</Text>
          <Text style={[styles.summaryVal, { color: '#dc2626' }]}>₹{totalOperating.toFixed(0)}</Text>
          <Text style={styles.summaryHint}>(Feed, Vet, Meds, etc.)</Text>
        </View>
        <View style={styles.summaryCol}>
          <Text style={styles.summaryLabel}>Capital Investment</Text>
          <Text style={[styles.summaryVal, { color: '#0369a1' }]}>₹{totalCapital.toFixed(0)}</Text>
          <Text style={styles.summaryHint}>(Animal Purchases)</Text>
        </View>
      </View>

      {/* Action Header */}
      <View style={styles.actionHeader}>
        <Text style={styles.sectionTitle}>Expense Records ({filteredExpenses.length})</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Text style={styles.addBtnText}>+ Add Expense / खर्च नोंदवा</Text>
        </TouchableOpacity>
      </View>

      {error ? <ErrorMessage message={error} onRetry={loadData} /> : null}

      {loading && !refreshing ? (
        <LoadingIndicator message="Loading expenses..." />
      ) : (
        <FlatList
          data={filteredExpenses}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderExpenseCard}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
          ListEmptyComponent={
            <EmptyState
              icon="🌾"
              title="No dairy expenses recorded"
              message="Track fodder, medicine, veterinary, and breeding costs for your livestock."
              actionTitle="+ Add First Expense"
              onAction={() => setModalVisible(true)}
            />
          }
        />
      )}

      {/* Add Expense Modal */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Record Dairy Expense / खर्च नोंद</Text>
              <Text style={styles.modalSubtitle}>Feed, veterinary, medicine, breeding, or maintenance</Text>

              {/* Scope: Herd vs Animal */}
              <Text style={styles.fieldLabel}>Expense Scope / खर्च कोणासाठी? *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.md }}>
                <TouchableOpacity
                  style={[styles.chip, selectedAnimalId === null && styles.chipActive]}
                  onPress={() => setSelectedAnimalId(null)}
                >
                  <Text style={[styles.chipText, selectedAnimalId === null && styles.chipTextActive]}>
                    👥 Entire Herd (संपूर्ण गोठा)
                  </Text>
                </TouchableOpacity>
                {animals.map((a) => (
                  <TouchableOpacity
                    key={a.id}
                    style={[styles.chip, selectedAnimalId === a.id && styles.chipActive]}
                    onPress={() => setSelectedAnimalId(a.id)}
                  >
                    <Text style={[styles.chipText, selectedAnimalId === a.id && styles.chipTextActive]}>
                      🐄 {a.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Category */}
              <Text style={styles.fieldLabel}>Category / प्रकार *</Text>
              <View style={styles.categoryGrid}>
                {EXPENSE_CATEGORIES.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.catBtn, category === c.id && styles.catBtnActive]}
                    onPress={() => setCategory(c.id)}
                  >
                    <Text style={[styles.catBtnText, category === c.id && styles.catBtnTextActive]}>
                      {c.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <AppInput
                label="Amount (₹) *"
                placeholder="e.g. 500"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />

              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <AppInput
                    label="Quantity (Optional)"
                    placeholder="e.g. 50"
                    keyboardType="numeric"
                    value={quantity}
                    onChangeText={setQuantity}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: SPACING.md }}>
                  <AppInput
                    label="Unit (e.g. KG, BAG, DOSE)"
                    placeholder="KG"
                    value={unit}
                    onChangeText={setUnit}
                  />
                </View>
              </View>

              <AppInput
                label="Expense Date (YYYY-MM-DD) *"
                value={expenseDate}
                onChangeText={setExpenseDate}
              />

              <AppInput
                label="Description / तपशील (Optional)"
                placeholder="e.g. 2 bags of Amul cattle feed"
                value={description}
                onChangeText={setDescription}
              />

              {/* Receipt / Bill Photo Attachment */}
              <ImageAttachment
                value={receiptUrl}
                onChange={setReceiptUrl}
                label="Attach Bill / Receipt Photo (पावती)"
                placeholderIcon="🧾"
                hint="Take photo of feed bill or purchase receipt"
              />

              <View style={styles.modalActions}>
                <AppButton
                  title="Cancel"
                  variant="outline"
                  onPress={() => setModalVisible(false)}
                  style={{ flex: 1, marginRight: SPACING.sm }}
                />
                <AppButton
                  title={saving ? 'Saving...' : 'Save Expense / जतन करा'}
                  onPress={handleSaveExpense}
                  loading={saving}
                  disabled={saving}
                  style={{ flex: 2 }}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Full Receipt Preview Modal */}
      <Modal
        visible={!!selectedPreviewReceipt}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedPreviewReceipt(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.previewModalHeader}>
              <Text style={styles.modalTitle}>{selectedPreviewReceipt?.title || 'Receipt'}</Text>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setSelectedPreviewReceipt(null)}
              >
                <Text style={styles.closeBtnText}>✕ Close</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.fullImageContainer}>
              {selectedPreviewReceipt?.uri && (
                <Image
                  source={{ uri: selectedPreviewReceipt.uri }}
                  style={styles.fullImage}
                  resizeMode="contain"
                />
              )}
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
  summaryBox: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.sm + 4,
    paddingHorizontal: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  summaryCol: {
    alignItems: 'center',
    flex: 1
  },
  summaryLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 2
  },
  summaryVal: {
    fontSize: 15,
    fontWeight: '800'
  },
  summaryHint: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1
  },
  actionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xs
  },
  sectionTitle: {
    fontSize: FONTS.medium,
    fontWeight: '700',
    color: COLORS.textPrimary
  },
  addBtn: {
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 1
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary
  },
  expenseSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2
  },
  amountVal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#dc2626'
  },
  descText: {
    fontSize: 12,
    color: COLORS.textPrimary,
    marginTop: 4,
    marginBottom: 4
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.xs + 2,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight
  },
  typeTag: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500'
  },
  deleteLink: {
    fontSize: 11,
    color: '#dc2626',
    fontWeight: '600'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md
  },
  modalContent: {
    width: '100%',
    maxWidth: 450,
    maxHeight: '90%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    elevation: 5
  },
  modalTitle: {
    fontSize: FONTS.large,
    fontWeight: '700',
    color: COLORS.textPrimary
  },
  modalSubtitle: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4
  },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.xs
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryDark
  },
  chipText: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: '600'
  },
  chipTextActive: {
    color: '#ffffff',
    fontWeight: '700'
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.md
  },
  catBtn: {
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs + 1,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#f8fafc'
  },
  catBtnActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary
  },
  catBtnText: {
    fontSize: 11,
    color: COLORS.textPrimary,
    fontWeight: '600'
  },
  catBtnTextActive: {
    color: COLORS.primaryDark,
    fontWeight: '700'
  },
  row: {
    flexDirection: 'row'
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: SPACING.md
  },
  receiptPill: {
    marginTop: SPACING.xs,
    marginBottom: SPACING.xs,
    alignSelf: 'flex-start',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: '#bfdbfe'
  },
  receiptPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1d4ed8'
  },
  previewModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight
  },
  closeBtn: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.sm
  },
  closeBtnText: {
    fontSize: FONTS.small,
    fontWeight: 'bold',
    color: COLORS.textPrimary
  },
  fullImageContainer: {
    width: '100%',
    height: 420,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center'
  },
  fullImage: {
    width: '100%',
    height: '100%'
  }
});
