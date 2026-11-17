-- A record of every Join Us enquiry, as a back-up to the email the membership team gets.
--
-- The Join Us form emails each enquiry (send-enquiry.php) and then saves a copy here, noting
-- whether the email went. The members' area "Trial Enquiries" section lists them.
--
-- These hold children's names and dates of birth, so:
--   - Only Membership Team and Webmaster accounts can read or delete them.
--   - The public can't read anything. They can only ADD an enquiry, and only through
--     submit_enquiry(), which checks it and refuses floods.
--   - Delete enquiries from the members' area once they're dealt with.
--
-- The form keeps working (email only) if this hasn't been run yet.
--
-- Run once in the Supabase SQL Editor. Safe to re-run.

create table if not exists public.enquiries (
  id           bigint generated always as identity primary key,
  received_at  timestamptz not null default now(),
  pathway      text not null check (pathway in ('lessons', 'competitive', 'masters')),
  parent       text check (char_length(parent)  <= 120),
  email        text not null check (char_length(email) <= 200),
  swimmer      text not null check (char_length(swimmer) <= 120),
  dob          date,
  stage        text check (char_length(stage) <= 20),
  se_no        text check (char_length(se_no) <= 20),
  level        text check (char_length(level) <= 40),
  notes        text check (char_length(notes) <= 3000),
  emailed      boolean not null default false
);

alter table public.enquiries enable row level security;

-- Membership Team and Webmasters only.
create or replace function public.can_see_enquiries()
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.members m
    where lower(m.email) = lower(auth.jwt() ->> 'email')
      and m.role in ('membership', 'webmaster')
  );
$$;

drop policy if exists "membership read enquiries"   on public.enquiries;
drop policy if exists "membership delete enquiries" on public.enquiries;
create policy "membership read enquiries"   on public.enquiries for select using (public.can_see_enquiries());
create policy "membership delete enquiries" on public.enquiries for delete using (public.can_see_enquiries());
-- No insert/update policies: new rows only arrive through submit_enquiry() below.

create or replace function public.submit_enquiry(
  p_pathway text, p_email text, p_swimmer text,
  p_parent text default null, p_dob text default null, p_stage text default null,
  p_se_no text default null, p_level text default null, p_notes text default null,
  p_emailed boolean default false
)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_dob date;
begin
  begin
    v_dob := nullif(btrim(p_dob), '')::date;
  exception when others then
    v_dob := null; -- a date the database can't read is left off rather than losing the enquiry
  end;
  if p_pathway not in ('lessons', 'competitive', 'masters') then
    raise exception 'Unknown pathway';
  end if;
  if coalesce(btrim(p_email), '') !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' or coalesce(btrim(p_swimmer), '') = '' then
    raise exception 'Missing name or email';
  end if;
  -- Flood guard: the club gets a handful a week, so 30 in an hour means something's wrong.
  if (select count(*) from public.enquiries where received_at > now() - interval '1 hour') >= 30 then
    raise exception 'Too many enquiries just now';
  end if;
  insert into public.enquiries (pathway, parent, email, swimmer, dob, stage, se_no, level, notes, emailed)
  values (
    p_pathway,
    left(nullif(btrim(p_parent), ''), 120),
    left(btrim(p_email), 200),
    left(btrim(p_swimmer), 120),
    v_dob,
    left(nullif(btrim(p_stage), ''), 20),
    left(nullif(btrim(p_se_no), ''), 20),
    left(nullif(btrim(p_level), ''), 40),
    left(nullif(btrim(p_notes), ''), 3000),
    coalesce(p_emailed, false)
  );
end;
$$;

revoke all on function public.submit_enquiry(text, text, text, text, text, text, text, text, text, boolean) from public;
grant execute on function public.submit_enquiry(text, text, text, text, text, text, text, text, text, boolean) to anon, authenticated;

-- Tell the API to re-read the table layout now, so the form and members' area work straight away.
notify pgrst, 'reload schema';
