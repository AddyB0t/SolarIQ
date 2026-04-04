export interface SensorData {
  id: string;
  timestamp: string;
  voltage: number;
  current: number;
  power: number;
  temperature: number;
  irradiance: number;
  efficiency: number;
  created_at: string;
}

export interface EnergyConfig {
  id: string;
  mode: 'auto' | 'manual';
  active_sources: ('solar' | 'battery' | 'grid')[];
  low_threshold: number;
  high_threshold: number;
  manual_override: {
    forced_sources?: ('solar' | 'battery' | 'grid')[];
  } | null;
  updated_at: string;
}

export interface Prediction {
  id: string;
  predicted_at: string;
  target_hour: string;
  predicted_power: number;
  confidence: number;
  model_version: string;
  created_at: string;
}

export interface Alert {
  id: string;
  type: 'warning' | 'critical' | 'info';
  message: string;
  trigger: string;
  acknowledged: boolean;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  action?: {
    type: string;
    params: Record<string, unknown>;
  };
  timestamp: string;
}

export type EnergySource = 'solar' | 'battery' | 'grid';
export type EnergyMode = 'Solar Only' | 'Solar + Battery' | 'Solar + Grid' | 'Full Mix';
