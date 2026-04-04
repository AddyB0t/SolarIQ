import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withTiming, Easing } from 'react-native-reanimated';
import { useEffect } from 'react';
import { colors, fonts } from '../../lib/theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface GaugeChartProps {
  value: number;
  label: string;
  color?: string;
  size?: number;
}

export function GaugeChart({ value, label, color = colors.success, size = 160 }: GaugeChartProps) {
  const halfW = size / 2;
  const halfH = size / 2.2;
  const strokeWidth = 14;
  const r = halfW - strokeWidth;
  const trackD = `M ${strokeWidth} ${halfH} A ${r} ${r} 0 0 1 ${size - strokeWidth} ${halfH}`;
  const totalArcLength = Math.PI * r;
  const fillLength = (value / 100) * totalArcLength;

  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(1, { duration: 2000, easing: Easing.out(Easing.cubic) });
  }, [value]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDasharray: `${fillLength * progress.value} ${totalArcLength}`,
  }));

  return (
    <View style={[styles.wrap, { width: size }]}>
      <Svg width={size} height={halfH + strokeWidth}>
        <Path d={trackD} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={strokeWidth} strokeLinecap="round" />
        <AnimatedPath d={trackD} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" animatedProps={animatedProps} />
      </Svg>
      <Text style={[styles.value, { color }]}>{value}%</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 4 },
  value: { fontFamily: fonts.sora.extraBold, fontSize: 26, marginTop: -4 },
  label: { fontFamily: fonts.sora.medium, fontSize: 10, color: colors.textSecondary, letterSpacing: 3, textTransform: 'uppercase' },
});
