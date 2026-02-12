-- ProfitMRR Library — Core schema + RLS
--
-- Apply via Supabase CLI (`supabase db push`) or the SQL editor.

begin;

-- UUID generation
create extension if not exists "pgcrypto" with schema extensions;

-- Generic updated_at helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Pending subscription data (for buyers who checkout before creating an account)
create table public.pending_subscriptions (
  email text primary key,
  ls_customer_id text,
  ls_subscription_id text,
  status text not null default 'inactive' check (status in ('active', 'cancelled', 'expired', 'inactive')),
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger pending_subscriptions_set_updated_at
before update on public.pending_subscriptions
for each row execute function public.set_updated_at();

-- Profiles (source of truth for subscription gating)
create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  role text not null default 'user' check (role in ('user', 'admin')),
  ls_customer_id text,
  ls_subscription_id text,
  status text not null default 'inactive' check (status in ('active', 'cancelled', 'expired', 'inactive')),
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index profiles_email_unique_idx on public.profiles (lower(email));

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- Admin helper (used by RLS)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid()
      and p.role = 'admin'
  );
$$;

grant execute on function public.is_admin() to authenticated;

-- Create profile row on signup + apply any pending subscription by email
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
begin
  if new.email is null then
    return new;
  end if;

  v_email := lower(new.email);

  insert into public.profiles (user_id, email)
  values (new.id, v_email)
  on conflict (user_id) do update
    set email = excluded.email,
        updated_at = now();

  -- If the buyer checked out before they created an account, link here.
  update public.profiles p
    set ls_customer_id = ps.ls_customer_id,
        ls_subscription_id = ps.ls_subscription_id,
        status = ps.status,
        current_period_end = ps.current_period_end,
        updated_at = now()
  from public.pending_subscriptions ps
  where ps.email = v_email
    and p.user_id = new.id;

  delete from public.pending_subscriptions where email = v_email;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Library content metadata
create table public.library_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  description text,
  tags text[],
  r2_key text not null,
  file_size_mb numeric,
  is_new boolean not null default false,
  starter_pack boolean not null default false,
  created_at timestamptz not null default now()
);

create index library_items_category_idx on public.library_items (category);
create index library_items_is_new_idx on public.library_items (is_new);
create index library_items_starter_pack_idx on public.library_items (starter_pack);
create index library_items_tags_gin_idx on public.library_items using gin (tags);

-- Download audit logs (also used for rate limiting)
create table public.download_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  library_item_id uuid not null references public.library_items(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index download_logs_user_created_at_idx on public.download_logs (user_id, created_at desc);
create index download_logs_item_created_at_idx on public.download_logs (library_item_id, created_at desc);

-- Community requests + voting
create table public.requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  details text,
  status text not null default 'open' check (status in ('open', 'planned', 'released', 'closed')),
  created_at timestamptz not null default now()
);

create index requests_status_created_at_idx on public.requests (status, created_at desc);

create table public.request_votes (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (request_id, user_id)
);

create index request_votes_request_id_idx on public.request_votes (request_id);
create index request_votes_user_id_idx on public.request_votes (user_id);

-- Support tickets
create table public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null,
  message text not null,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create index support_tickets_user_created_at_idx on public.support_tickets (user_id, created_at desc);
create index support_tickets_status_created_at_idx on public.support_tickets (status, created_at desc);

-- App settings (Discord link, announcements, etc.)
create table public.app_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

-- Webhook idempotency store
create table public.webhook_events (
  event_id text primary key,
  event_name text not null,
  payload jsonb not null,
  received_at timestamptz not null default now()
);

-- Admin CRM helpers
create table public.user_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  note text not null,
  created_at timestamptz not null default now()
);

create index user_notes_user_created_at_idx on public.user_notes (user_id, created_at desc);

create table public.user_tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tag text not null,
  created_at timestamptz not null default now(),
  unique (user_id, tag)
);

