import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Sun } from 'lucide-react-native';
import { colors, fonts, spacing } from '../../lib/theme';
import { useSensorData } from '../../hooks/useSensorData';
import { useEnergyConfig } from '../../hooks/useEnergyConfig';
import { useAlerts } from '../../hooks/useAlerts';
import { getHomeLoad } from '../../lib/simulator';
import { GlassCard } from '../../components/ui/GlassCard';
import { GradientText } from '../../components/ui/GradientText';
import { DonutChart } from '../../components/charts/DonutChart';
import { GaugeChart } from '../../components/charts/GaugeChart';
import { StatCard } from '../../components/cards/StatCard';
import { AlertCard } from '../../components/cards/AlertCard';
import { FlowDiagram } from '../../components/charts/FlowDiagram';
import { ModeToggle } from '../../components/controls/ModeToggle';
import { ThresholdSlider } from '../../components/controls/ThresholdSlider';
import { SourceButton } from '../../components/controls/SourceButton';
import type { EnergySource, EnergyMode } from '../../lib/types';

function getEnergyMode(sources: EnergySource[]): EnergyMode {
  const has = (s: EnergySource) => sources.includes(s);
  if (has('solar') && has('battery') && has('grid')) return 'Full Mix';
  if (has('solar') && has('grid')) return 'Solar + Grid';
  if (has('solar') && has('battery')) return 'Solar + Battery';
  return 'Solar Only';
}

