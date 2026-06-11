import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  FlatList, Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, RADIUS } from '../theme';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    key: '1',
    icon: 'basket-outline',
    iconColor: '#2D6A4F',
    bgOuter: '#D8F3DC',
    bgInner: '#B7E4C7',
    title: 'Know what you have',
    subtitle: 'Add items from your fridge, freezer and pantry in seconds — or just scan the barcode.',
  },
  {
    key: '2',
    icon: 'notifications-outline',
    iconColor: '#C07050',
    bgOuter: '#F5EBE4',
    bgInner: '#EAD5C8',
    title: 'Nothing goes to waste',
    subtitle: 'Get notified before food expires so you always use it in time.',
  },
  {
    key: '3',
    icon: 'people-outline',
    iconColor: '#2D6A4F',
    bgOuter: '#D8F3DC',
    bgInner: '#B7E4C7',
    title: "Your family's pantry",
    subtitle: 'Everyone in the household sees the same pantry, updated in real time.',
  },
];

function SlideIllustration({ icon, iconColor, bgOuter, bgInner }: {
  icon: string; iconColor: string; bgOuter: string; bgInner: string;
}) {
  return (
    <View style={illStyles.wrapper}>
      <View style={[illStyles.ringOuter, { backgroundColor: bgOuter }]}>
        <View style={[illStyles.ringInner, { backgroundColor: bgInner }]}>
          <View style={[illStyles.iconCircle, { backgroundColor: '#fff' }]}>
            <Ionicons name={icon as any} size={64} color={iconColor} />
          </View>
        </View>
      </View>
    </View>
  );
}

const illStyles = StyleSheet.create({
  wrapper: { alignItems: 'center', marginBottom: 48 },
  ringOuter: {
    width: 220, height: 220, borderRadius: 110,
    justifyContent: 'center', alignItems: 'center',
  },
  ringInner: {
    width: 170, height: 170, borderRadius: 85,
    justifyContent: 'center', alignItems: 'center',
  },
  iconCircle: {
    width: 120, height: 120, borderRadius: 60,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
});

export const ONBOARDING_KEY = '@useitup_onboarded';

export default function OnboardingScreen({ onDone }: { onDone: () => void }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    } else {
      handleDone();
    }
  };

  const handleDone = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    onDone();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.skip} onPress={handleDone}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(s) => s.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setActiveIndex(index);
        }}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <SlideIllustration
              icon={item.icon}
              iconColor={item.iconColor}
              bgOuter={item.bgOuter}
              bgInner={item.bgInner}
            />
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
        )}
      />

      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
        ))}
      </View>

      <TouchableOpacity style={styles.btn} onPress={handleNext}>
        <Text style={styles.btnText}>
          {activeIndex < SLIDES.length - 1 ? 'Next' : 'Get Started'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: COLORS.background,
    paddingBottom: 48,
  },
  skip: { alignSelf: 'flex-end', padding: 20, paddingBottom: 0 },
  skipText: { ...TYPOGRAPHY.body, color: COLORS.gray },

  slide: {
    width, paddingHorizontal: 36,
    alignItems: 'center', justifyContent: 'center',
    paddingTop: 60,
  },
  title: {
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 28, color: COLORS.text,
    textAlign: 'center', letterSpacing: -0.5, marginBottom: 14,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular', fontSize: 15, color: COLORS.textSecondary,
    textAlign: 'center', lineHeight: 24,
  },

  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 28 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.border },
  dotActive: { width: 24, backgroundColor: COLORS.cta },

  btn: {
    marginHorizontal: 24, backgroundColor: COLORS.cta,
    borderRadius: RADIUS.xl, paddingVertical: 17, alignItems: 'center',
    shadowColor: COLORS.cta, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  btnText: { fontSize: 17, fontWeight: '700', color: '#fff', letterSpacing: 0.2 },
});
