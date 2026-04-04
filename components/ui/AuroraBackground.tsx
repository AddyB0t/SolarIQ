import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { useEffect } from 'react';

const { width, height } = Dimensions.get('window');

function Blob({ color, size, x, y, delay }: { color: string; size: number; x: number; y: number; delay: number }) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateX.value = withRepeat(withTiming(30, { duration: 15000 + delay, easing: Easing.inOut(Easing.ease) }), -1, true);
    translateY.value = withRepeat(withTiming(20, { duration: 12000 + delay, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        { position: 'absolute', width: size, height: size, borderRadius: size / 2, backgroundColor: color, left: x, top: y, opacity: 0.06 },
        style,
      ]}
    />
  );
}

export function AuroraBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Blob color="#4F8CFF" size={400} x={-100} y={-150} delay={0} />
      <Blob color="#A855F7" size={350} x={width - 150} y={height - 300} delay={3000} />
      <Blob color="#EC4899" size={300} x={width / 2 - 150} y={height / 3} delay={6000} />
    </View>
  );
}
