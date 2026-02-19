-- ProfitMRR Library — Invite-only registration links for paid buyers

begin;

create table if not exists public.register_invites (
  token text primary key,
  email text not null,
  source text,
  checkout_id text,
  order_id text,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists register_invites_email_idx
  on public.register_invites (lower(email));

create index if not exists register_invites_expires_idx
  on public.register_invites (expires_at);

alter table public.register_invites enable row level security;

commit;

