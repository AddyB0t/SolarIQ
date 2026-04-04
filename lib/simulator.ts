import { supabase } from './supabase';

// Bell curve: peaks at solar noon (13:00)
function solarIrradiance(hour: number): number {
  const peak = 13;
  const sigma = 3.5;
  const max = 1000;
  const base = Math.exp(-0.5 * Math.pow((hour - peak) / sigma, 2));
  const noise = 1 + (Math.random() - 0.5) * 0.16;
  return Math.max(0, base * max * noise);
}

function panelTemp(irradiance: number): number {
  const ambient = 25;
  const tempRise = (irradiance / 1000) * 25;
  const noise = (Math.random() - 0.5) * 3;
  return ambient + tempRise + noise;
}

function mpptEfficiency(temperature: number, irradiance: number): number {
  const base = 0.92;
  const tempPenalty = Math.max(0, (temperature - 40) * 0.003);
  const lowLightPenalty = irradiance < 200 ? 0.05 : 0;
  const noise = (Math.random() - 0.5) * 0.04;
  return Math.min(0.97, Math.max(0.78, base - tempPenalty - lowLightPenalty + noise));
}

function homeLoad(hour: number): number {
  const morningPeak = 300 + 400 * Math.exp(-0.5 * Math.pow((hour - 8) / 1.5, 2));
  const eveningPeak = 500 + 600 * Math.exp(-0.5 * Math.pow((hour - 19) / 2, 2));
  const baseLoad = 200;
  const noise = (Math.random() - 0.5) * 100;
  return Math.max(100, baseLoad + morningPeak + eveningPeak + noise);
}

function determineActiveSources(
  solarPower: number,
  loadW: number,
  lowThreshold: number,
  highThreshold: number
): ('solar' | 'battery' | 'grid')[] {
  if (loadW < lowThreshold) return ['solar'];
  if (loadW < highThreshold) return ['solar', 'battery'];
  return ['solar', 'battery', 'grid'];
}

export function generateSensorReading(): {
  voltage: number;
  current: number;
  power: number;
  temperature: number;
  irradiance: number;
  efficiency: number;
} {
  const now = new Date();
  const hour = now.getHours() + now.getMinutes() / 60;

  const irr = solarIrradiance(hour);
  const temp = panelTemp(irr);
  const eff = mpptEfficiency(temp, irr);

  const voltage = irr > 10 ? 24 + (irr / 1000) * 12 + (Math.random() - 0.5) * 2 : 0;
  const current = irr > 10 ? (irr / 1000) * 8.5 * eff + (Math.random() - 0.5) * 0.5 : 0;
  const power = voltage * current;

  return {
    voltage: Math.round(voltage * 100) / 100,
    current: Math.round(current * 100) / 100,
    power: Math.round(power * 100) / 100,
    temperature: Math.round(temp * 10) / 10,
    irradiance: Math.round(irr * 10) / 10,
    efficiency: Math.round(eff * 1000) / 10,
  };
}

export function getHomeLoad(): number {
  const now = new Date();
  const hour = now.getHours() + now.getMinutes() / 60;
  return Math.round(homeLoad(hour));
}

let simulatorInterval: ReturnType<typeof setInterval> | null = null;

export async function startSimulator() {
  if (simulatorInterval) return;

  const tick = async () => {
    const reading = generateSensorReading();
    const load = getHomeLoad();

    await supabase.from('sensor_data').insert({
      ...reading,
      timestamp: new Date().toISOString(),
    });

    const { data: config } = await supabase
      .from('energy_config')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (config && config.mode === 'auto') {
      const sources = determineActiveSources(
        reading.power,
        load,
        config.low_threshold,
        config.high_threshold
      );

      if (JSON.stringify(sources) !== JSON.stringify(config.active_sources)) {
        await supabase
          .from('energy_config')
          .update({
            active_sources: sources,
            updated_at: new Date().toISOString(),
          })
          .eq('id', config.id);
      }
    }

    const batteryLevel = Math.min(100, Math.max(0, 50 + (reading.power - load) / 20));

    if (batteryLevel < 20) {
      await supabase.from('alerts').insert({
        type: 'critical',
        message: 'Battery critically low — grid backup activated',
        trigger: `battery_level:${Math.round(batteryLevel)}`,
      });
    } else if (reading.temperature > 45) {
      await supabase.from('alerts').insert({
        type: 'warning',
        message: 'Panel temperature high — efficiency may drop',
        trigger: `temperature:${reading.temperature}`,
      });
    } else if (load > 1500) {
      await supabase.from('alerts').insert({
        type: 'warning',
        message: 'High load detected — blending grid power',
        trigger: `load:${load}`,
      });
    }
  };

  await tick();
  simulatorInterval = setInterval(tick, 5000);
}

export function stopSimulator() {
  if (simulatorInterval) {
    clearInterval(simulatorInterval);
    simulatorInterval = null;
  }
}
