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

-- Add missing fields from CSV
alter table public.crm_leads
  add column if not exists excel_name text,
  add column if not exists lead_date date not null default current_date,
  add column if not exists projects_interested text,
  add column if not exists uc_rtm text,
  add column if not exists agreed_walk_in text,
  add column if not exists end_use_investment text,
  add column if not exists follow_up_date date;

-- Optional: constrain dropdown-like columns (kept permissive with NOT VALID)
do $$
begin
  if not exists (select 1 from pg_constraint where conname='crm_leads_initial_assessment_check') then
    alter table public.crm_leads
      add constraint crm_leads_initial_assessment_check
      check (initial_assessment is null or initial_assessment in ('warm','cold','hot')) not valid;
  end if;

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
end $$;

