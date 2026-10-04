-- Schema extension for comprehensive Fee Management

-- 1. Modify existing school_fee_payments table to support monthly tracking
alter table public.school_fee_payments 
add column if not exists for_month text, -- e.g. "2024-04" for April 2024
add column if not exists fee_structure_id uuid; -- optionally link payment to a specific fee structure

-- 2. Create school_fee_structures
create table if not exists public.school_fee_structures (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  amount numeric not null check (amount >= 0),
  frequency text not null default 'MONTHLY', -- MONTHLY, YEARLY, ONCE
  start_date date, -- For monthly occurrences
  months text[], -- Array of months this fee applies to if customized
  target_type text not null default 'ALL', -- ALL, CLASS, STUDENT, FAMILY, GROUP
  target_class_id uuid references public.school_classes(id) on delete cascade,
  description text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists school_fee_structures_org_idx on public.school_fee_structures (org_id);

-- 3. Create school_student_fee_assignments for specific overrides/discounts
create table if not exists public.school_student_fee_assignments (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  fee_structure_id uuid not null references public.school_fee_structures(id) on delete cascade,
  discount_amount numeric not null default 0 check (discount_amount >= 0),
  created_at timestamp with time zone default now(),
  unique(student_id, fee_structure_id)
);

create index if not exists school_student_fee_assignments_org_idx on public.school_student_fee_assignments (org_id);

alter table public.school_fee_structures enable row level security;
alter table public.school_student_fee_assignments enable row level security;

grant select, insert, update, delete on public.school_fee_structures to authenticated;
grant select, insert, update, delete on public.school_student_fee_assignments to authenticated;

drop policy if exists "School staff manage fee structures" on public.school_fee_structures;
create policy "School staff manage fee structures" on public.school_fee_structures
  for all to authenticated using (public.has_school_permission(org_id, 'fees'))
  with check (public.has_school_permission(org_id, 'fees'));

drop policy if exists "School staff manage fee assignments" on public.school_student_fee_assignments;
create policy "School staff manage fee assignments" on public.school_student_fee_assignments
  for all to authenticated using (public.has_school_permission(org_id, 'fees'))
  with check (public.has_school_permission(org_id, 'fees'));
