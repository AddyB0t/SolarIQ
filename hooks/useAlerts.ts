import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Alert } from '../lib/types';

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      const { data } = await supabase
        .from('alerts')
        .select('*')
        .eq('acknowledged', false)
        .order('created_at', { ascending: false })
        .limit(20);

      if (data) setAlerts(data);
      setLoading(false);
    };

    fetchAlerts();

    const channelName = `alerts_${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'alerts' },
        (payload) => {
          setAlerts((prev) => [payload.new as Alert, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const acknowledgeAlert = useCallback(async (id: string) => {
    await supabase.from('alerts').update({ acknowledged: true }).eq('id', id);
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  return { alerts, loading, acknowledgeAlert };
}
