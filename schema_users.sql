-- Organization Users (Staff & Franchise Admins) Table
create table if not exists public.organization_users (
    id uuid default uuid_generate_v4() primary key,
    org_id uuid references public.organizations(id) on delete cascade not null,
    user_id uuid references auth.users(id) on delete cascade, -- Nullable initially until the user accepts the invite
    email text not null,
    name text not null,
    phone text,
    role text default 'STAFF', -- 'FRANCHISE_ADMIN' or 'STAFF'
    permissions jsonb default '[]'::jsonb, -- Array of allowed sidebar modules, e.g. ["students", "attendance", "fees"]
    status text default 'PENDING', -- 'PENDING', 'ACTIVE'
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(org_id, email)
);

-- Enable RLS
alter table public.organization_users enable row level security;

-- Super Admins (organization owners) can manage users in their orgs
create policy "Owners can manage users in their organizations"
on public.organization_users for all
using (
    exists (
        select 1 from public.organizations o 
        where o.id = organization_users.org_id 
        and o.owner_id = auth.uid()
    )
);

-- Users can read their own permissions
create policy "Users can view their own permissions"
on public.organization_users for select
using ( auth.uid() = user_id );
