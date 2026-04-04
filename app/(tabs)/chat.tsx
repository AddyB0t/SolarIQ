import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts } from '../../lib/theme';

export default function ChatScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chat</Text>
      <Text style={styles.subtitle}>AI assistant coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  title: { fontFamily: fonts.sora.extraBold, fontSize: 32, color: colors.primary },
  subtitle: { fontFamily: fonts.sora.light, fontSize: 16, color: colors.textSecondary, marginTop: 8 },
});
