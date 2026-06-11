export const COLORS = {
  // Backgrounds
  background: '#FAF7F2',
  surface: '#FFFFFF',
  surfaceWarm: '#F5F0E8',

  // Brand — Sage & Honey
  primary: '#8FA88D',
  primaryLight: '#ADBFAB',
  primaryPale: '#E4EDE3',
  primaryDark: '#6B8A69',

  // Status
  danger: '#C85C3A',
  dangerPale: '#FDEEE9',
  warning: '#C8883A',
  warningPale: '#FBF0E3',
  safe: '#7A9E78',
  safePale: '#E4EDE3',

  // Text — Warm Earthy Brown
  text: '#4A3B32',
  textSecondary: '#7A6558',
  gray: '#9A8E84',
  lightGray: '#BEB5AC',

  // Structure
  border: '#E5DDD5',
  divider: '#F0E9E2',

  // Honey/Terracotta — warm CTA
  cta: '#C07050',
  ctaPale: '#F5EBE4',

  // Legacy aliases for compatibility
  white: '#FFFFFF',
  offWhite: '#FAF7F2',
  darkGray: '#4A3B32',
  accent: '#C07050',
  shadow: 'rgba(74,59,50,0.10)',
};

export const RADIUS = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#7B5C3A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: '#7B5C3A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
};

export const TYPOGRAPHY = {
  h1: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 26, letterSpacing: -0.5 },
  h2: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 20, letterSpacing: -0.3 },
  h3: { fontFamily: 'Inter_600SemiBold', fontSize: 16 },
  body: { fontFamily: 'Inter_400Regular', fontSize: 15 },
  label: { fontFamily: 'Inter_600SemiBold', fontSize: 12, letterSpacing: 0.5 },
  caption: { fontFamily: 'Inter_400Regular', fontSize: 12 },
};

// Legacy — kept for any remaining references
export const CATEGORY_EMOJI: Record<string, string> = {
  dairy: '🥛', meat: '🥩', seafood: '🐟', vegetables: '🥦', fruits: '🍎',
  beverages: '🧃', snacks: '🍿', condiments: '🫙', grains: '🌾', frozen: '🧊', other: '📦',
};

export const LOCATION_EMOJI: Record<string, string> = {
  fridge: '🧊', freezer: '❄️', pantry: '🏠', other: '📦',
};

// Ionicons names for categories and locations
export const CATEGORY_ICON: Record<string, string> = {
  dairy: 'water-outline',
  meat: 'nutrition-outline',
  seafood: 'fish-outline',
  vegetables: 'leaf-outline',
  fruits: 'rose-outline',
  beverages: 'cafe-outline',
  snacks: 'fast-food-outline',
  condiments: 'flask-outline',
  grains: 'layers-outline',
  frozen: 'snow-outline',
  other: 'cube-outline',
};

export const LOCATION_ICON: Record<string, string> = {
  fridge: 'thermometer-outline',
  freezer: 'snow-outline',
  pantry: 'home-outline',
  other: 'ellipsis-horizontal-outline',
};
