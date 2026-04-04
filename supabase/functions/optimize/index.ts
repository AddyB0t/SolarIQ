import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const body = await req.json();
  const { power, load } = body;

  const { data: config } = await supabase
    .from('energy_config')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();

  if (!config || config.mode !== 'auto') {
    return new Response(JSON.stringify({ message: 'Manual mode active, skipping optimization' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let recommended: string[];
  let reason: string;

  if (load < config.low_threshold) {
    recommended = ['solar'];
    reason = `Load (${load}W) is below low threshold (${config.low_threshold}W). Solar only is sufficient.`;
  } else if (load < config.high_threshold) {
    recommended = ['solar', 'battery'];
    reason = `Load (${load}W) is between thresholds. Supplementing solar with battery.`;
  } else {
    recommended = ['solar', 'battery', 'grid'];
    reason = `Load (${load}W) exceeds high threshold (${config.high_threshold}W). Grid backup engaged.`;
  }

  if (JSON.stringify(recommended) !== JSON.stringify(config.active_sources)) {
    await supabase
      .from('energy_config')
      .update({ active_sources: recommended, updated_at: new Date().toISOString() })
      .eq('id', config.id);
  }

  return new Response(JSON.stringify({ recommended_sources: recommended, reason }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
