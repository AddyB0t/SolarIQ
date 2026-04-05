import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { EnergyConfig, EnergySource } from '../lib/types';

export function useEnergyConfig() {
  const [config, setConfig] = useState<EnergyConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      const { data } = await supabase
        .from('energy_config')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (data) setConfig(data);
      setLoading(false);
    };

    fetchConfig();

    const channelName = `energy_config_${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'energy_config' },
        (payload) => {
          setConfig(payload.new as EnergyConfig);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateConfig = useCallback(
    async (updates: Partial<Omit<EnergyConfig, 'id' | 'updated_at'>>) => {
      if (!config) return;
      const { data } = await supabase
        .from('energy_config')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', config.id)
        .select()
        .single();

      if (data) setConfig(data);
    },
    [config]
  );

  const setMode = useCallback(
    (mode: 'auto' | 'manual') => updateConfig({ mode }),
    [updateConfig]
  );

  const setThresholds = useCallback(
    (low: number, high: number) =>
      updateConfig({ low_threshold: low, high_threshold: high }),
    [updateConfig]
  );

  const forceSources = useCallback(
    (sources: EnergySource[]) =>
      updateConfig({
        mode: 'manual',
        active_sources: sources,
        manual_override: { forced_sources: sources },
      }),
    [updateConfig]
  );

  return { config, loading, updateConfig, setMode, setThresholds, forceSources };
}
