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
  return (
    <GlassCard style={styles.card} glowColor={color}>
      {icon && <View style={styles.iconWrap}>{icon}</View>}
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: 'center', padding: 16 },
  iconWrap: { marginBottom: 8 },
  value: { fontFamily: fonts.sora.extraBold, fontSize: 28, letterSpacing: -1 },
  label: {
    fontFamily: fonts.sora.medium,
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.textSecondary,
    marginTop: 4,
  },
});
