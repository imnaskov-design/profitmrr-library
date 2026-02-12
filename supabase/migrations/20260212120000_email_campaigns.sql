-- ProfitMRR Library — Email campaigns + unsubscribe preferences

begin;

-- Email preferences (unsubscribe handling)
create table public.email_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  unsubscribed boolean not null default false,
  token text not null default encode(gen_random_bytes(32), 'hex'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index email_preferences_token_unique_idx on public.email_preferences (token);
create index email_preferences_unsubscribed_idx on public.email_preferences (unsubscribed);

create trigger email_preferences_set_updated_at
before update on public.email_preferences
for each row execute function public.set_updated_at();

-- Campaigns
create table public.email_campaigns (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  preview_text text,
  body_markdown text not null,
  audience text not null check (audience in ('active', 'cancelled', 'expired', 'all')),
  status text not null default 'draft' check (status in ('draft', 'sending', 'sent', 'failed')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  sent_at timestamptz
);

create index email_campaigns_status_created_at_idx on public.email_campaigns (status, created_at desc);
create index email_campaigns_audience_created_at_idx on public.email_campaigns (audience, created_at desc);

create trigger email_campaigns_set_updated_at
before update on public.email_campaigns
for each row execute function public.set_updated_at();

-- Send log
create table public.email_sends (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.email_campaigns(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  status text not null check (status in ('queued', 'sent', 'failed')),
  provider text not null default 'resend',
  provider_message_id text,
  error text,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create unique index email_sends_campaign_user_unique_idx
on public.email_sends (campaign_id, user_id)
where user_id is not null;

create index email_sends_campaign_created_at_idx on public.email_sends (campaign_id, created_at desc);
create index email_sends_status_created_at_idx on public.email_sends (status, created_at desc);

-- =============================================
-- RLS
-- =============================================

alter table public.email_preferences enable row level security;
alter table public.email_campaigns enable row level security;
alter table public.email_sends enable row level security;

-- Admin can manage campaigns + sends
create policy email_campaigns_admin_all
on public.email_campaigns
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy email_sends_admin_all
on public.email_sends
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Preferences are readable by admins; optionally readable/updatable by the owner
create policy email_preferences_select_admin
on public.email_preferences
for select
to authenticated
using (public.is_admin());

create policy email_preferences_select_own
on public.email_preferences
for select
to authenticated
using (user_id = auth.uid());

create policy email_preferences_update_own
on public.email_preferences
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- =============================================
-- Privileges
-- =============================================

revoke all on table public.email_preferences from anon, authenticated;
revoke all on table public.email_campaigns from anon, authenticated;
revoke all on table public.email_sends from anon, authenticated;

grant select, update (unsubscribed) on table public.email_preferences to authenticated;
grant select, insert, update, delete on table public.email_campaigns to authenticated;
grant select, insert, update, delete on table public.email_sends to authenticated;

-- =============================================
-- Keep email_preferences in sync for new signups
-- =============================================

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

  -- Ensure preferences row exists for unsubscribe links.
  insert into public.email_preferences (user_id, email)
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

commit;

