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
  unique (org_id, id),
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
  knowledge_type text,
  is_compulsory boolean not null default true,
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
  color text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  unique (org_id, id)
);
alter table public.school_houses add column if not exists color text;
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

create table if not exists public.school_section_teachers (
  org_id uuid not null,
  section_id uuid not null,
  teacher_id uuid not null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  primary key (org_id, section_id, teacher_id),
  foreign key (org_id, section_id) references public.school_sections(org_id, id) on delete cascade,
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
        exists (select 1 from public.school_section_teachers ct where ct.org_id = target_org_id and ct.teacher_id = t.id)
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
        exists (select 1 from public.school_section_teachers ct join public.school_sections s on s.org_id = ct.org_id and s.id = ct.section_id where ct.org_id = target_org_id and s.class_id = target_class_id and ct.teacher_id = t.id)
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
        exists (select 1 from public.school_section_teachers ct where ct.org_id = target_org_id and ct.section_id = target_section_id and ct.teacher_id = t.id)
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
        exists (select 1 from public.school_section_teachers ct where ct.org_id = t.org_id and ct.section_id = s.section_id and ct.teacher_id = t.id)
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
alter table public.school_section_teachers enable row level security;
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
grant select, insert, update, delete on public.school_section_teachers to authenticated;
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

drop policy if exists "School users can read section teacher assignments" on public.school_section_teachers;
create policy "School users can read section teacher assignments" on public.school_section_teachers
  for select to authenticated using (
    public.has_school_permission(org_id, 'manage_school')
    or exists (select 1 from public.school_teachers t where t.org_id = school_section_teachers.org_id and t.id = school_section_teachers.teacher_id and t.user_id = auth.uid())
  );
drop policy if exists "School admins manage section teacher assignments" on public.school_section_teachers;
create policy "School admins manage section teacher assignments" on public.school_section_teachers
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

-- CRM workspaces are provisioned only for explicitly designated super admins;
-- organization ownership by itself never grants access to the sales CRM.
alter table public.profiles alter column role set default 'FRANCHISE_ADMIN';
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Users can update their own profile details" on public.profiles;
create policy "Users can update their own profile details" on public.profiles for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);
revoke update on public.profiles from anon, authenticated;
grant update (full_name, avatar_url) on public.profiles to authenticated;

create table if not exists public.crm_workspaces (
  id uuid primary key default uuid_generate_v4(),
  owner_user_id uuid not null unique references auth.users(id) on delete cascade,
  name text not null default 'Sales CRM',
  created_at timestamptz not null default timezone('utc'::text, now())
);
alter table public.crm_workspaces enable row level security;
revoke all on public.crm_workspaces from anon, authenticated;
create or replace function public.provision_crm_workspace_for_super_admin()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.role = 'SUPER_ADMIN' then
    insert into public.crm_workspaces (owner_user_id, name)
    values (new.id, coalesce(nullif(new.full_name, ''), 'Sales CRM'))
    on conflict (owner_user_id) do nothing;
  end if;
  return new;
end;
$$;
revoke all on function public.provision_crm_workspace_for_super_admin() from public;
drop trigger if exists profiles_provision_crm_workspace on public.profiles;
create trigger profiles_provision_crm_workspace after insert or update of role on public.profiles
  for each row execute function public.provision_crm_workspace_for_super_admin();
insert into public.crm_workspaces (owner_user_id, name)
select p.id, coalesce(nullif(p.full_name, ''), 'Sales CRM')
from public.profiles p
where p.role = 'SUPER_ADMIN'
on conflict (owner_user_id) do nothing;

create table if not exists public.crm_users (
  id uuid primary key default uuid_generate_v4(),
  crm_workspace_id uuid references public.crm_workspaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text not null,
  role text not null default 'CRM_MEMBER' check (role in ('CRM_MEMBER', 'CRM_ADMIN')),
  status text not null default 'PENDING' check (status in ('PENDING', 'ACTIVE')),
  invited_by uuid references auth.users(id) on delete set null,
  invited_by_email text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  unique (id, user_id)
);
alter table public.crm_users add column if not exists crm_workspace_id uuid references public.crm_workspaces(id) on delete cascade;
drop index if exists public.crm_users_email_unique;
drop index if exists public.crm_users_user_id_unique;
create unique index if not exists crm_users_workspace_email_unique on public.crm_users (lower(email));
create unique index if not exists crm_users_workspace_user_id_unique on public.crm_users (user_id) where user_id is not null;

