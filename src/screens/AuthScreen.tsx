import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { GoogleSigninButton } from '@react-native-google-signin/google-signin';
import { signInWithGoogle } from '../services/firebase';
import { COLORS, RADIUS, SHADOWS, TYPOGRAPHY } from '../theme';

export default function AuthScreen() {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      if (error.code !== 'SIGN_IN_CANCELLED') {
        Alert.alert('Sign in failed', 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.heroEmoji}>🥦</Text>
        <Text style={styles.appName}>UseItUp</Text>
        <Text style={styles.tagline}>One pantry.{'\n'}The whole family.</Text>
      </View>

      <View style={styles.features}>
        {[
          { emoji: '📷', label: 'Scan & add', text: 'Add items instantly with a barcode scan' },
          { emoji: '🔔', label: 'Smart alerts', text: 'Get notified before food expires' },
          { emoji: '👨‍👩‍👧', label: 'Family sharing', text: 'One pantry for your whole household' },
        ].map((f) => (
          <View key={f.label} style={styles.featureCard}>
            <Text style={styles.featureEmoji}>{f.emoji}</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureLabel}>{f.label}</Text>
              <Text style={styles.featureDesc}>{f.text}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ height: 52 }} />
        ) : (
          <GoogleSigninButton
            style={styles.googleBtn}
            size={GoogleSigninButton.Size.Wide}
            color={GoogleSigninButton.Color.Dark}
            onPress={handleGoogleSignIn}
          />
        )}
        <Text style={styles.legal}>
          By signing in you agree to use UseItUp only for household pantry tracking. 🧺
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: COLORS.background,
    paddingHorizontal: 28, justifyContent: 'space-between',
    paddingTop: 80, paddingBottom: 48,
  },
  hero: { alignItems: 'center', gap: 10 },
  heroEmoji: { fontSize: 80 },
  appName: { fontSize: 40, fontWeight: '800', color: COLORS.primary, letterSpacing: -1.5 },
  tagline: { fontSize: 19, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 28, fontWeight: '500' },

  features: { gap: 12 },
  featureCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    padding: 16, borderWidth: 1, borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  featureEmoji: { fontSize: 28, width: 38, textAlign: 'center' },
  featureText: { flex: 1 },
  featureLabel: { ...TYPOGRAPHY.h3, color: COLORS.text },
  featureDesc: { ...TYPOGRAPHY.caption, color: COLORS.gray, marginTop: 2, lineHeight: 17 },

  footer: { alignItems: 'center', gap: 14 },
  googleBtn: { width: 240, height: 52 },
  legal: { ...TYPOGRAPHY.caption, color: COLORS.lightGray, textAlign: 'center', lineHeight: 18 },
});
