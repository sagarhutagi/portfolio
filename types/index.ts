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
  // Contact & location
  email: string;
  location: string;
  // Social links
  github_url: string;
  twitter_url: string;
  linkedin_url: string;
  // Info cards
  focus: string;
  reading: string;
  interests: string;
  // Profile image
  profile_image_url: string;
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

export interface WorkExperience {
  id: string;
  company: string;
  role: string;
  start_date: string;
  end_date: string; // empty string = "Present"
  description: string;
  tech: string[];
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

export interface PageView {
  id: string;
  path: string;
  referrer: string;
  user_agent: string;
  country: string;
  city: string;
  device: string;
  browser: string;
  os: string;
  created_at: string;
}
