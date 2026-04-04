import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, fonts } from '../../lib/theme';

interface QuickChipsProps {
  chips: string[];
  onPress: (chip: string) => void;
}

export function QuickChips({ chips, onPress }: QuickChipsProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {chips.map((chip) => (
        <TouchableOpacity key={chip} onPress={() => onPress(chip)} style={styles.chip}>
          <Text style={styles.chipText}>{chip}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: 16, gap: 8, paddingVertical: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(79,140,255,0.15)', backgroundColor: 'rgba(79,140,255,0.06)' },
  chipText: { fontFamily: fonts.sora.medium, fontSize: 12, color: colors.primary },
});
