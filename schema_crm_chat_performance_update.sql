-- Team chat messages stay private to server-authorized CRM workspace conversations.
alter table public.crm_activities
  add column if not exists reminder_at timestamptz;

create index if not exists crm_activities_workspace_reminder_idx
  on public.crm_activities (crm_workspace_id, reminder_at)
  where reminder_at is not null;

create table if not exists public.crm_team_messages (
  id uuid primary key default uuid_generate_v4(),
  crm_workspace_id uuid not null references public.crm_workspaces(id) on delete cascade,
  sender_user_id uuid not null references auth.users(id) on delete cascade,
  recipient_user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default timezone('utc'::text, now()),
  read_at timestamptz,
  check (sender_user_id <> recipient_user_id)
);
create index if not exists crm_team_messages_thread_idx
  on public.crm_team_messages (crm_workspace_id, sender_user_id, recipient_user_id, created_at);
create index if not exists crm_team_messages_recipient_idx
  on public.crm_team_messages (crm_workspace_id, recipient_user_id, read_at);
alter table public.crm_team_messages enable row level security;

-- Weekly performance is based on actual assignment and successful-close events.
create table if not exists public.crm_lead_performance_events (
  id uuid primary key default uuid_generate_v4(),
  crm_workspace_id uuid not null references public.crm_workspaces(id) on delete cascade,
  lead_id uuid not null references public.crm_leads(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  event_type text not null check (event_type in ('ASSIGNED', 'CLOSED')),
  assigned_to_user_id uuid references auth.users(id) on delete set null,
  status text,
  created_at timestamptz not null default timezone('utc'::text, now())
);
create index if not exists crm_lead_performance_workspace_created_idx
  on public.crm_lead_performance_events (crm_workspace_id, created_at desc);
create index if not exists crm_lead_performance_user_type_idx
  on public.crm_lead_performance_events (crm_workspace_id, assigned_to_user_id, event_type, created_at desc);
alter table public.crm_lead_performance_events enable row level security;
