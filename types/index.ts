/* ── Shared TypeScript types ── */

export interface SiteSettings {
  id: number;
  name: string;
  title: string;
  intro: string;
  about: string;
  skills: string[];
  current_status: string;
  resume_url: string;
}

export interface Project {
  id: string;
  title: string;
  short_desc: string;
  long_desc: string;
  tech: string[];
  screenshots: string[];
  live_url: string;
  github_url: string;
  order: number;
}

export interface Learning {
  id: string;
  title: string;
  summary: string;
  full_details: string;
  order: number;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
  is_read: boolean;
}
