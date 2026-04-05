import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { SensorData } from '../lib/types';

export function useSensorData() {
  const [latest, setLatest] = useState<SensorData | null>(null);
  const [history, setHistory] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    // Fetch initial history
    const fetchHistory = async () => {
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
    };

    fetchHistory();

    // Unique channel name to avoid conflicts on re-renders
    const channelName = `sensor_data_${Date.now()}`;
    const channel = supabase
      .channel(channelName)
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

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { latest, history, loading };
}
