-- Run this in the Supabase SQL Editor to enable school setup, students, separate teacher and parent accounts, and parent messaging.
create extension if not exists "uuid-ossp";

create table if not exists public.school_classes (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc'::text, now()),
  unique (org_id, id)
);
create unique index if not exists school_classes_org_name_unique
  on public.school_classes (org_id, lower(name));

create table if not exists public.school_sections (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null,
  class_id uuid not null,
  name text not null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  unique (org_id, class_id, id),
  foreign key (org_id, class_id) references public.school_classes(org_id, id) on delete cascade
);
create unique index if not exists school_sections_class_name_unique
  on public.school_sections (class_id, lower(name));

create table if not exists public.school_subjects (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null,
  class_id uuid not null,
  section_id uuid not null,
  name text not null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  foreign key (org_id, class_id, section_id)
    references public.school_sections(org_id, class_id, id) on delete cascade
);
create unique index if not exists school_subjects_section_name_unique
  on public.school_subjects (section_id, lower(name));
create unique index if not exists school_subjects_org_id_id_unique
  on public.school_subjects (org_id, id);

create table if not exists public.students (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  class_id uuid not null,
  section_id uuid not null,
  admission_number text,
  student_name text not null,
  date_of_birth date,
  gender text,
  guardian_name text,
  guardian_phone text,
  guardian_email text,
  roll_number text,
  registration_number text,
  student_type text,
  transport_type text,
  category text,
  email text,
  phone text,
  status text not null default 'ACTIVE',
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  created_by uuid,
  created_by_email text,
  updated_by uuid,
  updated_by_email text,
  foreign key (org_id, class_id) references public.school_classes(org_id, id),
  foreign key (org_id, class_id, section_id)
    references public.school_sections(org_id, class_id, id)
);
alter table public.students add column if not exists roll_number text;
alter table public.students add column if not exists registration_number text;
alter table public.students add column if not exists student_type text;
alter table public.students add column if not exists transport_type text;
alter table public.students add column if not exists category text;
alter table public.students add column if not exists email text;
alter table public.students add column if not exists phone text;
alter table public.students add column if not exists created_by uuid;
alter table public.students add column if not exists created_by_email text;
alter table public.students add column if not exists updated_by uuid;
alter table public.students add column if not exists updated_by_email text;
create unique index if not exists students_admission_number_unique
  on public.students (org_id, lower(admission_number)) where admission_number is not null;
create index if not exists students_org_class_section_idx
  on public.students (org_id, class_id, section_id);
create unique index if not exists students_org_id_id_unique
  on public.students (org_id, id);

create table if not exists public.school_houses (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  unique (org_id, id)
);
create unique index if not exists school_houses_org_name_unique on public.school_houses (org_id, lower(name));

create table if not exists public.student_details (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null,
  student_id uuid not null,
  house_id uuid,
  active_fee numeric(12,2),
  optional_subjects jsonb not null default '[]'::jsonb,
  details jsonb not null default '{}'::jsonb,
  siblings jsonb not null default '[]'::jsonb,
  concessions jsonb not null default '[]'::jsonb,
  profile_picture_path text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  updated_by uuid,
  updated_by_email text,
  unique (org_id, student_id),
  foreign key (org_id, student_id) references public.students(org_id, id) on delete cascade,
  foreign key (org_id, house_id) references public.school_houses(org_id, id)
);

