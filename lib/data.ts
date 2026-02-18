import type { SiteSettings, Project, Learning } from "@/types";
import { createServerSupabase } from "./supabase-server";

/* ── Dummy / fallback data (used when Supabase is not configured) ── */

const FALLBACK_SETTINGS: SiteSettings = {
  id: 1,
  name: "John Doe",
  title: "Full Stack Developer",
  intro:
    "Building modern web experiences with clean code and thoughtful design.",
  about:
    "I'm a developer who cares about performance, accessibility, and simplicity. I enjoy turning complex problems into elegant interfaces and shipping products that people love to use.",
  skills: [
    "Next.js",
    "React",
    "TypeScript",
    "Tailwind CSS",
    "Supabase",
    "Node.js",
    "Python",
    "PostgreSQL",
    "Git",
    "Figma",
  ],
  current_status: "Currently building: Next.js Portfolio",
  resume_url: "https://example.com/resume.pdf",
};

const FALLBACK_PROJECTS: Project[] = [
  {
    id: "1",
    title: "E-Commerce Platform",
    short_desc:
      "A modern storefront with real-time inventory, Stripe payments, and admin analytics dashboard.",
    long_desc:
      "This full-stack e-commerce platform handles everything from product cataloging to order fulfillment. Built with Next.js for the frontend and Supabase for the backend, it features real-time inventory tracking, Stripe payment integration, and a comprehensive admin dashboard with sales analytics.\n\nThe architecture is designed for scalability with edge caching, optimistic UI updates, and background job processing for emails and notifications.",
    tech: ["Next.js", "Supabase", "Stripe", "Tailwind CSS", "TypeScript"],
    screenshots: [
      "https://picsum.photos/seed/ecom1/800/500",
      "https://picsum.photos/seed/ecom2/800/500",
      "https://picsum.photos/seed/ecom3/800/500",
    ],
    live_url: "https://example.com",
    github_url: "https://github.com/example/ecommerce",
    order: 0,
  },
  {
    id: "2",
    title: "Task Management App",
    short_desc:
      "Kanban-style task board with drag-and-drop, real-time sync, and team collaboration.",
    long_desc:
      "A collaborative task management tool inspired by Trello and Linear. Features include drag-and-drop card reordering, real-time presence indicators, keyboard shortcuts, and Markdown support in task descriptions.\n\nThe real-time sync is powered by Supabase Realtime, ensuring all team members see updates instantly without refreshing.",
    tech: ["React", "Supabase", "DnD Kit", "Zustand", "TypeScript"],
    screenshots: [
      "https://picsum.photos/seed/task1/800/500",
      "https://picsum.photos/seed/task2/800/500",
      "https://picsum.photos/seed/task3/800/500",
    ],
    live_url: "https://example.com",
    github_url: "https://github.com/example/taskboard",
    order: 1,
  },
  {
    id: "3",
    title: "Developer Blog",
    short_desc:
      "MDX-powered blog with syntax highlighting, RSS feed, and full-text search.",
    long_desc:
      "A personal developer blog built with Next.js and MDX. Posts are written in Markdown with support for interactive React components, code blocks with syntax highlighting, and auto-generated table of contents.\n\nIncludes an RSS feed, Open Graph image generation, full-text search, and reading time estimates.",
    tech: ["Next.js", "MDX", "Tailwind CSS", "Vercel OG"],
    screenshots: [
      "https://picsum.photos/seed/blog1/800/500",
      "https://picsum.photos/seed/blog2/800/500",
      "https://picsum.photos/seed/blog3/800/500",
    ],
    live_url: "https://example.com",
    github_url: "https://github.com/example/blog",
    order: 2,
  },
  {
    id: "4",
    title: "Weather Dashboard",
    short_desc:
      "Real-time weather with interactive maps, forecasts, and location-based alerts.",
    long_desc:
      "A weather dashboard that pulls data from the OpenWeatherMap API. Displays current conditions, hourly and 7-day forecasts, interactive radar maps, and severe weather alerts.\n\nUsers can save multiple locations, toggle between metric and imperial units, and receive browser notifications for weather alerts.",
    tech: ["React", "OpenWeatherMap API", "Mapbox", "Chart.js"],
    screenshots: [
      "https://picsum.photos/seed/weather1/800/500",
      "https://picsum.photos/seed/weather2/800/500",
      "https://picsum.photos/seed/weather3/800/500",
    ],
    live_url: "https://example.com",
    github_url: "https://github.com/example/weather",
    order: 3,
  },
];

