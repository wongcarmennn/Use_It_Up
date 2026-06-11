import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  FlatList, Dimensions, Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, TYPOGRAPHY } from '../theme';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    key: '1',
    illustration: ['🥛', '🥩', '🥦', '🍎', '🧊'],
    title: 'Know what you have',
    subtitle: 'Add items from your fridge, freezer and pantry in seconds — or just scan the barcode.',
  },
  {
    key: '2',
    illustration: ['⚡', '🔔', '📅', '✓', '🌿'],
    title: 'Nothing goes to waste',
    subtitle: 'Get notified before food expires so you always use it in time.',
  },
  {
    key: '3',
    illustration: ['👨‍👩‍👧', '🏡', '🤝', '✨', '🧺'],
    title: 'Your family\'s pantry',
    subtitle: 'Everyone in the household sees the same pantry, updated in real time.',
  },
];

function Illustration({ emojis }: { emojis: string[] }) {
  const [center, ...corners] = emojis;
  const positions = [
    { top: 10, left: 30 },
    { top: 10, right: 30 },
    { bottom: 10, left: 30 },
    { bottom: 10, right: 30 },
  ];
  return (
    <View style={illStyles.wrapper}>
      <View style={illStyles.circle}>
        <Text style={illStyles.center}>{center}</Text>
        {corners.map((emoji, i) => (
          <Text key={i} style={[illStyles.corner, positions[i]]}>{emoji}</Text>
        ))}
      </View>
    </View>
  );
}

const illStyles = StyleSheet.create({
  wrapper: { alignItems: 'center', marginBottom: 40 },
  circle: {
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: '#F2EBE0',
    justifyContent: 'center', alignItems: 'center',
    position: 'relative',
  },
  center: { fontSize: 80 },
  corner: { position: 'absolute', fontSize: 32 },
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
        scrollEnabled={true}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setActiveIndex(index);
        }}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Illustration emojis={item.illustration} />
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
        )}
      />

      {/* Dots */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
        ))}
      </View>

      {/* CTA */}
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
    flex: 1, backgroundColor: '#FAF5EE',
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
    fontSize: 28, fontWeight: '700', color: COLORS.text,
    textAlign: 'center', letterSpacing: -0.5, marginBottom: 14,
  },
  subtitle: {
    ...TYPOGRAPHY.body, color: COLORS.textSecondary,
    textAlign: 'center', lineHeight: 24,
  },

  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 28 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.border },
  dotActive: { width: 24, backgroundColor: COLORS.cta },

  btn: {
    marginHorizontal: 24, backgroundColor: COLORS.cta,
    borderRadius: 999, paddingVertical: 17, alignItems: 'center',
    shadowColor: COLORS.cta, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  btnText: { fontSize: 17, fontWeight: '700', color: '#fff', letterSpacing: 0.2 },
});
