import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Image, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { differenceInDays } from 'date-fns';

import { subscribeToItems } from '../services/firebase';
import { findRecipesByIngredients, RecipeSummary } from '../services/spoonacular';
import { useAuthStore } from '../store/authStore';
import { COLORS, RADIUS, SHADOWS, TYPOGRAPHY } from '../theme';
import { RecipesStackParams } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RecipesStackParams, 'RecipesHome'>;

export default function RecipesScreen() {
  const navigation = useNavigation<Nav>();
  const { household } = useAuthStore();
  const [pantryNames, setPantryNames] = useState<string[]>([]);
  const [expiringNames, setExpiringNames] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<RecipeSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const warningDays = household?.settings.expiryWarningDays ?? 3;

  useEffect(() => {
    if (!household?.id) return;
    return subscribeToItems(household.id, (items) => {
      setPantryNames(items.map((i) => i.name));
      setExpiringNames(
        items
          .filter((i) => differenceInDays(i.expiryDate, new Date()) <= warningDays)
          .map((i) => i.name)
      );
    });
  }, [household?.id]);

  const handleSearch = async () => {
    if (pantryNames.length === 0) {
      Alert.alert('Empty pantry', 'Add some items to your pantry first!');
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const results = await findRecipesByIngredients(pantryNames);
      setRecipes(results);
    } catch {
      Alert.alert('Error', 'Could not fetch recipes. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const renderRecipe = ({ item }: { item: RecipeSummary }) => {
    const matchPct = Math.round(
      (item.usedIngredientCount / (item.usedIngredientCount + item.missedIngredientCount)) * 100
    );
    const usesExpiring = item.usedIngredients.some((u) =>
      expiringNames.some((e) => e.toLowerCase().includes(u.name.toLowerCase()) || u.name.toLowerCase().includes(e.toLowerCase()))
    );

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.id, title: item.title })}
        activeOpacity={0.8}
      >
        {usesExpiring && (
          <View style={styles.urgentBanner}>
            <Text style={styles.urgentText}>⚡ Uses expiring ingredients</Text>
          </View>
        )}
        <Image source={{ uri: item.image }} style={styles.cardImage} />
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
          <View style={styles.cardMeta}>
            <View style={styles.matchPill}>
              <Text style={styles.matchText}>{item.usedIngredientCount} ingredients matched</Text>
            </View>
            {item.missedIngredientCount > 0 && (
              <Text style={styles.missedText}>+{item.missedIngredientCount} to buy</Text>
            )}
          </View>
          <View style={styles.matchBar}>
            <View style={[styles.matchFill, { width: `${matchPct}%` as any }]} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>What can I cook?</Text>
        <Text style={styles.headerSub}>
          {pantryNames.length > 0
            ? `Based on your ${pantryNames.length} pantry items`
            : 'Add items to your pantry first'}
        </Text>
        {expiringNames.length > 0 && (
          <View style={styles.expiringNote}>
            <Text style={styles.expiringNoteText}>
              ⚡ {expiringNames.length} ingredient{expiringNames.length !== 1 ? 's' : ''} expiring soon — use them up!
            </Text>
          </View>
        )}
      </View>

      {(!searched || recipes.length === 0) && !loading && (
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
          <Text style={styles.searchBtnText}>🍳  Find Recipes</Text>
        </TouchableOpacity>
      )}

      {loading && (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={COLORS.cta} />
          <Text style={styles.loadingText}>Finding recipes for you…</Text>
        </View>
      )}

      {!loading && recipes.length > 0 && (
        <>
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsTitle}>{recipes.length} recipes found</Text>
            <TouchableOpacity onPress={handleSearch}>
              <Text style={styles.refreshBtn}>Refresh</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={recipes}
            keyExtractor={(r) => String(r.id)}
            renderItem={renderRecipe}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}

      {!loading && searched && recipes.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🍽</Text>
          <Text style={styles.emptyTitle}>No recipes found</Text>
          <Text style={styles.emptySubtitle}>Try adding more items to your pantry</Text>
          <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
            <Text style={styles.searchBtnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  header: {
    backgroundColor: COLORS.surface, padding: 20,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerTitle: { ...TYPOGRAPHY.h1, color: COLORS.text, marginBottom: 4 },
  headerSub: { ...TYPOGRAPHY.body, color: COLORS.gray },
  expiringNote: {
    marginTop: 10, backgroundColor: COLORS.warningPale,
    borderRadius: RADIUS.sm, padding: 10, borderLeftWidth: 3, borderLeftColor: COLORS.warning,
  },
  expiringNoteText: { ...TYPOGRAPHY.caption, color: COLORS.warning, fontWeight: '600' },

  searchBtn: {
    margin: 20, backgroundColor: COLORS.cta, borderRadius: 999,
    paddingVertical: 16, alignItems: 'center',
    shadowColor: COLORS.cta, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
  },
  searchBtnText: { fontSize: 17, fontWeight: '700', color: '#fff' },

  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 14 },
  loadingText: { ...TYPOGRAPHY.body, color: COLORS.gray },

  resultsHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  resultsTitle: { ...TYPOGRAPHY.label, color: COLORS.gray, textTransform: 'uppercase' },
  refreshBtn: { ...TYPOGRAPHY.body, color: COLORS.cta, fontWeight: '600' },

  list: { paddingHorizontal: 16, paddingBottom: 100, gap: 14 },

  card: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
    overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm,
  },
  urgentBanner: {
    backgroundColor: COLORS.warningPale, paddingHorizontal: 14, paddingVertical: 6,
    borderBottomWidth: 1, borderBottomColor: COLORS.warning,
  },
  urgentText: { fontSize: 12, fontWeight: '600', color: COLORS.warning },
  cardImage: { width: '100%', height: 180, backgroundColor: COLORS.border },
  cardBody: { padding: 14 },
  cardTitle: { ...TYPOGRAPHY.h3, color: COLORS.text, marginBottom: 10, lineHeight: 22 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  matchPill: {
    backgroundColor: COLORS.primaryPale, paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: RADIUS.xl,
  },
  matchText: { fontSize: 12, fontWeight: '600', color: COLORS.primary },
  missedText: { fontSize: 12, color: COLORS.gray },
  matchBar: {
    height: 4, backgroundColor: COLORS.border, borderRadius: 2, overflow: 'hidden',
  },
  matchFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 2 },

  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10, padding: 32 },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { ...TYPOGRAPHY.h2, color: COLORS.darkGray },
  emptySubtitle: { ...TYPOGRAPHY.body, color: COLORS.gray, textAlign: 'center' },
});
