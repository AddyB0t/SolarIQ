import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { SensorData, EnergySource } from '../lib/types';

// While the app is open and the user has Auto mode selected, this hook
// listens for new sensor_data rows and decides which sources should be
// active based on solar power vs. the configured thresholds. The decision
// is written back to energy_config; the ESP32 picks it up on its next poll
// and switches relays accordingly.
//
// Hysteresis: switch to solar only when power crosses *above* high_threshold,
// switch to grid only when power drops *below* low_threshold. The gap
// between the two prevents rapid relay flapping at the boundary.
export function useAutoRouting() {
  const lastDesiredRef = useRef<string>('');

  useEffect(() => {
    const channel = supabase
      .channel(`auto_routing_${Date.now()}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'sensor_data' },
        async (payload) => {
          const sensor = payload.new as SensorData;

          const { data: config } = await supabase
            .from('energy_config')
            .select('*')
            .order('updated_at', { ascending: false })
            .limit(1)
            .single();

          if (!config || config.mode !== 'auto') return;

          const isCurrentlySolar = config.active_sources.includes('solar');
          const power = sensor.power;

          let desired: EnergySource[];
          if (isCurrentlySolar) {
            desired = power < config.low_threshold ? ['grid'] : ['solar'];
          } else {
            desired = power >= config.high_threshold ? ['solar'] : ['grid'];
          }

          const desiredKey = desired.join(',');
          if (desiredKey === lastDesiredRef.current) return;
          lastDesiredRef.current = desiredKey;

          if (JSON.stringify(desired) === JSON.stringify(config.active_sources)) {
            return;
          }

          await supabase
            .from('energy_config')
            .update({
              active_sources: desired,
              updated_at: new Date().toISOString(),
            })
            .eq('id', config.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
}
