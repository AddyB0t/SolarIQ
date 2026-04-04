import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrendingUp, Thermometer, Sun, Leaf, Trees } from 'lucide-react-native';
import { colors, fonts, spacing } from '../../lib/theme';
import { useSensorData } from '../../hooks/useSensorData';
import { usePredictions } from '../../hooks/usePredictions';
import { GlassCard } from '../../components/ui/GlassCard';
import { GradientText } from '../../components/ui/GradientText';
import { LineChart } from '../../components/charts/LineChart';
import { StatCard } from '../../components/cards/StatCard';
import { ActionCard } from '../../components/cards/ActionCard';

export default function MonitorScreen() {
  const { latest, history, loading } = useSensorData();
  const { predictions } = usePredictions();

  const powerData = history.map((d) => d.power);
  const voltageData = history.map((d) => d.voltage);
  const currentData = history.map((d) => d.current);

  const timeLabels = history
    .filter((_, i) => i % Math.max(1, Math.floor(history.length / 5)) === 0)
    .map((d) => {
      const t = new Date(d.timestamp);
      return `${t.getHours().toString().padStart(2, '0')}:${t.getMinutes().toString().padStart(2, '0')}`;
    });

  const predictionValues = predictions.map((p) => p.predicted_power);
  const predictionLabels = predictions.map((p) => {
    const t = new Date(p.target_hour);
    return `${t.getHours().toString().padStart(2, '0')}:00`;
  });

  const totalPowerKwh = history.reduce((sum, d) => sum + d.power / 1000 / 720, 0);
  const co2Saved = Math.round(totalPowerKwh * 0.85 * 100) / 100;
  const treesEquiv = Math.round(co2Saved / 21.77 * 100) / 100;

  const efficiencyScore = latest ? Math.round(latest.efficiency * 10) / 10 : 0;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <GradientText style={styles.title}>Monitor</GradientText>
          <Text style={styles.subtitle}>Live Data & AI Insights</Text>
        </View>

        <View style={styles.statRow}>
          <View style={styles.statItem}>
            <StatCard value={latest ? `${latest.voltage.toFixed(1)}V` : '--'} label="Voltage" color={colors.primary} />
          </View>
          <View style={styles.statItem}>
            <StatCard value={latest ? `${latest.current.toFixed(1)}A` : '--'} label="Current" color={colors.success} />
          </View>
          <View style={styles.statItem}>
            <StatCard value={latest ? `${latest.temperature.toFixed(0)}°C` : '--'} label="Temp" color={colors.warning} icon={<Thermometer size={18} color={colors.warning} />} />
          </View>
        </View>

        <View style={styles.statRow}>
          <View style={styles.statItem}>
            <StatCard value={latest ? `${latest.irradiance.toFixed(0)}` : '--'} label="W/m² Irradiance" color={colors.secondary} icon={<Sun size={18} color={colors.secondary} />} />
          </View>
          <View style={styles.statItem}>
            <StatCard value={`${efficiencyScore}%`} label="Efficiency" color={efficiencyScore > 85 ? colors.success : colors.warning} icon={<TrendingUp size={18} color={efficiencyScore > 85 ? colors.success : colors.warning} />} />
          </View>
        </View>

        <GlassCard>
          <Text style={styles.sectionLabel}>Power Output</Text>
          <LineChart data={powerData} labels={timeLabels} color={colors.primary} />
        </GlassCard>

        <GlassCard>
          <Text style={styles.sectionLabel}>Voltage</Text>
          <LineChart data={voltageData} labels={timeLabels} color={colors.success} />
        </GlassCard>

        <GlassCard>
          <Text style={styles.sectionLabel}>Current</Text>
          <LineChart data={currentData} labels={timeLabels} color={colors.secondary} />
        </GlassCard>

        {predictionValues.length > 0 && (
          <GlassCard>
            <Text style={styles.sectionLabel}>Predicted Output</Text>
            <LineChart data={predictionValues} labels={predictionLabels} color={colors.secondary} showArea />
            <View style={styles.predConfidence}>
              <Text style={styles.predText}>
                Confidence: {predictions[0]?.confidence ? `${Math.round(predictions[0].confidence * 100)}%` : '--'}
              </Text>
            </View>
          </GlassCard>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabelTop}>AI Suggestions</Text>
        </View>
        <ActionCard title="Optimal Export Window" description="Export to grid between 12:00-14:00 for maximum revenue" onPress={() => {}} icon={<TrendingUp size={18} color={colors.primary} />} />
        <ActionCard title="Battery Strategy" description={`Battery at ${latest ? Math.round(50 + (latest.power - 800) / 20) : 50}% — store excess solar until evening peak`} onPress={() => {}} icon={<Leaf size={18} color={colors.success} />} />

        <GlassCard>
          <Text style={styles.sectionLabel}>Environmental Impact</Text>
          <View style={styles.envRow}>
            <View style={styles.envItem}>
              <Leaf size={20} color={colors.success} />
              <Text style={styles.envValue}>{co2Saved.toFixed(1)} kg</Text>
              <Text style={styles.envLabel}>CO₂ Saved</Text>
            </View>
            <View style={styles.envDivider} />
            <View style={styles.envItem}>
              <Trees size={20} color={colors.success} />
              <Text style={styles.envValue}>{treesEquiv.toFixed(1)}</Text>
              <Text style={styles.envLabel}>Trees Equiv.</Text>
            </View>
          </View>
        </GlassCard>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.lg },
  header: { gap: 4 },
  title: { fontFamily: fonts.sora.extraBold, fontSize: 28 },
  subtitle: { fontFamily: fonts.sora.light, fontSize: 14, color: colors.textSecondary, letterSpacing: 1 },
  statRow: { flexDirection: 'row', gap: 12 },
  statItem: { flex: 1 },
  sectionLabel: { fontFamily: fonts.sora.medium, fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: colors.textSecondary, marginBottom: 12 },
  sectionHeader: { marginTop: 4 },
  sectionLabelTop: { fontFamily: fonts.sora.medium, fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: colors.textSecondary },
  predConfidence: { alignItems: 'center', marginTop: 8 },
  predText: { fontFamily: fonts.mono.regular, fontSize: 11, color: colors.textSecondary },
  envRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24 },
  envItem: { alignItems: 'center', gap: 6 },
  envValue: { fontFamily: fonts.sora.bold, fontSize: 22, color: colors.success },
  envLabel: { fontFamily: fonts.sora.medium, fontSize: 10, color: colors.textSecondary, letterSpacing: 2, textTransform: 'uppercase' },
  envDivider: { width: 1, height: 48, backgroundColor: 'rgba(255,255,255,0.06)' },
});