create table if not exists public.crm_leads (
  id uuid primary key default uuid_generate_v4(),
  company_name text not null,
  contact_name text not null,
  email text,
  phone text,
  source text,
  status text not null default 'NEW' check (status in ('NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST')),
  next_follow_up date,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_by_email text,
  updated_by uuid references auth.users(id) on delete set null,
  updated_by_email text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);
alter table public.crm_leads add column if not exists owner_user_id uuid references auth.users(id) on delete set null;
alter table public.crm_leads add column if not exists campaign_id uuid;
alter table public.crm_leads drop constraint if exists crm_leads_status_check;
alter table public.crm_leads add constraint crm_leads_status_check check (status in ('NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST', 'CONVERTED'));

alter table public.crm_users drop constraint if exists crm_users_role_check;
alter table public.crm_users add constraint crm_users_role_check check (role in ('CRM_MEMBER', 'CRM_ADMIN', 'SALES_MANAGER', 'SALES_REP'));

create table if not exists public.crm_accounts (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  website text,
  industry text,
  phone text,
  email text,
  address text,
  notes text,
  owner_user_id uuid references auth.users(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);
create table if not exists public.crm_contacts (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  title text,
  email text,
  phone text,
  account_id uuid references public.crm_accounts(id) on delete set null,
  lead_id uuid references public.crm_leads(id) on delete set null,
  owner_user_id uuid references auth.users(id) on delete set null,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);
create table if not exists public.crm_deals (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  account_id uuid references public.crm_accounts(id) on delete set null,
  contact_id uuid references public.crm_contacts(id) on delete set null,
  lead_id uuid references public.crm_leads(id) on delete set null,
  value numeric(14,2) not null default 0,
  stage text not null default 'QUALIFICATION' check (stage in ('QUALIFICATION', 'NEEDS_ANALYSIS', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST')),
  probability integer not null default 20 check (probability between 0 and 100),
  close_date date,
  owner_user_id uuid references auth.users(id) on delete set null,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);
create table if not exists public.crm_activities (
  id uuid primary key default uuid_generate_v4(),
  kind text not null default 'TASK' check (kind in ('TASK', 'CALL', 'MEETING')),
  subject text not null,
  details text,
  due_at timestamptz,
  reminder_at timestamptz,
  completed_at timestamptz,
  lead_id uuid references public.crm_leads(id) on delete cascade,
  contact_id uuid references public.crm_contacts(id) on delete cascade,
  deal_id uuid references public.crm_deals(id) on delete cascade,
  owner_user_id uuid references auth.users(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);
create table if not exists public.crm_notes (
  id uuid primary key default uuid_generate_v4(),
  parent_type text not null check (parent_type in ('LEAD', 'CONTACT', 'ACCOUNT', 'DEAL')),
  parent_id uuid not null,
  body text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_by_email text,
  created_at timestamptz not null default timezone('utc'::text, now())
);
create table if not exists public.crm_campaigns (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  channel text not null default 'OTHER',
  status text not null default 'PLANNING' check (status in ('PLANNING', 'ACTIVE', 'COMPLETED')),
  start_date date,
  end_date date,
  budget numeric(14,2) not null default 0,
  owner_user_id uuid references auth.users(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);
alter table public.crm_leads drop constraint if exists crm_leads_campaign_id_fkey;
alter table public.crm_leads add constraint crm_leads_campaign_id_fkey foreign key (campaign_id) references public.crm_campaigns(id) on delete set null;
create table if not exists public.crm_automation_rules (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  enabled boolean not null default true,
  trigger_event text not null default 'LEAD_CREATED' check (trigger_event in ('LEAD_CREATED')),
  task_subject text not null,
  days_after integer not null default 1 check (days_after between 0 and 365),
  owner_user_id uuid references auth.users(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

-- Tenant stamp every row. Legacy data is associated with the workspace of its
-- creator/inviter; rows without a resolvable creator stay inaccessible (NULL).
alter table public.crm_leads add column if not exists crm_workspace_id uuid references public.crm_workspaces(id) on delete cascade;
alter table public.crm_accounts add column if not exists crm_workspace_id uuid references public.crm_workspaces(id) on delete cascade;
alter table public.crm_contacts add column if not exists crm_workspace_id uuid references public.crm_workspaces(id) on delete cascade;
alter table public.crm_deals add column if not exists crm_workspace_id uuid references public.crm_workspaces(id) on delete cascade;
alter table public.crm_activities add column if not exists crm_workspace_id uuid references public.crm_workspaces(id) on delete cascade;
alter table public.crm_notes add column if not exists crm_workspace_id uuid references public.crm_workspaces(id) on delete cascade;
alter table public.crm_campaigns add column if not exists crm_workspace_id uuid references public.crm_workspaces(id) on delete cascade;
alter table public.crm_automation_rules add column if not exists crm_workspace_id uuid references public.crm_workspaces(id) on delete cascade;

update public.crm_users cu set crm_workspace_id = w.id
from public.crm_workspaces w where cu.crm_workspace_id is null and cu.invited_by = w.owner_user_id;
update public.crm_leads r set crm_workspace_id = w.id from public.crm_workspaces w where r.crm_workspace_id is null and r.created_by = w.owner_user_id;
update public.crm_accounts r set crm_workspace_id = w.id from public.crm_workspaces w where r.crm_workspace_id is null and r.created_by = w.owner_user_id;
update public.crm_contacts r set crm_workspace_id = w.id from public.crm_workspaces w where r.crm_workspace_id is null and r.created_by = w.owner_user_id;
update public.crm_deals r set crm_workspace_id = w.id from public.crm_workspaces w where r.crm_workspace_id is null and r.created_by = w.owner_user_id;
update public.crm_activities r set crm_workspace_id = w.id from public.crm_workspaces w where r.crm_workspace_id is null and r.created_by = w.owner_user_id;
update public.crm_campaigns r set crm_workspace_id = w.id from public.crm_workspaces w where r.crm_workspace_id is null and r.created_by = w.owner_user_id;
update public.crm_automation_rules r set crm_workspace_id = w.id from public.crm_workspaces w where r.crm_workspace_id is null and r.created_by = w.owner_user_id;
update public.crm_leads r set crm_workspace_id = cu.crm_workspace_id from public.crm_users cu where r.crm_workspace_id is null and cu.user_id = r.created_by and cu.status = 'ACTIVE';
update public.crm_accounts r set crm_workspace_id = cu.crm_workspace_id from public.crm_users cu where r.crm_workspace_id is null and cu.user_id = r.created_by and cu.status = 'ACTIVE';
update public.crm_contacts r set crm_workspace_id = cu.crm_workspace_id from public.crm_users cu where r.crm_workspace_id is null and cu.user_id = r.created_by and cu.status = 'ACTIVE';
update public.crm_deals r set crm_workspace_id = cu.crm_workspace_id from public.crm_users cu where r.crm_workspace_id is null and cu.user_id = r.created_by and cu.status = 'ACTIVE';
update public.crm_activities r set crm_workspace_id = cu.crm_workspace_id from public.crm_users cu where r.crm_workspace_id is null and cu.user_id = r.created_by and cu.status = 'ACTIVE';
update public.crm_campaigns r set crm_workspace_id = cu.crm_workspace_id from public.crm_users cu where r.crm_workspace_id is null and cu.user_id = r.created_by and cu.status = 'ACTIVE';
update public.crm_automation_rules r set crm_workspace_id = cu.crm_workspace_id from public.crm_users cu where r.crm_workspace_id is null and cu.user_id = r.created_by and cu.status = 'ACTIVE';
update public.crm_notes n set crm_workspace_id = l.crm_workspace_id from public.crm_leads l where n.crm_workspace_id is null and n.parent_type = 'LEAD' and l.id = n.parent_id;
update public.crm_notes n set crm_workspace_id = a.crm_workspace_id from public.crm_accounts a where n.crm_workspace_id is null and n.parent_type = 'ACCOUNT' and a.id = n.parent_id;
update public.crm_notes n set crm_workspace_id = c.crm_workspace_id from public.crm_contacts c where n.crm_workspace_id is null and n.parent_type = 'CONTACT' and c.id = n.parent_id;
update public.crm_notes n set crm_workspace_id = d.crm_workspace_id from public.crm_deals d where n.crm_workspace_id is null and n.parent_type = 'DEAL' and d.id = n.parent_id;

create index if not exists crm_leads_workspace_idx on public.crm_leads (crm_workspace_id, updated_at desc);
create index if not exists crm_accounts_workspace_idx on public.crm_accounts (crm_workspace_id, updated_at desc);
create index if not exists crm_contacts_workspace_idx on public.crm_contacts (crm_workspace_id, updated_at desc);
create index if not exists crm_deals_workspace_idx on public.crm_deals (crm_workspace_id, updated_at desc);
create index if not exists crm_activities_workspace_idx on public.crm_activities (crm_workspace_id, due_at);
create index if not exists crm_notes_workspace_idx on public.crm_notes (crm_workspace_id, created_at desc);
create index if not exists crm_campaigns_workspace_idx on public.crm_campaigns (crm_workspace_id, created_at desc);
create index if not exists crm_automation_workspace_idx on public.crm_automation_rules (crm_workspace_id, created_at desc);

create or replace function public.crm_validate_workspace_relations()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_table_name in ('crm_leads', 'crm_accounts', 'crm_contacts', 'crm_deals', 'crm_activities', 'crm_campaigns', 'crm_automation_rules') then
    if new.owner_user_id is not null
      and not exists (select 1 from public.crm_workspaces where id = new.crm_workspace_id and owner_user_id = new.owner_user_id)
      and not exists (select 1 from public.crm_users where crm_workspace_id = new.crm_workspace_id and user_id = new.owner_user_id) then
      raise exception 'Record owner must belong to the same CRM workspace.';
    end if;
  end if;
  if tg_table_name = 'crm_leads' and new.campaign_id is not null and not exists (
    select 1 from public.crm_campaigns where id = new.campaign_id and crm_workspace_id = new.crm_workspace_id
  ) then raise exception 'Campaign must belong to the same CRM workspace.'; end if;
  if tg_table_name = 'crm_contacts' then
    if new.account_id is not null and not exists (select 1 from public.crm_accounts where id = new.account_id and crm_workspace_id = new.crm_workspace_id) then raise exception 'Account must belong to the same CRM workspace.'; end if;
    if new.lead_id is not null and not exists (select 1 from public.crm_leads where id = new.lead_id and crm_workspace_id = new.crm_workspace_id) then raise exception 'Lead must belong to the same CRM workspace.'; end if;
  end if;
  if tg_table_name = 'crm_deals' then
    if new.account_id is not null and not exists (select 1 from public.crm_accounts where id = new.account_id and crm_workspace_id = new.crm_workspace_id) then raise exception 'Account must belong to the same CRM workspace.'; end if;
    if new.contact_id is not null and not exists (select 1 from public.crm_contacts where id = new.contact_id and crm_workspace_id = new.crm_workspace_id) then raise exception 'Contact must belong to the same CRM workspace.'; end if;
    if new.lead_id is not null and not exists (select 1 from public.crm_leads where id = new.lead_id and crm_workspace_id = new.crm_workspace_id) then raise exception 'Lead must belong to the same CRM workspace.'; end if;
  end if;
  if tg_table_name = 'crm_activities' then
    if new.lead_id is not null and not exists (select 1 from public.crm_leads where id = new.lead_id and crm_workspace_id = new.crm_workspace_id) then raise exception 'Lead must belong to the same CRM workspace.'; end if;
    if new.contact_id is not null and not exists (select 1 from public.crm_contacts where id = new.contact_id and crm_workspace_id = new.crm_workspace_id) then raise exception 'Contact must belong to the same CRM workspace.'; end if;
    if new.deal_id is not null and not exists (select 1 from public.crm_deals where id = new.deal_id and crm_workspace_id = new.crm_workspace_id) then raise exception 'Deal must belong to the same CRM workspace.'; end if;
  end if;
  if tg_table_name = 'crm_notes' then
    if new.parent_type = 'LEAD' and not exists (select 1 from public.crm_leads where id = new.parent_id and crm_workspace_id = new.crm_workspace_id) then raise exception 'Note parent must belong to the same CRM workspace.'; end if;
    if new.parent_type = 'ACCOUNT' and not exists (select 1 from public.crm_accounts where id = new.parent_id and crm_workspace_id = new.crm_workspace_id) then raise exception 'Note parent must belong to the same CRM workspace.'; end if;
    if new.parent_type = 'CONTACT' and not exists (select 1 from public.crm_contacts where id = new.parent_id and crm_workspace_id = new.crm_workspace_id) then raise exception 'Note parent must belong to the same CRM workspace.'; end if;
    if new.parent_type = 'DEAL' and not exists (select 1 from public.crm_deals where id = new.parent_id and crm_workspace_id = new.crm_workspace_id) then raise exception 'Note parent must belong to the same CRM workspace.'; end if;
  end if;
  return new;
end;
$$;
revoke all on function public.crm_validate_workspace_relations() from public;
drop trigger if exists crm_leads_workspace_relations on public.crm_leads;
create trigger crm_leads_workspace_relations before insert or update of crm_workspace_id, campaign_id, owner_user_id on public.crm_leads for each row execute function public.crm_validate_workspace_relations();
drop trigger if exists crm_accounts_workspace_relations on public.crm_accounts;
create trigger crm_accounts_workspace_relations before insert or update of crm_workspace_id, owner_user_id on public.crm_accounts for each row execute function public.crm_validate_workspace_relations();
drop trigger if exists crm_contacts_workspace_relations on public.crm_contacts;
create trigger crm_contacts_workspace_relations before insert or update of crm_workspace_id, account_id, lead_id, owner_user_id on public.crm_contacts for each row execute function public.crm_validate_workspace_relations();
drop trigger if exists crm_deals_workspace_relations on public.crm_deals;
create trigger crm_deals_workspace_relations before insert or update of crm_workspace_id, account_id, contact_id, lead_id, owner_user_id on public.crm_deals for each row execute function public.crm_validate_workspace_relations();
drop trigger if exists crm_activities_workspace_relations on public.crm_activities;
create trigger crm_activities_workspace_relations before insert or update of crm_workspace_id, lead_id, contact_id, deal_id, owner_user_id on public.crm_activities for each row execute function public.crm_validate_workspace_relations();
drop trigger if exists crm_campaigns_workspace_relations on public.crm_campaigns;
create trigger crm_campaigns_workspace_relations before insert or update of crm_workspace_id, owner_user_id on public.crm_campaigns for each row execute function public.crm_validate_workspace_relations();
drop trigger if exists crm_automation_workspace_relations on public.crm_automation_rules;
create trigger crm_automation_workspace_relations before insert or update of crm_workspace_id, owner_user_id on public.crm_automation_rules for each row execute function public.crm_validate_workspace_relations();
drop trigger if exists crm_notes_workspace_relations on public.crm_notes;
create trigger crm_notes_workspace_relations before insert or update of crm_workspace_id, parent_type, parent_id on public.crm_notes for each row execute function public.crm_validate_workspace_relations();

create or replace function public.current_crm_workspace_id()
returns uuid language sql stable security definer set search_path = public as $$
  select coalesce(
    (select w.id from public.crm_workspaces w join public.profiles p on p.id = w.owner_user_id and p.role = 'SUPER_ADMIN' where w.owner_user_id = auth.uid() limit 1),
    (select cu.crm_workspace_id from public.crm_users cu where cu.user_id = auth.uid() and cu.status = 'ACTIVE' and cu.crm_workspace_id is not null limit 1)
  );
$$;
create or replace function public.is_crm_super_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.crm_workspaces w join public.profiles p on p.id = w.owner_user_id where w.owner_user_id = auth.uid() and p.role = 'SUPER_ADMIN');
$$;
create or replace function public.has_crm_access()
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_crm_super_admin() or (
    exists (select 1 from public.crm_users cu where cu.user_id = auth.uid() and cu.status = 'ACTIVE' and cu.crm_workspace_id = public.current_crm_workspace_id())
    and not exists (select 1 from public.organization_users ou where ou.user_id = auth.uid())
    and not exists (select 1 from public.school_teachers t where t.user_id = auth.uid())
    and not exists (select 1 from public.school_parents p where p.user_id = auth.uid())
  );
$$;
create or replace function public.is_crm_manager()
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_crm_access() and (public.is_crm_super_admin() or exists (
    select 1 from public.crm_users cu where cu.user_id = auth.uid() and cu.status = 'ACTIVE' and cu.crm_workspace_id = public.current_crm_workspace_id() and cu.role in ('CRM_ADMIN', 'SALES_MANAGER')
  ));
$$;
create or replace function public.can_manage_crm_record(target_workspace_id uuid, target_owner_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_crm_access() and target_workspace_id = public.current_crm_workspace_id()
    and (public.is_crm_manager() or target_owner_user_id is null or target_owner_user_id = auth.uid());
$$;
create or replace function public.can_access_crm_note(target_parent_type text, target_parent_id uuid)
returns boolean language plpgsql stable security definer set search_path = public as $$
declare target_owner uuid;
begin
  if target_parent_type = 'LEAD' then select owner_user_id into target_owner from public.crm_leads where id = target_parent_id and crm_workspace_id = public.current_crm_workspace_id();
  elsif target_parent_type = 'ACCOUNT' then select owner_user_id into target_owner from public.crm_accounts where id = target_parent_id and crm_workspace_id = public.current_crm_workspace_id();
  elsif target_parent_type = 'CONTACT' then select owner_user_id into target_owner from public.crm_contacts where id = target_parent_id and crm_workspace_id = public.current_crm_workspace_id();
  elsif target_parent_type = 'DEAL' then select owner_user_id into target_owner from public.crm_deals where id = target_parent_id and crm_workspace_id = public.current_crm_workspace_id();
  else return false;
  end if;
  if not found then return false; end if;
  return public.can_manage_crm_record(public.current_crm_workspace_id(), target_owner);
end;
$$;

create or replace function public.can_manage_crm_record(target_owner_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.can_manage_crm_record(public.current_crm_workspace_id(), target_owner_user_id);
$$;

revoke all on function public.current_crm_workspace_id() from public;
grant execute on function public.current_crm_workspace_id() to authenticated;

create index if not exists crm_leads_owner_status_idx on public.crm_leads (owner_user_id, status);
create index if not exists crm_deals_owner_stage_idx on public.crm_deals (owner_user_id, stage);
create index if not exists crm_activities_due_idx on public.crm_activities (owner_user_id, due_at, completed_at);
create index if not exists crm_contacts_account_idx on public.crm_contacts (account_id);
create index if not exists crm_notes_parent_idx on public.crm_notes (parent_type, parent_id, created_at desc);
alter table public.crm_accounts enable row level security;
alter table public.crm_contacts enable row level security;
alter table public.crm_deals enable row level security;
alter table public.crm_activities enable row level security;
alter table public.crm_notes enable row level security;
alter table public.crm_campaigns enable row level security;
alter table public.crm_automation_rules enable row level security;
grant select, insert, update, delete on public.crm_accounts, public.crm_contacts, public.crm_deals, public.crm_activities, public.crm_notes, public.crm_campaigns, public.crm_automation_rules to authenticated;
drop policy if exists "CRM users manage accounts" on public.crm_accounts;
create policy "CRM users manage accounts" on public.crm_accounts for all to authenticated using (public.can_manage_crm_record(owner_user_id)) with check (public.can_manage_crm_record(owner_user_id));
drop policy if exists "CRM users manage contacts" on public.crm_contacts;
create policy "CRM users manage contacts" on public.crm_contacts for all to authenticated using (public.can_manage_crm_record(owner_user_id)) with check (public.can_manage_crm_record(owner_user_id));
drop policy if exists "CRM users manage deals" on public.crm_deals;
create policy "CRM users manage deals" on public.crm_deals for all to authenticated using (public.can_manage_crm_record(owner_user_id)) with check (public.can_manage_crm_record(owner_user_id));
drop policy if exists "CRM users manage activities" on public.crm_activities;
create policy "CRM users manage activities" on public.crm_activities for all to authenticated using (public.can_manage_crm_record(owner_user_id)) with check (public.can_manage_crm_record(owner_user_id));
drop policy if exists "CRM users manage notes" on public.crm_notes;
create policy "CRM users manage notes" on public.crm_notes for all to authenticated using (public.can_access_crm_note(parent_type, parent_id)) with check (public.can_access_crm_note(parent_type, parent_id));
drop policy if exists "CRM users manage campaigns" on public.crm_campaigns;
drop policy if exists "CRM users read campaigns" on public.crm_campaigns;
drop policy if exists "CRM managers manage campaigns" on public.crm_campaigns;
create policy "CRM users read campaigns" on public.crm_campaigns for select to authenticated using (public.has_crm_access());
create policy "CRM managers manage campaigns" on public.crm_campaigns for all to authenticated using (public.is_crm_manager()) with check (public.is_crm_manager());
drop policy if exists "CRM users manage automation rules" on public.crm_automation_rules;
create policy "CRM users manage automation rules" on public.crm_automation_rules for all to authenticated using (public.is_crm_super_admin()) with check (public.is_crm_super_admin());

drop trigger if exists crm_accounts_updated_at on public.crm_accounts;
create trigger crm_accounts_updated_at before update on public.crm_accounts for each row execute function public.set_school_updated_at();
drop trigger if exists crm_contacts_updated_at on public.crm_contacts;
create trigger crm_contacts_updated_at before update on public.crm_contacts for each row execute function public.set_school_updated_at();
drop trigger if exists crm_deals_updated_at on public.crm_deals;
create trigger crm_deals_updated_at before update on public.crm_deals for each row execute function public.set_school_updated_at();
drop trigger if exists crm_activities_updated_at on public.crm_activities;
create trigger crm_activities_updated_at before update on public.crm_activities for each row execute function public.set_school_updated_at();
drop trigger if exists crm_campaigns_updated_at on public.crm_campaigns;
create trigger crm_campaigns_updated_at before update on public.crm_campaigns for each row execute function public.set_school_updated_at();
drop trigger if exists crm_automation_rules_updated_at on public.crm_automation_rules;
create trigger crm_automation_rules_updated_at before update on public.crm_automation_rules for each row execute function public.set_school_updated_at();
create index if not exists crm_leads_status_follow_up_idx on public.crm_leads (status, next_follow_up);
create index if not exists crm_leads_created_at_idx on public.crm_leads (created_at desc);
drop trigger if exists crm_leads_updated_at on public.crm_leads;
create trigger crm_leads_updated_at before update on public.crm_leads for each row execute function public.set_school_updated_at();

revoke all on function public.is_crm_super_admin() from public;
revoke all on function public.has_crm_access() from public;
revoke all on function public.is_crm_manager() from public;
revoke all on function public.can_manage_crm_record(uuid) from public;
revoke all on function public.can_access_crm_note(text, uuid) from public;
revoke all on function public.can_manage_crm_record(uuid, uuid) from public;
grant execute on function public.is_crm_super_admin() to authenticated;
grant execute on function public.has_crm_access() to authenticated;
grant execute on function public.is_crm_manager() to authenticated;
grant execute on function public.can_manage_crm_record(uuid) to authenticated;
grant execute on function public.can_manage_crm_record(uuid, uuid) to authenticated;
grant execute on function public.can_access_crm_note(text, uuid) to authenticated;

alter table public.crm_users enable row level security;
alter table public.crm_leads enable row level security;
grant select, insert, update, delete on public.crm_users to authenticated;
grant select, insert, update, delete on public.crm_leads to authenticated;
drop policy if exists "CRM members can read own membership" on public.crm_users;
create policy "CRM members can read own membership" on public.crm_users for select to authenticated
  using (crm_workspace_id = public.current_crm_workspace_id() and (user_id = auth.uid() or public.is_crm_super_admin()));
drop policy if exists "Super admins manage CRM memberships" on public.crm_users;
create policy "Super admins manage CRM memberships" on public.crm_users for all to authenticated
  using (crm_workspace_id = public.current_crm_workspace_id() and public.is_crm_super_admin())
  with check (crm_workspace_id = public.current_crm_workspace_id() and public.is_crm_super_admin());
drop policy if exists "CRM users manage sales leads" on public.crm_leads;
create policy "CRM users manage sales leads" on public.crm_leads for all to authenticated
  using (public.can_manage_crm_record(crm_workspace_id, owner_user_id)) with check (public.can_manage_crm_record(crm_workspace_id, owner_user_id));
drop policy if exists "CRM users manage accounts" on public.crm_accounts;
create policy "CRM users manage accounts" on public.crm_accounts for all to authenticated
  using (public.can_manage_crm_record(crm_workspace_id, owner_user_id)) with check (public.can_manage_crm_record(crm_workspace_id, owner_user_id));
drop policy if exists "CRM users manage contacts" on public.crm_contacts;
create policy "CRM users manage contacts" on public.crm_contacts for all to authenticated
  using (public.can_manage_crm_record(crm_workspace_id, owner_user_id)) with check (public.can_manage_crm_record(crm_workspace_id, owner_user_id));
drop policy if exists "CRM users manage deals" on public.crm_deals;
create policy "CRM users manage deals" on public.crm_deals for all to authenticated
  using (public.can_manage_crm_record(crm_workspace_id, owner_user_id)) with check (public.can_manage_crm_record(crm_workspace_id, owner_user_id));
drop policy if exists "CRM users manage activities" on public.crm_activities;
create policy "CRM users manage activities" on public.crm_activities for all to authenticated
  using (public.can_manage_crm_record(crm_workspace_id, owner_user_id)) with check (public.can_manage_crm_record(crm_workspace_id, owner_user_id));
drop policy if exists "CRM users manage notes" on public.crm_notes;
create policy "CRM users manage notes" on public.crm_notes for all to authenticated
  using (crm_workspace_id = public.current_crm_workspace_id() and public.can_access_crm_note(parent_type, parent_id))
  with check (crm_workspace_id = public.current_crm_workspace_id() and public.can_access_crm_note(parent_type, parent_id));
drop policy if exists "CRM users read campaigns" on public.crm_campaigns;
create policy "CRM users read campaigns" on public.crm_campaigns for select to authenticated
  using (crm_workspace_id = public.current_crm_workspace_id() and public.has_crm_access());
drop policy if exists "CRM managers manage campaigns" on public.crm_campaigns;
create policy "CRM managers manage campaigns" on public.crm_campaigns for all to authenticated
  using (crm_workspace_id = public.current_crm_workspace_id() and public.is_crm_manager())
  with check (crm_workspace_id = public.current_crm_workspace_id() and public.is_crm_manager());
drop policy if exists "CRM users manage automation rules" on public.crm_automation_rules;
create policy "CRM users manage automation rules" on public.crm_automation_rules for all to authenticated
  using (crm_workspace_id = public.current_crm_workspace_id() and public.is_crm_super_admin())
  with check (crm_workspace_id = public.current_crm_workspace_id() and public.is_crm_super_admin());


create table if not exists public.school_attendance (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  student_id uuid not null,
  class_id uuid not null,
  section_id uuid not null,
  date date not null,
  status text not null check (status in ('PRESENT', 'ABSENT', 'LATE', 'HALF_DAY')),
  notes text,
  recorded_by uuid,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  unique (org_id, student_id, date)
);
create index if not exists school_attendance_org_class_section_date_idx on public.school_attendance (org_id, class_id, section_id, date);

alter table public.school_attendance enable row level security;
grant select, insert, update, delete on public.school_attendance to authenticated;

drop policy if exists "School staff can manage attendance" on public.school_attendance;
create policy "School staff can manage attendance" on public.school_attendance
  for all to authenticated
  using (public.has_school_permission(org_id, 'manage_school') or public.has_school_permission(org_id, 'attendance') or public.has_school_permission(org_id, 'teacher'))
  with check (public.has_school_permission(org_id, 'manage_school') or public.has_school_permission(org_id, 'attendance') or public.has_school_permission(org_id, 'teacher'));


create table if not exists public.school_fee_structures (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  amount numeric not null check (amount >= 0),
  frequency text not null default 'MONTHLY', -- MONTHLY, YEARLY, ONCE
  target_type text not null default 'ALL', -- ALL, CLASS, STUDENT, FAMILY, GROUP
  target_class_id uuid references public.school_classes(id) on delete cascade,
  description text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists school_fee_structures_org_idx on public.school_fee_structures (org_id);

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
  for all using (
    exists (
      select 1 from public.organization_users
      where organization_users.org_id = school_fee_structures.org_id
      and organization_users.user_id = auth.uid()
      and organization_users.status = 'ACTIVE'
    )
  );

drop policy if exists "School staff manage fee assignments" on public.school_student_fee_assignments;
create policy "School staff manage fee assignments" on public.school_student_fee_assignments
  for all using (
    exists (
      select 1 from public.organization_users
      where organization_users.org_id = school_student_fee_assignments.org_id
      and organization_users.user_id = auth.uid()
      and organization_users.status = 'ACTIVE'
    )
  );
