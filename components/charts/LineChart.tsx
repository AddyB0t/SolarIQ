import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop, Text as SvgText } from 'react-native-svg';
import { colors, spacing } from '../../lib/theme';

interface LineChartProps {
  data: number[];
  labels?: string[];
  color?: string;
  height?: number;
  showArea?: boolean;
}

export function LineChart({ data, labels = [], color = colors.primary, height = 130, showArea = true }: LineChartProps) {
  const { width: screenWidth } = useWindowDimensions();
  // Card padding (20*2) + screen padding (24*2) + border (2)
  const width = screenWidth - spacing.lg * 2 - 42;

  if (data.length < 2) return null;

  const padding = { top: 10, bottom: 24, left: 8, right: 8 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const max = Math.max(...data) * 1.1 || 1;
  const min = Math.min(...data) * 0.9;
  const range = max - min || 1;

  const points = data.map((v, i) => ({
    x: padding.left + (i / (data.length - 1)) * chartW,
    y: padding.top + chartH - ((v - min) / range) * chartH,
  }));

  let linePath = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx = (prev.x + curr.x) / 2;
    linePath += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
  }

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;

  // Unique gradient ID per chart instance to avoid SVG conflicts
  const gradId = `areaGrad_${color.replace('#', '')}`;

  return (
    <View style={styles.wrap}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <SvgGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={color} stopOpacity={0.25} />
            <Stop offset="100%" stopColor={color} stopOpacity={0} />
          </SvgGradient>
        </Defs>
        {showArea && <Path d={areaPath} fill={`url(#${gradId})`} />}
        <Path d={linePath} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
        {labels.map((label, i) => {
          const x = padding.left + (i / Math.max(labels.length - 1, 1)) * chartW;
          return (
            <SvgText key={i} x={x} y={height - 4} fill={colors.textSecondary} fontSize={9} fontFamily="JetBrainsMono_400Regular" textAnchor="middle">
              {label}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', width: '100%' },
});
