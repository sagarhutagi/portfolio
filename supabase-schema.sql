-- ═══════════════════════════════════════════════════════════════
-- PORTFOLIO — Supabase SQL Schema  (fully idempotent)
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor).
-- Safe to paste & run multiple times — everything uses
-- IF NOT EXISTS / IF EXISTS / ON CONFLICT guards.
-- ═══════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────
-- 1. TABLES
-- ───────────────────────────────────────────────────────────────

-- 1a. SETTINGS (single-row config)
create table if not exists public.settings (
  id         int primary key default 1 check (id = 1),
  name       text not null default 'John Doe',
  title      text not null default 'Full Stack Developer',
  intro      text not null default 'Building modern web experiences.',
  about      text not null default '',
  skills     jsonb not null default '["Next.js","React","TypeScript","Tailwind CSS","Supabase"]'::jsonb,
  current_status text not null default 'Currently building: Next.js Portfolio',
  resume_url text not null default 'https://example.com/resume.pdf',
  -- Contact & location
  email      text not null default 'hello@example.com',
  location   text not null default 'San Francisco, CA',
  -- Social links
  github_url   text not null default '',
  twitter_url  text not null default '',
  linkedin_url text not null default '',
  -- Info cards
  focus      text not null default 'Full Stack',
  reading    text not null default 'Clean Code',
  interests  text not null default 'OSS, Design',
  -- Profile image
  profile_image_url text not null default ''
);

-- Seed the single settings row (no-op if it already exists)
insert into public.settings (id) values (1) on conflict (id) do nothing;

-- 1b. PROJECTS
create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  title       text not null default '',
  short_desc  text not null default '',
  long_desc   text not null default '',
  tech        jsonb not null default '[]'::jsonb,
  screenshots jsonb not null default '[]'::jsonb,
  live_url    text not null default '',
  github_url  text not null default '',
  "order"     int not null default 0
);

-- 1c. LEARNINGS
create table if not exists public.learnings (
  id           uuid primary key default gen_random_uuid(),
  title        text not null default '',
  summary      text not null default '',
  full_details text not null default '',
  "order"      int not null default 0
);

-- 1d. CONTACT SUBMISSIONS
create table if not exists public.contact_submissions (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  message    text not null,
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);

-- 1e. WORK EXPERIENCE
create table if not exists public.experience (
  id          uuid primary key default gen_random_uuid(),
  company     text not null default '',
  role        text not null default '',
  start_date  text not null default '',
  end_date    text not null default '',  -- empty = Present
  description text not null default '',
  tech        jsonb not null default '[]'::jsonb,
  "order"     int not null default 0
);

-- 1f. PAGE VIEWS (visitor analytics)
create table if not exists public.page_views (
  id         uuid primary key default gen_random_uuid(),
  path       text not null default '/',
  referrer   text not null default '',
  user_agent text not null default '',
  country    text not null default '',
  city       text not null default '',
  device     text not null default 'desktop',
  browser    text not null default '',
  os         text not null default '',
  created_at timestamptz not null default now()
);

-- Indexes for analytics queries
create index if not exists idx_page_views_created_at on public.page_views (created_at desc);
create index if not exists idx_page_views_path on public.page_views (path);

-- ───────────────────────────────────────────────────────────────
-- 2. ROW LEVEL SECURITY  (enable is idempotent)
-- ───────────────────────────────────────────────────────────────

alter table public.settings enable row level security;
alter table public.projects enable row level security;
alter table public.learnings enable row level security;
alter table public.contact_submissions enable row level security;
alter table public.experience enable row level security;
alter table public.page_views enable row level security;

-- ───────────────────────────────────────────────────────────────
-- 3. POLICIES  (drop-then-create so re-runs never error)
-- ───────────────────────────────────────────────────────────────

-- ── settings ──
drop policy if exists "Public can read settings"       on public.settings;
drop policy if exists "Admin can update settings"       on public.settings;

create policy "Public can read settings"
  on public.settings for select to anon, authenticated using (true);

create policy "Admin can update settings"
  on public.settings for update to authenticated using (true) with check (true);

-- ── projects ──
drop policy if exists "Public can read projects"  on public.projects;
drop policy if exists "Admin can insert projects" on public.projects;
drop policy if exists "Admin can update projects" on public.projects;
drop policy if exists "Admin can delete projects" on public.projects;

create policy "Public can read projects"
  on public.projects for select to anon, authenticated using (true);

create policy "Admin can insert projects"
  on public.projects for insert to authenticated with check (true);

create policy "Admin can update projects"
  on public.projects for update to authenticated using (true) with check (true);

create policy "Admin can delete projects"
  on public.projects for delete to authenticated using (true);

-- ── learnings ──
drop policy if exists "Public can read learnings"  on public.learnings;
drop policy if exists "Admin can insert learnings" on public.learnings;
drop policy if exists "Admin can update learnings" on public.learnings;
drop policy if exists "Admin can delete learnings" on public.learnings;

create policy "Public can read learnings"
  on public.learnings for select to anon, authenticated using (true);

create policy "Admin can insert learnings"
  on public.learnings for insert to authenticated with check (true);

create policy "Admin can update learnings"
  on public.learnings for update to authenticated using (true) with check (true);

create policy "Admin can delete learnings"
  on public.learnings for delete to authenticated using (true);

-- ── contact_submissions ──
drop policy if exists "Anyone can submit contact form"       on public.contact_submissions;
drop policy if exists "Admin can read contact submissions"   on public.contact_submissions;
drop policy if exists "Admin can update contact submissions" on public.contact_submissions;

create policy "Anyone can submit contact form"
  on public.contact_submissions for insert to anon, authenticated with check (true);