create or replace function public.set_school_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;
drop trigger if exists school_students_updated_at on public.students;
create trigger school_students_updated_at before update on public.students for each row execute function public.set_school_updated_at();
drop trigger if exists school_student_details_updated_at on public.student_details;
create trigger school_student_details_updated_at before update on public.student_details for each row execute function public.set_school_updated_at();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('student-profile-images', 'student-profile-images', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = false, file_size_limit = 5242880, allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

-- Teachers have their own records and sign-in identity, separate from admin users.
create table if not exists public.school_teachers (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text not null,
  phone text,
  role text not null default 'TEACHER' check (role = 'TEACHER'),
  invited_by_role text not null default 'ADMIN' check (invited_by_role in ('ADMIN', 'FRANCHISE_ADMIN', 'SCHOOL_MANAGER')),
  status text not null default 'PENDING' check (status in ('PENDING', 'ACTIVE')),
  created_at timestamptz not null default timezone('utc'::text, now()),
  unique (org_id, id)
);
create unique index if not exists school_teachers_org_email_unique on public.school_teachers (org_id, lower(email));
create index if not exists school_teachers_user_id_idx on public.school_teachers (user_id);

create table if not exists public.school_class_teachers (
  org_id uuid not null,
  class_id uuid not null,
  teacher_id uuid not null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  primary key (org_id, class_id, teacher_id),
  foreign key (org_id, class_id) references public.school_classes(org_id, id) on delete cascade,
  foreign key (org_id, teacher_id) references public.school_teachers(org_id, id) on delete cascade
);

create table if not exists public.school_subject_teachers (
  org_id uuid not null,
  subject_id uuid not null,
  teacher_id uuid not null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  primary key (org_id, subject_id, teacher_id),
  foreign key (org_id, subject_id) references public.school_subjects(org_id, id) on delete cascade,
  foreign key (org_id, teacher_id) references public.school_teachers(org_id, id) on delete cascade
);

-- Upgrade the earlier prototype mapping, which temporarily pointed at admin users.
alter table public.school_class_teachers drop constraint if exists school_class_teachers_org_id_teacher_id_fkey;
alter table public.school_class_teachers drop constraint if exists school_class_teachers_org_teacher_fkey;
delete from public.school_class_teachers a where not exists (
  select 1 from public.school_teachers t where t.org_id = a.org_id and t.id = a.teacher_id
);
alter table public.school_class_teachers add constraint school_class_teachers_org_teacher_fkey
  foreign key (org_id, teacher_id) references public.school_teachers(org_id, id) on delete cascade;
alter table public.school_subject_teachers drop constraint if exists school_subject_teachers_org_id_teacher_id_fkey;
alter table public.school_subject_teachers drop constraint if exists school_subject_teachers_org_teacher_fkey;
delete from public.school_subject_teachers a where not exists (
  select 1 from public.school_teachers t where t.org_id = a.org_id and t.id = a.teacher_id
);
alter table public.school_subject_teachers add constraint school_subject_teachers_org_teacher_fkey
  foreign key (org_id, teacher_id) references public.school_teachers(org_id, id) on delete cascade;

create table if not exists public.school_parents (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text not null,
  phone text,
  status text not null default 'PENDING' check (status in ('PENDING', 'ACTIVE')),
  created_at timestamptz not null default timezone('utc'::text, now()),
  unique (org_id, id)
);
create unique index if not exists school_parents_org_email_unique on public.school_parents (org_id, lower(email));
create index if not exists school_parents_user_id_idx on public.school_parents (user_id);

create table if not exists public.school_parent_students (
  org_id uuid not null,
  parent_id uuid not null,
  student_id uuid not null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  primary key (org_id, parent_id, student_id),
  foreign key (org_id, parent_id) references public.school_parents(org_id, id) on delete cascade,
  foreign key (org_id, student_id) references public.students(org_id, id) on delete cascade
);

create table if not exists public.school_parent_messages (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null,
  parent_id uuid not null,
  student_id uuid not null,
  teacher_id uuid,
  sender_role text not null check (sender_role in ('TEACHER', 'PARENT')),
  body text not null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  foreign key (org_id, parent_id) references public.school_parents(org_id, id) on delete cascade,
  foreign key (org_id, student_id) references public.students(org_id, id) on delete cascade,
  foreign key (org_id, teacher_id) references public.school_teachers(org_id, id) on delete cascade
);

create or replace function public.has_school_permission(target_org_id uuid, requested_permission text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.organizations o
    where o.id = target_org_id and o.owner_id = auth.uid()
  ) or exists (
    select 1 from public.organization_users ou
    where ou.org_id = target_org_id
      and ou.user_id = auth.uid()
      and ou.status = 'ACTIVE'
      and (
        ou.role = 'FRANCHISE_ADMIN'
        or coalesce(ou.permissions, '[]'::jsonb) @> jsonb_build_array(requested_permission)
        or (requested_permission = 'students' and coalesce(ou.permissions, '[]'::jsonb) @> '["manage_school"]'::jsonb)
      )
  ) or (requested_permission = 'teacher' and exists (
    select 1 from public.school_teachers t
    where t.org_id = target_org_id and t.user_id = auth.uid()
      and (
        exists (select 1 from public.school_class_teachers ct where ct.org_id = target_org_id and ct.teacher_id = t.id)
        or exists (select 1 from public.school_subject_teachers st where st.org_id = target_org_id and st.teacher_id = t.id)
      )
  )) or (requested_permission = 'parent' and exists (
    select 1 from public.school_parents p
    where p.org_id = target_org_id and p.user_id = auth.uid()
  ));
$$;
revoke all on function public.has_school_permission(uuid, text) from public;
grant execute on function public.has_school_permission(uuid, text) to authenticated;

create or replace function public.teacher_has_class(target_org_id uuid, target_class_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.school_teachers t
    where t.org_id = target_org_id and t.user_id = auth.uid()
      and (
        exists (select 1 from public.school_class_teachers ct where ct.org_id = target_org_id and ct.class_id = target_class_id and ct.teacher_id = t.id)
        or exists (select 1 from public.school_subject_teachers st join public.school_subjects s on s.org_id = st.org_id and s.id = st.subject_id where st.org_id = target_org_id and s.class_id = target_class_id and st.teacher_id = t.id)
      )
  );
$$;

create or replace function public.teacher_has_section(target_org_id uuid, target_class_id uuid, target_section_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.school_teachers t
    where t.org_id = target_org_id and t.user_id = auth.uid()
      and (
        exists (select 1 from public.school_class_teachers ct where ct.org_id = target_org_id and ct.class_id = target_class_id and ct.teacher_id = t.id)
        or exists (select 1 from public.school_subject_teachers st join public.school_subjects s on s.org_id = st.org_id and s.id = st.subject_id where st.org_id = target_org_id and s.class_id = target_class_id and s.section_id = target_section_id and st.teacher_id = t.id)
      )
  );
$$;

create or replace function public.teacher_has_subject(target_org_id uuid, target_subject_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.school_teachers t join public.school_subjects s on s.org_id = t.org_id
    where t.org_id = target_org_id and t.user_id = auth.uid() and s.id = target_subject_id
      and (
        exists (select 1 from public.school_class_teachers ct where ct.org_id = t.org_id and ct.class_id = s.class_id and ct.teacher_id = t.id)
        or exists (select 1 from public.school_subject_teachers st where st.org_id = t.org_id and st.subject_id = s.id and st.teacher_id = t.id)
      )
  );
$$;

create or replace function public.teacher_has_student(target_org_id uuid, target_student_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.students s where s.org_id = target_org_id and s.id = target_student_id and public.teacher_has_section(target_org_id, s.class_id, s.section_id));
$$;

create or replace function public.parent_has_student(target_org_id uuid, target_student_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.school_parents p join public.school_parent_students ps on ps.org_id = p.org_id and ps.parent_id = p.id
    where p.org_id = target_org_id and p.user_id = auth.uid() and ps.student_id = target_student_id
  );
$$;

grant execute on function public.teacher_has_class(uuid, uuid) to authenticated;
grant execute on function public.teacher_has_section(uuid, uuid, uuid) to authenticated;
grant execute on function public.teacher_has_subject(uuid, uuid) to authenticated;
grant execute on function public.teacher_has_student(uuid, uuid) to authenticated;
grant execute on function public.parent_has_student(uuid, uuid) to authenticated;

alter table public.school_classes enable row level security;
alter table public.school_sections enable row level security;
alter table public.school_subjects enable row level security;
alter table public.students enable row level security;
alter table public.school_class_teachers enable row level security;
alter table public.school_subject_teachers enable row level security;
alter table public.school_teachers enable row level security;
alter table public.school_parents enable row level security;
alter table public.school_parent_students enable row level security;
alter table public.school_parent_messages enable row level security;
alter table public.school_houses enable row level security;
alter table public.student_details enable row level security;

grant select, insert, update, delete on public.school_classes to authenticated;
grant select, insert, update, delete on public.school_sections to authenticated;
grant select, insert, update, delete on public.school_subjects to authenticated;
grant select, insert, update, delete on public.students to authenticated;
grant select, insert, update, delete on public.school_class_teachers to authenticated;
grant select, insert, update, delete on public.school_subject_teachers to authenticated;
grant select, insert, update, delete on public.school_teachers to authenticated;
grant select, insert, update, delete on public.school_parents to authenticated;
grant select, insert, update, delete on public.school_parent_students to authenticated;
grant select, insert, update, delete on public.school_parent_messages to authenticated;
grant select, insert, update, delete on public.school_houses to authenticated;
grant select, insert, update, delete on public.student_details to authenticated;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
    and not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'school_parent_messages') then
    alter publication supabase_realtime add table public.school_parent_messages;
  end if;
