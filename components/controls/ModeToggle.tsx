import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { colors, fonts, borderRadius } from '../../lib/theme';

interface ModeToggleProps {
  mode: 'auto' | 'manual';
  onToggle: (mode: 'auto' | 'manual') => void;
}

export function ModeToggle({ mode, onToggle }: ModeToggleProps) {
  const { width: screenWidth } = useWindowDimensions();
  const trackWidth = screenWidth - 88; // account for card padding + screen padding
  const halfWidth = trackWidth / 2;

  const translateX = useSharedValue(mode === 'auto' ? 0 : halfWidth);

  const handlePress = (newMode: 'auto' | 'manual') => {
    translateX.value = withTiming(newMode === 'auto' ? 0 : halfWidth, { duration: 250 });
    onToggle(newMode);
  };

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    width: halfWidth,
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Energy Mode</Text>
      <View style={styles.track}>
        <Animated.View style={[styles.indicator, indicatorStyle]} />
        <TouchableOpacity style={styles.option} onPress={() => handlePress('auto')}>
          <Text style={[styles.optionText, mode === 'auto' && styles.activeText]}>Auto</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option} onPress={() => handlePress('manual')}>
          <Text style={[styles.optionText, mode === 'manual' && styles.activeText]}>Manual</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  label: { fontFamily: fonts.sora.medium, fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: colors.textSecondary },
  track: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    overflow: 'hidden',
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    height: '100%',
    backgroundColor: 'rgba(79,140,255,0.12)',
    borderRadius: borderRadius.md - 1,
    borderWidth: 1,
    borderColor: 'rgba(79,140,255,0.2)',
  },
  option: { flex: 1, paddingVertical: 12, alignItems: 'center', zIndex: 1 },
  optionText: { fontFamily: fonts.sora.medium, fontSize: 14, color: colors.textSecondary },
  activeText: { color: colors.primary },
});
