-- ProfitMRR Library — E-Books foundation schema, quotas, and RLS

begin;

-- =============================================
-- Types
-- =============================================

create type public.ebook_status as enum (
  'draft',
  'generating',
  'ready',
  'failed',
  'archived'
);

create type public.ebook_version_source as enum (
  'generated',
  'edited',
  'regenerated_section'
);

create type public.ebook_job_type as enum (
  'generate',
  'export',
  'rewrite_section',
  'regenerate_section'
);

create type public.ebook_job_status as enum (
  'queued',
  'running',
  'succeeded',
  'failed',
  'cancelled'
);

create type public.ebook_export_format as enum (
  'pdf',
  'docx',
  'epub'
);

create type public.ebook_export_profile as enum (
  'us_letter',
  'a4'
);

create type public.ebook_export_status as enum (
  'queued',
  'rendering',
  'ready',
  'failed'
);

create type public.ebook_edit_action_type as enum (
  'rewrite',
  'expand',
  'shorten',
  'tone_switch',
  'regenerate'
);

create type public.ebook_quota_scope as enum (
  'generation',
  'ai_edit',
  'export'
);

create type public.ebook_quota_period as enum (
  'daily',
  'monthly'
);

-- =============================================
-- Tables
-- =============================================

create table public.ebooks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  niche text,
  category text,
  language text,
  tone text,
  target_page_count int,
  uniqueness_mode boolean not null default false,
  status public.ebook_status not null default 'draft',
  active_version_id uuid,
  active_job_id uuid,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index ebooks_user_created_idx
  on public.ebooks (user_id, created_at desc);

create index ebooks_user_status_idx
  on public.ebooks (user_id, status, created_at desc);

create trigger ebooks_set_updated_at
before update on public.ebooks
for each row execute function public.set_updated_at();

create table public.ebook_versions (
  id uuid primary key default gen_random_uuid(),
  ebook_id uuid not null references public.ebooks(id) on delete cascade,
  version_number int not null,
  source public.ebook_version_source not null,
  content_json jsonb not null,
  outline_json jsonb,
  quality_score numeric,
  quality_report_json jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (ebook_id, version_number)
);

create index ebook_versions_ebook_version_idx
  on public.ebook_versions (ebook_id, version_number desc);

create table public.ebook_sections (
  id uuid primary key default gen_random_uuid(),
  ebook_version_id uuid not null references public.ebook_versions(id) on delete cascade,
  chapter_index int not null,
  section_index int not null,
  section_key text not null,
  heading text,
  body_richtext jsonb not null,
  word_count int,
  est_page_span numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (ebook_version_id, section_key)
);

create index ebook_sections_version_position_idx
  on public.ebook_sections (ebook_version_id, chapter_index, section_index);

create trigger ebook_sections_set_updated_at
before update on public.ebook_sections
for each row execute function public.set_updated_at();

create table public.ebook_jobs (
  id uuid primary key default gen_random_uuid(),
  ebook_id uuid not null references public.ebooks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  idempotency_key text not null,
  job_type public.ebook_job_type not null,
  status public.ebook_job_status not null default 'queued',
  step text,
  progress_pct int not null default 0,
  input_json jsonb,
  output_json jsonb,
  error_code text,
  error_message text,
  retry_count int not null default 0,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, idempotency_key)
);

create index ebook_jobs_user_status_created_idx
  on public.ebook_jobs (user_id, status, created_at desc);

create index ebook_jobs_ebook_created_idx
  on public.ebook_jobs (ebook_id, created_at desc);

create table public.ebook_exports (
  id uuid primary key default gen_random_uuid(),
  ebook_id uuid not null references public.ebooks(id) on delete cascade,
  ebook_version_id uuid not null references public.ebook_versions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  format public.ebook_export_format not null,
  profile public.ebook_export_profile not null,
  style_preset text,
  status public.ebook_export_status not null default 'queued',
  file_path text,
  file_size_bytes bigint,
  page_count int,
  checksum_sha256 text,
  created_at timestamptz not null default now(),
  ready_at timestamptz,
  unique (ebook_id, ebook_version_id, format, profile)
);

create index ebook_exports_user_created_idx
  on public.ebook_exports (user_id, created_at desc);

create index ebook_exports_ebook_status_created_idx
  on public.ebook_exports (ebook_id, status, created_at desc);

create table public.ebook_edit_actions (
  id uuid primary key default gen_random_uuid(),
  ebook_id uuid not null references public.ebooks(id) on delete cascade,
  ebook_version_id uuid not null references public.ebook_versions(id) on delete cascade,
  section_id uuid references public.ebook_sections(id) on delete set null,
  user_id uuid not null references auth.users(id) on delete cascade,
  action_type public.ebook_edit_action_type not null,
  before_text text,
  after_text text,
  metadata_json jsonb,
  created_at timestamptz not null default now()
);

create index ebook_edit_actions_user_created_idx
  on public.ebook_edit_actions (user_id, created_at desc);

create index ebook_edit_actions_ebook_created_idx
  on public.ebook_edit_actions (ebook_id, created_at desc);

create table public.ebook_usage_counters (
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_tier text not null,
  scope public.ebook_quota_scope not null,
  period public.ebook_quota_period not null,
  period_start timestamptz not null,
  used_count int not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, scope, period, period_start)
);

create index ebook_usage_counters_user_scope_idx
  on public.ebook_usage_counters (user_id, scope, period, period_start desc);

create trigger ebook_usage_counters_set_updated_at
before update on public.ebook_usage_counters
for each row execute function public.set_updated_at();

-- add deferred relationships now that referenced tables exist
alter table public.ebooks
  add constraint ebooks_active_version_fk
  foreign key (active_version_id)
  references public.ebook_versions(id)
  on delete set null;