create policy "Admin can read contact submissions"
  on public.contact_submissions for select to authenticated using (true);

create policy "Admin can update contact submissions"
  on public.contact_submissions for update to authenticated using (true) with check (true);

-- ── experience ──
drop policy if exists "Public can read experience"  on public.experience;
drop policy if exists "Admin can insert experience" on public.experience;
drop policy if exists "Admin can update experience" on public.experience;
drop policy if exists "Admin can delete experience" on public.experience;

create policy "Public can read experience"
  on public.experience for select to anon, authenticated using (true);

create policy "Admin can insert experience"
  on public.experience for insert to authenticated with check (true);

create policy "Admin can update experience"
  on public.experience for update to authenticated using (true) with check (true);

create policy "Admin can delete experience"
  on public.experience for delete to authenticated using (true);

-- ── page_views ──
drop policy if exists "Anyone can insert page views" on public.page_views;
drop policy if exists "Admin can read page views"    on public.page_views;
drop policy if exists "Admin can delete page views"  on public.page_views;

create policy "Anyone can insert page views"
  on public.page_views for insert to anon, authenticated with check (true);

create policy "Admin can read page views"
  on public.page_views for select to authenticated using (true);

create policy "Admin can delete page views"
  on public.page_views for delete to authenticated using (true);

-- ───────────────────────────────────────────────────────────────
-- 4. OPTIONAL: Seed sample data  (skipped if rows already exist)
-- ───────────────────────────────────────────────────────────────

-- Only insert sample projects when the table is empty
insert into public.projects (title, short_desc, long_desc, tech, screenshots, live_url, github_url, "order")
select *
from (
  values
    (
      'E-Commerce Platform',
      'A modern storefront with real-time inventory, Stripe payments, and admin analytics.',
      'Full-stack e-commerce platform with Next.js frontend and Supabase backend. Features real-time inventory, Stripe integration, and admin dashboard.',
      '["Next.js","Supabase","Stripe","Tailwind CSS","TypeScript"]'::jsonb,
      '["https://picsum.photos/seed/ecom1/800/500","https://picsum.photos/seed/ecom2/800/500","https://picsum.photos/seed/ecom3/800/500"]'::jsonb,
      'https://example.com',
      'https://github.com/example/ecommerce',
      0
    ),
    (
      'Task Management App',
      'Kanban-style task board with drag-and-drop, real-time sync, and team collaboration.',
      'Collaborative task management tool with drag-and-drop, real-time presence, keyboard shortcuts, and Markdown support.',
      '["React","Supabase","DnD Kit","Zustand","TypeScript"]'::jsonb,
      '["https://picsum.photos/seed/task1/800/500","https://picsum.photos/seed/task2/800/500"]'::jsonb,
      'https://example.com',
      'https://github.com/example/taskboard',
      1
    )
) as seed(title, short_desc, long_desc, tech, screenshots, live_url, github_url, "order")
where not exists (select 1 from public.projects limit 1);

-- Only insert sample learnings when the table is empty
insert into public.learnings (title, summary, full_details, "order")
select *
from (
  values
    (
      'Server Components vs Client Components',
      'Understanding the mental model behind React Server Components and when to use each pattern.',
      'React Server Components run only on the server and produce HTML streamed to the client. They can directly access databases and server-only resources without exposing secrets. Client Components run in the browser and are needed for state, effects, and event handlers. Start with Server Components by default.',
      0
    ),
    (
      'Database Indexing Strategies',
      'How proper indexing turns a 5-second query into a 5ms query — practical PostgreSQL tips.',
      'Database indexes speed up reads at the cost of slower writes. Always index foreign keys and WHERE clause columns. Use EXPLAIN ANALYZE to understand query performance. Partial indexes reduce size for subset queries.',
      1
    )
) as seed(title, summary, full_details, "order")
where not exists (select 1 from public.learnings limit 1);

-- ───────────────────────────────────────────────────────────────
-- 5. MIGRATION HELPERS  (uncomment if adding columns to an
--    existing settings table)
-- ───────────────────────────────────────────────────────────────
-- alter table public.settings add column if not exists email text not null default 'hello@example.com';
-- alter table public.settings add column if not exists location text not null default 'San Francisco, CA';
-- alter table public.settings add column if not exists github_url text not null default '';
-- alter table public.settings add column if not exists twitter_url text not null default '';
-- alter table public.settings add column if not exists linkedin_url text not null default '';
-- alter table public.settings add column if not exists focus text not null default 'Full Stack';
-- alter table public.settings add column if not exists reading text not null default 'Clean Code';
-- alter table public.settings add column if not exists interests text not null default 'OSS, Design';
-- alter table public.settings add column if not exists profile_image_url text not null default '';

-- ───────────────────────────────────────────────────────────────
-- 6. STORAGE BUCKET  (for image uploads)
--    The bucket is auto-created by the upload API route, but you
--    can also create it manually in the Supabase Dashboard:
--    Storage → New bucket → Name: "portfolio-images" → Public
-- ───────────────────────────────────────────────────────────────
-- Run this in SQL Editor if you want to set up the storage
-- bucket policy for public read access:
--
-- insert into storage.buckets (id, name, public)
--   values ('portfolio-images', 'portfolio-images', true)
--   on conflict (id) do nothing;
--
-- create policy "Public read portfolio images"
--   on storage.objects for select
--   using (bucket_id = 'portfolio-images');
--
-- create policy "Authenticated users can upload images"
--   on storage.objects for insert to authenticated
--   with check (bucket_id = 'portfolio-images');
--
-- create policy "Authenticated users can delete images"
--   on storage.objects for delete to authenticated
--   using (bucket_id = 'portfolio-images');
