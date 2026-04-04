export const colors = {
  background: '#070B14',
  surface: '#0E1423',
  card: 'rgba(14,20,35,0.85)',
  glassBorder: 'rgba(79,140,255,0.1)',
  glassBorderActive: 'rgba(79,140,255,0.25)',
  primary: '#4F8CFF',
  secondary: '#A855F7',
  success: '#34D399',
  danger: '#EC4899',
  warning: '#FB923C',
  textPrimary: '#EDF0F7',
  textSecondary: '#4F5B73',
  gradientStart: '#4F8CFF',
  gradientEnd: '#A855F7',
} as const;

export const spacing = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48,
} as const;

export const borderRadius = {
  sm: 12, md: 16, lg: 20, xl: 24, full: 9999,
} as const;

export const fonts = {
  sora: {
    light: 'Sora_300Light',
    regular: 'Sora_400Regular',
    medium: 'Sora_500Medium',
    semiBold: 'Sora_600SemiBold',
    bold: 'Sora_700Bold',
    extraBold: 'Sora_800ExtraBold',
  },
  mono: {
    regular: 'JetBrainsMono_400Regular',
    medium: 'JetBrainsMono_500Medium',
    semiBold: 'JetBrainsMono_600SemiBold',
  },
} as const;

export const shadows = {
  glow: (color: string, intensity: number = 0.3) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: intensity,
    shadowRadius: 12,
    elevation: 8,
  }),
} as const;
