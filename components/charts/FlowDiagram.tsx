import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { Sun, Battery, Home, Zap } from 'lucide-react-native';
import { useEffect } from 'react';
import { colors, fonts, borderRadius } from '../../lib/theme';
import type { EnergySource } from '../../lib/types';

interface FlowDiagramProps {
  activeSources: EnergySource[];
  solarPower: number;
  batteryLevel: number;
  homeLoad: number;
  gridPower: number;
}

interface FlowNodeProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  active: boolean;
}

function FlowNode({ icon, label, value, color, active }: FlowNodeProps) {
  const pulse = useSharedValue(1);
  useEffect(() => {
    if (active) {
      pulse.value = withRepeat(withTiming(1.08, { duration: 1500, easing: Easing.inOut(Easing.ease) }), -1, true);
    } else {
      pulse.value = 1;
    }
  }, [active]);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: active ? 1 : 0.35,
  }));
  return (
    <Animated.View style={[styles.node, animatedStyle]}>
      <View style={[styles.nodeIcon, { borderColor: active ? color : 'rgba(255,255,255,0.1)', backgroundColor: active ? `${color}12` : 'transparent' }]}>
        {icon}
      </View>
      <Text style={styles.nodeLabel}>{label}</Text>
      <Text style={[styles.nodeValue, { color }]}>{value}</Text>
    </Animated.View>
  );
}

function FlowArrow({ active }: { active: boolean }) {
  const opacity = useSharedValue(0.2);
  useEffect(() => {
    if (active) {
      opacity.value = withRepeat(withTiming(0.8, { duration: 1000, easing: Easing.inOut(Easing.ease) }), -1, true);
    } else {
      opacity.value = 0.1;
    }
  }, [active]);
  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <Animated.View style={[styles.arrow, animatedStyle]}>
      <Text style={styles.arrowText}>{'\u2192'}</Text>
    </Animated.View>
  );
}

export function FlowDiagram({ activeSources, solarPower, batteryLevel, homeLoad, gridPower }: FlowDiagramProps) {
  const hasSolar = activeSources.includes('solar');
  const hasBattery = activeSources.includes('battery');
  const hasGrid = activeSources.includes('grid');

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <FlowNode icon={<Sun size={24} color={colors.primary} />} label="Solar" value={`${(solarPower / 1000).toFixed(2)} kW`} color={colors.primary} active={hasSolar} />
        <FlowArrow active={hasSolar && hasBattery} />
        <FlowNode icon={<Battery size={24} color={colors.success} />} label="Battery" value={`${batteryLevel}%`} color={colors.success} active={hasBattery} />
        <FlowArrow active={true} />
        <FlowNode icon={<Home size={24} color={colors.warning} />} label="Home" value={`${(homeLoad / 1000).toFixed(2)} kW`} color={colors.warning} active={true} />
        <FlowArrow active={hasGrid} />
        <FlowNode icon={<Zap size={24} color={colors.danger} />} label="Grid" value={`${(gridPower / 1000).toFixed(2)} kW`} color={colors.danger} active={hasGrid} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 12 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 2 },
  node: { alignItems: 'center', gap: 6, width: 68 },
  nodeIcon: { width: 52, height: 52, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  nodeLabel: { fontFamily: fonts.sora.medium, fontSize: 9, color: colors.textSecondary, letterSpacing: 2, textTransform: 'uppercase' },
  nodeValue: { fontFamily: fonts.sora.bold, fontSize: 12 },
  arrow: { marginBottom: 36 },
  arrowText: { fontSize: 18, color: colors.primary },
});
