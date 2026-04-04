import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { colors, fonts } from '../../lib/theme';

interface ThresholdSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
  color?: string;
  onValueChange: (value: number) => void;
}

export function ThresholdSlider({ label, value, min, max, unit = 'W', color = colors.primary, onValueChange }: ThresholdSliderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, { color }]}>{Math.round(value)}{unit}</Text>
      </View>
      <Slider
        style={styles.slider}
        minimumValue={min}
        maximumValue={max}
        value={value}
        onSlidingComplete={onValueChange}
        minimumTrackTintColor={color}
        maximumTrackTintColor="rgba(255,255,255,0.06)"
        thumbTintColor={color}
      />
      <View style={styles.range}>
        <Text style={styles.rangeText}>{min}{unit}</Text>
        <Text style={styles.rangeText}>{max}{unit}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 4 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontFamily: fonts.sora.medium, fontSize: 13, color: colors.textPrimary },
  value: { fontFamily: fonts.mono.semiBold, fontSize: 14 },
  slider: { width: '100%', height: 32 },
  range: { flexDirection: 'row', justifyContent: 'space-between' },
  rangeText: { fontFamily: fonts.mono.regular, fontSize: 10, color: colors.textSecondary },
});
