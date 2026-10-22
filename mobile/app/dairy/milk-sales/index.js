import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Modal, Alert, ScrollView } from 'react-native';
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

export default function MilkSalesScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [sales, setSales] = useState([]);
  const [todayUsage, setTodayUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Sale Modal
  const [saleModalVisible, setSaleModalVisible] = useState(false);
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [buyerName, setBuyerName] = useState('');
  const [buyerContact, setBuyerContact] = useState('');
  const [quantityLiters, setQuantityLiters] = useState('');
  const [pricePerLiter, setPricePerLiter] = useState('55');
  const [totalAmount, setTotalAmount] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('PAID');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [notes, setNotes] = useState('');
  const [savingSale, setSavingSale] = useState(false);

  // Usage Modal
  const [usageModalVisible, setUsageModalVisible] = useState(false);
  const [usageDate, setUsageDate] = useState(new Date().toISOString().split('T')[0]);
  const [homeLit, setHomeLit] = useState('');
  const [calfLit, setCalfLit] = useState('');
  const [wastedLit, setWastedLit] = useState('');
  const [usageNotes, setUsageNotes] = useState('');
  const [savingUsage, setSavingUsage] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setError('');
      const today = new Date().toISOString().split('T')[0];
      const [salesRes, usageRes] = await Promise.all([
        dairyService.listMilkSales(),
        dairyService.getMilkUsage(today)
      ]);

      if (salesRes.success && salesRes.data) setSales(salesRes.data);
      if (usageRes.success && usageRes.data) setTodayUsage(usageRes.data);
    } catch (e) {
      setError(e.message || 'Failed to load milk sales');
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

  const handleQtyChange = (val) => {
    setQuantityLiters(val);
    const q = parseFloat(val) || 0;
    const p = parseFloat(pricePerLiter) || 0;
    const tot = (q * p).toFixed(2);
    setTotalAmount(tot);
    setPaidAmount(tot);
  };

  const handlePriceChange = (val) => {
    setPricePerLiter(val);
    const q = parseFloat(quantityLiters) || 0;
    const p = parseFloat(val) || 0;
    const tot = (q * p).toFixed(2);
    setTotalAmount(tot);
    setPaidAmount(tot);
  };

  const handleSaveSale = async () => {
    if (!buyerName.trim()) {
      Alert.alert('Required', 'Please enter the buyer or dairy name');
      return;
    }
    const q = parseFloat(quantityLiters);
    const p = parseFloat(pricePerLiter);
    if (isNaN(q) || q <= 0 || isNaN(p) || p <= 0) {
      Alert.alert('Invalid', 'Please enter valid quantity and price per liter');
      return;
    }

    setSavingSale(true);
    try {
      const tot = totalAmount ? parseFloat(totalAmount) : (q * p);
      const paid = paidAmount ? parseFloat(paidAmount) : 0;

      const payload = {
        saleDate,
        buyerName: buyerName.trim(),
        buyerContact: buyerContact.trim() || undefined,
        quantityLiters: q,
        pricePerLiter: p,
        totalAmount: tot,
        paidAmount: paid,
        paymentStatus,
        paymentMethod,
        notes: notes.trim() || undefined
      };

      const res = await dairyService.recordMilkSale(payload);
      if (res.success) {
        setSaleModalVisible(false);
        setBuyerName('');
        setQuantityLiters('');
        setTotalAmount('');
        setPaidAmount('');
        setNotes('');
        loadData();
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to record milk sale');
    } finally {
      setSavingSale(false);
    }
  };

  const handleSaveUsage = async () => {
    setSavingUsage(true);
    try {
      const payload = {
        usageDate,
        homeConsumptionLiters: homeLit ? parseFloat(homeLit) : 0,
        calfFeedingLiters: calfLit ? parseFloat(calfLit) : 0,
        wastedLiters: wastedLit ? parseFloat(wastedLit) : 0,
        notes: usageNotes.trim() || undefined
      };

      const res = await dairyService.recordMilkUsage(payload);
      if (res.success) {
        setUsageModalVisible(false);
        loadData();
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to save usage');
    } finally {
      setSavingUsage(false);
    }
  };

  const handleDeleteSale = (saleId) => {
    Alert.alert(
      'Delete Sale Record / नोंद हटवा',
      'Are you sure you want to delete this sale entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await dairyService.deleteMilkSale(saleId);
              if (res.success) loadData();
            } catch (e) {
              Alert.alert('Error', e.message || 'Failed to delete sale');
            }
          }
        }
      ]
    );
  };

  // Aggregates
  const totalSoldLiters = sales.reduce((acc, s) => acc + (parseFloat(s.quantityLiters) || 0), 0);
  const totalRevenue = sales.reduce((acc, s) => acc + (parseFloat(s.totalAmount) || 0), 0);
  const totalCollected = sales.reduce((acc, s) => acc + (parseFloat(s.paidAmount) || 0), 0);
  const totalReceivables = sales.reduce((acc, s) => acc + (parseFloat(s.balanceDue) || 0), 0);

  const renderSaleCard = ({ item }) => {
    const isPaid = item.paymentStatus === 'PAID';
    const isPartial = item.paymentStatus === 'PARTIALLY_PAID';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.buyerTitle}>🏢 {item.buyerName}</Text>
            <Text style={styles.saleSub}>
              📅 {item.saleDate} • {item.quantityLiters} L @ ₹{item.pricePerLiter}/L
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.saleAmount}>₹{item.totalAmount}</Text>
            <View style={[
              styles.statusPill,
              { backgroundColor: isPaid ? '#dcfce7' : isPartial ? '#fef3c7' : '#fee2e2' }
            ]}>
              <Text style={[
                styles.statusPillText,
                { color: isPaid ? '#15803d' : isPartial ? '#b45309' : '#dc2626' }
              ]}>
                {item.paymentStatus}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.paymentInfoRow}>
          <Text style={styles.paymentDetail}>
            💵 Received: ₹{item.paidAmount || 0}
            {item.balanceDue > 0 ? ` • ⚠️ Due: ₹${item.balanceDue}` : ''}
          </Text>
          <TouchableOpacity onPress={() => handleDeleteSale(item.id)}>
            <Text style={styles.deleteLink}>🗑️ Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title={t('dairy.milkSales') || 'Milk Sales & Usage'}
        subtitle="Customer ledger, payments & home milk"
        showBack={true}
        fallbackRoute="/dairy"
      />

      {/* Financial Overview Cards */}
      <View style={styles.statsBar}>
        <View style={styles.statCol}>
          <Text style={styles.statLabel}>Total Sold</Text>
          <Text style={styles.statVal}>{totalSoldLiters.toFixed(1)} L</Text>
        </View>
        <View style={styles.statCol}>
          <Text style={styles.statLabel}>Total Sales</Text>
          <Text style={[styles.statVal, { color: '#16a34a' }]}>₹{totalRevenue.toFixed(0)}</Text>
        </View>
        <View style={styles.statCol}>
          <Text style={styles.statLabel}>Cash Received</Text>
          <Text style={[styles.statVal, { color: COLORS.primaryDark }]}>₹{totalCollected.toFixed(0)}</Text>
        </View>
        <View style={styles.statCol}>
          <Text style={styles.statLabel}>Due Balance</Text>
          <Text style={[styles.statVal, { color: '#dc2626' }]}>₹{totalReceivables.toFixed(0)}</Text>
        </View>
      </View>

      {/* Buttons Bar */}
      <View style={styles.actionsBar}>
        <TouchableOpacity style={styles.actionBtnPrimary} onPress={() => setSaleModalVisible(true)}>
          <Text style={styles.actionBtnPrimaryText}>+ Record Milk Sale / विक्री नोंदवा</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtnSecondary} onPress={() => setUsageModalVisible(true)}>
          <Text style={styles.actionBtnSecondaryText}>🥛 Home/Calf Usage</Text>
        </TouchableOpacity>
      </View>

      {/* Home Usage Snippet if available */}
      {todayUsage && (todayUsage.homeConsumptionLiters > 0 || todayUsage.calfFeedingLiters > 0) ? (
        <View style={styles.usageNotice}>
          <Text style={styles.usageNoticeText}>
            🏠 Today's Usage: Home: {todayUsage.homeConsumptionLiters} L • Calf: {todayUsage.calfFeedingLiters} L (Total: {todayUsage.totalUsedLiters} L)
          </Text>
        </View>
      ) : null}

      {error ? <ErrorMessage message={error} onRetry={loadData} /> : null}

      {loading && !refreshing ? (
        <LoadingIndicator message="Loading milk sales ledger..." />
      ) : (
        <FlatList
          data={sales}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderSaleCard}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
          ListEmptyComponent={
            <EmptyState
              icon="💰"
              title="No milk sales recorded yet"
              description="Record sales to dairies, collection centers, or direct customers."
              actionLabel="+ Record First Sale"
              onAction={() => setSaleModalVisible(true)}
            />
          }
        />
      )}

      {/* Modal: Record Milk Sale */}
      <Modal visible={saleModalVisible} transparent animationType="fade" onRequestClose={() => setSaleModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Record Milk Sale / दूध विक्री</Text>
              <Text style={styles.modalSubtitle}>Enter buyer, volume, price and payment</Text>

              <AppInput
                label="Sale Date (YYYY-MM-DD) *"
                placeholder="2026-10-22"
                value={saleDate}
                onChangeText={setSaleDate}
              />

              <AppInput
                label="Buyer / Dairy Name (डेअरी / ग्राहक) *"
                placeholder="e.g. Mahanand / Amul / Vinod Patil"
                value={buyerName}
                onChangeText={setBuyerName}
              />

              <AppInput
                label="Buyer Mobile (Optional)"
                placeholder="10-digit phone"
                keyboardType="phone-pad"
                value={buyerContact}
                onChangeText={setBuyerContact}
              />

              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <AppInput
                    label="Quantity (Liters) *"
                    placeholder="e.g. 15.5"
                    keyboardType="numeric"
                    value={quantityLiters}
                    onChangeText={handleQtyChange}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: SPACING.md }}>
                  <AppInput
                    label="Rate / L (₹) *"
                    placeholder="e.g. 55"
                    keyboardType="numeric"
                    value={pricePerLiter}
                    onChangeText={handlePriceChange}
                  />
                </View>
              </View>

              <AppInput
                label="Total Sale Amount (₹) *"
                placeholder="Total"
                keyboardType="numeric"
                value={totalAmount}
                onChangeText={setTotalAmount}
              />

              <AppInput
                label="Amount Paid by Buyer (₹) *"
                placeholder="Enter cash received"
                keyboardType="numeric"
                value={paidAmount}
                onChangeText={setPaidAmount}
              />

              {/* Payment Status */}
              <Text style={styles.fieldLabel}>Payment Status</Text>
              <View style={styles.statusChipsRow}>
                {['PAID', 'PARTIALLY_PAID', 'UNPAID'].map((st) => (
                  <TouchableOpacity
                    key={st}
                    style={[styles.statusChip, paymentStatus === st && styles.statusChipActive]}
                    onPress={() => setPaymentStatus(st)}
                  >
                    <Text style={[styles.statusChipText, paymentStatus === st && styles.statusChipTextActive]}>
                      {st}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <AppInput
                label="Notes (Optional)"
                placeholder="e.g. Morning batch milk"
                value={notes}
                onChangeText={setNotes}
              />

              <View style={styles.modalActions}>
                <AppButton
                  title="Cancel"
                  variant="outline"
                  onPress={() => setSaleModalVisible(false)}
                  style={{ flex: 1, marginRight: SPACING.sm }}
                />
                <AppButton
                  title={savingSale ? 'Saving...' : 'Save Sale / जतन करा'}
                  onPress={handleSaveSale}
                  loading={savingSale}
                  disabled={savingSale}
                  style={{ flex: 2 }}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal: Home & Calf Usage */}
      <Modal visible={usageModalVisible} transparent animationType="fade" onRequestClose={() => setUsageModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Log Milk Usage (घरगुती वापर)</Text>
            <Text style={styles.modalSubtitle}>Track milk consumed at home or given to calves</Text>

            <AppInput
              label="Date (YYYY-MM-DD)"
              value={usageDate}
              onChangeText={setUsageDate}
            />

            <AppInput
              label="Home Consumption (Liters) / घरगुती वापर"
              placeholder="e.g. 2.0"
              keyboardType="numeric"
              value={homeLit}
              onChangeText={setHomeLit}
            />

            <AppInput
              label="Calf Feeding (Liters) / वासरांना पाजलेले"
              placeholder="e.g. 1.5"
              keyboardType="numeric"
              value={calfLit}
              onChangeText={setCalfLit}
            />

            <AppInput
              label="Spoilage / Wasted (Liters)"
              placeholder="e.g. 0.5"
              keyboardType="numeric"
              value={wastedLit}
              onChangeText={setWastedLit}
            />

            <View style={styles.modalActions}>
              <AppButton
                title="Cancel"
                variant="outline"
                onPress={() => setUsageModalVisible(false)}
                style={{ flex: 1, marginRight: SPACING.sm }}
              />
              <AppButton
                title={savingUsage ? 'Saving...' : 'Save Usage'}
                onPress={handleSaveUsage}
                loading={savingUsage}
                disabled={savingUsage}
                style={{ flex: 2 }}
              />
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
  statsBar: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  statCol: {
    alignItems: 'center',
    flex: 1
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginBottom: 2
  },
  statVal: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary
  },
  actionsBar: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm
  },
  actionBtnPrimary: {
    flex: 2,
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    alignItems: 'center'
  },
  actionBtnPrimaryText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 12
  },
  actionBtnSecondary: {
    flex: 1.3,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    alignItems: 'center'
  },
  actionBtnSecondaryText: {
    color: COLORS.primaryDark,
    fontWeight: '700',
    fontSize: 12
  },
  usageNotice: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    marginHorizontal: SPACING.md,
    padding: SPACING.xs + 2,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.xs
  },
  usageNoticeText: {
    fontSize: 11,
    color: '#1e40af',
    fontWeight: '600',
    textAlign: 'center'
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
    marginBottom: 6
  },
  buyerTitle: {
    fontSize: FONTS.medium,
    fontWeight: '700',
    color: COLORS.textPrimary
  },
  saleSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2
  },
  saleAmount: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primaryDark
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    marginTop: 2
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700'
  },
  paymentInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.xs + 2,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight
  },
  paymentDetail: {
    fontSize: 11,
    color: COLORS.textSecondary
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
  row: {
    flexDirection: 'row'
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4
  },
  statusChipsRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.md
  },
  statusChip: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border
  },
  statusChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryDark
  },
  statusChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary
  },
  statusChipTextActive: {
    color: '#ffffff'
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: SPACING.md
  }
});
