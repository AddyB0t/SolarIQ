import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { SensorData } from '../lib/types';

export function useSensorData() {
  const [latest, setLatest] = useState<SensorData | null>(null);
  const [history, setHistory] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data } = await supabase
      .from('sensor_data')
      .select('*')
      .gte('timestamp', oneHourAgo)
      .order('timestamp', { ascending: true })
      .limit(720);

    if (data) {
      setHistory(data);
      if (data.length > 0) setLatest(data[data.length - 1]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchHistory();

    const channel = supabase
      .channel('sensor_data_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'sensor_data' },
        (payload) => {
          const newData = payload.new as SensorData;
          setLatest(newData);
          setHistory((prev) => {
            const oneHourAgo = Date.now() - 60 * 60 * 1000;
            const filtered = prev.filter(
              (d) => new Date(d.timestamp).getTime() > oneHourAgo
            );
            return [...filtered, newData];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchHistory]);

  return { latest, history, loading };
}
