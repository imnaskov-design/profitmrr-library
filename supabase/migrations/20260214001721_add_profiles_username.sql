-- ProfitMRR Library — Add `profiles.username` for username-based login

begin;

-- 1) Schema: add username column
alter table public.profiles
  add column if not exists username text;

-- 2) Validation: keep usernames lowercase and within a safe format.
--    This allows login by username without case ambiguity.
alter table public.profiles
  drop constraint if exists profiles_username_format_chk,
  drop constraint if exists profiles_username_lowercase_chk;

alter table public.profiles
  add constraint profiles_username_format_chk
    check (username is null or username ~ '^[a-z0-9_]{3,32}$'),
  add constraint profiles_username_lowercase_chk
    check (username is null or username = lower(username));

-- 3) Uniqueness: enforce unique usernames (case-insensitive via stored-lowercase)
drop index if exists public.profiles_username_unique_idx;
create unique index profiles_username_unique_idx
  on public.profiles (username)
  where username is not null;

-- 4) Backfill: copy any auth user metadata `username` into profiles.
update public.profiles p
set
  username = lower(nullif(u.raw_user_meta_data->>'username', '')),
  updated_at = now()
from auth.users u
where u.id = p.user_id
  and p.username is null
  and nullif(u.raw_user_meta_data->>'username', '') is not null;

-- 5) Repair drift: ensure profiles.email mirrors auth.users.email.
--    (Some earlier test users had `profiles.email` overwritten with usernames.)
update public.profiles p
set
  email = lower(u.email),
  updated_at = now()
from auth.users u
where u.id = p.user_id
  and u.email is not null
  and p.email <> lower(u.email);

-- 6) Bootstrap: extend signup trigger to populate profiles.username on create.
--    Note: This replaces the function from earlier migrations.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
  v_username text;
begin
  if new.email is null then
    return new;
  end if;

  v_email := lower(new.email);
  v_username := nullif(lower(new.raw_user_meta_data->>'username'), '');

  insert into public.profiles (user_id, email, username)
  values (new.id, v_email, v_username)
  on conflict (user_id) do update
    set email = excluded.email,
        username = coalesce(public.profiles.username, excluded.username),
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
