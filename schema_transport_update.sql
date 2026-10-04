-- Schema extension for Transport Management

-- 1. Create school_vehicles table
create table if not exists public.school_vehicles (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  vehicle_number text not null,
  vehicle_model text,
  seating_capacity integer not null default 0,
  driver_name text,
  driver_phone text,
  gps_device_id text, -- For future GPS integration
  status text not null default 'ACTIVE', -- ACTIVE, MAINTENANCE, INACTIVE
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists school_vehicles_org_idx on public.school_vehicles (org_id);

-- 2. Create school_transport_routes table
create table if not exists public.school_transport_routes (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  route_name text not null,
  vehicle_id uuid references public.school_vehicles(id) on delete set null,
  start_point text,
  end_point text,
  distance_km numeric,
  monthly_fee numeric not null default 0 check (monthly_fee >= 0),
  stops text[], -- Array of stop names
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists school_transport_routes_org_idx on public.school_transport_routes (org_id);

-- 3. Enable RLS and setup policies
alter table public.school_vehicles enable row level security;
alter table public.school_transport_routes enable row level security;

grant select, insert, update, delete on public.school_vehicles to authenticated;
grant select, insert, update, delete on public.school_transport_routes to authenticated;

drop policy if exists "School staff manage vehicles" on public.school_vehicles;
create policy "School staff manage vehicles" on public.school_vehicles
  for all to authenticated using (public.has_school_permission(org_id, 'transport'))
  with check (public.has_school_permission(org_id, 'transport'));

drop policy if exists "School staff manage routes" on public.school_transport_routes;
create policy "School staff manage routes" on public.school_transport_routes
  for all to authenticated using (public.has_school_permission(org_id, 'transport'))
  with check (public.has_school_permission(org_id, 'transport'));
