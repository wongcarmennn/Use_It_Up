import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { format, addDays } from 'date-fns';

import { Category, StorageLocation } from '../types';
import { addItem } from '../services/firebase';
import { useAuthStore } from '../store/authStore';
import { COLORS, CATEGORY_EMOJI, LOCATION_EMOJI, RADIUS, SHADOWS, TYPOGRAPHY } from '../theme';
import { PantryStackParams } from '../navigation/AppNavigator';
import { scheduleExpiryNotification } from '../services/notifications';

type RouteProps = RouteProp<PantryStackParams, 'AddItem'>;

const CATEGORIES: Category[] = ['dairy','meat','seafood','vegetables','fruits','beverages','snacks','condiments','grains','frozen','other'];
const LOCATIONS: StorageLocation[] = ['fridge', 'freezer', 'pantry', 'other'];
const UNITS = ['pcs', 'g', 'kg', 'ml', 'L', 'bottle', 'can', 'pack', 'box'];

export default function AddItemScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProps>();
  const { household, user } = useAuthStore();

  const [name, setName] = useState(route.params?.productName ?? '');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState<Category>('other');
  const [location, setLocation] = useState<StorageLocation>('fridge');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('pcs');
  const [expiryDate, setExpiryDate] = useState(addDays(new Date(), 7));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Item name required'); return; }
    if (!household || !user) return;
    setSaving(true);
    try {
      const itemData: any = {
        householdId: household.id,
        addedByUserId: user.uid,
        addedByName: user.displayName ?? 'Family Member',
        name: name.trim(),
        category, location,
        quantity: parseFloat(quantity) || 1,
        unit, expiryDate,
        purchaseDate: new Date(),
        isConsumed: false,
        isExpired: false,
      };
      if (brand.trim()) itemData.brand = brand.trim();
      if (route.params?.barcode) itemData.barcode = route.params.barcode;

      const itemId = await addItem(household.id, itemData);
      if (household.settings.notificationsEnabled) {
        await scheduleExpiryNotification(itemId, name.trim(), expiryDate, household.settings.expiryWarningDays);
      }
      navigation.goBack();
    } catch (e: any) { Alert.alert('Error', e?.message ?? 'Failed to save item. Please try again.'); }
    finally { setSaving(false); }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>

        <View style={styles.card}>
          <View style={styles.field}>
            <Text style={styles.label}>ITEM NAME</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName}
              placeholder="e.g. Full Cream Milk" placeholderTextColor={COLORS.lightGray} />
          </View>
          <View style={styles.divider} />
          <View style={styles.field}>
            <Text style={styles.label}>BRAND (OPTIONAL)</Text>
            <TextInput style={styles.input} value={brand} onChangeText={setBrand}
              placeholder="e.g. Pauls" placeholderTextColor={COLORS.lightGray} />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>CATEGORY</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            style={{ marginHorizontal: -16 }}
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 10, gap: 8, flexDirection: 'row' }}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity key={cat}
                style={[styles.chip, category === cat && styles.chipActive]}
                onPress={() => setCategory(cat)}>
                <Text style={styles.chipEmoji}>{CATEGORY_EMOJI[cat]}</Text>
                <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>STORAGE LOCATION</Text>
          <View style={styles.chipRow}>
            {LOCATIONS.map((loc) => (
              <TouchableOpacity key={loc}
                style={[styles.chip, styles.chipGrow, location === loc && styles.chipActive]}
                onPress={() => setLocation(loc)}>
                <Text style={styles.chipEmoji}>{LOCATION_EMOJI[loc]}</Text>
                <Text style={[styles.chipText, location === loc && styles.chipTextActive]}>
                  {loc.charAt(0).toUpperCase() + loc.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.rowFields}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>QUANTITY</Text>
              <TextInput style={styles.input} value={quantity} onChangeText={setQuantity}
                keyboardType="numeric" placeholder="1" placeholderTextColor={COLORS.lightGray} />
            </View>
            <View style={{ flex: 2 }}>
              <Text style={styles.label}>UNIT</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
                  {UNITS.map((u) => (
                    <TouchableOpacity key={u} style={[styles.chip, unit === u && styles.chipActive]} onPress={() => setUnit(u)}>
                      <Text style={[styles.chipText, unit === u && styles.chipTextActive]}>{u}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>EXPIRY DATE</Text>
          <TouchableOpacity style={styles.dateBtn} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.dateBtnEmoji}>📅</Text>
            <Text style={styles.dateBtnText}>{format(expiryDate, 'dd MMM yyyy')}</Text>
          </TouchableOpacity>
        </View>

        <DateTimePickerModal
          isVisible={showDatePicker} mode="date" date={expiryDate} minimumDate={new Date()}
          onConfirm={(date) => { setExpiryDate(date); setShowDatePicker(false); }}
          onCancel={() => setShowDatePicker(false)}
        />

        <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
          <Text style={styles.saveBtnText}>{saving ? 'Saving…' : '✓  Add to Pantry'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 40, gap: 12 },

  card: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    padding: 16, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm,
  },
  cardLabel: { ...TYPOGRAPHY.label, color: COLORS.gray, marginBottom: 2 },
  divider: { height: 1, backgroundColor: COLORS.divider, marginVertical: 12 },

  field: { gap: 6 },
  label: { ...TYPOGRAPHY.label, color: COLORS.gray },
  input: {
    backgroundColor: COLORS.background, borderRadius: RADIUS.sm,
    borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: 12, paddingVertical: 11,
    ...TYPOGRAPHY.body, color: COLORS.text,
  },

  rowFields: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: RADIUS.xl,
    backgroundColor: COLORS.background, borderWidth: 1.5, borderColor: COLORS.border,
  },
  chipGrow: { flex: 1, justifyContent: 'center' },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipEmoji: { fontSize: 15 },
  chipText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
  chipTextActive: { color: COLORS.white },

  dateBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8,
    backgroundColor: COLORS.background, borderRadius: RADIUS.sm,
    borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 14, paddingVertical: 12,
  },
  dateBtnEmoji: { fontSize: 18 },
  dateBtnText: { ...TYPOGRAPHY.body, color: COLORS.text, fontWeight: '500' },

  saveBtn: {
    backgroundColor: COLORS.cta, borderRadius: RADIUS.xl,
    paddingVertical: 17, alignItems: 'center', marginTop: 4, ...SHADOWS.md,
  },
  saveBtnText: { ...TYPOGRAPHY.h3, color: COLORS.white, fontSize: 17 },
});
