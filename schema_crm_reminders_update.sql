-- Upgrade existing CRM databases so lead reminders can store their scheduled time.
alter table public.crm_activities
  add column if not exists reminder_at timestamptz;

create index if not exists crm_activities_workspace_reminder_idx
  on public.crm_activities (crm_workspace_id, reminder_at)
  where reminder_at is not null;
