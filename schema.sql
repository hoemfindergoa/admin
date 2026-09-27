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
    role text default 'SUPER_ADMIN', -- Default to SUPER_ADMIN when they sign up to create a franchise
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
on public.profiles for select
using ( auth.uid() = id );

create policy "Users can update their own profile"
on public.profiles for update
using ( auth.uid() = id );