end;
$$;

drop policy if exists "School users can read classes" on public.school_classes;
create policy "School users can read classes" on public.school_classes
  for select to authenticated using (
    public.has_school_permission(org_id, 'manage_school')
    or public.has_school_permission(org_id, 'students')
    or public.teacher_has_class(org_id, id)
  );
drop policy if exists "School admins manage classes" on public.school_classes;
create policy "School admins manage classes" on public.school_classes
  for all to authenticated using (public.has_school_permission(org_id, 'manage_school'))
  with check (public.has_school_permission(org_id, 'manage_school'));

drop policy if exists "School users can read sections" on public.school_sections;
create policy "School users can read sections" on public.school_sections
  for select to authenticated using (
    public.has_school_permission(org_id, 'manage_school')
    or public.has_school_permission(org_id, 'students')
    or public.teacher_has_section(org_id, class_id, id)
  );
drop policy if exists "School admins manage sections" on public.school_sections;
create policy "School admins manage sections" on public.school_sections
  for all to authenticated using (public.has_school_permission(org_id, 'manage_school'))
  with check (public.has_school_permission(org_id, 'manage_school'));

drop policy if exists "School users can read subjects" on public.school_subjects;
create policy "School users can read subjects" on public.school_subjects
  for select to authenticated using (
    public.has_school_permission(org_id, 'manage_school')
    or public.has_school_permission(org_id, 'students')
    or public.teacher_has_subject(org_id, id)
  );