export default function HomeScreen() {
  const { latest, loading: sensorLoading } = useSensorData();
  const { config, loading: configLoading, setMode, setThresholds, forceSources } = useEnergyConfig();
  const { alerts, acknowledgeAlert } = useAlerts();

  const homeLoad = getHomeLoad();
  const batteryLevel = latest
    ? Math.min(100, Math.max(0, Math.round(50 + (latest.power - homeLoad) / 20)))
    : 50;
  const gridPower = config?.active_sources.includes('grid')
    ? Math.max(0, homeLoad - (latest?.power || 0))
    : 0;

  const solarPct = latest ? Math.round((latest.power / (latest.power + gridPower + batteryLevel * 3)) * 100) || 58 : 58;
  const battPct = Math.round(batteryLevel * 0.4) || 27;
  const gridPct = 100 - solarPct - battPct;

  const activeSources = config?.active_sources || ['solar'];
  const mode = config?.mode || 'auto';
  const energyMode = getEnergyMode(activeSources as EnergySource[]);

  const handleSourceToggle = (source: EnergySource) => {
    const current = [...(config?.active_sources || ['solar'])] as EnergySource[];
    const idx = current.indexOf(source);
    if (idx >= 0 && current.length > 1) {
      current.splice(idx, 1);
    } else if (idx < 0) {
      current.push(source);
    }
    forceSources(current);
  };

  const insets = useSafeAreaInsets();

  return (
    <View style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + 32 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <GradientText style={styles.title}>SolarIQ</GradientText>
          <Text style={styles.subtitle}>Dashboard</Text>
        </View>

        <GlassCard style={styles.powerCard}>
          <View style={styles.powerRow}>
            <Sun size={28} color={colors.primary} />
            <View>
              <Text style={styles.powerValue}>
                {latest ? (latest.power / 1000).toFixed(2) : '0.00'}
              </Text>
              <Text style={styles.powerUnit}>kW Generated</Text>
            </View>
          </View>
        </GlassCard>

        <GlassCard style={styles.centered}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>Energy Distribution</Text>
          </View>
          <DonutChart
            segments={[
              { value: solarPct, color: colors.primary, label: 'Solar' },
              { value: battPct, color: colors.success, label: 'Battery' },
              { value: gridPct, color: colors.danger, label: 'Grid' },
            ]}
            centerValue={(latest ? latest.power / 1000 : 0).toFixed(2)}
            centerLabel="kW TOTAL"
          />
          <View style={styles.legendRow}>
            <Text style={[styles.legend, { color: colors.primary }]}>● Solar {solarPct}%</Text>
            <Text style={[styles.legend, { color: colors.success }]}>● Battery {battPct}%</Text>
            <Text style={[styles.legend, { color: colors.danger }]}>● Grid {gridPct}%</Text>
          </View>
        </GlassCard>

        <View style={styles.statRow}>
          <View style={styles.statItem}>
            <GaugeChart value={batteryLevel} label="Battery" color={colors.success} size={120} />
          </View>
          <View style={styles.statItem}>
            <StatCard value={`${homeLoad}W`} label="Load" color={colors.warning} />
          </View>
          <View style={styles.statItem}>
            <StatCard
              value={gridPower > 0 ? `${(gridPower / 1000).toFixed(1)}kW` : 'Export'}
              label={gridPower > 0 ? 'Importing' : 'Status'}
              color={gridPower > 0 ? colors.danger : colors.success}
            />
          </View>
        </View>

        <GlassCard>
          <Text style={styles.sectionLabel}>Energy Flow</Text>
          <FlowDiagram
            activeSources={activeSources as EnergySource[]}
            solarPower={latest?.power || 0}
            batteryLevel={batteryLevel}
            homeLoad={homeLoad}
            gridPower={gridPower}
          />
          <View style={styles.modeBadge}>
            <Text style={styles.modeBadgeText}>{mode.toUpperCase()} · {energyMode}</Text>
          </View>
        </GlassCard>

        <GlassCard style={styles.controlCard}>
          <Text style={styles.sectionLabel}>Energy Control</Text>
          <ModeToggle mode={mode} onToggle={setMode} />

          {mode === 'manual' && (
            <View style={styles.sourceRow}>
              {(['solar', 'battery', 'grid'] as EnergySource[]).map((s) => (
                <SourceButton
                  key={s}
                  source={s}
                  active={activeSources.includes(s)}
                  onPress={() => handleSourceToggle(s)}
                />
              ))}
            </View>
          )}

          <ThresholdSlider
            label="Low → Medium threshold"
            value={config?.low_threshold || 500}
            min={200}
            max={1000}
            onValueChange={(v) => setThresholds(Math.round(v), config?.high_threshold || 1200)}
          />
          <ThresholdSlider
            label="Medium → High threshold"
            value={config?.high_threshold || 1200}
            min={800}
            max={2000}
            onValueChange={(v) => setThresholds(config?.low_threshold || 500, Math.round(v))}
          />
        </GlassCard>

        {alerts.length > 0 && (
          <GlassCard>
            <Text style={styles.sectionLabel}>Alerts</Text>
            {alerts.slice(0, 5).map((alert) => (
              <AlertCard key={alert.id} alert={alert} onAcknowledge={acknowledgeAlert} />
            ))}
          </GlassCard>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.lg },
  header: { gap: 4 },
  title: { fontFamily: fonts.sora.extraBold, fontSize: 28 },
  subtitle: { fontFamily: fonts.sora.light, fontSize: 14, color: colors.textSecondary, letterSpacing: 1 },
  powerCard: { flexDirection: 'row', alignItems: 'center' },
  powerRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  powerValue: { fontFamily: fonts.sora.extraBold, fontSize: 36, color: colors.textPrimary, letterSpacing: -1 },
  powerUnit: { fontFamily: fonts.sora.medium, fontSize: 12, color: colors.textSecondary, letterSpacing: 2, textTransform: 'uppercase' },
  centered: { alignItems: 'center' },
  sectionHeader: { alignSelf: 'flex-start', marginBottom: 12 },
  sectionLabel: { fontFamily: fonts.sora.medium, fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: colors.textSecondary, marginBottom: 12 },
  legendRow: { flexDirection: 'row', gap: 16, marginTop: 12 },
  legend: { fontFamily: fonts.sora.medium, fontSize: 11 },
  statRow: { flexDirection: 'row', gap: 12 },
  statItem: { flex: 1 },
  modeBadge: { alignItems: 'center', marginTop: 8 },
  modeBadgeText: { fontFamily: fonts.sora.medium, fontSize: 10, letterSpacing: 3, color: colors.primary, textTransform: 'uppercase' },
  controlCard: { gap: 20 },
  sourceRow: { flexDirection: 'row', gap: 10 },
});
