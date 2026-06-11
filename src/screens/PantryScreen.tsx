import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SectionList, Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { differenceInDays } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';

import { PantryItem, StorageLocation } from '../types';
import { subscribeToItems, markConsumed } from '../services/firebase';
import { useAuthStore } from '../store/authStore';
import { COLORS, CATEGORY_ICON, LOCATION_ICON, RADIUS, SHADOWS, TYPOGRAPHY } from '../theme';
import { PantryStackParams } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<PantryStackParams, 'PantryHome'>;

function getExpiryStatus(expiryDate: Date, warningDays: number): 'expired' | 'warning' | 'fresh' {
  const days = differenceInDays(expiryDate, new Date());
  if (days < 0) return 'expired';
  if (days <= warningDays) return 'warning';
  return 'fresh';
}

function expiryLabel(expiryDate: Date): string {
  const days = differenceInDays(expiryDate, new Date());
  if (days < 0) return `Expired ${Math.abs(days)}d ago`;
  if (days === 0) return 'Expires today!';
  if (days === 1) return 'Tomorrow';
  return `${days} days left`;
}

const STATUS_COLOR = { expired: COLORS.danger, warning: COLORS.warning, fresh: COLORS.safe };
const STATUS_PALE  = { expired: COLORS.dangerPale, warning: COLORS.warningPale, fresh: COLORS.safePale };

function CategoryIcon({ category, size = 20, color = COLORS.textSecondary }: { category: string; size?: number; color?: string }) {
  const name = (CATEGORY_ICON[category] ?? 'cube-outline') as any;
  return <Ionicons name={name} size={size} color={color} />;
}

