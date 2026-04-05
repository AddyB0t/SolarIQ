import { View, Text, StyleSheet } from 'react-native';
import { GlassCard } from '../ui/GlassCard';
import { colors, fonts } from '../../lib/theme';

interface StatCardProps {
  value: string;
  label: string;
  color?: string;
  icon?: React.ReactNode;
}

export function StatCard({ value, label, color = colors.primary, icon }: StatCardProps) {
  const isLongValue = value.length > 5;

  return (
    <GlassCard style={styles.card} glowColor={color}>
      {icon && <View style={styles.iconWrap}>{icon}</View>}
      <Text
        style={[styles.value, { color }, isLongValue && styles.smallValue]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </Text>
      <Text style={styles.label} numberOfLines={1}>{label}</Text>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: 'center', padding: 14, minHeight: 90 },
  iconWrap: { marginBottom: 6 },
  value: { fontFamily: fonts.sora.extraBold, fontSize: 24, letterSpacing: -1 },
  smallValue: { fontSize: 18 },
  label: {
    fontFamily: fonts.sora.medium,
    fontSize: 9,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
});
