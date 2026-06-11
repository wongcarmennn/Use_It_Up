import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { createHousehold, joinHousehold, getHousehold } from '../services/firebase';
import { useAuthStore } from '../store/authStore';
import { COLORS, RADIUS, SHADOWS, TYPOGRAPHY } from '../theme';

type Mode = 'pick' | 'create' | 'join';

export default function HouseholdSetupScreen() {
  const { user, setHousehold } = useAuthStore();
  const [mode, setMode] = useState<Mode>('pick');
  const [householdName, setHouseholdName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!householdName.trim()) { Alert.alert('Name required', 'Give your household a name.'); return; }
    setLoading(true);
    try {
      const householdId = await createHousehold(householdName.trim(), user!.uid);
      const household = await getHousehold(householdId);
      setHousehold(household);
    } catch { Alert.alert('Error', 'Could not create household. Try again.'); }
    finally { setLoading(false); }
  };

  const handleJoin = async () => {
    if (inviteCode.trim().length !== 6) { Alert.alert('Invalid code', 'Invite codes are 6 characters long.'); return; }
    setLoading(true);
    try {
      const householdId = await joinHousehold(inviteCode.trim(), user!.uid);
      if (!householdId) { Alert.alert('Not found', "That invite code doesn't match any household."); return; }
      const household = await getHousehold(householdId);
      setHousehold(household);
    } catch { Alert.alert('Error', 'Could not join household. Try again.'); }
    finally { setLoading(false); }
  };

  if (mode === 'pick') {
    return (
      <View style={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>🏡</Text>
          <Text style={styles.title}>Set up your household</Text>
          <Text style={styles.subtitle}>
            Hi {user?.displayName?.split(' ')[0]}! Create a new household or join one with an invite code.
          </Text>
        </View>
        <View style={styles.options}>
          <TouchableOpacity style={styles.optionCard} onPress={() => setMode('create')} activeOpacity={0.75}>
            <Text style={styles.optionEmoji}>✨</Text>
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>Create a household</Text>
              <Text style={styles.optionDesc}>Start fresh and invite your family</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionCard} onPress={() => setMode('join')} activeOpacity={0.75}>
            <Text style={styles.optionEmoji}>🔑</Text>
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>Join a household</Text>
              <Text style={styles.optionDesc}>Enter an invite code from a family member</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (mode === 'create') {
    return (
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableOpacity style={styles.back} onPress={() => setMode('pick')}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>✨</Text>
          <Text style={styles.title}>Name your household</Text>
          <Text style={styles.subtitle}>Something your family will recognise.</Text>
        </View>
        <View style={styles.form}>
          <TextInput style={styles.input} value={householdName} onChangeText={setHouseholdName}
            placeholder="e.g. The Wong Family 🏡" placeholderTextColor={COLORS.lightGray} autoFocus
            returnKeyType="done" onSubmitEditing={handleCreate} />
          <TouchableOpacity style={[styles.btn, loading && { opacity: 0.6 }]} onPress={handleCreate} disabled={loading}>
            {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.btnText}>Create Household</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <TouchableOpacity style={styles.back} onPress={() => setMode('pick')}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
      <View style={styles.hero}>
        <Text style={styles.heroEmoji}>🔑</Text>
        <Text style={styles.title}>Enter invite code</Text>
        <Text style={styles.subtitle}>Ask a family member to share their invite code from Settings.</Text>
      </View>
      <View style={styles.form}>
        <TextInput style={[styles.input, styles.codeInput]} value={inviteCode}
          onChangeText={(t) => setInviteCode(t.toUpperCase())} placeholder="ABC123"
          placeholderTextColor={COLORS.lightGray} autoCapitalize="characters" maxLength={6}
          autoFocus returnKeyType="done" onSubmitEditing={handleJoin} />
        <TouchableOpacity style={[styles.btn, loading && { opacity: 0.6 }]} onPress={handleJoin} disabled={loading}>
          {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.btnText}>Join Household</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: COLORS.background,
    paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40,
  },
  back: { marginBottom: 28 },
  backText: { ...TYPOGRAPHY.body, color: COLORS.primary, fontWeight: '600' },

  hero: { alignItems: 'center', gap: 10, marginBottom: 40 },
  heroEmoji: { fontSize: 64 },
  title: { ...TYPOGRAPHY.h1, color: COLORS.text, textAlign: 'center' },
  subtitle: { ...TYPOGRAPHY.body, color: COLORS.gray, textAlign: 'center', lineHeight: 22 },

  options: { gap: 14 },
  optionCard: {
    flexDirection: 'row', alignItems: 'center', padding: 18,
    borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border,
    backgroundColor: COLORS.surface, gap: 14, ...SHADOWS.sm,
  },
  optionEmoji: { fontSize: 32 },
  optionText: { flex: 1 },
  optionTitle: { ...TYPOGRAPHY.h3, color: COLORS.text },
  optionDesc: { ...TYPOGRAPHY.caption, color: COLORS.gray, marginTop: 3 },
  arrow: { fontSize: 22, color: COLORS.lightGray },

  form: { gap: 14 },
  input: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    borderWidth: 1.5, borderColor: COLORS.border,
    paddingHorizontal: 16, paddingVertical: 14,
    ...TYPOGRAPHY.body, color: COLORS.text,
  },
  codeInput: {
    textAlign: 'center', fontSize: 30, fontWeight: '700',
    letterSpacing: 10, color: COLORS.primary,
  },
  btn: {
    backgroundColor: COLORS.cta, borderRadius: RADIUS.xl,
    paddingVertical: 16, alignItems: 'center', ...SHADOWS.sm,
  },
  btnText: { ...TYPOGRAPHY.h3, color: COLORS.white },
});
