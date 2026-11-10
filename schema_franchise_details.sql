-- Optional commercial and payment information for franchise records.
-- Safe to run on existing databases; all fields may remain NULL.
alter table public.organizations add column if not exists franchise_month text;
alter table public.organizations add column if not exists franchise_year integer;
alter table public.organizations add column if not exists payment_date date;
alter table public.organizations add column if not exists model text;
alter table public.organizations add column if not exists closure_by text;
alter table public.organizations add column if not exists city text;
alter table public.organizations add column if not exists state text;
alter table public.organizations add column if not exists authorization_code text;
alter table public.organizations add column if not exists client_name text;
alter table public.organizations add column if not exists client_number text;
alter table public.organizations add column if not exists franchise_fee numeric(12,2);
alter table public.organizations add column if not exists gst numeric(12,2);
alter table public.organizations add column if not exists total_franchise_fee numeric(12,2);
alter table public.organizations add column if not exists amount_received numeric(12,2);
alter table public.organizations add column if not exists confirmation text;
alter table public.organizations add column if not exists transaction_details text;
alter table public.organizations add column if not exists incentive_amount numeric(12,2);
alter table public.organizations add column if not exists transaction_date date;
alter table public.organizations add column if not exists manager_name text;
alter table public.organizations add column if not exists manager_amount numeric(12,2);
