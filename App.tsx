import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

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

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.primary }}>
        <ActivityIndicator size="large" color={COLORS.white} />
      </View>
    );
  }

  return <AppNavigator />;
}
