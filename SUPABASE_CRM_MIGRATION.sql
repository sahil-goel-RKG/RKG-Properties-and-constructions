-- CRM migration: align DB columns with CSV fields + UI dropdowns
-- Apply in Supabase SQL editor (safe to re-run).

-- Rename columns to match your business terms
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema='public' and table_name='crm_leads' and column_name='sm_name'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema='public' and table_name='crm_leads' and column_name='source'
  ) then
    alter table public.crm_leads rename column sm_name to source;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema='public' and table_name='crm_leads' and column_name='status'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema='public' and table_name='crm_leads' and column_name='initial_assessment'
  ) then
    alter table public.crm_leads rename column status to initial_assessment;
  end if;
end $$;

-- Add missing fields from CSV/UI
alter table public.crm_leads
  add column if not exists excel_name text,
  add column if not exists lead_date date not null default current_date,
  add column if not exists location text,
  add column if not exists projects_interested text,
  add column if not exists uc_rtm text,
  add column if not exists agreed_walk_in text,
  add column if not exists end_use_investment text,
  add column if not exists bhk_interested_in text,
  add column if not exists follow_up_date date,
  add column if not exists follow_up_time time,
  -- Set when a personal WhatsApp follow-up reminder was sent (CallMeBot)
  add column if not exists follow_up_whatsapp_reminded_at timestamptz;

-- Employees table (for consistent assignment dropdown)
create table if not exists public.crm_employees (
  employee_id text primary key,
  name text not null,
  created_at timestamptz not null default now()
);

-- Leads: optional FK to employees
alter table public.crm_leads
  add column if not exists assigned_to_employee_id text;

-- Normalize any existing assignment IDs (defensive cleanup)
update public.crm_leads
set assigned_to_employee_id = nullif(btrim(assigned_to_employee_id), '')
where assigned_to_employee_id is not null;

-- Backfill assigned_to_employee_id from assigned_to_name (for older rows)
update public.crm_leads l
set assigned_to_employee_id = e.employee_id
from public.crm_employees e
where (l.assigned_to_employee_id is null or btrim(l.assigned_to_employee_id) = '')
  and l.assigned_to_name is not null
  and lower(btrim(l.assigned_to_name)) = lower(btrim(e.name));

do $$
begin
  if not exists (
    select 1
    from information_schema.table_constraints
    where constraint_schema='public'
      and table_name='crm_leads'
      and constraint_name='crm_leads_assigned_to_employee_id_fkey'
  ) then
    alter table public.crm_leads
      add constraint crm_leads_assigned_to_employee_id_fkey
      foreign key (assigned_to_employee_id) references public.crm_employees(employee_id)
      on delete set null;
  end if;
end $$;

-- Optional: constrain dropdown-like columns (kept permissive with NOT VALID)
do $$
begin
  -- If the constraint exists with older allowed values (e.g. 'hot'), replace it.
  if exists (select 1 from pg_constraint where conname='crm_leads_initial_assessment_check') then
    alter table public.crm_leads drop constraint crm_leads_initial_assessment_check;
  end if;
  alter table public.crm_leads
    add constraint crm_leads_initial_assessment_check
    check (initial_assessment is null or initial_assessment in ('warm','cold','running','closed')) not valid;

  if not exists (select 1 from pg_constraint where conname='crm_leads_uc_rtm_check') then
    alter table public.crm_leads
      add constraint crm_leads_uc_rtm_check
      check (uc_rtm is null or uc_rtm in ('UC','RTM')) not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname='crm_leads_agreed_walk_in_check') then
    alter table public.crm_leads
      add constraint crm_leads_agreed_walk_in_check
      check (agreed_walk_in is null or agreed_walk_in in ('YES','NO')) not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname='crm_leads_end_use_investment_check') then
    alter table public.crm_leads
      add constraint crm_leads_end_use_investment_check
      check (end_use_investment is null or end_use_investment in ('End Use','Investment')) not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname='crm_leads_bhk_interested_in_check') then
    alter table public.crm_leads
      add constraint crm_leads_bhk_interested_in_check
      check (bhk_interested_in is null or bhk_interested_in in ('2 BHK','3 BHK','4 BHK','5 BHK','6 BHK')) not valid;
  end if;
end $$;

