import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, TextInput } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { differenceInDays, format } from 'date-fns';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

import { PantryItem } from '../types';
import { subscribeToItems, updateItem, markConsumed, deleteItem } from '../services/firebase';
import { useAuthStore } from '../store/authStore';
import { COLORS, CATEGORY_EMOJI, LOCATION_EMOJI, RADIUS, SHADOWS, TYPOGRAPHY } from '../theme';
import { PantryStackParams } from '../navigation/AppNavigator';

type RouteProps = RouteProp<PantryStackParams, 'ItemDetail'>;

export default function ItemDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProps>();
  const { household } = useAuthStore();
  const [item, setItem] = useState<PantryItem | null>(null);
  const [editingQty, setEditingQty] = useState(false);
  const [qty, setQty] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (!household?.id) return;
    return subscribeToItems(household.id, (items) => {
      const found = items.find((i) => i.id === route.params.itemId);
      if (found) { setItem(found); setQty(String(found.quantity)); }
      else navigation.goBack();
    });
  }, [household?.id, route.params.itemId]);

  if (!item) return null;

  const warningDays = household?.settings.expiryWarningDays ?? 3;
  const days = differenceInDays(item.expiryDate, new Date());
  const status = days < 0 ? 'expired' : days <= warningDays ? 'warning' : 'fresh';
  const statusColor = { expired: COLORS.danger, warning: COLORS.warning, fresh: COLORS.safe }[status];
  const statusPale  = { expired: COLORS.dangerPale, warning: COLORS.warningPale, fresh: COLORS.safePale }[status];
  const expiryLabel = days < 0
    ? `Expired ${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''} ago`
    : days === 0 ? 'Expires today!'
    : days === 1 ? 'Expires tomorrow'
    : `${days} days until expiry`;

  const handleSaveQty = () => {
    const parsed = parseFloat(qty);
    if (!isNaN(parsed) && parsed > 0) updateItem(household!.id, item.id, { quantity: parsed });
    setEditingQty(false);
  };

  const handleConsume = () =>
    Alert.alert('Mark as used?', `Remove "${item.name}" from your pantry?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Yes, used it!', onPress: async () => { await markConsumed(household!.id, item.id); navigation.goBack(); } },
    ]);

  const handleDelete = () =>
    Alert.alert('Delete item?', 'This will permanently remove it.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteItem(household!.id, item.id); navigation.goBack(); } },
    ]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Hero header */}
      <View style={styles.hero}>
        <View style={[styles.emojiCircle, { backgroundColor: statusPale }]}>
          <Text style={styles.heroEmoji}>{CATEGORY_EMOJI[item.category]}</Text>
        </View>
        <Text style={styles.itemName}>{item.name}</Text>
        {item.brand ? <Text style={styles.itemBrand}>{item.brand}</Text> : null}
        <View style={[styles.expiryBadge, { backgroundColor: statusPale, borderColor: statusColor }]}>
          <Text style={[styles.expiryBadgeText, { color: statusColor }]}>{expiryLabel}</Text>
        </View>
      </View>

      {/* Info card */}
      <View style={styles.card}>
        <Row label="Location" value={`${LOCATION_EMOJI[item.location]}  ${item.location.charAt(0).toUpperCase() + item.location.slice(1)}`} />
        <View style={styles.divider} />
        <Row label="Category" value={`${CATEGORY_EMOJI[item.category]}  ${item.category.charAt(0).toUpperCase() + item.category.slice(1)}`} />
        <View style={styles.divider} />
        <Row label="Added by" value={item.addedByName} />
        <View style={styles.divider} />
        <Row label="Purchased" value={format(item.purchaseDate, 'dd MMM yyyy')} />
      </View>

      {/* Editable card */}
      <View style={styles.card}>
        <View style={styles.editRow}>
          <Text style={styles.editLabel}>Quantity</Text>
          {editingQty ? (
            <View style={styles.qtyEdit}>
              <TextInput style={styles.qtyInput} value={qty} onChangeText={setQty}
                keyboardType="numeric" autoFocus onBlur={handleSaveQty} onSubmitEditing={handleSaveQty} />
              <Text style={styles.unitText}>{item.unit}</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.editableVal} onPress={() => setEditingQty(true)}>
              <Text style={styles.editableValText}>{item.quantity} {item.unit}</Text>
              <Text style={styles.pencil}>✏️</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.divider} />
        <View style={styles.editRow}>
          <Text style={styles.editLabel}>Expiry date</Text>
          <TouchableOpacity style={styles.editableVal} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.editableValText}>{format(item.expiryDate, 'dd MMM yyyy')}</Text>
            <Text style={styles.pencil}>✏️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <DateTimePickerModal isVisible={showDatePicker} mode="date" date={item.expiryDate}
        onConfirm={(date) => { updateItem(household!.id, item.id, { expiryDate: date }); setShowDatePicker(false); }}
        onCancel={() => setShowDatePicker(false)} />

      <TouchableOpacity style={styles.consumeBtn} onPress={handleConsume}>
        <Text style={styles.consumeBtnText}>✓  Mark as Used</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
        <Text style={styles.deleteBtnText}>🗑  Delete Item</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 48, gap: 14 },

  hero: { alignItems: 'center', paddingVertical: 8, gap: 8 },
  emojiCircle: {
    width: 100, height: 100, borderRadius: 50,
    justifyContent: 'center', alignItems: 'center', marginBottom: 4,
  },
  heroEmoji: { fontSize: 56 },
  itemName: { ...TYPOGRAPHY.h1, color: COLORS.text, textAlign: 'center' },
  itemBrand: { ...TYPOGRAPHY.body, color: COLORS.gray },
  expiryBadge: {
    paddingHorizontal: 18, paddingVertical: 7, borderRadius: RADIUS.xl,
    borderWidth: 1.5, marginTop: 2,
  },
  expiryBadgeText: { fontWeight: '700', fontSize: 14 },

  card: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    padding: 16, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  rowLabel: { ...TYPOGRAPHY.body, color: COLORS.gray },
  rowValue: { ...TYPOGRAPHY.body, color: COLORS.text, fontWeight: '500' },
  divider: { height: 1, backgroundColor: COLORS.divider, marginVertical: 8 },

  editRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  editLabel: { ...TYPOGRAPHY.body, color: COLORS.gray },
  editableVal: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  editableValText: { ...TYPOGRAPHY.body, color: COLORS.text, fontWeight: '500' },
  pencil: { fontSize: 14 },
  qtyEdit: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  qtyInput: {
    borderBottomWidth: 2, borderBottomColor: COLORS.primary, minWidth: 48,
    ...TYPOGRAPHY.body, color: COLORS.text, fontWeight: '500', textAlign: 'right', paddingVertical: 2,
  },
  unitText: { ...TYPOGRAPHY.body, color: COLORS.gray },

  consumeBtn: {
    backgroundColor: COLORS.cta, borderRadius: RADIUS.xl,
    paddingVertical: 17, alignItems: 'center', ...SHADOWS.md,
  },
  consumeBtnText: { ...TYPOGRAPHY.h3, color: COLORS.white, fontSize: 17 },
  deleteBtn: {
    borderRadius: RADIUS.md, paddingVertical: 14, alignItems: 'center',
    borderWidth: 1.5, borderColor: COLORS.danger, backgroundColor: COLORS.dangerPale,
  },
  deleteBtnText: { ...TYPOGRAPHY.body, color: COLORS.danger, fontWeight: '600' },
});
