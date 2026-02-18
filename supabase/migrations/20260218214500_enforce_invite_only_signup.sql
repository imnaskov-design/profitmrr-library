-- ProfitMRR Library — Enforce invite-only signups at DB level

begin;

create or replace function public.validate_register_invite_on_signup()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_email text;
  v_token text;
begin
  if new.email is null then
    return new;
  end if;

  v_email := lower(new.email);
  v_token := nullif(trim(new.raw_user_meta_data->>'invite_token'), '');

  if v_token is null then
    raise exception 'invite_token_required';
  end if;

  if not exists (
    select 1
    from public.register_invites ri
    where ri.token = v_token
      and lower(ri.email) = v_email
      and ri.consumed_at is null
      and ri.expires_at > now()
  ) then
    raise exception 'invalid_or_expired_invite_token';
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_validate_register_invite on auth.users;

create trigger on_auth_user_validate_register_invite
before insert on auth.users
for each row execute function public.validate_register_invite_on_signup();

commit;

