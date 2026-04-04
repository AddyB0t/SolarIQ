import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const { message, history } = await req.json();

  const { data: sensorData } = await supabase
    .from('sensor_data')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(1)
    .single();

  const { data: config } = await supabase
    .from('energy_config')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();

  const systemContext = `Current solar system state:
- Power: ${sensorData?.power || 0}W
- Voltage: ${sensorData?.voltage || 0}V
- Current: ${sensorData?.current || 0}A
- Temperature: ${sensorData?.temperature || 0}°C
- Irradiance: ${sensorData?.irradiance || 0} W/m²
- Efficiency: ${sensorData?.efficiency || 0}%
- Mode: ${config?.mode || 'auto'}
- Active Sources: ${config?.active_sources?.join(', ') || 'solar'}
- Thresholds: Low=${config?.low_threshold || 500}W, High=${config?.high_threshold || 1200}W`;

  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');

  if (apiKey) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        system: `You are SolarIQ, an AI energy assistant. You help users monitor and optimize their solar energy system. ${systemContext}\n\nYou can execute these actions by including them in your response JSON:\n- force_sources: Switch energy sources. Params: { sources: ["solar", "battery", "grid"] }\n- set_thresholds: Change load thresholds. Params: { low: number, high: number }\n\nBe concise, helpful, and use data from the system state.`,
        messages: [
          ...(history || []).map((m: { role: string; content: string }) => ({
            role: m.role,
            content: m.content,
          })),
          { role: 'user', content: message },
        ],
      }),
    });

    const data = await response.json();
    const reply = data.content?.[0]?.text || 'Sorry, I could not process that request.';

    return new Response(JSON.stringify({ reply }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(
    JSON.stringify({ reply: `System is running in demo mode (no AI API key configured). ${systemContext}` }),
    { headers: { 'Content-Type': 'application/json' } }
  );
});
