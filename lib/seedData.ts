import { supabase } from './supabase';

export async function seedHistoricalData() {
  const { count } = await supabase
    .from('sensor_data')
    .select('*', { count: 'exact', head: true });

  if (count && count > 100) return;

  const now = Date.now();
  const readings = [];

  for (let day = 6; day >= 0; day--) {
    for (let hour = 5; hour <= 20; hour++) {
      for (let min = 0; min < 60; min += 5) {
        const timestamp = new Date(now - day * 24 * 60 * 60 * 1000);
        timestamp.setHours(hour, min, 0, 0);

        const h = hour + min / 60;
        const peak = 13;
        const sigma = 3.5;
        const irradiance = Math.max(0, Math.exp(-0.5 * Math.pow((h - peak) / sigma, 2)) * 1000 * (1 + (Math.random() - 0.5) * 0.16));
        const temperature = 25 + (irradiance / 1000) * 25 + (Math.random() - 0.5) * 3;
        const efficiency = Math.min(0.97, Math.max(0.78, 0.92 - Math.max(0, (temperature - 40) * 0.003) + (Math.random() - 0.5) * 0.04));
        const voltage = irradiance > 10 ? 24 + (irradiance / 1000) * 12 + (Math.random() - 0.5) * 2 : 0;
        const current = irradiance > 10 ? (irradiance / 1000) * 8.5 * efficiency + (Math.random() - 0.5) * 0.5 : 0;

        readings.push({
          timestamp: timestamp.toISOString(),
          voltage: Math.round(voltage * 100) / 100,
          current: Math.round(current * 100) / 100,
          power: Math.round(voltage * current * 100) / 100,
          temperature: Math.round(temperature * 10) / 10,
          irradiance: Math.round(irradiance * 10) / 10,
          efficiency: Math.round(efficiency * 1000) / 10,
        });
      }
    }
  }

  for (let i = 0; i < readings.length; i += 500) {
    const batch = readings.slice(i, i + 500);
    await supabase.from('sensor_data').insert(batch);
  }

  console.log(`Seeded ${readings.length} historical sensor readings`);
}
