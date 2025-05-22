alter table profiles
  add column if not exists stripe_account_id text unique,
  add column if not exists plan text default 'free'
    check (plan in ('free','pro')); 