import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, TextStyle, type ColorValue } from 'react-native';
import { colors as themeColors } from '../../lib/theme';

type GradientColors = readonly [ColorValue, ColorValue, ...ColorValue[]];

interface GradientTextProps {
  children: string;
  style?: TextStyle;
  colors?: GradientColors;
}

export function GradientText({
  children,
  style,
  colors: gradColors = [themeColors.gradientStart, themeColors.gradientEnd],
}: GradientTextProps) {
  return (
    <MaskedView maskElement={<Text style={[style, { backgroundColor: 'transparent' }]}>{children}</Text>}>
      <LinearGradient colors={gradColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <Text style={[style, { opacity: 0 }]}>{children}</Text>
      </LinearGradient>
    </MaskedView>
  );
}
