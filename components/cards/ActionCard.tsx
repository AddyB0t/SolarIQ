import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Zap } from 'lucide-react-native';
import { GlassCard } from '../ui/GlassCard';
import { colors, fonts } from '../../lib/theme';

interface ActionCardProps {
  title: string;
  description: string;
  onPress: () => void;
  icon?: React.ReactNode;
}

export function ActionCard({ title, description, onPress, icon }: ActionCardProps) {
  return (
    <TouchableOpacity onPress={onPress}>
      <GlassCard style={styles.card}>
        <View style={styles.iconWrap}>
          {icon || <Zap size={18} color={colors.primary} />}
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.desc}>{description}</Text>
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(79,140,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flex: 1 },
  title: { fontFamily: fonts.sora.semiBold, fontSize: 14, color: colors.textPrimary },
  desc: { fontFamily: fonts.sora.light, fontSize: 12, color: colors.textSecondary, marginTop: 2 },
});
