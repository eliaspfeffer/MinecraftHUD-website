create table if not exists minecrafthud_email_signups (
  id         bigserial primary key,
  email      text not null unique,
  source     text not null default 'homepage',
  created_at timestamptz not null default now()
);

alter table minecrafthud_email_signups enable row level security;

-- Only service role can read/write
create policy "service_role_only" on minecrafthud_email_signups
  for all using (false);
