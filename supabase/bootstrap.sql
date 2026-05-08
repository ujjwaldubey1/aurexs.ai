-- Jewellery ERP Supabase Bootstrap
-- Run in Supabase SQL Editor.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('OWNER', 'MANAGER', 'STAFF', 'KARIGAR');
  end if;
  if not exists (select 1 from pg_type where typname = 'metal_type') then
    create type public.metal_type as enum ('GOLD', 'SILVER', 'DIAMOND');
  end if;
  if not exists (select 1 from pg_type where typname = 'item_status') then
    create type public.item_status as enum ('IN_STOCK', 'WITH_KARIGAR', 'ON_APPROVAL', 'IN_REPAIR', 'SOLD', 'RETURNED_TO_SUPPLIER');
  end if;
  if not exists (select 1 from pg_type where typname = 'transaction_type') then
    create type public.transaction_type as enum ('SALE', 'PURCHASE', 'REPAIR', 'PAYMENT_IN', 'PAYMENT_OUT', 'STATUS_CHANGE');
  end if;
  if not exists (select 1 from pg_type where typname = 'party_type') then
    create type public.party_type as enum ('CUSTOMER', 'SUPPLIER', 'KARIGAR', 'LEDGER_ACCOUNT');
  end if;
  if not exists (select 1 from pg_type where typname = 'payment_mode') then
    create type public.payment_mode as enum ('CASH', 'BANK_TRANSFER', 'CARD', 'UPI', 'MIXED');
  end if;
  if not exists (select 1 from pg_type where typname = 'ledger_account_type') then
    create type public.ledger_account_type as enum ('ASSET', 'LIABILITY', 'INCOME', 'EXPENSE', 'EQUITY');
  end if;
  if not exists (select 1 from pg_type where typname = 'karigar_job_status') then
    create type public.karigar_job_status as enum ('OPEN', 'CLOSED', 'CANCELLED');
  end if;
  if not exists (select 1 from pg_type where typname = 'repair_status') then
    create type public.repair_status as enum ('RECEIVED', 'ASSIGNED', 'IN_PROGRESS', 'READY', 'DELIVERED', 'CANCELLED');
  end if;
end $$;

create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  gstin varchar(15),
  address text,
  logo_url text,
  "plan" text not null default 'core',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  auth_user_id uuid unique,
  name text not null,
  phone varchar(20) not null,
  role public.user_role not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  item_code text not null,
  category text not null,
  metal public.metal_type not null,
  gross_wt numeric(18,3) not null,
  net_wt numeric(18,3) not null,
  purity numeric(5,2) not null,
  making_charges numeric(18,2) not null default 0,
  rate_at_purchase numeric(18,2),
  status public.item_status not null default 'IN_STOCK',
  location text,
  hsn_code varchar(8),
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, item_code)
);

create table if not exists public.karigars (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  phone varchar(20),
  address text,
  skill text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.karigar_jobs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  karigar_id uuid not null references public.karigars(id) on delete restrict,
  metal public.metal_type not null,
  issued_wt numeric(18,3) not null,
  issued_purity numeric(5,2) not null,
  returned_wt numeric(18,3),
  returned_purity numeric(5,2),
  wastage_agreed numeric(5,2),
  status public.karigar_job_status not null default 'OPEN',
  opened_at timestamptz not null default now(),
  closed_at timestamptz
);

create table if not exists public.karigar_job_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  job_id uuid not null references public.karigar_jobs(id) on delete cascade,
  item_id uuid not null references public.items(id) on delete restrict,
  unique (job_id, item_id)
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  phone varchar(20) not null,
  email text,
  address text,
  anniversary date,
  dob date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  phone varchar(20),
  gstin varchar(15),
  address text,
  balance numeric(18,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  type public.transaction_type not null,
  party_type public.party_type,
  party_id uuid,
  total_amount numeric(18,2) not null,
  payment_mode public.payment_mode,
  notes text,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.transaction_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  transaction_id uuid not null references public.transactions(id) on delete cascade,
  item_id uuid references public.items(id) on delete set null,
  gross_wt numeric(18,3),
  purity numeric(5,2),
  rate numeric(18,2),
  making_charges numeric(18,2),
  amount numeric(18,2) not null
);

