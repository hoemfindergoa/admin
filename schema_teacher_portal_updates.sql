-- Teacher homework and motivation notes shown to the parents of students in the target class/section.
-- Run after schema_school_management.sql.
create table if not exists public.school_class_updates (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  class_id uuid not null,
  section_id uuid,
  teacher_id uuid not null,
  kind text not null check (kind in ('HOMEWORK', 'MOTIVATION')),
  title text not null,
  body text not null,
  due_date date,
  created_at timestamptz not null default timezone('utc'::text, now()),
  foreign key (org_id, class_id) references public.school_classes(org_id, id) on delete cascade,
  foreign key (org_id, class_id, section_id) references public.school_sections(org_id, class_id, id) on delete cascade,
  foreign key (org_id, teacher_id) references public.school_teachers(org_id, id) on delete cascade
);
create index if not exists school_class_updates_target_date_idx
  on public.school_class_updates (org_id, class_id, section_id, created_at desc);

-- Ensure attendance exists before applying the teacher-scoped attendance policy.
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

create index if not exists school_attendance_org_class_section_date_idx
  on public.school_attendance (org_id, class_id, section_id, date);

alter table public.school_attendance enable row level security;
grant select, insert, update, delete on public.school_attendance to authenticated;

create or replace function public.teacher_has_class(target_org_id uuid, target_class_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.school_teachers t
    where t.org_id = target_org_id and t.user_id = auth.uid() and t.status = 'ACTIVE'
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
    where t.org_id = target_org_id and t.user_id = auth.uid() and t.status = 'ACTIVE'
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
    where t.org_id = target_org_id and t.user_id = auth.uid() and t.status = 'ACTIVE' and s.id = target_subject_id
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

grant execute on function public.teacher_has_class(uuid, uuid) to authenticated;
grant execute on function public.teacher_has_section(uuid, uuid, uuid) to authenticated;
grant execute on function public.teacher_has_subject(uuid, uuid) to authenticated;
grant execute on function public.teacher_has_student(uuid, uuid) to authenticated;

create or replace function public.parent_has_student(target_org_id uuid, target_student_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.school_parents p join public.school_parent_students ps on ps.org_id = p.org_id and ps.parent_id = p.id
    where p.org_id = target_org_id and p.user_id = auth.uid() and p.status = 'ACTIVE' and ps.student_id = target_student_id
  );
$$;
grant execute on function public.parent_has_student(uuid, uuid) to authenticated;

drop policy if exists "School users can read classes" on public.school_classes;
create policy "School users can read classes" on public.school_classes
  for select to authenticated using (
    public.has_school_permission(org_id, 'manage_school')
    or public.has_school_permission(org_id, 'students')
    or public.teacher_has_class(org_id, id)
    or exists (select 1 from public.students s where s.org_id = school_classes.org_id and s.class_id = school_classes.id and public.parent_has_student(s.org_id, s.id))
  );

drop policy if exists "School users can read sections" on public.school_sections;
create policy "School users can read sections" on public.school_sections
  for select to authenticated using (
    public.has_school_permission(org_id, 'manage_school')
    or public.has_school_permission(org_id, 'students')
    or public.teacher_has_section(org_id, class_id, id)
    or exists (select 1 from public.students s where s.org_id = school_sections.org_id and s.class_id = school_sections.class_id and s.section_id = school_sections.id and public.parent_has_student(s.org_id, s.id))
  );

drop policy if exists "School staff can manage attendance" on public.school_attendance;
create policy "School staff can manage attendance" on public.school_attendance
  for all to authenticated
  using (
    public.has_school_permission(org_id, 'manage_school')
    or public.has_school_permission(org_id, 'attendance')
    or (public.has_school_permission(org_id, 'teacher') and public.teacher_has_section(org_id, class_id, section_id))
  )
  with check (
    public.has_school_permission(org_id, 'manage_school')
    or public.has_school_permission(org_id, 'attendance')
    or (public.has_school_permission(org_id, 'teacher') and public.teacher_has_section(org_id, class_id, section_id))
  );

alter table public.school_class_updates enable row level security;
grant select, insert, update, delete on public.school_class_updates to authenticated;
drop policy if exists "School members read class updates" on public.school_class_updates;
create policy "School members read class updates" on public.school_class_updates
  for select to authenticated using (
    public.has_school_permission(org_id, 'manage_school')
    or (
      public.has_school_permission(org_id, 'teacher')
      and public.teacher_has_class(org_id, class_id)
      and (section_id is null or public.teacher_has_section(org_id, class_id, section_id))
    )
    or exists (
      select 1 from public.students s
      where s.org_id = school_class_updates.org_id
        and s.class_id = school_class_updates.class_id
        and (school_class_updates.section_id is null or s.section_id = school_class_updates.section_id)
        and public.parent_has_student(s.org_id, s.id)
    )
  );
drop policy if exists "Teachers publish class updates" on public.school_class_updates;
create policy "Teachers publish class updates" on public.school_class_updates
  for insert to authenticated with check (
    public.has_school_permission(org_id, 'manage_school')
    or (
      public.has_school_permission(org_id, 'teacher')
      and public.teacher_has_class(org_id, class_id)
      and section_id is not null
      and public.teacher_has_section(org_id, class_id, section_id)
      and exists (select 1 from public.school_teachers t where t.org_id = school_class_updates.org_id and t.id = school_class_updates.teacher_id and t.user_id = auth.uid() and t.status = 'ACTIVE')
    )
  );
drop policy if exists "School admins manage class updates" on public.school_class_updates;
create policy "School admins manage class updates" on public.school_class_updates
  for all to authenticated using (public.has_school_permission(org_id, 'manage_school'))
  with check (public.has_school_permission(org_id, 'manage_school'));

drop policy if exists "Teachers and parents can read messages" on public.school_parent_messages;
create policy "Teachers and parents can read messages" on public.school_parent_messages
  for select to authenticated using (
    public.has_school_permission(org_id, 'manage_school')
    or (public.teacher_has_student(org_id, student_id) and exists (select 1 from public.school_teachers t where t.org_id = school_parent_messages.org_id and t.user_id = auth.uid() and t.status = 'ACTIVE'))
    or (public.parent_has_student(org_id, student_id) and exists (select 1 from public.school_parents p where p.org_id = school_parent_messages.org_id and p.id = school_parent_messages.parent_id and p.user_id = auth.uid() and p.status = 'ACTIVE'))
  );
drop policy if exists "Teachers and parents can send messages" on public.school_parent_messages;
create policy "Teachers and parents can send messages" on public.school_parent_messages
  for insert to authenticated with check (
    (sender_role = 'TEACHER' and public.teacher_has_student(org_id, student_id) and exists (select 1 from public.school_teachers t where t.org_id = school_parent_messages.org_id and t.id = school_parent_messages.teacher_id and t.user_id = auth.uid() and t.status = 'ACTIVE'))
    or (sender_role = 'PARENT' and public.parent_has_student(org_id, student_id) and exists (select 1 from public.school_parents p where p.org_id = school_parent_messages.org_id and p.id = school_parent_messages.parent_id and p.user_id = auth.uid() and p.status = 'ACTIVE'))
  );
