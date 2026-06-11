import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator, Alert, Image, TouchableOpacity,
} from 'react-native';
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
      {/* App name + tagline */}
      <View style={styles.header}>
        <Text style={styles.appName}>Habis First</Text>
        <Text style={styles.tagline}>One pantry. The whole family.</Text>
      </View>

      {/* Hero illustration */}
      <View style={styles.imageContainer}>
        <Image
          source={require('../../assets/hero-illustration.png')}
          style={styles.heroImage}
          resizeMode="contain"
        />
      </View>

      {/* Sign in */}
      <View style={styles.footer}>
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ height: 56 }} />
        ) : (
          <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleSignIn} activeOpacity={0.85}>
            <View style={styles.googleLogo}>
              <Text style={styles.googleG}>G</Text>
            </View>
            <Text style={styles.googleBtnText}>Sign in with Google</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.legal}>
          By signing in you agree to use Habis First only for household pantry tracking.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 28,
    paddingTop: 72,
    paddingBottom: 48,
    justifyContent: 'space-between',
  },

  header: { alignItems: 'center', gap: 8 },
  appName: {
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 42, color: COLORS.primary,
    letterSpacing: -1,
  },
  tagline: {
    fontFamily: 'Inter_400Regular', fontSize: 17, color: COLORS.textSecondary,
    textAlign: 'center', lineHeight: 26,
  },

  imageContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    paddingVertical: 16,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },

  footer: { alignItems: 'center', gap: 12 },

  googleBtn: {
    flexDirection: 'row', alignItems: 'center',
    width: '100%', paddingVertical: 15, paddingHorizontal: 20,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1.5, borderColor: COLORS.border,
    ...SHADOWS.sm,
    gap: 12,
  },
  googleLogo: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: COLORS.background,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  googleG: {
    fontFamily: 'Inter_700Bold', fontSize: 15, color: '#4285F4',
  },
  googleBtnText: {
    fontFamily: 'Inter_600SemiBold', fontSize: 16, color: COLORS.text,
    flex: 1, textAlign: 'center', marginRight: 28,
  },

  legal: {
    ...TYPOGRAPHY.caption, color: COLORS.lightGray,
    textAlign: 'center', lineHeight: 18,
  },
});
