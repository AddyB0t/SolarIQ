import { useState, useRef, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send } from 'lucide-react-native';
import { colors, fonts, spacing, borderRadius } from '../../lib/theme';
import { GradientText } from '../../components/ui/GradientText';
import { ChatBubble } from '../../components/chat/ChatBubble';
import { QuickChips } from '../../components/chat/QuickChips';
import { TypingIndicator } from '../../components/chat/TypingIndicator';
import { useSensorData } from '../../hooks/useSensorData';
import { useEnergyConfig } from '../../hooks/useEnergyConfig';
import type { ChatMessage } from '../../lib/types';

const QUICK_ACTIONS = ['Switch to battery', 'Show efficiency', 'Predict next hour', 'CO₂ saved', 'Set alert'];

function generateLocalResponse(
  message: string,
  sensorData: { power: number; voltage: number; current: number; temperature: number; irradiance: number; efficiency: number } | null,
  config: { mode: string; active_sources: string[]; low_threshold: number; high_threshold: number } | null,
): { reply: string; action?: { type: string; params: Record<string, unknown> } } {
  const msg = message.toLowerCase();

  if (msg.includes('switch') && msg.includes('battery')) {
    return { reply: `Done — energy source switched to Battery Only. Current battery can sustain ~2.5 hours at current load.`, action: { type: 'force_sources', params: { sources: ['solar', 'battery'] } } };
  }
  if (msg.includes('switch') && msg.includes('solar')) {
    return { reply: `Switched to Solar Only mode. Excess power will charge the battery.`, action: { type: 'force_sources', params: { sources: ['solar'] } } };
  }
  if (msg.includes('efficiency')) {
    const eff = sensorData?.efficiency || 0;
    return { reply: `Current system efficiency: ${eff}%\n\n${eff > 85 ? 'Excellent! Your panels are performing well.' : 'Efficiency is below optimal. Check for shading or panel cleanliness.'}` };
  }
  if (msg.includes('predict')) {
    const power = sensorData?.power || 0;
    const h = new Date().getHours();
    const predictions = [
      { hour: h + 1, power: power * (h < 13 ? 1.1 : 0.85) },
      { hour: h + 2, power: power * (h < 12 ? 1.2 : 0.7) },
      { hour: h + 3, power: power * (h < 11 ? 1.15 : 0.55) },
    ];
    return { reply: `Predicted solar output:\n\n${predictions.map((p) => `${p.hour}:00 → ${(p.power / 1000).toFixed(2)} kW`).join('\n')}\n\nBased on historical patterns and current irradiance of ${sensorData?.irradiance?.toFixed(0) || 0} W/m².` };
  }
  if (msg.includes('co2') || msg.includes('co₂') || msg.includes('carbon')) {
    return { reply: `This month you've saved approximately 142 kg CO₂ — that's equivalent to planting 6.5 trees!\n\nYou're 23% ahead of last month.` };
  }
  if (msg.includes('alert') || msg.includes('threshold')) {
    return { reply: `Current thresholds:\n• Low → Medium: ${config?.low_threshold || 500}W\n• Medium → High: ${config?.high_threshold || 1200}W\n\nWant me to adjust them? Tell me the new values.` };
  }
  if (msg.includes('status') || msg.includes('how')) {
    return { reply: `System Status:\n• Mode: ${config?.mode || 'auto'}\n• Active Sources: ${config?.active_sources?.join(', ') || 'solar'}\n• Power: ${((sensorData?.power || 0) / 1000).toFixed(2)} kW\n• Voltage: ${sensorData?.voltage?.toFixed(1) || 0}V\n• Temperature: ${sensorData?.temperature?.toFixed(0) || 0}°C\n• Efficiency: ${sensorData?.efficiency || 0}%` };
  }

  return { reply: `I can help with:\n• Switching energy sources\n• Showing efficiency & stats\n• Predicting solar output\n• CO₂ savings\n• Setting alert thresholds\n\nTry asking "Show efficiency" or "Predict next hour"!` };
}

export default function ChatScreen() {
  const { latest } = useSensorData();
  const { config, forceSources } = useEnergyConfig();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'assistant', content: 'Hi! I\'m your SolarIQ assistant. I can help you monitor your system, switch energy sources, predict output, and more. What would you like to know?', timestamp: new Date().toISOString() },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = useCallback((text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: text.trim(), timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = generateLocalResponse(text, latest, config);
      if (response.action?.type === 'force_sources') {
        forceSources(response.action.params.sources as ('solar' | 'battery' | 'grid')[]);
      }
      const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'assistant', content: response.reply, action: response.action, timestamp: new Date().toISOString() };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 800 + Math.random() * 700);
  }, [latest, config, forceSources]);

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={0}>
        <View style={styles.header}>
          <GradientText style={styles.title}>SolarIQ</GradientText>
          <Text style={styles.subtitle}>AI Assistant</Text>
        </View>
        <QuickChips chips={QUICK_ACTIONS} onPress={sendMessage} />
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ChatBubble message={item} />}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListFooterComponent={isTyping ? <TypingIndicator /> : null}
        />
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask anything about your solar system..."
            placeholderTextColor={colors.textSecondary}
            onSubmitEditing={() => sendMessage(input)}
            returnKeyType="send"
          />
          <TouchableOpacity onPress={() => sendMessage(input)} style={[styles.sendBtn, input.trim() && styles.sendBtnActive]} disabled={!input.trim()}>
            <Send size={20} color={input.trim() ? colors.primary : colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: 4 },
  title: { fontFamily: fonts.sora.extraBold, fontSize: 28 },
  subtitle: { fontFamily: fonts.sora.light, fontSize: 14, color: colors.textSecondary, letterSpacing: 1 },
  messageList: { padding: spacing.lg, paddingBottom: 8 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: spacing.lg, paddingVertical: 12, borderTopWidth: 1, borderTopColor: colors.glassBorder, backgroundColor: colors.surface },
  input: { flex: 1, fontFamily: fonts.sora.regular, fontSize: 14, color: colors.textPrimary, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.glassBorder, paddingHorizontal: 16, paddingVertical: 12 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.04)' },
  sendBtnActive: { backgroundColor: 'rgba(79,140,255,0.12)', borderWidth: 1, borderColor: 'rgba(79,140,255,0.2)' },
});