function UseFirstSection({ items, warningDays, onPress }: {
  items: PantryItem[]; warningDays: number; onPress: (id: string) => void;
}) {
  const urgent = items.filter((i) => getExpiryStatus(i.expiryDate, warningDays) !== 'fresh');
  if (urgent.length === 0) return null;
  return (
    <View style={useFirstStyles.container}>
      <View style={useFirstStyles.header}>
        <View style={useFirstStyles.titleRow}>
          <Ionicons name="alert-circle-outline" size={16} color={COLORS.warning} />
          <Text style={useFirstStyles.title}>Use First</Text>
        </View>
        <Text style={useFirstStyles.subtitle}>{urgent.length} item{urgent.length !== 1 ? 's' : ''} need attention</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={useFirstStyles.scroll}>
        {urgent.map((item) => {
          const status = getExpiryStatus(item.expiryDate, warningDays);
          const color = STATUS_COLOR[status];
          const pale  = STATUS_PALE[status];
          return (
            <TouchableOpacity key={item.id} style={[useFirstStyles.card, { borderColor: color, backgroundColor: pale }]}
              onPress={() => onPress(item.id)} activeOpacity={0.75}>
              <View style={[useFirstStyles.iconCircle, { backgroundColor: color + '22' }]}>
                <CategoryIcon category={item.category} size={20} color={color} />
              </View>
              <Text style={useFirstStyles.name} numberOfLines={2}>{item.name}</Text>
              <View style={[useFirstStyles.pill, { backgroundColor: color }]}>
                <Text style={useFirstStyles.pillText}>{expiryLabel(item.expiryDate)}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const useFirstStyles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface, borderBottomWidth: 1,
    borderBottomColor: COLORS.border, paddingBottom: 16,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { ...TYPOGRAPHY.h3, color: COLORS.text },
  subtitle: { ...TYPOGRAPHY.caption, color: COLORS.gray },
  scroll: { paddingHorizontal: 16, gap: 10 },
  card: {
    width: 110, borderRadius: RADIUS.md, borderWidth: 1.5,
    padding: 12, gap: 6, alignItems: 'center',
  },
  iconCircle: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
  },
  name: { ...TYPOGRAPHY.label, color: COLORS.text, textAlign: 'center', lineHeight: 16 },
  pill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.xl, marginTop: 2 },
  pillText: { fontSize: 10, fontWeight: '700', color: COLORS.white },
});

function ItemCard({ item, warningDays, onPress, onConsume }: {
  item: PantryItem; warningDays: number; onPress: () => void; onConsume: () => void;
}) {
  const status = getExpiryStatus(item.expiryDate, warningDays);
  const color = STATUS_COLOR[status];
  const pale  = STATUS_PALE[status];
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.statusStrip, { backgroundColor: color }]} />
      <View style={styles.cardBody}>
        <View style={[styles.cardIconCircle, { backgroundColor: COLORS.background }]}>
          <CategoryIcon category={item.category} size={20} color={COLORS.textSecondary} />
        </View>
        <View style={styles.cardMid}>
          <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
          {item.brand ? <Text style={styles.cardBrand}>{item.brand}</Text> : null}
          <View style={[styles.expiryPill, { backgroundColor: pale }]}>
            <Text style={[styles.expiryPillText, { color }]}>{expiryLabel(item.expiryDate)}</Text>
          </View>
        </View>
        <View style={styles.cardQtyBox}>
          <Text style={styles.cardQty}>{item.quantity}</Text>
          <Text style={styles.cardUnit}>{item.unit}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.checkBtn} onPress={onConsume}>
        <Ionicons name="checkmark" size={22} color={COLORS.primary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const LOCATIONS: { key: StorageLocation | 'all'; label: string; icon: string }[] = [
  { key: 'all',     label: 'All',     icon: 'apps-outline'          },
  { key: 'fridge',  label: 'Fridge',  icon: 'thermometer-outline'   },
  { key: 'freezer', label: 'Freezer', icon: 'snow-outline'          },
  { key: 'pantry',  label: 'Pantry',  icon: 'home-outline'          },
];

export default function PantryScreen() {
  const navigation = useNavigation<Nav>();
  const { household, user } = useAuthStore();
  const [items, setItems] = useState<PantryItem[]>([]);
  const [filter, setFilter] = useState<StorageLocation | 'all'>('all');
  const warningDays = household?.settings.expiryWarningDays ?? 3;

  useEffect(() => {
    if (!household?.id) return;
    return subscribeToItems(household.id, setItems);
  }, [household?.id]);

  const filtered = useMemo(() =>
    filter === 'all' ? items : items.filter((i) => i.location === filter),
    [items, filter]);

  const sections = useMemo(() => {
    const groups: Record<string, PantryItem[]> = {};
    filtered.forEach((item) => {
      if (!groups[item.location]) groups[item.location] = [];
      groups[item.location].push(item);
    });
    return Object.entries(groups).map(([loc, data]) => ({
      title: loc.charAt(0).toUpperCase() + loc.slice(1),
      icon: (LOCATION_ICON[loc] ?? 'cube-outline') as any,
      data,
    }));
  }, [filtered]);

  const handleConsume = (item: PantryItem) =>
    Alert.alert('Mark as used?', `Remove "${item.name}" from your pantry?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Yes, used it!', onPress: () => markConsumed(household!.id, item.id) },
    ]);

  const firstName = user?.displayName?.split(' ')[0] ?? 'there';

  return (
    <View style={styles.container}>
      {/* Greeting header */}
      <View style={styles.greeting}>
        <View>
          <Text style={styles.greetingHi}>Hi {firstName}</Text>
          <Text style={styles.greetingHousehold}>{household?.name}</Text>
        </View>
        <View style={styles.greetingBadge}>
          <Text style={styles.greetingCount}>{items.length}</Text>
          <Text style={styles.greetingLabel}>items</Text>
        </View>
      </View>

      <UseFirstSection
        items={items}
        warningDays={warningDays}
        onPress={(id) => navigation.navigate('ItemDetail', { itemId: id })}
      />

      {/* Filter chips */}
      <View style={styles.filterBar}>
        {LOCATIONS.map((loc) => (
          <TouchableOpacity
            key={loc.key}
            style={[styles.filterChip, filter === loc.key && styles.filterChipActive]}
            onPress={() => setFilter(loc.key)}
          >
            <Ionicons
              name={loc.icon as any}
              size={13}
              color={filter === loc.key ? COLORS.white : COLORS.textSecondary}
            />
            <Text style={[styles.filterChipText, filter === loc.key && styles.filterChipTextActive]}>
              {loc.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="basket-outline" size={48} color={COLORS.lightGray} />
          </View>
          <Text style={styles.emptyTitle}>Your pantry is empty</Text>
          <Text style={styles.emptySubtitle}>Tap + to add your first item</Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Ionicons name={(section as any).icon} size={13} color={COLORS.gray} />
              <Text style={styles.sectionHeaderText}>{(section as any).title}</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <ItemCard
              item={item}
              warningDays={warningDays}
              onPress={() => navigation.navigate('ItemDetail', { itemId: item.id })}
              onConsume={() => handleConsume(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      )}

      <View style={styles.fabRow}>
        <TouchableOpacity style={[styles.fab, styles.fabScan]} onPress={() => navigation.navigate('Scanner')}>
          <Ionicons name="camera-outline" size={26} color={COLORS.white} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddItem', {})}>
          <Ionicons name="add" size={30} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  filterBar: {
    flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 12, gap: 8,
    backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: RADIUS.xl,
    backgroundColor: COLORS.background, borderWidth: 1.5, borderColor: COLORS.border,
  },
  filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterChipText: { ...TYPOGRAPHY.label, color: COLORS.textSecondary },
  filterChipTextActive: { color: COLORS.white },

  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 6,
  },
  sectionHeaderText: { ...TYPOGRAPHY.label, color: COLORS.gray, textTransform: 'uppercase', letterSpacing: 1 },

  listContent: { paddingBottom: 110 },

  card: {
    flexDirection: 'row', backgroundColor: COLORS.surface,
    marginHorizontal: 16, marginVertical: 5, borderRadius: RADIUS.md,
    overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  statusStrip: { width: 5 },
  cardBody: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 14, gap: 12 },
  cardIconCircle: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  cardMid: { flex: 1, gap: 3 },
  cardName: { ...TYPOGRAPHY.h3, color: COLORS.text },
  cardBrand: { ...TYPOGRAPHY.caption, color: COLORS.gray },
  expiryPill: { alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 3, borderRadius: RADIUS.xl, marginTop: 2 },
  expiryPillText: { fontSize: 12, fontWeight: '600' },
  cardQtyBox: { alignItems: 'center' },
  cardQty: { ...TYPOGRAPHY.h3, color: COLORS.text },
  cardUnit: { ...TYPOGRAPHY.caption, color: COLORS.gray },

  checkBtn: { width: 50, backgroundColor: COLORS.primaryPale, justifyContent: 'center', alignItems: 'center' },

  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyIconCircle: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: COLORS.border, justifyContent: 'center', alignItems: 'center',
  },
  emptyTitle: { ...TYPOGRAPHY.h2, color: COLORS.darkGray },
  emptySubtitle: { ...TYPOGRAPHY.body, color: COLORS.gray },

  fabRow: { position: 'absolute', bottom: 28, right: 20, flexDirection: 'row', gap: 12 },
  fab: {
    width: 58, height: 58, borderRadius: 29, backgroundColor: COLORS.cta,
    justifyContent: 'center', alignItems: 'center', ...SHADOWS.md,
  },
  fabScan: { backgroundColor: '#D4906C' },

  greeting: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14,
    backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  greetingHi: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 22, color: COLORS.text, letterSpacing: -0.3 },
  greetingHousehold: { ...TYPOGRAPHY.caption, color: COLORS.gray, marginTop: 2 },
  greetingBadge: {
    alignItems: 'center', backgroundColor: COLORS.ctaPale,
    borderRadius: RADIUS.md, paddingHorizontal: 14, paddingVertical: 8,
  },
  greetingCount: { fontSize: 22, fontWeight: '700', color: COLORS.cta },
  greetingLabel: { fontSize: 11, color: COLORS.cta, fontWeight: '500' },
});
