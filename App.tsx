import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import {
  useFonts,
  PlayfairDisplay_700Bold,
  PlayfairDisplay_400Regular,
} from '@expo-google-fonts/playfair-display';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

import AppNavigator from './src/navigation/AppNavigator';
import { useAuthStore } from './src/store/authStore';
import {
  getUserProfile,
  getHousehold,
  configureGoogleSignIn,
  onAuthChange,
} from './src/services/firebase';
import { requestNotificationPermissions } from './src/services/notifications';
import { COLORS } from './src/theme';

export default function App() {
  const { setUser, setHousehold, setLoading, isLoading } = useAuthStore();

  const [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
    PlayfairDisplay_400Regular,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    configureGoogleSignIn();
    requestNotificationPermissions();

    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        const profile = await getUserProfile(firebaseUser.uid);
        setUser(profile);
        if (profile?.householdId) {
          const household = await getHousehold(profile.householdId);
          setHousehold(household);
        }
      } else {
        setUser(null);
        setHousehold(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (isLoading || !fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return <AppNavigator />;
}