create index user_tags_tag_idx on public.user_tags (tag);

-- =============================================
-- RLS
-- =============================================

alter table public.pending_subscriptions enable row level security;
alter table public.profiles enable row level security;
alter table public.library_items enable row level security;
alter table public.download_logs enable row level security;
alter table public.requests enable row level security;
alter table public.request_votes enable row level security;
alter table public.support_tickets enable row level security;
alter table public.app_settings enable row level security;
alter table public.webhook_events enable row level security;
alter table public.user_notes enable row level security;
alter table public.user_tags enable row level security;

-- pending_subscriptions: no client access (service role only)

-- profiles
create policy profiles_select_own
on public.profiles
for select
to authenticated
using (user_id = auth.uid());

create policy profiles_select_admin
on public.profiles
for select
to authenticated
using (public.is_admin());

create policy profiles_update_own
on public.profiles
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- library_items (metadata is readable by any authenticated user)
create policy library_items_select_authenticated
on public.library_items
for select
to authenticated
using (true);

-- download_logs
create policy download_logs_select_own
on public.download_logs
for select
to authenticated
using (user_id = auth.uid());

create policy download_logs_select_admin
on public.download_logs
for select
to authenticated
using (public.is_admin());

create policy download_logs_insert_own
on public.download_logs
for insert
to authenticated
with check (user_id = auth.uid());

-- requests
create policy requests_select_authenticated
on public.requests
for select
to authenticated
using (true);

create policy requests_insert_own
on public.requests
for insert
to authenticated
with check (user_id = auth.uid());

-- request_votes
create policy request_votes_select_authenticated
on public.request_votes
for select
to authenticated
using (true);

create policy request_votes_insert_own
on public.request_votes
for insert
to authenticated
with check (user_id = auth.uid());

create policy request_votes_delete_own
on public.request_votes
for delete
to authenticated
using (user_id = auth.uid());

-- support_tickets
create policy support_tickets_select_own
on public.support_tickets
for select
to authenticated
using (user_id = auth.uid());

create policy support_tickets_select_admin
on public.support_tickets
for select
to authenticated
using (public.is_admin());

create policy support_tickets_insert_own
on public.support_tickets
for insert
to authenticated
with check (user_id = auth.uid());

-- app_settings (safe read-only settings)
create policy app_settings_select_authenticated
on public.app_settings
for select
to authenticated
using (true);

-- webhook_events: no client access (service role only)

-- user_notes / user_tags: admin read-only by default (writes happen via server)
create policy user_notes_select_admin
on public.user_notes
for select
to authenticated
using (public.is_admin());

create policy user_tags_select_admin
on public.user_tags
for select
to authenticated
using (public.is_admin());

-- =============================================
-- Privileges (tighten column updates on profiles)
-- =============================================

revoke all on table public.pending_subscriptions from anon, authenticated;
revoke all on table public.webhook_events from anon, authenticated;

revoke all on table public.profiles from anon, authenticated;
grant select on table public.profiles to authenticated;
grant update (name) on table public.profiles to authenticated;

revoke all on table public.library_items from anon, authenticated;
grant select on table public.library_items to authenticated;

revoke all on table public.download_logs from anon, authenticated;
grant select, insert on table public.download_logs to authenticated;

revoke all on table public.requests from anon, authenticated;
grant select, insert on table public.requests to authenticated;

revoke all on table public.request_votes from anon, authenticated;
grant select, insert, delete on table public.request_votes to authenticated;

revoke all on table public.support_tickets from anon, authenticated;
grant select, insert on table public.support_tickets to authenticated;

revoke all on table public.app_settings from anon, authenticated;
grant select on table public.app_settings to authenticated;

revoke all on table public.user_notes from anon, authenticated;
grant select on table public.user_notes to authenticated;

revoke all on table public.user_tags from anon, authenticated;
grant select on table public.user_tags to authenticated;

commit;

