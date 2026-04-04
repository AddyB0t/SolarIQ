import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, TextStyle } from 'react-native';
import { colors } from '../../lib/theme';

interface GradientTextProps {
  children: string;
  style?: TextStyle;
  colors?: string[];
}

export function GradientText({
  children,
  style,
  colors: gradColors = [colors.gradientStart, colors.gradientEnd],
}: GradientTextProps) {
  return (
    <MaskedView maskElement={<Text style={[style, { backgroundColor: 'transparent' }]}>{children}</Text>}>
      <LinearGradient colors={gradColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <Text style={[style, { opacity: 0 }]}>{children}</Text>
      </LinearGradient>
    </MaskedView>
  );
}
