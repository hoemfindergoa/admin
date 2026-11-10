-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Organizations (Franchises) Table
create table if not exists public.organizations (
    id uuid default uuid_generate_v4() primary key,
    owner_id uuid references auth.users(id) on delete cascade not null,
    name text not null,
    affiliation text,
    session_start_date date,
    session_end_date date,
    course_type text, -- 'Pre Primary', 'Primary', 'Middle School', 'Secondary School', 'Senior Secondary School'
    email text,
    phone text,
    address text,
    logo_url text,
    franchise_month text,
    franchise_year integer,
    payment_date date,
    model text,
    closure_by text,
    city text,
    state text,
    authorization_code text,
    client_name text,
    client_number text,
    franchise_fee numeric(12,2),
    gst numeric(12,2),
    total_franchise_fee numeric(12,2),
    amount_received numeric(12,2),
    confirmation text,
    transaction_details text,
    incentive_amount numeric(12,2),
    transaction_date date,
    manager_name text,
    manager_amount numeric(12,2),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.organizations enable row level security;

-- RLS Policies for Organizations
-- Super Admins (owners) can view their own organizations
create policy "Users can view their own organizations"
on public.organizations for select
using ( auth.uid() = owner_id );

-- Super Admins (owners) can insert their own organizations
create policy "Users can insert their own organizations"
on public.organizations for insert
with check ( auth.uid() = owner_id );

-- Super Admins (owners) can update their own organizations
create policy "Users can update their own organizations"
on public.organizations for update
using ( auth.uid() = owner_id );

-- Super Admins (owners) can delete their own organizations
create policy "Users can delete their own organizations"
on public.organizations for delete
using ( auth.uid() = owner_id );

-- Function to handle new user signup (Optional, if we want to store user details in a profiles table)
create table if not exists public.profiles (
    id uuid references auth.users(id) on delete cascade primary key,
    full_name text,
    avatar_url text,
    role text not null default 'FRANCHISE_ADMIN', -- CRM access must be granted explicitly by a trusted administrator
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
on public.profiles for select
using ( auth.uid() = id );

create policy "Users can update their own profile details"
on public.profiles for update to authenticated
using ( auth.uid() = id ) with check ( auth.uid() = id );
revoke update on public.profiles from anon, authenticated;
grant update (full_name, avatar_url) on public.profiles to authenticated;
