import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Prediction } from '../lib/types';

export function usePredictions() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPredictions = useCallback(async () => {
    const now = new Date().toISOString();
    const { data } = await supabase
      .from('predictions')
      .select('*')
      .gte('target_hour', now)
      .order('target_hour', { ascending: true })
      .limit(6);

    if (data) setPredictions(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPredictions();

    const channel = supabase
      .channel('predictions_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'predictions' },
        () => {
          fetchPredictions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPredictions]);

  const requestPrediction = useCallback(async () => {
    await supabase.functions.invoke('predict');
    await fetchPredictions();
  }, [fetchPredictions]);

  return { predictions, loading, requestPrediction };
}
