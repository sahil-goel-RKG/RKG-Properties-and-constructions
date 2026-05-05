-- CRM minimal schema (internal-only)
-- Apply in Supabase SQL editor.

create extension if not exists "pgcrypto";

create table if not exists public.crm_import_batches (
  id uuid primary key default gen_random_uuid(),
  filename text not null,
  uploaded_by_clerk_user_id text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.crm_leads (
  id uuid primary key default gen_random_uuid(),
  import_batch_id uuid references public.crm_import_batches(id) on delete set null,
  -- From CSV: "Excel Name" (store as-is)
  excel_name text,
  -- Upload/CSV date (if CSV "DATE" missing, we set upload date)
  lead_date date not null default current_date,
  -- From CSV: "Source"
  source text,
  -- From CSV: "Location"
  location text,
  customer_name text not null,
  phone text,
  phone_normalized text,
  -- From CSV: "Initial Assesment" (Warm/Cold/Hot)
  initial_assessment text,
  -- From CSV: "Projects Interested"
  projects_interested text,
  -- From CSV: "UC/ RTM" (UC or RTM)
  uc_rtm text,
  -- From CSV: "Has the Client Agreed to Walk - in?" (YES/NO)
  agreed_walk_in text,
  -- From CSV: "End Use/ Investment" (End Use/Investment)
  end_use_investment text,
  -- From CSV: "Follow UP" (date)
  follow_up_date date,
  remarks text,
  -- Assigned to: store a human-friendly name for small teams.
  assigned_to_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- IMPORTANT:
-- This must be a non-partial unique index so Upsert(onConflict: 'phone_normalized') works.
-- Postgres allows multiple NULLs in a unique index, so missing phones remain insertable.
create unique index if not exists crm_leads_phone_normalized_unique
  on public.crm_leads(phone_normalized);

create index if not exists crm_leads_created_at_idx on public.crm_leads(created_at desc);
create index if not exists crm_leads_customer_name_idx on public.crm_leads(customer_name);
create index if not exists crm_leads_source_idx on public.crm_leads(source);
create index if not exists crm_leads_location_idx on public.crm_leads(location);
create index if not exists crm_leads_excel_name_idx on public.crm_leads(excel_name);
create index if not exists crm_leads_lead_date_idx on public.crm_leads(lead_date desc);
create index if not exists crm_leads_initial_assessment_idx on public.crm_leads(initial_assessment);

-- Keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_crm_leads_updated_at on public.crm_leads;
create trigger set_crm_leads_updated_at
before update on public.crm_leads
for each row execute function public.set_updated_at();

-- Security note:
-- This app is intended to access via server using SUPABASE_SERVICE_ROLE_KEY.
-- If you later want client-side access, enable RLS and add policies.

