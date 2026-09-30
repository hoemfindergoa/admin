-- Sales CRM schema and tenant-isolation migration.
-- Apply schema.sql first because CRM workspaces are attached to organizations.

create extension if not exists "uuid-ossp";

-- A workspace belongs to exactly one organization. The organization owner is its
-- CRM super admin; no user can create or access another organization's workspace.
create table if not exists public.crm_workspaces (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null unique references public.organizations(id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Sales CRM',
  created_at timestamptz not null default timezone('utc'::text, now())
);
alter table public.crm_workspaces add column if not exists organization_id uuid references public.organizations(id) on delete cascade;
alter table public.crm_workspaces add column if not exists owner_user_id uuid references auth.users(id) on delete cascade;
alter table public.crm_workspaces add column if not exists name text;
alter table public.crm_workspaces add column if not exists created_at timestamptz not null default timezone('utc'::text, now());
alter table public.crm_workspaces drop constraint if exists crm_workspaces_owner_user_id_key;
create unique index if not exists crm_workspaces_organization_unique
  on public.crm_workspaces (organization_id) where organization_id is not null;

-- Legacy workspaces are only connected automatically where an owner has exactly
-- one organization. Ambiguous records stay unassigned and are not exposed.
with single_owner_org as (
  select owner_id, min(id::text)::uuid as organization_id
  from public.organizations
  group by owner_id
  having count(*) = 1
)
update public.crm_workspaces workspace
set organization_id = candidate.organization_id
from single_owner_org candidate
where workspace.organization_id is null
  and workspace.owner_user_id = candidate.owner_id;

create or replace function public.crm_validate_workspace_owner()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.organization_id is not null and not exists (
    select 1 from public.organizations organization
    where organization.id = new.organization_id
      and organization.owner_id = new.owner_user_id
  ) then
    raise exception 'A CRM workspace owner must own its organization.';
  end if;
  return new;
end;
$$;
revoke all on function public.crm_validate_workspace_owner() from public;
drop trigger if exists crm_workspace_owner_check on public.crm_workspaces;
create trigger crm_workspace_owner_check
before insert or update of organization_id, owner_user_id on public.crm_workspaces
for each row execute function public.crm_validate_workspace_owner();

create table if not exists public.crm_users (
  id uuid primary key default uuid_generate_v4(),
  crm_workspace_id uuid references public.crm_workspaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text not null,
  role text not null default 'SALES_REP',
  status text not null default 'PENDING',
  invited_by uuid references auth.users(id) on delete set null,
  invited_by_email text,
  created_at timestamptz not null default timezone('utc'::text, now())
);
alter table public.crm_users add column if not exists crm_workspace_id uuid references public.crm_workspaces(id) on delete cascade;
alter table public.crm_users add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table public.crm_users add column if not exists name text;
alter table public.crm_users add column if not exists email text;
alter table public.crm_users add column if not exists role text not null default 'SALES_REP';
alter table public.crm_users add column if not exists status text not null default 'PENDING';
alter table public.crm_users add column if not exists invited_by uuid references auth.users(id) on delete set null;
alter table public.crm_users add column if not exists invited_by_email text;
alter table public.crm_users add column if not exists created_at timestamptz not null default timezone('utc'::text, now());
alter table public.crm_users drop constraint if exists crm_users_role_check;
alter table public.crm_users add constraint crm_users_role_check
  check (role in ('CRM_ADMIN', 'SALES_MANAGER', 'SALES_REP'));
alter table public.crm_users drop constraint if exists crm_users_status_check;
alter table public.crm_users add constraint crm_users_status_check
  check (status in ('PENDING', 'ACTIVE', 'SUSPENDED'));
drop index if exists public.crm_users_email_unique;
drop index if exists public.crm_users_user_id_unique;
drop index if exists public.crm_users_workspace_email_unique;
drop index if exists public.crm_users_workspace_user_id_unique;
create unique index if not exists crm_users_workspace_email_unique
  on public.crm_users (crm_workspace_id, lower(email))
  where crm_workspace_id is not null;
create unique index if not exists crm_users_workspace_user_id_unique
  on public.crm_users (crm_workspace_id, user_id)
  where crm_workspace_id is not null and user_id is not null;

create table if not exists public.crm_leads (
  id uuid primary key default uuid_generate_v4(),
  crm_workspace_id uuid references public.crm_workspaces(id) on delete cascade,
  company_name text not null,
  contact_name text not null,
  email text,
  phone text,
  source text,
  status text not null default 'NEW',
  next_follow_up date,
  notes text,
  owner_user_id uuid references auth.users(id) on delete set null,
  campaign_id uuid,
  created_by uuid references auth.users(id) on delete set null,
  created_by_email text,
  updated_by uuid references auth.users(id) on delete set null,
  updated_by_email text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);
alter table public.crm_leads add column if not exists crm_workspace_id uuid references public.crm_workspaces(id) on delete cascade;
alter table public.crm_leads add column if not exists owner_user_id uuid references auth.users(id) on delete set null;
alter table public.crm_leads add column if not exists campaign_id uuid;
alter table public.crm_leads drop constraint if exists crm_leads_status_check;
alter table public.crm_leads add constraint crm_leads_status_check
  check (status in ('NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST', 'CONVERTED'));

create table if not exists public.crm_accounts (
  id uuid primary key default uuid_generate_v4(),
  crm_workspace_id uuid references public.crm_workspaces(id) on delete cascade,
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
alter table public.crm_accounts add column if not exists crm_workspace_id uuid references public.crm_workspaces(id) on delete cascade;

create table if not exists public.crm_contacts (
  id uuid primary key default uuid_generate_v4(),
  crm_workspace_id uuid references public.crm_workspaces(id) on delete cascade,
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
alter table public.crm_contacts add column if not exists crm_workspace_id uuid references public.crm_workspaces(id) on delete cascade;

create table if not exists public.crm_deals (
  id uuid primary key default uuid_generate_v4(),
  crm_workspace_id uuid references public.crm_workspaces(id) on delete cascade,
  name text not null,
  account_id uuid references public.crm_accounts(id) on delete set null,
  contact_id uuid references public.crm_contacts(id) on delete set null,
  lead_id uuid references public.crm_leads(id) on delete set null,
  value numeric(14,2) not null default 0,
  stage text not null default 'QUALIFICATION',
  probability integer not null default 20,
  close_date date,
  owner_user_id uuid references auth.users(id) on delete set null,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  check (stage in ('QUALIFICATION', 'NEEDS_ANALYSIS', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST')),
  check (probability between 0 and 100)
);
alter table public.crm_deals add column if not exists crm_workspace_id uuid references public.crm_workspaces(id) on delete cascade;

create table if not exists public.crm_activities (
  id uuid primary key default uuid_generate_v4(),
  crm_workspace_id uuid references public.crm_workspaces(id) on delete cascade,
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
alter table public.crm_activities add column if not exists crm_workspace_id uuid references public.crm_workspaces(id) on delete cascade;

create table if not exists public.crm_notes (
  id uuid primary key default uuid_generate_v4(),
  crm_workspace_id uuid references public.crm_workspaces(id) on delete cascade,
  parent_type text not null check (parent_type in ('LEAD', 'CONTACT', 'ACCOUNT', 'DEAL')),
  parent_id uuid not null,
  body text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_by_email text,
  created_at timestamptz not null default timezone('utc'::text, now())
);
alter table public.crm_notes add column if not exists crm_workspace_id uuid references public.crm_workspaces(id) on delete cascade;

create table if not exists public.crm_campaigns (
  id uuid primary key default uuid_generate_v4(),
  crm_workspace_id uuid references public.crm_workspaces(id) on delete cascade,
  name text not null,
  channel text not null default 'OTHER',
  status text not null default 'PLANNING',
  start_date date,
  end_date date,
  budget numeric(14,2) not null default 0,
  owner_user_id uuid references auth.users(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  check (status in ('PLANNING', 'ACTIVE', 'COMPLETED'))
);
alter table public.crm_campaigns add column if not exists crm_workspace_id uuid references public.crm_workspaces(id) on delete cascade;
alter table public.crm_leads drop constraint if exists crm_leads_campaign_id_fkey;
alter table public.crm_leads add constraint crm_leads_campaign_id_fkey
  foreign key (campaign_id) references public.crm_campaigns(id) on delete set null;

create table if not exists public.crm_automation_rules (
  id uuid primary key default uuid_generate_v4(),
  crm_workspace_id uuid references public.crm_workspaces(id) on delete cascade,
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
alter table public.crm_automation_rules add column if not exists crm_workspace_id uuid references public.crm_workspaces(id) on delete cascade;

-- Safely associate legacy membership and data only when one destination exists.
with one_workspace_per_owner as (
  select owner_user_id, min(id::text)::uuid as crm_workspace_id
  from public.crm_workspaces
  where organization_id is not null
  group by owner_user_id
  having count(*) = 1
)
update public.crm_users member
set crm_workspace_id = candidate.crm_workspace_id
from one_workspace_per_owner candidate
where member.crm_workspace_id is null
  and member.invited_by = candidate.owner_user_id;

with one_workspace_per_creator as (
  select user_id, min(crm_workspace_id::text)::uuid as crm_workspace_id
  from public.crm_users
  where user_id is not null and status = 'ACTIVE' and crm_workspace_id is not null
  group by user_id
  having count(*) = 1
)
update public.crm_leads row
set crm_workspace_id = member.crm_workspace_id
from one_workspace_per_creator member
where row.crm_workspace_id is null
  and row.created_by = member.user_id;

with one_workspace_per_owner as (
  select owner_user_id, min(id::text)::uuid as crm_workspace_id
  from public.crm_workspaces
  where organization_id is not null
  group by owner_user_id
  having count(*) = 1
)
update public.crm_leads row
set crm_workspace_id = owner.crm_workspace_id
from one_workspace_per_owner owner
where row.crm_workspace_id is null
  and row.created_by = owner.owner_user_id;

-- Legacy rows whose workspace cannot be proved are intentionally left unassigned.
-- They are denied by RLS and excluded by server queries until reviewed.

update public.crm_notes note
set crm_workspace_id = lead.crm_workspace_id
from public.crm_leads lead
where note.crm_workspace_id is null and note.parent_type = 'LEAD' and note.parent_id = lead.id;
update public.crm_notes note
set crm_workspace_id = account.crm_workspace_id
from public.crm_accounts account
where note.crm_workspace_id is null and note.parent_type = 'ACCOUNT' and note.parent_id = account.id;
update public.crm_notes note
set crm_workspace_id = contact.crm_workspace_id
from public.crm_contacts contact
where note.crm_workspace_id is null and note.parent_type = 'CONTACT' and note.parent_id = contact.id;
update public.crm_notes note
set crm_workspace_id = deal.crm_workspace_id
from public.crm_deals deal
where note.crm_workspace_id is null and note.parent_type = 'DEAL' and note.parent_id = deal.id;

create index if not exists crm_leads_workspace_updated_idx on public.crm_leads (crm_workspace_id, updated_at desc);
create index if not exists crm_accounts_workspace_updated_idx on public.crm_accounts (crm_workspace_id, updated_at desc);
create index if not exists crm_contacts_workspace_updated_idx on public.crm_contacts (crm_workspace_id, updated_at desc);
create index if not exists crm_deals_workspace_updated_idx on public.crm_deals (crm_workspace_id, updated_at desc);
create index if not exists crm_activities_workspace_due_idx on public.crm_activities (crm_workspace_id, due_at);
create index if not exists crm_notes_workspace_created_idx on public.crm_notes (crm_workspace_id, created_at desc);
create index if not exists crm_campaigns_workspace_created_idx on public.crm_campaigns (crm_workspace_id, created_at desc);
create index if not exists crm_automation_workspace_created_idx on public.crm_automation_rules (crm_workspace_id, created_at desc);

create or replace function public.set_crm_updated_at()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;
revoke all on function public.set_crm_updated_at() from public;

create or replace function public.crm_can_access_workspace(target_workspace_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.crm_workspaces workspace
    join public.organizations organization on organization.id = workspace.organization_id
    where workspace.id = target_workspace_id and organization.owner_id = auth.uid()
  ) or exists (
    select 1 from public.crm_users member
    where member.crm_workspace_id = target_workspace_id
      and member.user_id = auth.uid()
      and member.status = 'ACTIVE'
  );
$$;

create or replace function public.crm_is_workspace_owner(target_workspace_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.crm_workspaces workspace
    join public.organizations organization on organization.id = workspace.organization_id
    where workspace.id = target_workspace_id and organization.owner_id = auth.uid()
  );
$$;

create or replace function public.crm_is_workspace_manager(target_workspace_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.crm_is_workspace_owner(target_workspace_id) or exists (
    select 1 from public.crm_users member
    where member.crm_workspace_id = target_workspace_id
      and member.user_id = auth.uid()
      and member.status = 'ACTIVE'
      and member.role in ('CRM_ADMIN', 'SALES_MANAGER')
  );
$$;

create or replace function public.crm_can_manage_record(target_workspace_id uuid, target_owner_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.crm_can_access_workspace(target_workspace_id)
    and (public.crm_is_workspace_manager(target_workspace_id)
      or target_owner_user_id is null
      or target_owner_user_id = auth.uid());
$$;

create or replace function public.crm_can_access_note(target_workspace_id uuid, target_parent_type text, target_parent_id uuid)
returns boolean language plpgsql stable security definer set search_path = public as $$
declare target_owner uuid;
begin
  if target_parent_type = 'LEAD' then
    select owner_user_id into target_owner from public.crm_leads
    where id = target_parent_id and crm_workspace_id = target_workspace_id;
  elsif target_parent_type = 'ACCOUNT' then
    select owner_user_id into target_owner from public.crm_accounts
    where id = target_parent_id and crm_workspace_id = target_workspace_id;
  elsif target_parent_type = 'CONTACT' then
    select owner_user_id into target_owner from public.crm_contacts
    where id = target_parent_id and crm_workspace_id = target_workspace_id;
  elsif target_parent_type = 'DEAL' then
    select owner_user_id into target_owner from public.crm_deals
    where id = target_parent_id and crm_workspace_id = target_workspace_id;
  else
    return false;
  end if;
  if not found then return false; end if;
  return public.crm_can_manage_record(target_workspace_id, target_owner);
end;
$$;

create or replace function public.crm_validate_workspace_relations()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'UPDATE' and new.crm_workspace_id is distinct from old.crm_workspace_id then
    raise exception 'CRM records cannot be moved between workspaces.';
  end if;
  if tg_table_name in ('crm_leads', 'crm_accounts', 'crm_contacts', 'crm_deals', 'crm_activities', 'crm_campaigns', 'crm_automation_rules')
    and new.owner_user_id is not null
    and not public.crm_is_workspace_owner(new.crm_workspace_id)
    and not exists (
      select 1 from public.crm_users member
      where member.crm_workspace_id = new.crm_workspace_id
        and member.user_id = new.owner_user_id
        and member.status = 'ACTIVE'
    ) then
    raise exception 'Record owner must belong to the same CRM workspace.';
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
  if tg_table_name = 'crm_notes' and not public.crm_can_access_note(new.crm_workspace_id, new.parent_type, new.parent_id) then
    raise exception 'Note parent must belong to the same CRM workspace.';
  end if;
  return new;
end;
$$;

drop trigger if exists crm_leads_workspace_relations on public.crm_leads;
create trigger crm_leads_workspace_relations before insert or update of crm_workspace_id, campaign_id, owner_user_id on public.crm_leads
for each row execute function public.crm_validate_workspace_relations();
drop trigger if exists crm_accounts_workspace_relations on public.crm_accounts;
create trigger crm_accounts_workspace_relations before insert or update of crm_workspace_id, owner_user_id on public.crm_accounts
for each row execute function public.crm_validate_workspace_relations();
drop trigger if exists crm_contacts_workspace_relations on public.crm_contacts;
create trigger crm_contacts_workspace_relations before insert or update of crm_workspace_id, account_id, lead_id, owner_user_id on public.crm_contacts
for each row execute function public.crm_validate_workspace_relations();
drop trigger if exists crm_deals_workspace_relations on public.crm_deals;
create trigger crm_deals_workspace_relations before insert or update of crm_workspace_id, account_id, contact_id, lead_id, owner_user_id on public.crm_deals
for each row execute function public.crm_validate_workspace_relations();
drop trigger if exists crm_activities_workspace_relations on public.crm_activities;
create trigger crm_activities_workspace_relations before insert or update of crm_workspace_id, lead_id, contact_id, deal_id, owner_user_id on public.crm_activities
for each row execute function public.crm_validate_workspace_relations();
drop trigger if exists crm_campaigns_workspace_relations on public.crm_campaigns;
create trigger crm_campaigns_workspace_relations before insert or update of crm_workspace_id, owner_user_id on public.crm_campaigns
for each row execute function public.crm_validate_workspace_relations();
drop trigger if exists crm_automation_workspace_relations on public.crm_automation_rules;
create trigger crm_automation_workspace_relations before insert or update of crm_workspace_id, owner_user_id on public.crm_automation_rules
for each row execute function public.crm_validate_workspace_relations();
drop trigger if exists crm_notes_workspace_relations on public.crm_notes;
create trigger crm_notes_workspace_relations before insert or update of crm_workspace_id, parent_type, parent_id on public.crm_notes
for each row execute function public.crm_validate_workspace_relations();

drop trigger if exists crm_leads_updated_at on public.crm_leads;
create trigger crm_leads_updated_at before update on public.crm_leads for each row execute function public.set_crm_updated_at();
drop trigger if exists crm_accounts_updated_at on public.crm_accounts;
create trigger crm_accounts_updated_at before update on public.crm_accounts for each row execute function public.set_crm_updated_at();
drop trigger if exists crm_contacts_updated_at on public.crm_contacts;
create trigger crm_contacts_updated_at before update on public.crm_contacts for each row execute function public.set_crm_updated_at();
drop trigger if exists crm_deals_updated_at on public.crm_deals;
create trigger crm_deals_updated_at before update on public.crm_deals for each row execute function public.set_crm_updated_at();
drop trigger if exists crm_activities_updated_at on public.crm_activities;
create trigger crm_activities_updated_at before update on public.crm_activities for each row execute function public.set_crm_updated_at();
drop trigger if exists crm_campaigns_updated_at on public.crm_campaigns;
create trigger crm_campaigns_updated_at before update on public.crm_campaigns for each row execute function public.set_crm_updated_at();
drop trigger if exists crm_automation_rules_updated_at on public.crm_automation_rules;
create trigger crm_automation_rules_updated_at before update on public.crm_automation_rules for each row execute function public.set_crm_updated_at();

alter table public.crm_workspaces enable row level security;
alter table public.crm_users enable row level security;
alter table public.crm_leads enable row level security;
alter table public.crm_accounts enable row level security;
alter table public.crm_contacts enable row level security;
alter table public.crm_deals enable row level security;
alter table public.crm_activities enable row level security;
alter table public.crm_notes enable row level security;
alter table public.crm_campaigns enable row level security;
alter table public.crm_automation_rules enable row level security;

grant select on public.crm_workspaces to authenticated;
grant select, insert, update, delete on public.crm_users, public.crm_leads, public.crm_accounts, public.crm_contacts, public.crm_deals, public.crm_activities, public.crm_notes, public.crm_campaigns, public.crm_automation_rules to authenticated;

drop policy if exists "CRM workspace access" on public.crm_workspaces;
create policy "CRM workspace access" on public.crm_workspaces for select to authenticated
  using (public.crm_can_access_workspace(id));
drop policy if exists "CRM members can read workspace members" on public.crm_users;
drop policy if exists "CRM members can read own membership" on public.crm_users;
create policy "CRM members can read workspace members" on public.crm_users for select to authenticated
  using (public.crm_can_access_workspace(crm_workspace_id));
drop policy if exists "CRM owners manage workspace members" on public.crm_users;
drop policy if exists "Super admins manage CRM memberships" on public.crm_users;
create policy "CRM owners manage workspace members" on public.crm_users for all to authenticated
  using (public.crm_is_workspace_owner(crm_workspace_id))
  with check (public.crm_is_workspace_owner(crm_workspace_id));

drop policy if exists "CRM users manage sales leads" on public.crm_leads;
create policy "CRM users manage sales leads" on public.crm_leads for all to authenticated
  using (public.crm_can_manage_record(crm_workspace_id, owner_user_id))
  with check (public.crm_can_manage_record(crm_workspace_id, owner_user_id));
drop policy if exists "CRM users manage accounts" on public.crm_accounts;
create policy "CRM users manage accounts" on public.crm_accounts for all to authenticated
  using (public.crm_can_manage_record(crm_workspace_id, owner_user_id))
  with check (public.crm_can_manage_record(crm_workspace_id, owner_user_id));
drop policy if exists "CRM users manage contacts" on public.crm_contacts;
create policy "CRM users manage contacts" on public.crm_contacts for all to authenticated
  using (public.crm_can_manage_record(crm_workspace_id, owner_user_id))
  with check (public.crm_can_manage_record(crm_workspace_id, owner_user_id));
drop policy if exists "CRM users manage deals" on public.crm_deals;
create policy "CRM users manage deals" on public.crm_deals for all to authenticated
  using (public.crm_can_manage_record(crm_workspace_id, owner_user_id))
  with check (public.crm_can_manage_record(crm_workspace_id, owner_user_id));
drop policy if exists "CRM users manage activities" on public.crm_activities;
create policy "CRM users manage activities" on public.crm_activities for all to authenticated
  using (public.crm_can_manage_record(crm_workspace_id, owner_user_id))
  with check (public.crm_can_manage_record(crm_workspace_id, owner_user_id));
drop policy if exists "CRM users manage notes" on public.crm_notes;
create policy "CRM users manage notes" on public.crm_notes for all to authenticated
  using (public.crm_can_access_note(crm_workspace_id, parent_type, parent_id))
  with check (public.crm_can_access_note(crm_workspace_id, parent_type, parent_id));
drop policy if exists "CRM users read campaigns" on public.crm_campaigns;
create policy "CRM users read campaigns" on public.crm_campaigns for select to authenticated
  using (public.crm_can_access_workspace(crm_workspace_id));
drop policy if exists "CRM managers manage campaigns" on public.crm_campaigns;
create policy "CRM managers manage campaigns" on public.crm_campaigns for all to authenticated
  using (public.crm_is_workspace_manager(crm_workspace_id))
  with check (public.crm_is_workspace_manager(crm_workspace_id));
drop policy if exists "CRM users manage automation rules" on public.crm_automation_rules;
create policy "CRM owners manage automation rules" on public.crm_automation_rules for all to authenticated
  using (public.crm_is_workspace_owner(crm_workspace_id))
  with check (public.crm_is_workspace_owner(crm_workspace_id));

revoke all on function public.crm_can_access_workspace(uuid) from public;
revoke all on function public.crm_is_workspace_owner(uuid) from public;
revoke all on function public.crm_is_workspace_manager(uuid) from public;
revoke all on function public.crm_can_manage_record(uuid, uuid) from public;
revoke all on function public.crm_can_access_note(uuid, text, uuid) from public;
revoke all on function public.crm_validate_workspace_relations() from public;
grant execute on function public.crm_can_access_workspace(uuid) to authenticated;
grant execute on function public.crm_is_workspace_owner(uuid) to authenticated;
grant execute on function public.crm_is_workspace_manager(uuid) to authenticated;
grant execute on function public.crm_can_manage_record(uuid, uuid) to authenticated;
grant execute on function public.crm_can_access_note(uuid, text, uuid) to authenticated;

-- Auto-provision CRM workspaces for all new organizations
create or replace function public.provision_crm_workspace_for_organization()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.crm_workspaces (organization_id, owner_user_id, name)
  values (new.id, new.owner_id, new.name || ' CRM')
  on conflict (organization_id) do nothing;
  return new;
end;
$$;
revoke all on function public.provision_crm_workspace_for_organization() from public;
drop trigger if exists provision_crm_workspace_after_org_insert on public.organizations;
create trigger provision_crm_workspace_after_org_insert
after insert on public.organizations
for each row execute function public.provision_crm_workspace_for_organization();

-- Backfill missing CRM workspaces for existing organizations
insert into public.crm_workspaces (organization_id, owner_user_id, name)
select id, owner_id, name || ' CRM'
from public.organizations
where not exists (
  select 1 from public.crm_workspaces where crm_workspaces.organization_id = organizations.id
) on conflict do nothing;