drop policy if exists "School admins manage subjects" on public.school_subjects;
create policy "School admins manage subjects" on public.school_subjects
  for all to authenticated using (public.has_school_permission(org_id, 'manage_school'))
  with check (public.has_school_permission(org_id, 'manage_school'));

drop policy if exists "School users can read students" on public.students;
create policy "School users can read students" on public.students
  for select to authenticated using (
    public.has_school_permission(org_id, 'students')
    or public.has_school_permission(org_id, 'manage_school')
    or public.teacher_has_student(org_id, id)
    or public.parent_has_student(org_id, id)
  );
drop policy if exists "School users manage students" on public.students;
create policy "School users manage students" on public.students
  for all to authenticated using (
    public.has_school_permission(org_id, 'students')
    or public.has_school_permission(org_id, 'manage_school')
  ) with check (
    public.has_school_permission(org_id, 'students')
    or public.has_school_permission(org_id, 'manage_school')
  );

drop policy if exists "School staff can read houses" on public.school_houses;
create policy "School staff can read houses" on public.school_houses
  for select to authenticated using (public.has_school_permission(org_id, 'students') or public.has_school_permission(org_id, 'manage_school'));
drop policy if exists "School staff manage houses" on public.school_houses;
create policy "School staff manage houses" on public.school_houses
  for all to authenticated using (public.has_school_permission(org_id, 'students') or public.has_school_permission(org_id, 'manage_school'))
  with check (public.has_school_permission(org_id, 'students') or public.has_school_permission(org_id, 'manage_school'));

