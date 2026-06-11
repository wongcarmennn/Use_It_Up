export const COLORS = {
  // Backgrounds
  background: '#FDF8F2',
  surface: '#FFFFFF',
  surfaceWarm: '#FFF6EC',

  // Brand
  primary: '#2D6A4F',
  primaryLight: '#52B788',
  primaryPale: '#D8F3DC',
  primaryDark: '#1B4332',

  // Status
  danger: '#D95F3B',
  dangerPale: '#FDEEE9',
  warning: '#E8954A',
  warningPale: '#FEF3E7',
  safe: '#40916C',
  safePale: '#D8F3DC',

  // Text
  text: '#2D2013',
  textSecondary: '#6B5744',
  gray: '#9E8E7E',
  lightGray: '#C4B8AB',

  // Structure
  border: '#EAE0D5',
  divider: '#F5EDE3',

  // Terracotta — warm CTA color
  cta: '#C07050',
  ctaPale: '#F5EBE4',

  // Legacy aliases for compatibility
  white: '#FFFFFF',
  offWhite: '#FDF8F2',
  darkGray: '#4A3828',
  accent: '#C07050',
  shadow: 'rgba(123,92,58,0.10)',
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
  h1: { fontSize: 26, fontWeight: '700' as const, letterSpacing: -0.5 },
  h2: { fontSize: 20, fontWeight: '700' as const, letterSpacing: -0.3 },
  h3: { fontSize: 16, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  label: { fontSize: 12, fontWeight: '600' as const, letterSpacing: 0.5 },
  caption: { fontSize: 12, fontWeight: '400' as const },
};

export const CATEGORY_EMOJI: Record<string, string> = {
  dairy: '🥛', meat: '🥩', seafood: '🐟', vegetables: '🥦', fruits: '🍎',
  beverages: '🧃', snacks: '🍿', condiments: '🫙', grains: '🌾', frozen: '🧊', other: '📦',
};

export const LOCATION_EMOJI: Record<string, string> = {
  fridge: '🧊', freezer: '❄️', pantry: '🏠', other: '📦',
};
