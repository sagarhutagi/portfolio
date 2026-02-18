-- ═══════════════════════════════════════════════════════════════
-- PORTFOLIO — Supabase SQL Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor).
-- ═══════════════════════════════════════════════════════════════

-- 1. SETTINGS (single-row config)
create table if not exists public.settings (
  id         int primary key default 1 check (id = 1),
  name       text not null default 'John Doe',
  title      text not null default 'Full Stack Developer',
  intro      text not null default 'Building modern web experiences.',
  about      text not null default '',
  skills     jsonb not null default '["Next.js","React","TypeScript","Tailwind CSS","Supabase"]'::jsonb,
  current_status text not null default 'Currently building: Next.js Portfolio',
  resume_url text not null default 'https://example.com/resume.pdf'
);

-- Seed the single settings row
insert into public.settings (id) values (1) on conflict (id) do nothing;

-- 2. PROJECTS
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

-- 3. LEARNINGS
create table if not exists public.learnings (
  id           uuid primary key default gen_random_uuid(),
  title        text not null default '',
  summary      text not null default '',
  full_details text not null default '',
  "order"      int not null default 0
);

-- 4. CONTACT SUBMISSIONS
create table if not exists public.contact_submissions (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  message    text not null,
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════

-- Enable RLS on all tables
alter table public.settings enable row level security;
alter table public.projects enable row level security;
alter table public.learnings enable row level security;
alter table public.contact_submissions enable row level security;

-- ── PUBLIC READ policies (anyone can read published content) ──

create policy "Public can read settings"
  on public.settings for select
  to anon, authenticated
  using (true);

create policy "Public can read projects"
  on public.projects for select
  to anon, authenticated
  using (true);

create policy "Public can read learnings"
  on public.learnings for select
  to anon, authenticated
  using (true);

-- ── PUBLIC INSERT for contact submissions ──

create policy "Anyone can submit contact form"
  on public.contact_submissions for insert
  to anon, authenticated
  with check (true);

-- ── AUTHENTICATED-ONLY write policies (admin) ──

create policy "Admin can update settings"
  on public.settings for update
  to authenticated
  using (true)
  with check (true);

create policy "Admin can insert projects"
  on public.projects for insert
  to authenticated
  with check (true);

create policy "Admin can update projects"
  on public.projects for update
  to authenticated
  using (true)
  with check (true);

create policy "Admin can delete projects"
  on public.projects for delete
  to authenticated
  using (true);

create policy "Admin can insert learnings"
  on public.learnings for insert
  to authenticated
  with check (true);

create policy "Admin can update learnings"
  on public.learnings for update
  to authenticated
  using (true)
  with check (true);

create policy "Admin can delete learnings"
  on public.learnings for delete
  to authenticated
  using (true);

create policy "Admin can read contact submissions"
  on public.contact_submissions for select
  to authenticated
  using (true);

create policy "Admin can update contact submissions"
  on public.contact_submissions for update
  to authenticated
  using (true)
  with check (true);

-- ═══════════════════════════════════════════════════════════════
-- OPTIONAL: Seed sample data
-- ═══════════════════════════════════════════════════════════════

insert into public.projects (title, short_desc, long_desc, tech, screenshots, live_url, github_url, "order")
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
  );

insert into public.learnings (title, summary, full_details, "order")
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
  );
