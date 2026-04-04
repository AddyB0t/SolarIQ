import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Sun, Battery, Zap } from 'lucide-react-native';
import { colors, fonts, borderRadius } from '../../lib/theme';
import type { EnergySource } from '../../lib/types';

interface SourceButtonProps {
  source: EnergySource;
  active: boolean;
  onPress: () => void;
}

const sourceConfig = {
  solar: { icon: Sun, color: colors.primary, label: 'Solar' },
  battery: { icon: Battery, color: colors.success, label: 'Battery' },
  grid: { icon: Zap, color: colors.danger, label: 'Grid' },
};

export function SourceButton({ source, active, onPress }: SourceButtonProps) {
  const config = sourceConfig[source];
  const Icon = config.icon;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.button,
        {
          borderColor: active ? config.color : 'rgba(255,255,255,0.08)',
          backgroundColor: active ? `${config.color}15` : 'transparent',
        },
      ]}
    >
      <Icon size={18} color={active ? config.color : colors.textSecondary} />
      <Text style={[styles.label, { color: active ? config.color : colors.textSecondary }]}>
        {config.label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  label: { fontFamily: fonts.sora.medium, fontSize: 13 },
});
