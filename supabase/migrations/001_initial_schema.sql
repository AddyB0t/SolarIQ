-- Sensor readings from solar system
create table sensor_data (
  id uuid primary key default gen_random_uuid(),
  timestamp timestamptz not null default now(),
  voltage float not null,
  current float not null,
  power float not null,
  temperature float not null,
  irradiance float not null,
  efficiency float not null,
  created_at timestamptz not null default now()
);

create table energy_config (
  id uuid primary key default gen_random_uuid(),
  mode text not null default 'auto' check (mode in ('auto', 'manual')),
  active_sources text[] not null default '{solar}',
  low_threshold int not null default 500,
  high_threshold int not null default 1200,
  manual_override jsonb,
  updated_at timestamptz not null default now()
);

create table predictions (
  id uuid primary key default gen_random_uuid(),
  predicted_at timestamptz not null default now(),
  target_hour timestamptz not null,
  predicted_power float not null,
  confidence float not null,
  model_version text not null default 'v1',
  created_at timestamptz not null default now()
);

create table alerts (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'info' check (type in ('warning', 'critical', 'info')),
  message text not null,
  trigger text not null,
  acknowledged boolean not null default false,
  created_at timestamptz not null default now()
);

alter publication supabase_realtime add table sensor_data;
alter publication supabase_realtime add table energy_config;
alter publication supabase_realtime add table predictions;
alter publication supabase_realtime add table alerts;

insert into energy_config (mode, active_sources, low_threshold, high_threshold)
values ('auto', '{solar}', 500, 1200);

create index idx_sensor_data_timestamp on sensor_data (timestamp desc);
create index idx_predictions_target_hour on predictions (target_hour desc);
create index idx_alerts_created_at on alerts (created_at desc);
