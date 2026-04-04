import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: sensorData } = await supabase
    .from('sensor_data')
    .select('timestamp, power')
    .gte('timestamp', sevenDaysAgo)
    .order('timestamp', { ascending: true });

  if (!sensorData || sensorData.length < 10) {
    return new Response(JSON.stringify({ error: 'Not enough data' }), { status: 400 });
  }

  const hourlyAvg: Record<number, { sum: number; count: number }> = {};
  for (const row of sensorData) {
    const hour = new Date(row.timestamp).getHours();
    if (!hourlyAvg[hour]) hourlyAvg[hour] = { sum: 0, count: 0 };
    hourlyAvg[hour].sum += row.power;
    hourlyAvg[hour].count += 1;
  }

  const now = new Date();
  const predictions = [];
  for (let i = 1; i <= 3; i++) {
    const targetHour = (now.getHours() + i) % 24;
    const avg = hourlyAvg[targetHour];
    const predictedPower = avg ? avg.sum / avg.count : 0;

    const recentData = sensorData.slice(-12);
    const recentAvg = recentData.reduce((s, d) => s + d.power, 0) / recentData.length;
    const trendFactor = recentAvg > 0 && predictedPower > 0 ? recentAvg / predictedPower : 1;
    const adjusted = predictedPower * (0.7 + 0.3 * trendFactor);

    const confidence = avg && avg.count > 5 ? 0.85 : avg ? 0.65 : 0.4;

    const targetTime = new Date(now);
    targetTime.setHours(targetHour, 0, 0, 0);
    if (targetHour <= now.getHours()) targetTime.setDate(targetTime.getDate() + 1);

    predictions.push({
      target_hour: targetTime.toISOString(),
      predicted_power: Math.round(adjusted * 100) / 100,
      confidence,
      model_version: 'v1-linear',
    });
  }

  const { data: inserted } = await supabase
    .from('predictions')
    .insert(predictions.map((p) => ({ ...p, predicted_at: now.toISOString() })))
    .select();

  return new Response(JSON.stringify({ predictions: inserted }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