create table if not exists public.ledger_accounts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  type public.ledger_account_type not null,
  parent_id uuid references public.ledger_accounts(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, name)
);

create table if not exists public.ledger_entries (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  account_id uuid not null references public.ledger_accounts(id) on delete restrict,
  debit numeric(18,2) not null default 0,
  credit numeric(18,2) not null default 0,
  narration text,
  transaction_id uuid references public.transactions(id) on delete set null,
  entry_date date not null default current_date
);

create table if not exists public.gold_rates (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  rate_date date not null default current_date,
  metal public.metal_type not null,
  purity numeric(5,2) not null,
  rate_per_gram numeric(18,2) not null,
  source text,
  created_at timestamptz not null default now()
);

create table if not exists public.repairs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete restrict,
  karigar_id uuid references public.karigars(id) on delete set null,
  description text not null,
  photo_urls text[] not null default '{}',
  charge numeric(18,2),
  status public.repair_status not null default 'RECEIVED',
  received_at timestamptz not null default now(),
  promised_at timestamptz,
  delivered_at timestamptz
);

create index if not exists idx_items_tenant_status on public.items(tenant_id, status);
create index if not exists idx_karigar_jobs_tenant_status on public.karigar_jobs(tenant_id, status);
create index if not exists idx_transactions_tenant_type_created on public.transactions(tenant_id, type, created_at desc);
create index if not exists idx_ledger_entries_tenant_date on public.ledger_entries(tenant_id, entry_date desc);
create index if not exists idx_customers_tenant_phone on public.customers(tenant_id, phone);
create index if not exists idx_gold_rates_tenant_date on public.gold_rates(tenant_id, rate_date desc);

drop trigger if exists trg_tenants_updated_at on public.tenants;
create trigger trg_tenants_updated_at before update on public.tenants for each row execute function public.set_updated_at();
drop trigger if exists trg_users_updated_at on public.users;
create trigger trg_users_updated_at before update on public.users for each row execute function public.set_updated_at();
drop trigger if exists trg_items_updated_at on public.items;
create trigger trg_items_updated_at before update on public.items for each row execute function public.set_updated_at();
drop trigger if exists trg_karigars_updated_at on public.karigars;
create trigger trg_karigars_updated_at before update on public.karigars for each row execute function public.set_updated_at();
drop trigger if exists trg_customers_updated_at on public.customers;
create trigger trg_customers_updated_at before update on public.customers for each row execute function public.set_updated_at();
drop trigger if exists trg_suppliers_updated_at on public.suppliers;
create trigger trg_suppliers_updated_at before update on public.suppliers for each row execute function public.set_updated_at();
drop trigger if exists trg_ledger_accounts_updated_at on public.ledger_accounts;
create trigger trg_ledger_accounts_updated_at before update on public.ledger_accounts for each row execute function public.set_updated_at();

-- Lock down and grant explicitly for Data API.
revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;

grant usage on schema public to anon, authenticated;
grant select on table public.gold_rates to anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;

-- Enable RLS on all exposed tables.
alter table public.tenants enable row level security;
alter table public.users enable row level security;
alter table public.items enable row level security;
alter table public.karigars enable row level security;
alter table public.karigar_jobs enable row level security;
alter table public.karigar_job_items enable row level security;
alter table public.customers enable row level security;
alter table public.suppliers enable row level security;
alter table public.transactions enable row level security;
alter table public.transaction_items enable row level security;
alter table public.ledger_accounts enable row level security;
alter table public.ledger_entries enable row level security;
alter table public.gold_rates enable row level security;
alter table public.repairs enable row level security;

