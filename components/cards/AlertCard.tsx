import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AlertTriangle, XCircle, CheckCircle } from 'lucide-react-native';
import { colors, fonts, borderRadius } from '../../lib/theme';
import type { Alert } from '../../lib/types';

interface AlertCardProps {
  alert: Alert;
  onAcknowledge: (id: string) => void;
}

const alertStyles = {
  warning: { color: colors.warning, border: 'rgba(251,146,60,0.2)', bg: 'rgba(251,146,60,0.04)', Icon: AlertTriangle },
  critical: { color: colors.danger, border: 'rgba(236,72,153,0.2)', bg: 'rgba(236,72,153,0.04)', Icon: XCircle },
  info: { color: colors.success, border: 'rgba(52,211,153,0.2)', bg: 'rgba(52,211,153,0.04)', Icon: CheckCircle },
};

export function AlertCard({ alert, onAcknowledge }: AlertCardProps) {
  const variant = alertStyles[alert.type];
  const Icon = variant.Icon;
  const timeAgo = getTimeAgo(alert.created_at);

  return (
    <TouchableOpacity
      onPress={() => onAcknowledge(alert.id)}
      style={[styles.card, { borderColor: variant.border, backgroundColor: variant.bg }]}
    >
      <Icon size={16} color={variant.color} />
      <Text style={[styles.text, { color: variant.color }]}>{alert.message}</Text>
      <Text style={styles.time}>{timeAgo}</Text>
    </TouchableOpacity>
  );
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ago`;
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: 8,
  },
  text: { flex: 1, fontFamily: fonts.sora.regular, fontSize: 13 },
  time: { fontFamily: fonts.mono.regular, fontSize: 10, color: colors.textSecondary },
});
