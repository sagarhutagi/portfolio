# Portfolio — Setup Guide

## 1. Supabase Setup

### Create a Supabase project
1. Go to [supabase.com](https://supabase.com) and sign in.
2. Click **New project**, choose an organization, name it (e.g. `portfolio`), set a database password, and pick a region.
3. Wait for the project to finish provisioning.

### Run the SQL schema
1. In your Supabase Dashboard, go to **SQL Editor**.
2. Click **New query**.
3. Paste the entire contents of `supabase-schema.sql` from this repo.
4. Click **Run** — this creates all tables, RLS policies, and seeds sample data.

### Get your API keys
1. Go to **Settings → API** in the Supabase Dashboard.
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`
3. Create a `.env.local` file in the project root (copy from `.env.example`):
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   NEXT_PUBLIC_SITE_URL=https://your-domain.com
   ```

### Create an admin user
1. In the Supabase Dashboard, go to **Authentication → Users**.
2. Click **Add user → Create new user**.
3. Enter an email and password (this will be your admin login).
4. That's it — use these credentials at `/admin/login`.

---

## 2. Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> **Note:** The site works without Supabase configured — it falls back to dummy data. Supabase is only needed for the admin dashboard and contact form.

---

## 3. Vercel Deployment

### Via GitHub
1. Push this repo to GitHub.
2. Go to [vercel.com](https://vercel.com), click **New Project**, and import your repo.
3. Add environment variables in the Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` (your Vercel domain, e.g. `https://portfolio.vercel.app`)
4. Click **Deploy**.

### Manual
```bash
npm i -g vercel
vercel
```

Follow the prompts and set env vars when asked.

---

## 4. Adding Real Content

### Replace dummy images
- Update screenshot URLs in your projects (via Admin → Projects).
- Use [picsum.photos](https://picsum.photos), Unsplash, or upload to Supabase Storage.
- For Supabase Storage: Dashboard → Storage → Create bucket → Upload files → Copy public URL.

### Replace dummy links
- Update social links in `app/contact/page.tsx` (the `SOCIALS` array).
- Update `resume_url` via Admin → Settings.
- Update the logo initials in `components/navbar.tsx`.

### Change the accent color
- Open `app/globals.css` and change `--accent-color: #22d3ee` to any hex color.
- The `--primary` HSL values should match if you want buttons to use the same color.

### Update SEO metadata
- Edit the base metadata in `app/layout.tsx`.
- Each page has its own `generateMetadata` — update descriptions, titles, etc.
- Set `NEXT_PUBLIC_SITE_URL` to your real domain for correct OG URLs.

### Add a custom domain
1. In Vercel: Settings → Domains → Add your domain.
2. Update DNS records as instructed by Vercel.
3. Update `NEXT_PUBLIC_SITE_URL` env var.

---

## 5. Project Structure

```
app/
  layout.tsx          ← Root layout (font, theme, navbar, cursor, toaster)
  page.tsx            ← Home page
  globals.css         ← Tailwind + theme tokens + cursor styles
  projects/page.tsx   ← Projects grid + full-page modal
  learnings/page.tsx  ← Learnings grid + accordion
  contact/page.tsx    ← Contact form + info
  admin/
    layout.tsx        ← Auth guard + admin sidebar
    page.tsx          ← Dashboard overview
    login/page.tsx    ← Login form
    settings/page.tsx ← Edit site settings
    projects/page.tsx ← CRUD + drag-reorder projects
    learnings/page.tsx← CRUD + drag-reorder learnings
    messages/page.tsx ← View contact submissions

components/
  navbar.tsx          ← Desktop sidebar + mobile hamburger
  mobile-menu.tsx     ← Full-screen mobile nav overlay
  custom-cursor.tsx   ← Glowing dot + ring cursor
  theme-provider.tsx  ← next-themes wrapper
  theme-toggle.tsx    ← Dark/Light toggle button
  project-card.tsx    ← Project grid card
  project-modal.tsx   ← Full-page project detail overlay
  projects-view.tsx   ← Client wrapper for project grid + modal state
  learning-card.tsx   ← Accordion learning card
  learnings-view.tsx  ← Client wrapper for learnings grid
  contact-form.tsx    ← react-hook-form + zod contact form
  admin-sidebar.tsx   ← Admin navigation sidebar
  ui/                 ← shadcn-style UI primitives

lib/
  utils.ts            ← cn() utility
  supabase.ts         ← Client-side Supabase instance
  supabase-server.ts  ← Server-side Supabase + auth verifier
  actions.ts          ← Server Actions (contact, CRUD, reorder)
  data.ts             ← Data fetching with fallback dummy data

types/
  index.ts            ← TypeScript interfaces
```
