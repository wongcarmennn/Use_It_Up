import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image,
  ActivityIndicator,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';

import { getRecipeDetail, RecipeDetail } from '../services/spoonacular';
import { subscribeToItems } from '../services/firebase';
import { useAuthStore } from '../store/authStore';
import { COLORS, RADIUS, SHADOWS, TYPOGRAPHY } from '../theme';
import { RecipesStackParams } from '../navigation/AppNavigator';

type RouteProps = RouteProp<RecipesStackParams, 'RecipeDetail'>;

export default function RecipeDetailScreen() {
  const route = useRoute<RouteProps>();
  const { household } = useAuthStore();
  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [pantryNames, setPantryNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!household?.id) return;
    return subscribeToItems(household.id, (items) => {
      setPantryNames(items.map((i) => i.name.toLowerCase()));
    });
  }, [household?.id]);

  useEffect(() => {
    getRecipeDetail(route.params.recipeId)
      .then(setRecipe)
      .finally(() => setLoading(false));
  }, [route.params.recipeId]);

  const haveIngredient = (name: string) =>
    pantryNames.some((p) => p.includes(name.toLowerCase()) || name.toLowerCase().includes(p));

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.cta} />
        <Text style={styles.loadingText}>Loading recipe…</Text>
      </View>
    );
  }

  if (!recipe) return null;

  const steps = recipe.analyzedInstructions?.[0]?.steps ?? [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Image source={{ uri: recipe.image }} style={styles.heroImage} />

      <View style={styles.titleSection}>
        <Text style={styles.title}>{recipe.title}</Text>
        <View style={styles.metaRow}>
          <View style={styles.metaChip}>
            <Text style={styles.metaIcon}>⏱</Text>
            <Text style={styles.metaText}>{recipe.readyInMinutes} min</Text>
          </View>
          <View style={styles.metaChip}>
            <Text style={styles.metaIcon}>🍽</Text>
            <Text style={styles.metaText}>{recipe.servings} servings</Text>
          </View>
        </View>
      </View>

      {/* Ingredients */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ingredients</Text>
        <View style={styles.card}>
          {recipe.extendedIngredients.map((ing, i) => {
            const have = haveIngredient(ing.name);
            return (
              <View key={`${ing.id}-${i}`} style={styles.ingRow}>
                <View style={[styles.ingDot, { backgroundColor: have ? COLORS.safe : COLORS.border }]} />
                <Text style={[styles.ingText, !have && styles.ingMissing]}>
                  {ing.original}
                </Text>
                {have && <Text style={styles.ingHave}>✓ In pantry</Text>}
              </View>
            );
          })}
          <View style={styles.ingLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.ingDot, { backgroundColor: COLORS.safe }]} />
              <Text style={styles.legendText}>You have it</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.ingDot, { backgroundColor: COLORS.border }]} />
              <Text style={styles.legendText}>Need to buy</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Instructions */}
      {steps.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          <View style={styles.card}>
            {steps.map((step) => (
              <View key={step.number} style={styles.stepRow}>
                <View style={styles.stepNum}>
                  <Text style={styles.stepNumText}>{step.number}</Text>
                </View>
                <Text style={styles.stepText}>{step.step}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingBottom: 48 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 14 },
  loadingText: { ...TYPOGRAPHY.body, color: COLORS.gray },

  heroImage: { width: '100%', height: 240, backgroundColor: COLORS.border },

  titleSection: {
    backgroundColor: COLORS.surface, padding: 20,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  title: { ...TYPOGRAPHY.h1, color: COLORS.text, marginBottom: 12, lineHeight: 32 },
  metaRow: { flexDirection: 'row', gap: 10 },
  metaChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.background, paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.border,
  },
  metaIcon: { fontSize: 14 },
  metaText: { ...TYPOGRAPHY.label, color: COLORS.textSecondary },

  section: { padding: 16, paddingBottom: 0 },
  sectionTitle: { ...TYPOGRAPHY.h3, color: COLORS.text, marginBottom: 10 },
  card: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    padding: 14, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm,
  },

  ingRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: COLORS.divider,
  },
  ingDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  ingText: { flex: 1, ...TYPOGRAPHY.body, color: COLORS.text },
  ingMissing: { color: COLORS.textSecondary },
  ingHave: { fontSize: 11, fontWeight: '600', color: COLORS.safe },
  ingLegend: {
    flexDirection: 'row', gap: 16, marginTop: 12, paddingTop: 10,
    borderTopWidth: 1, borderTopColor: COLORS.divider,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendText: { ...TYPOGRAPHY.caption, color: COLORS.gray },

  stepRow: { flexDirection: 'row', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  stepNum: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.ctaPale,
    justifyContent: 'center', alignItems: 'center', flexShrink: 0, marginTop: 1,
  },
  stepNumText: { fontSize: 13, fontWeight: '700', color: COLORS.cta },
  stepText: { flex: 1, ...TYPOGRAPHY.body, color: COLORS.text, lineHeight: 22 },
});
