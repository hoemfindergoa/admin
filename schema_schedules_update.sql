-- Schema extension for Schedules & Timetable Management

-- 1. Create school_events table (for calendar events, holidays, exams)
create table if not exists public.school_events (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  description text,
  scope text not null default 'ALL', -- ALL, CLASS, SECTION, TEACHERS
  class_id uuid references public.school_classes(id) on delete cascade,
  section_id uuid references public.school_sections(id) on delete cascade,
  start_date timestamp with time zone not null,
  end_date timestamp with time zone not null,
  is_full_day boolean not null default false,
  is_recurring boolean not null default false,
  recurrence_rule text, -- RRULE format or simple text like DAILY, WEEKLY
  event_type text not null default 'EVENT', -- HOLIDAY, EXAM, MEETING, EVENT
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists school_events_org_idx on public.school_events (org_id);

-- 2. Create school_timetable_slots table (for class weekly routine)
create table if not exists public.school_timetable_slots (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  class_id uuid not null references public.school_classes(id) on delete cascade,
  section_id uuid not null references public.school_sections(id) on delete cascade,
  day_of_week integer not null check (day_of_week between 1 and 7), -- 1=Monday, 7=Sunday
  start_time time not null,
  end_time time not null,
  slot_type text not null default 'SUBJECT', -- SUBJECT, BREAK, ASSEMBLY, EVENT
  subject_id uuid references public.school_subjects(id) on delete set null,
  teacher_id uuid references public.school_teachers(id) on delete set null,
  label text, -- Used for 'Break' or 'Lunch' label if slot_type != SUBJECT
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists school_timetable_slots_org_idx on public.school_timetable_slots (org_id);

-- 3. Enable RLS and setup policies
alter table public.school_events enable row level security;
alter table public.school_timetable_slots enable row level security;

grant select, insert, update, delete on public.school_events to authenticated;
grant select, insert, update, delete on public.school_timetable_slots to authenticated;

drop policy if exists "School staff manage events" on public.school_events;
create policy "School staff manage events" on public.school_events
  for all to authenticated using (public.has_school_permission(org_id, 'schedules'))
  with check (public.has_school_permission(org_id, 'schedules'));

drop policy if exists "School staff manage timetable" on public.school_timetable_slots;
create policy "School staff manage timetable" on public.school_timetable_slots
  for all to authenticated using (public.has_school_permission(org_id, 'schedules'))
  with check (public.has_school_permission(org_id, 'schedules'));
