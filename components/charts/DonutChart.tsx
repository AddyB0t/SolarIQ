import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withTiming, Easing } from 'react-native-reanimated';
import { useEffect } from 'react';
import { colors, fonts } from '../../lib/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface DonutSegment {
  value: number;
  color: string;
  label: string;
}

interface DonutChartProps {
  segments: DonutSegment[];
  centerValue: string;
  centerLabel: string;
  size?: number;
}

export function DonutChart({ segments, centerValue, centerLabel, size = 200 }: DonutChartProps) {
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const total = segments.reduce((s, seg) => s + seg.value, 0);
  let cumulativeOffset = 0;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Defs>
          <SvgGradient id="aurora" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={colors.gradientStart} />
            <Stop offset="100%" stopColor={colors.gradientEnd} />
          </SvgGradient>
        </Defs>
        <Circle cx={center} cy={center} r={radius} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth={strokeWidth} />
        {segments.map((seg, i) => {
          const segLength = (seg.value / total) * circumference;
          const offset = cumulativeOffset;
          cumulativeOffset += segLength;
          return (
            <AnimatedSegment key={i} cx={center} cy={center} r={radius} strokeWidth={strokeWidth} color={seg.color} segLength={segLength} dashOffset={-offset} circumference={circumference} />
          );
        })}
      </Svg>
      <View style={styles.center}>
        <Text style={styles.centerValue}>{centerValue}</Text>
        <Text style={styles.centerLabel}>{centerLabel}</Text>
      </View>
    </View>
  );
}

function AnimatedSegment({ cx, cy, r, strokeWidth, color, segLength, dashOffset, circumference }: { cx: number; cy: number; r: number; strokeWidth: number; color: string; segLength: number; dashOffset: number; circumference: number; }) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(1, { duration: 1500, easing: Easing.out(Easing.cubic) });
  }, []);
  const animatedProps = useAnimatedProps(() => ({
    strokeDasharray: `${segLength * progress.value} ${circumference}`,
  }));
  return (
    <AnimatedCircle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeDashoffset={dashOffset} animatedProps={animatedProps} />
  );
}

const styles = StyleSheet.create({
  container: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  center: { position: 'absolute', alignItems: 'center' },
  centerValue: { fontFamily: fonts.sora.extraBold, fontSize: 32, color: colors.textPrimary, letterSpacing: -1 },
  centerLabel: { fontFamily: fonts.sora.medium, fontSize: 10, color: colors.textSecondary, letterSpacing: 3, textTransform: 'uppercase', marginTop: 2 },
});