drop policy if exists "School staff can read student details" on public.student_details;
create policy "School staff can read student details" on public.student_details
  for select to authenticated using (public.has_school_permission(org_id, 'students') or public.has_school_permission(org_id, 'manage_school'));
drop policy if exists "School staff manage student details" on public.student_details;
create policy "School staff manage student details" on public.student_details
  for all to authenticated using (public.has_school_permission(org_id, 'students') or public.has_school_permission(org_id, 'manage_school'))
  with check (public.has_school_permission(org_id, 'students') or public.has_school_permission(org_id, 'manage_school'));

drop policy if exists "School users can read class teacher assignments" on public.school_class_teachers;
create policy "School users can read class teacher assignments" on public.school_class_teachers
  for select to authenticated using (
    public.has_school_permission(org_id, 'manage_school')
    or exists (select 1 from public.school_teachers t where t.org_id = school_class_teachers.org_id and t.id = school_class_teachers.teacher_id and t.user_id = auth.uid())
  );
drop policy if exists "School admins manage class teacher assignments" on public.school_class_teachers;
create policy "School admins manage class teacher assignments" on public.school_class_teachers
  for all to authenticated using (public.has_school_permission(org_id, 'manage_school'))
  with check (public.has_school_permission(org_id, 'manage_school'));

drop policy if exists "School users can read subject teacher assignments" on public.school_subject_teachers;
create policy "School users can read subject teacher assignments" on public.school_subject_teachers
  for select to authenticated using (
    public.has_school_permission(org_id, 'manage_school')
    or exists (select 1 from public.school_teachers t where t.org_id = school_subject_teachers.org_id and t.id = school_subject_teachers.teacher_id and t.user_id = auth.uid())
  );
drop policy if exists "School admins manage subject teacher assignments" on public.school_subject_teachers;
create policy "School admins manage subject teacher assignments" on public.school_subject_teachers
  for all to authenticated using (public.has_school_permission(org_id, 'manage_school'))
  with check (public.has_school_permission(org_id, 'manage_school'));

drop policy if exists "School staff can read teacher records" on public.school_teachers;
create policy "School staff can read teacher records" on public.school_teachers
  for select to authenticated using (public.has_school_permission(org_id, 'manage_school') or user_id = auth.uid());
drop policy if exists "School admins manage teacher records" on public.school_teachers;
create policy "School admins manage teacher records" on public.school_teachers
  for all to authenticated using (public.has_school_permission(org_id, 'manage_school'))
  with check (public.has_school_permission(org_id, 'manage_school'));

drop policy if exists "School users can read parent records" on public.school_parents;
create policy "School users can read parent records" on public.school_parents
  for select to authenticated using (
    public.has_school_permission(org_id, 'manage_school') or user_id = auth.uid()
    or exists (select 1 from public.school_parent_students ps where ps.org_id = school_parents.org_id and ps.parent_id = school_parents.id and public.teacher_has_student(ps.org_id, ps.student_id))
  );
drop policy if exists "School admins manage parent records" on public.school_parents;
create policy "School admins manage parent records" on public.school_parents
  for all to authenticated using (public.has_school_permission(org_id, 'manage_school'))
  with check (public.has_school_permission(org_id, 'manage_school'));

drop policy if exists "School users can read parent student links" on public.school_parent_students;
create policy "School users can read parent student links" on public.school_parent_students
  for select to authenticated using (public.has_school_permission(org_id, 'manage_school') or public.teacher_has_student(org_id, student_id) or public.parent_has_student(org_id, student_id));
drop policy if exists "School admins manage parent student links" on public.school_parent_students;
create policy "School admins manage parent student links" on public.school_parent_students
  for all to authenticated using (public.has_school_permission(org_id, 'manage_school'))
  with check (public.has_school_permission(org_id, 'manage_school'));