const FALLBACK_LEARNINGS: Learning[] = [
  {
    id: "1",
    title: "Server Components vs Client Components",
    summary:
      "Understanding the mental model behind React Server Components and when to use each pattern.",
    full_details:
      "React Server Components (RSC) run only on the server and produce HTML that gets streamed to the client. They can directly access databases, file systems, and other server-only resources without exposing secrets to the browser.\n\nClient Components are the traditional React components that run in the browser. You need them when using state, effects, browser APIs, or event handlers.\n\nThe key insight: start with Server Components by default and only add 'use client' when you need interactivity. This gives you smaller bundles and better performance out of the box.\n\nCommon patterns:\n- Fetching data in Server Components and passing it down as props\n- Wrapping interactive parts in Client Components\n- Using composition to keep the server/client boundary clean",
    order: 0,
  },
  {
    id: "2",
    title: "Database Indexing Strategies",
    summary:
      "How proper indexing can turn a 5-second query into a 5ms query — practical PostgreSQL tips.",
    full_details:
      "Database indexes are data structures that speed up read queries at the cost of slightly slower writes and extra storage. In PostgreSQL, the default B-tree index works well for most cases, but understanding when to use other types is crucial.\n\nKey takeaways:\n- Always index foreign keys and columns used in WHERE clauses\n- Use composite indexes for queries that filter on multiple columns\n- EXPLAIN ANALYZE is your best friend for understanding query performance\n- Partial indexes can dramatically reduce index size when you only query a subset of rows\n- GIN indexes are excellent for JSONB columns and full-text search\n\nRule of thumb: if a query is slow, check its execution plan before adding indexes randomly.",
    order: 1,
  },
  {
    id: "3",
    title: "Effective TypeScript Patterns",
    summary:
      "Practical patterns for writing type-safe code that actually improves developer experience.",
    full_details:
      "TypeScript is most valuable when it catches bugs before runtime and provides better autocompletion. Here are patterns I use daily:\n\n1. Discriminated Unions: Use a literal type field to narrow union types safely.\n2. Branded Types: Create nominal types for IDs and other primitives that shouldn't be mixed.\n3. Const Assertions: Use 'as const' to get literal types from objects and arrays.\n4. Template Literal Types: Build type-safe string patterns.\n5. Zod for Runtime Validation: Pair TypeScript with Zod to validate data at boundaries.\n\nThe goal is to make invalid states unrepresentable. If your types are designed well, many categories of bugs simply cannot occur.",
    order: 2,
  },
  {
    id: "4",
    title: "CSS Container Queries",
    summary:
      "Moving beyond media queries — responsive components that adapt to their container, not the viewport.",
    full_details:
      "Container queries let you style elements based on the size of their parent container rather than the viewport. This is a game-changer for component-based architectures.\n\nWith @container, a card component can rearrange its layout whether it's in a wide main content area or a narrow sidebar — without knowing anything about the page layout.\n\nKey concepts:\n- Define a containment context with 'container-type: inline-size'\n- Query it with '@container (min-width: 400px) { ... }'\n- Container query units (cqw, cqh) for fluid sizing relative to the container\n- Named containers for targeting specific ancestors\n\nBrowser support is now excellent, making this production-ready for modern projects.",
    order: 3,
  },
];

/* ── Data fetching functions ── */

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://your-project.supabase.co"
  );
}

export async function getSettings(): Promise<SiteSettings> {
  if (!isSupabaseConfigured()) return FALLBACK_SETTINGS;
  try {
    const db = createServerSupabase();
    const { data, error } = await db
      .from("settings")
      .select("*")
      .eq("id", 1)
      .single();
    if (error || !data) return FALLBACK_SETTINGS;
    return {
      ...data,
      skills: typeof data.skills === "string" ? JSON.parse(data.skills) : data.skills,
    } as SiteSettings;
  } catch {
    return FALLBACK_SETTINGS;
  }
}

export async function getProjects(): Promise<Project[]> {
  if (!isSupabaseConfigured()) return FALLBACK_PROJECTS;
  try {
    const db = createServerSupabase();
    const { data, error } = await db
      .from("projects")
      .select("*")
      .order("order", { ascending: true });
    if (error || !data) return FALLBACK_PROJECTS;
    return data.map((p) => ({
      ...p,
      tech: typeof p.tech === "string" ? JSON.parse(p.tech) : p.tech,
      screenshots:
        typeof p.screenshots === "string"
          ? JSON.parse(p.screenshots)
          : p.screenshots,
    })) as Project[];
  } catch {
    return FALLBACK_PROJECTS;
  }
}

export async function getLearnings(): Promise<Learning[]> {
  if (!isSupabaseConfigured()) return FALLBACK_LEARNINGS;
  try {
    const db = createServerSupabase();
    const { data, error } = await db
      .from("learnings")
      .select("*")
      .order("order", { ascending: true });
    if (error || !data) return FALLBACK_LEARNINGS;
    return data as Learning[];
  } catch {
    return FALLBACK_LEARNINGS;
  }
}

export { FALLBACK_SETTINGS, FALLBACK_PROJECTS, FALLBACK_LEARNINGS };
