-- Welfare & Safeguarding page: adds the welfare_page table (a single row of rich-HTML
-- body text, edited through the same WYSIWYG box as a news article), seeds it with the
-- content carried across from the old WordPress site (basildonswimming.org/welfare/),
-- and lets a "welfare" role account (or the webmaster) edit it. Safe to re-run.

create table if not exists public.welfare_page (
  id          smallint primary key default 1,
  body        text not null default '',
  updated_at  timestamptz not null default now(),
  constraint welfare_page_single_row check (id = 1)
);

alter table public.welfare_page enable row level security;

drop policy if exists "public read welfare" on public.welfare_page;
create policy "public read welfare" on public.welfare_page for select using (true);

create or replace function public.can_edit(section text, feed_type text default null)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.members m
    where lower(m.email) = lower(auth.jwt() ->> 'email')
      and (
        m.role = 'webmaster'
        or (section = 'feed'    and m.feed_types is not null and feed_type = any (m.feed_types))
        or (section = 'coaches' and m.role = 'coaching')
        or (section = 'squads'  and m.role = 'coaching')
        or (section = 'roles'   and m.role = 'volunteers')
        or (section = 'welfare' and m.role = 'welfare')
      )
  );
$$;

drop policy if exists "welfare write" on public.welfare_page;
create policy "welfare write" on public.welfare_page for all to authenticated
  using (public.can_edit('welfare')) with check (public.can_edit('welfare'));

drop trigger if exists touch_welfare_page on public.welfare_page;
create trigger touch_welfare_page before update on public.welfare_page
  for each row execute function public.touch_updated_at();

insert into public.welfare_page (id, body) values (1, $body$<p><strong>If you believe a child or adult to be in immediate danger, call 999</strong>, then notify our Welfare Officer for further advice. If no immediate danger is apparent, contact our Welfare Officer directly — you don't need to go through your coach or the committee first.</p>
<h3>Club Welfare Officers</h3>
<ul>
<li>Katie Doel — BPSC Welfare Officer — <a href="mailto:welfare@phoenixbasildonsc.org">welfare@phoenixbasildonsc.org</a></li>
<li>Kathy Morey — BPSC Welfare Officer — <a href="mailto:welfare@phoenixbasildonsc.org">welfare@phoenixbasildonsc.org</a></li>
</ul>
<h3>Swim England contacts</h3>
<ul>
<li>Cheryl Ellis — Essex Welfare Officer — <a href="mailto:welfare@essexswimming.org">welfare@essexswimming.org</a></li>
<li>Fran Vesztrocy — East Region Welfare Officer — <a href="mailto:eastwelfare@swimming.org">eastwelfare@swimming.org</a></li>
</ul>
<h3>Safeguarding policy</h3>
<p>Swim England's Wavepower child safeguarding policy manual sets out our safeguarding procedures — see the <a href="https://www.swimming.org/swimengland/wavepower-child-safeguarding-for-clubs/">Wavepower policy manual</a>. See also <a href="policies">Club Policies</a> for our codes of conduct, and <a href="coaches">Coaches &amp; Squads</a> for DBS checks and safeguarding training.</p>
<h3>Other safeguarding organisations and resources</h3>
<p>Recommended by Swim England — the full list is <a href="https://www.swimming.org/swimengland/other-safeguarding-organisations-resources/">here</a>.</p>
<ul>
<li><a href="https://www.escb.co.uk/working-with-children/concerns-about-the-welfare-of-a-child/">Essex Safeguarding Children Board</a></li>
<li><a href="https://www.essex.gov.uk/adult-social-care-and-health/report-concern-about-adult/report-concern-about-child">Essex County Council — Children's Social Care</a></li>
<li><a href="https://www.activeessex.org/dealing-with-a-concern/">Active Essex — Dealing with a concern</a></li>
</ul>$body$)
on conflict (id) do nothing;
