-- ============================================
-- DROP OLD TABLES (from existing Hackathon DB)
-- ============================================
drop table if exists chat_messages cascade;
drop table if exists conversations cascade;
drop table if exists profiles cascade;
drop table if exists shortlisted_universities cascade;
drop table if exists sop_documents cascade;
drop table if exists tasks cascade;
drop table if exists universities cascade;
drop table if exists user_profiles cascade;

-- ============================================
-- CREATE SOLARIQ TABLES
-- ============================================

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

-- ============================================
-- DISABLE RLS (allow all access via anon key)
-- ============================================
alter table sensor_data disable row level security;
alter table energy_config disable row level security;
alter table predictions disable row level security;
alter table alerts disable row level security;

-- ============================================
-- ENABLE REALTIME
-- ============================================
alter publication supabase_realtime add table sensor_data;
alter publication supabase_realtime add table energy_config;
alter publication supabase_realtime add table predictions;
alter publication supabase_realtime add table alerts;

-- ============================================
-- SEED DEFAULT CONFIG
-- ============================================
insert into energy_config (mode, active_sources, low_threshold, high_threshold)
values ('auto', '{solar}', 500, 1200);

-- ============================================
-- INDEXES
-- ============================================
create index idx_sensor_data_timestamp on sensor_data (timestamp desc);
create index idx_predictions_target_hour on predictions (target_hour desc);
create index idx_alerts_created_at on alerts (created_at desc);