-- RLS helper: tenant comes from auth.users.app_metadata. Never use user_metadata.
create or replace function public.current_tenant_id()
returns uuid
language sql
stable
as $$
  select nullif(auth.jwt() -> 'app_metadata' ->> 'tenant_id', '')::uuid;
$$;

-- Per-tenant policies.
drop policy if exists tenant_isolation_tenants on public.tenants;
create policy tenant_isolation_tenants on public.tenants for all to authenticated using (id = public.current_tenant_id()) with check (id = public.current_tenant_id());

drop policy if exists tenant_isolation_users on public.users;
create policy tenant_isolation_users on public.users for all to authenticated using (tenant_id = public.current_tenant_id()) with check (tenant_id = public.current_tenant_id());

drop policy if exists tenant_isolation_items on public.items;
create policy tenant_isolation_items on public.items for all to authenticated using (tenant_id = public.current_tenant_id()) with check (tenant_id = public.current_tenant_id());

drop policy if exists tenant_isolation_karigars on public.karigars;
create policy tenant_isolation_karigars on public.karigars for all to authenticated using (tenant_id = public.current_tenant_id()) with check (tenant_id = public.current_tenant_id());

drop policy if exists tenant_isolation_karigar_jobs on public.karigar_jobs;
create policy tenant_isolation_karigar_jobs on public.karigar_jobs for all to authenticated using (tenant_id = public.current_tenant_id()) with check (tenant_id = public.current_tenant_id());

drop policy if exists tenant_isolation_karigar_job_items on public.karigar_job_items;
create policy tenant_isolation_karigar_job_items on public.karigar_job_items for all to authenticated using (tenant_id = public.current_tenant_id()) with check (tenant_id = public.current_tenant_id());

drop policy if exists tenant_isolation_customers on public.customers;
create policy tenant_isolation_customers on public.customers for all to authenticated using (tenant_id = public.current_tenant_id()) with check (tenant_id = public.current_tenant_id());

drop policy if exists tenant_isolation_suppliers on public.suppliers;
create policy tenant_isolation_suppliers on public.suppliers for all to authenticated using (tenant_id = public.current_tenant_id()) with check (tenant_id = public.current_tenant_id());

drop policy if exists tenant_isolation_transactions on public.transactions;
create policy tenant_isolation_transactions on public.transactions for all to authenticated using (tenant_id = public.current_tenant_id()) with check (tenant_id = public.current_tenant_id());

drop policy if exists tenant_isolation_transaction_items on public.transaction_items;
create policy tenant_isolation_transaction_items on public.transaction_items for all to authenticated using (tenant_id = public.current_tenant_id()) with check (tenant_id = public.current_tenant_id());

drop policy if exists tenant_isolation_ledger_accounts on public.ledger_accounts;
create policy tenant_isolation_ledger_accounts on public.ledger_accounts for all to authenticated using (tenant_id = public.current_tenant_id()) with check (tenant_id = public.current_tenant_id());

drop policy if exists tenant_isolation_ledger_entries on public.ledger_entries;
create policy tenant_isolation_ledger_entries on public.ledger_entries for all to authenticated using (tenant_id = public.current_tenant_id()) with check (tenant_id = public.current_tenant_id());

drop policy if exists tenant_isolation_gold_rates on public.gold_rates;
create policy tenant_isolation_gold_rates on public.gold_rates for all to authenticated using (tenant_id = public.current_tenant_id()) with check (tenant_id = public.current_tenant_id());

drop policy if exists tenant_isolation_repairs on public.repairs;
create policy tenant_isolation_repairs on public.repairs for all to authenticated using (tenant_id = public.current_tenant_id()) with check (tenant_id = public.current_tenant_id());

-- Optional public read for latest rates.
drop policy if exists anon_read_gold_rates on public.gold_rates;
create policy anon_read_gold_rates on public.gold_rates for select to anon using (true);
