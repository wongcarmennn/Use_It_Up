import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert, ScrollView, Share, Platform } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { signOut, updateHouseholdSettings } from '../services/firebase';
import { COLORS, RADIUS, SHADOWS, TYPOGRAPHY } from '../theme';

export default function SettingsScreen() {
  const { household, setHousehold, user, reset } = useAuthStore();
  const settings = household?.settings;
  const [warningDays, setWarningDays] = useState(settings?.expiryWarningDays ?? 3);
  const [notificationsOn, setNotificationsOn] = useState(settings?.notificationsEnabled ?? true);

  const save = async (patch: Partial<typeof settings>) => {
    if (!household) return;
    const updated = { ...settings, ...patch } as typeof settings;
    await updateHouseholdSettings(household.id, updated!);
    setHousehold({ ...household, settings: updated! });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Household */}
      <Text style={styles.sectionTitle}>HOUSEHOLD</Text>
      <View style={styles.card}>
        <Row label="Name" value={household?.name ?? ''} />
        <View style={styles.divider} />
        <Row label="Members" value={`${household?.memberIds.length ?? 1} member${(household?.memberIds.length ?? 1) !== 1 ? 's' : ''}`} />
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Invite Code</Text>
          <Text style={styles.inviteCode}>{household?.inviteCode}</Text>
        </View>
        <TouchableOpacity style={styles.shareBtn} onPress={() =>
          Share.share({ message: `Join our UseItUp household "${household?.name}"! Invite code: ${household?.inviteCode}` })
        }>
          <Text style={styles.shareBtnText}>📤  Share Invite Link</Text>
        </TouchableOpacity>
      </View>

      {/* Notifications */}
      <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Expiry Alerts</Text>
          <Switch
            value={notificationsOn}
            onValueChange={(val) => { setNotificationsOn(val); save({ notificationsEnabled: val }); }}
            trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
            thumbColor={notificationsOn ? COLORS.primary : COLORS.lightGray}
          />
        </View>
        {notificationsOn && (
          <>
            <View style={styles.divider} />
            <Text style={styles.rowLabel}>Warn me this many days before expiry:</Text>
            <View style={styles.daysRow}>
              {[1, 2, 3, 5, 7].map((d) => (
                <TouchableOpacity key={d}
                  style={[styles.dayChip, warningDays === d && styles.dayChipActive]}
                  onPress={() => { setWarningDays(d); save({ expiryWarningDays: d }); }}>
                  <Text style={[styles.dayChipText, warningDays === d && styles.dayChipTextActive]}>{d}d</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </View>

      {/* Account */}
      <Text style={styles.sectionTitle}>ACCOUNT</Text>
      <View style={styles.card}>
        <Row label="Name" value={user?.displayName ?? ''} />
        <View style={styles.divider} />
        <Row label="Email" value={user?.email ?? ''} />
      </View>

      <TouchableOpacity style={styles.signOutBtn} onPress={() =>
        Alert.alert('Sign out?', 'You can sign back in anytime.', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign Out', style: 'destructive', onPress: async () => { await signOut(); reset(); } },
        ])
      }>
        <Text style={styles.signOutText}>Sign Out</Text>
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
  content: { padding: 20, paddingBottom: 48, gap: 6 },

  sectionTitle: {
    ...TYPOGRAPHY.label, color: COLORS.gray,
    textTransform: 'uppercase', letterSpacing: 1,
    marginTop: 16, marginBottom: 8, paddingHorizontal: 4,
  },

  card: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    padding: 16, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm,
  },
  divider: { height: 1, backgroundColor: COLORS.divider, marginVertical: 10 },

  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 3 },
  rowLabel: { ...TYPOGRAPHY.body, color: COLORS.textSecondary },
  rowValue: { ...TYPOGRAPHY.body, color: COLORS.text, fontWeight: '500', flexShrink: 1, textAlign: 'right', marginLeft: 12 },

  inviteCode: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 20, color: COLORS.primary, fontWeight: '700', letterSpacing: 4,
  },

  shareBtn: {
    marginTop: 12, backgroundColor: COLORS.primaryPale, borderRadius: RADIUS.md,
    paddingVertical: 10, alignItems: 'center',
  },
  shareBtnText: { ...TYPOGRAPHY.body, color: COLORS.primary, fontWeight: '600' },

  daysRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  dayChip: {
    flex: 1, paddingVertical: 9, borderRadius: RADIUS.xl,
    backgroundColor: COLORS.background, borderWidth: 1.5,
    borderColor: COLORS.border, alignItems: 'center',
  },
  dayChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  dayChipText: { ...TYPOGRAPHY.label, color: COLORS.textSecondary, fontSize: 13 },
  dayChipTextActive: { color: COLORS.white },

  signOutBtn: {
    marginTop: 20, borderRadius: RADIUS.md, paddingVertical: 14,
    alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.danger,
    backgroundColor: COLORS.dangerPale,
  },
  signOutText: { ...TYPOGRAPHY.body, color: COLORS.danger, fontWeight: '600' },
});
