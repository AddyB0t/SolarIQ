import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, borderRadius } from '../../lib/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  glowColor?: string;
}

export function GlassCard({ children, style, glowColor }: GlassCardProps) {
  return (
    <View
      style={[
        styles.card,
        glowColor && {
          shadowColor: glowColor,
          shadowOpacity: 0.15,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 4 },
          elevation: 6,
        },
        style,
      ]}
    >
      <LinearGradient
        colors={['rgba(79,140,255,0.12)', 'rgba(168,85,247,0.06)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.topEdge}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    padding: 20,
    overflow: 'hidden',
  },
  topEdge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
  },
});
