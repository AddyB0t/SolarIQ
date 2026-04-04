import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts } from '../../lib/theme';
import type { ChatMessage } from '../../lib/types';

interface ChatBubbleProps {
  message: ChatMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user';
  return (
    <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
      <Text style={[styles.text, isUser ? styles.userText : styles.aiText]}>{message.content}</Text>
      <Text style={styles.time}>
        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: { maxWidth: '82%', padding: 14, borderRadius: 20, marginBottom: 8 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: 'rgba(79,140,255,0.12)', borderWidth: 1, borderColor: 'rgba(79,140,255,0.15)', borderBottomRightRadius: 6 },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderBottomLeftRadius: 6 },
  text: { fontFamily: fonts.sora.regular, fontSize: 14, lineHeight: 22 },
  userText: { color: colors.textPrimary },
  aiText: { color: colors.textPrimary },
  time: { fontFamily: fonts.mono.regular, fontSize: 9, color: colors.textSecondary, marginTop: 6, alignSelf: 'flex-end' },
});