drop policy if exists "Teachers and parents can read messages" on public.school_parent_messages;
create policy "Teachers and parents can read messages" on public.school_parent_messages
  for select to authenticated using (
    public.has_school_permission(org_id, 'manage_school')
    or (public.teacher_has_student(school_parent_messages.org_id, school_parent_messages.student_id) and public.has_school_permission(school_parent_messages.org_id, 'teacher'))
    or (public.parent_has_student(school_parent_messages.org_id, school_parent_messages.student_id) and exists (select 1 from public.school_parents p where p.org_id = school_parent_messages.org_id and p.id = school_parent_messages.parent_id and p.user_id = auth.uid()))
  );
drop policy if exists "Teachers and parents can send messages" on public.school_parent_messages;
create policy "Teachers and parents can send messages" on public.school_parent_messages
  for insert to authenticated with check (
    (sender_role = 'TEACHER' and public.teacher_has_student(school_parent_messages.org_id, school_parent_messages.student_id) and exists (select 1 from public.school_teachers t where t.org_id = school_parent_messages.org_id and t.id = school_parent_messages.teacher_id and t.user_id = auth.uid()))
    or (sender_role = 'PARENT' and public.parent_has_student(school_parent_messages.org_id, school_parent_messages.student_id) and exists (select 1 from public.school_parents p where p.org_id = school_parent_messages.org_id and p.id = school_parent_messages.parent_id and p.user_id = auth.uid()))
  );

-- School financial ledger: collected fee payments and logged expenses.
create table if not exists public.school_fee_payments (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  student_id uuid not null,
  amount numeric(12,2) not null check (amount > 0),
  payment_date date not null default current_date,
  payment_method text not null default 'CASH' check (payment_method in ('CASH', 'UPI', 'BANK_TRANSFER', 'CARD', 'CHEQUE', 'OTHER')),
  reference_number text,
  notes text,
  recorded_by uuid,
  recorded_by_email text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  foreign key (org_id, student_id) references public.students(org_id, id) on delete cascade,
  unique (org_id, id)
);
create index if not exists school_fee_payments_org_date_idx on public.school_fee_payments (org_id, payment_date desc);
create index if not exists school_fee_payments_student_idx on public.school_fee_payments (org_id, student_id);

create table if not exists public.school_expenses (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  category text not null,
  amount numeric(12,2) not null check (amount > 0),
  expense_date date not null default current_date,
  payment_method text not null default 'CASH' check (payment_method in ('CASH', 'UPI', 'BANK_TRANSFER', 'CARD', 'CHEQUE', 'OTHER')),
  vendor text,
  reference_number text,
  notes text,
  recorded_by uuid,
  recorded_by_email text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  unique (org_id, id)
);
create index if not exists school_expenses_org_date_idx on public.school_expenses (org_id, expense_date desc);
alter table public.school_fee_payments enable row level security;
alter table public.school_expenses enable row level security;
grant select, insert, update, delete on public.school_fee_payments to authenticated;
grant select, insert, update, delete on public.school_expenses to authenticated;

drop policy if exists "School staff read fee payments" on public.school_fee_payments;
create policy "School staff read fee payments" on public.school_fee_payments
  for select to authenticated using (public.has_school_permission(org_id, 'fees'));
drop policy if exists "School staff manage fee payments" on public.school_fee_payments;
create policy "School staff manage fee payments" on public.school_fee_payments
  for all to authenticated using (public.has_school_permission(org_id, 'fees'))
  with check (public.has_school_permission(org_id, 'fees'));

drop policy if exists "School staff read expenses" on public.school_expenses;
create policy "School staff read expenses" on public.school_expenses
  for select to authenticated using (public.has_school_permission(org_id, 'expenses'));
drop policy if exists "School staff manage expenses" on public.school_expenses;
create policy "School staff manage expenses" on public.school_expenses
  for all to authenticated using (public.has_school_permission(org_id, 'expenses'))
  with check (public.has_school_permission(org_id, 'expenses'));