alter table public.ebooks
  add constraint ebooks_active_job_fk
  foreign key (active_job_id)
  references public.ebook_jobs(id)
  on delete set null;

-- =============================================
-- RLS
-- =============================================

alter table public.ebooks enable row level security;
alter table public.ebook_versions enable row level security;
alter table public.ebook_sections enable row level security;
alter table public.ebook_jobs enable row level security;
alter table public.ebook_exports enable row level security;
alter table public.ebook_edit_actions enable row level security;
alter table public.ebook_usage_counters enable row level security;

-- ebooks
create policy ebooks_select_own
on public.ebooks
for select
to authenticated
using (user_id = auth.uid());

create policy ebooks_select_admin
on public.ebooks
for select
to authenticated
using (public.is_admin());

create policy ebooks_insert_own
on public.ebooks
for insert
to authenticated
with check (user_id = auth.uid());

create policy ebooks_update_own
on public.ebooks
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy ebooks_delete_own
on public.ebooks
for delete
to authenticated
using (user_id = auth.uid());

-- ebook_versions
create policy ebook_versions_select_own
on public.ebook_versions
for select
to authenticated
using (
  exists (
    select 1
    from public.ebooks e
    where e.id = ebook_versions.ebook_id
      and e.user_id = auth.uid()
  )
);

create policy ebook_versions_select_admin
on public.ebook_versions
for select
to authenticated
using (public.is_admin());

create policy ebook_versions_insert_own
on public.ebook_versions
for insert
to authenticated
with check (
  exists (
    select 1
    from public.ebooks e
    where e.id = ebook_versions.ebook_id
      and e.user_id = auth.uid()
  )
);

create policy ebook_versions_update_own
on public.ebook_versions
for update
to authenticated
using (
  exists (
    select 1
    from public.ebooks e
    where e.id = ebook_versions.ebook_id
      and e.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.ebooks e
    where e.id = ebook_versions.ebook_id
      and e.user_id = auth.uid()
  )
);

-- ebook_sections
create policy ebook_sections_select_own
on public.ebook_sections
for select
to authenticated
using (
  exists (
    select 1
    from public.ebook_versions ev
    join public.ebooks e on e.id = ev.ebook_id
    where ev.id = ebook_sections.ebook_version_id
      and e.user_id = auth.uid()
  )
);

create policy ebook_sections_select_admin
on public.ebook_sections
for select
to authenticated
using (public.is_admin());

create policy ebook_sections_insert_own
on public.ebook_sections
for insert
to authenticated
with check (
  exists (
    select 1
    from public.ebook_versions ev
    join public.ebooks e on e.id = ev.ebook_id
    where ev.id = ebook_sections.ebook_version_id
      and e.user_id = auth.uid()
  )
);

create policy ebook_sections_update_own
on public.ebook_sections
for update
to authenticated
using (
  exists (
    select 1
    from public.ebook_versions ev
    join public.ebooks e on e.id = ev.ebook_id
    where ev.id = ebook_sections.ebook_version_id
      and e.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.ebook_versions ev
    join public.ebooks e on e.id = ev.ebook_id
    where ev.id = ebook_sections.ebook_version_id
      and e.user_id = auth.uid()
  )
);

-- ebook_jobs
create policy ebook_jobs_select_own
on public.ebook_jobs
for select
to authenticated
using (user_id = auth.uid());

create policy ebook_jobs_select_admin
on public.ebook_jobs
for select
to authenticated
using (public.is_admin());

create policy ebook_jobs_insert_own
on public.ebook_jobs
for insert
to authenticated
with check (user_id = auth.uid());

create policy ebook_jobs_update_own
on public.ebook_jobs
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- ebook_exports
create policy ebook_exports_select_own
on public.ebook_exports
for select
to authenticated
using (user_id = auth.uid());

create policy ebook_exports_select_admin
on public.ebook_exports
for select
to authenticated
using (public.is_admin());

create policy ebook_exports_insert_own
on public.ebook_exports
for insert
to authenticated
with check (user_id = auth.uid());

create policy ebook_exports_update_own
on public.ebook_exports
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- ebook_edit_actions
create policy ebook_edit_actions_select_own
on public.ebook_edit_actions
for select
to authenticated
using (user_id = auth.uid());

create policy ebook_edit_actions_select_admin
on public.ebook_edit_actions
for select
to authenticated
using (public.is_admin());

create policy ebook_edit_actions_insert_own
on public.ebook_edit_actions
for insert
to authenticated
with check (user_id = auth.uid());

-- ebook_usage_counters
create policy ebook_usage_counters_select_own
on public.ebook_usage_counters
for select
to authenticated
using (user_id = auth.uid());

create policy ebook_usage_counters_select_admin
on public.ebook_usage_counters
for select
to authenticated
using (public.is_admin());

-- service role should write usage counters; authenticated does not need direct writes

-- =============================================
-- Privileges
-- =============================================

revoke all on table public.ebooks from anon, authenticated;
grant select, insert, update, delete on table public.ebooks to authenticated;

revoke all on table public.ebook_versions from anon, authenticated;
grant select, insert, update on table public.ebook_versions to authenticated;

revoke all on table public.ebook_sections from anon, authenticated;
grant select, insert, update on table public.ebook_sections to authenticated;

revoke all on table public.ebook_jobs from anon, authenticated;
grant select, insert, update on table public.ebook_jobs to authenticated;

revoke all on table public.ebook_exports from anon, authenticated;
grant select, insert, update on table public.ebook_exports to authenticated;

revoke all on table public.ebook_edit_actions from anon, authenticated;
grant select, insert on table public.ebook_edit_actions to authenticated;

revoke all on table public.ebook_usage_counters from anon, authenticated;
grant select on table public.ebook_usage_counters to authenticated;

commit;
