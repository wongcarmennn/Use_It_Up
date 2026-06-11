import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import PantryScreen from '../screens/PantryScreen';
import AddItemScreen from '../screens/AddItemScreen';
import ScannerScreen from '../screens/ScannerScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ItemDetailScreen from '../screens/ItemDetailScreen';
import AuthScreen from '../screens/AuthScreen';
import HouseholdSetupScreen from '../screens/HouseholdSetupScreen';
import OnboardingScreen, { ONBOARDING_KEY } from '../screens/OnboardingScreen';
import RecipesScreen from '../screens/RecipesScreen';
import RecipeDetailScreen from '../screens/RecipeDetailScreen';

import { useAuthStore } from '../store/authStore';
import { COLORS } from '../theme';

export type PantryStackParams = {
  PantryHome: undefined;
  ItemDetail: { itemId: string };
  AddItem: { barcode?: string; productName?: string };
  Scanner: undefined;
};

export type RecipesStackParams = {
  RecipesHome: undefined;
  RecipeDetail: { recipeId: number; title: string };
};

export type RootTabParams = {
  PantryTab: undefined;
  RecipesTab: undefined;
  SettingsTab: undefined;
};

const Tab = createBottomTabNavigator<RootTabParams>();
const PantryStack = createNativeStackNavigator<PantryStackParams>();
const RecipesStack = createNativeStackNavigator<RecipesStackParams>();
const AuthStack = createNativeStackNavigator();

function PantryStackNavigator() {
  return (
    <PantryStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700', fontSize: 17 },
        headerShadowVisible: false,
      }}
    >
      <PantryStack.Screen name="PantryHome" component={PantryScreen} options={{ title: 'Habis First' }} />
      <PantryStack.Screen name="ItemDetail" component={ItemDetailScreen} options={{ title: 'Item Details' }} />
      <PantryStack.Screen name="AddItem" component={AddItemScreen} options={{ title: 'Add Item' }} />
      <PantryStack.Screen name="Scanner" component={ScannerScreen} options={{ headerShown: false }} />
    </PantryStack.Navigator>
  );
}

function RecipesStackNavigator() {
  return (
    <RecipesStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700', fontSize: 17 },
        headerShadowVisible: false,
      }}
    >
      <RecipesStack.Screen name="RecipesHome" component={RecipesScreen} options={{ title: 'Recipes' }} />
      <RecipesStack.Screen name="RecipeDetail" component={RecipeDetailScreen}
        options={({ route }) => ({ title: route.params.title })} />
    </RecipesStack.Navigator>
  );
}

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Auth" component={AuthScreen} />
      <AuthStack.Screen name="HouseholdSetup" component={HouseholdSetupScreen} />
    </AuthStack.Navigator>
  );
}

export default function AppNavigator() {
  const { user, household } = useAuthStore();
  const [onboarded, setOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then((val) => setOnboarded(val === 'true'));
  }, []);

  if (onboarded === null) return null;

  return (
    <NavigationContainer>
      {!onboarded ? (
        <OnboardingScreen onDone={() => setOnboarded(true)} />
      ) : !user ? (
        <AuthNavigator />
      ) : !household ? (
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
          <AuthStack.Screen name="HouseholdSetup" component={HouseholdSetupScreen} />
        </AuthStack.Navigator>
      ) : (
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: COLORS.primary,
            tabBarInactiveTintColor: COLORS.lightGray,
            tabBarStyle: {
              backgroundColor: COLORS.surface,
              borderTopColor: COLORS.border,
              borderTopWidth: 1,
              paddingBottom: 8,
              paddingTop: 6,
              height: 62,
            },
            tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
          }}
        >
          <Tab.Screen
            name="PantryTab"
            component={PantryStackNavigator}
            options={{
              tabBarLabel: 'Pantry',
              tabBarIcon: ({ color, size }) => <Ionicons name="basket-outline" color={color} size={size} />,
            }}
          />
          <Tab.Screen
            name="RecipesTab"
            component={RecipesStackNavigator}
            options={{
              tabBarLabel: 'Recipes',
              tabBarIcon: ({ color, size }) => <Ionicons name="restaurant-outline" color={color} size={size} />,
            }}
          />
          <Tab.Screen
            name="SettingsTab"
            component={SettingsScreen}
            options={{
              tabBarLabel: 'Settings',
              tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" color={color} size={size} />,
              headerShown: true,
              headerTitle: 'Settings',
              headerStyle: { backgroundColor: COLORS.primary },
              headerTintColor: '#fff',
              headerTitleStyle: { fontWeight: '700', fontSize: 17 },
              headerShadowVisible: false,
            }}
          />
        </Tab.Navigator>
      )}
    </NavigationContainer>
  );
}
