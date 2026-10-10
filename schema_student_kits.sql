create table if not exists public.student_kit_orders (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  status text not null default 'PENDING',
  total_amount numeric(10,2) not null default 0,
  payment_status text not null default 'PENDING',
  transaction_id text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  created_by uuid references auth.users(id) on delete set null
);

alter table public.student_kit_orders enable row level security;

create policy "Users can view their own org kit orders" on public.student_kit_orders for select using (
  auth.uid() in (select owner_id from public.organizations where id = org_id) or
  auth.uid() in (select user_id from public.organization_users where org_id = student_kit_orders.org_id)
);

create policy "Super admins can view all kit orders" on public.student_kit_orders for select using (
  exists (select 1 from public.organizations where owner_id = auth.uid())
);

create policy "Users can insert kit orders for their org" on public.student_kit_orders for insert with check (
  auth.uid() in (select owner_id from public.organizations where id = org_id) or
  auth.uid() in (select user_id from public.organization_users where org_id = student_kit_orders.org_id)
);

create policy "Users can update their own org kit orders" on public.student_kit_orders for update using (
  auth.uid() in (select owner_id from public.organizations where id = org_id) or
  auth.uid() in (select user_id from public.organization_users where org_id = student_kit_orders.org_id)
);

create table if not exists public.student_kit_order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.student_kit_orders(id) on delete cascade,
  class_name text not null,
  quantity integer not null,
  unit_price numeric(10,2) not null default 0,
  total_price numeric(10,2) not null default 0,
  created_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.student_kit_order_items enable row level security;

create policy "Users can view kit order items for their org" on public.student_kit_order_items for select using (
  exists (select 1 from public.student_kit_orders o where o.id = order_id and (
    auth.uid() in (select owner_id from public.organizations where id = o.org_id) or
    auth.uid() in (select user_id from public.organization_users where org_id = o.org_id)
  ))
);

create policy "Super admins can view all kit order items" on public.student_kit_order_items for select using (
  exists (select 1 from public.organizations where owner_id = auth.uid())
);

create policy "Users can insert kit order items" on public.student_kit_order_items for insert with check (
  exists (select 1 from public.student_kit_orders o where o.id = order_id and (
    auth.uid() in (select owner_id from public.organizations where id = o.org_id) or
    auth.uid() in (select user_id from public.organization_users where org_id = o.org_id)
  ))
);

ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS franchise_brand text;
