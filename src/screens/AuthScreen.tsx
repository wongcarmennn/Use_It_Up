import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator, Alert, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
      {/* App name + tagline */}
      <View style={styles.header}>
        <Text style={styles.appName}>Habis First</Text>
        <Text style={styles.tagline}>One pantry. The whole family.</Text>
      </View>

      {/* Hero illustration — swap require path to hero-illustration.png once saved to /assets */}
      <View style={styles.imageContainer}>
        <Image
          source={require('../../assets/icon.png')}
          style={styles.heroImage}
          resizeMode="contain"
        />
      </View>

      {/* Sign in */}
      <View style={styles.footer}>
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ height: 52 }} />
        ) : (
          <GoogleSigninButton
            style={styles.googleBtn}
            size={GoogleSigninButton.Size.Wide}
            color={GoogleSigninButton.Color.Light}
            onPress={handleGoogleSignIn}
          />
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
  googleBtn: { width: '100%', height: 52 },
  legal: {
    ...TYPOGRAPHY.caption, color: COLORS.lightGray,
    textAlign: 'center', lineHeight: 18,
  },
});
