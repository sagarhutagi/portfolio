"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Home, FolderOpen, BookOpen, Briefcase, Mail, Menu, Github, Twitter, Linkedin } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { MobileMenu } from "./mobile-menu";
import { supabase } from "@/lib/supabase";

const NAV_LINKS = [
  { href: "#home", label: "home", icon: Home },
  { href: "#projects", label: "projects", icon: FolderOpen },
  { href: "#learnings", label: "learnings", icon: BookOpen },
  { href: "#experience", label: "experience", icon: Briefcase },
  { href: "#contact", label: "contact", icon: Mail },
];

interface SocialLink {
  label: string;
  href: string;
  icon: typeof Github;
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("#home");
  const [socials, setSocials] = useState<SocialLink[]>([]);
  const [settings, setSettings] = useState<{ name?: string; title?: string }>({});
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) return null;

  useEffect(() => {
    async function loadSettings() {
      const { data } = await supabase
        .from("settings")
        .select("name, title, email, github_url, twitter_url, linkedin_url")
        .eq("id", 1)
        .single();
      if (data) {
        const links: SocialLink[] = [];
        if (data.github_url) links.push({ label: "GitHub", href: data.github_url, icon: Github });
        if (data.twitter_url) links.push({ label: "Twitter / X", href: data.twitter_url, icon: Twitter });
        if (data.linkedin_url) links.push({ label: "LinkedIn", href: data.linkedin_url, icon: Linkedin });
        if (data.email) links.push({ label: "Email", href: `mailto:${data.email}`, icon: Mail });
        setSocials(links);
        setSettings({ name: data.name, title: data.title });
      }
    }
    loadSettings();
  }, []);

  useEffect(() => {
    const ids = NAV_LINKS.map((l) => l.href.slice(1));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(`#${entry.target.id}`);
          }
        }
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollTo = (hash: string) => {
    const el = document.getElementById(hash.slice(1));
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <nav className="hidden md:flex fixed left-0 top-0 bottom-0 w-48 flex-col py-6 px-4 z-40 bg-background/80 backdrop-blur-md border-r border-border/60">
        {/* Branding */}
        <button
          onClick={() => scrollTo("#home")}
          className="text-left mb-8 text-sm font-mono text-[var(--accent-color)] tracking-tight"
          data-interactive
        >
          <span className="text-muted-foreground">~/</span>portfolio
        </button>

        {/* Links */}
        <div className="flex flex-col gap-0.5 flex-1">
          {NAV_LINKS.map((link) => {
            const isActive = activeSection === link.href;
            const Icon = link.icon;
            return (
              <button
                key={link.href}
                onClick={() => scrollTo(link.href)}
                className={`group flex items-center gap-2.5 px-2 py-1.5 text-xs font-mono transition-all duration-200 text-left ${
                  isActive
                    ? "text-[var(--accent-color)] bg-[var(--accent-color)]/8"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                }`}
                data-interactive
              >
                <Icon size={13} className="shrink-0" />
                {link.label}
              </button>
            );
          })}
        </div>

        {/* Bottom */}
        <div className="space-y-3">
          <div className="h-px bg-border/40" />
          <div className="flex items-center gap-2 px-1">
            {socials.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={social.label}
                  className="text-muted-foreground/60 hover:text-[var(--accent-color)] transition-colors"
                  data-interactive
                >
                  <Icon size={14} />
                </a>
              );
            })}
            <div className="ml-auto">
              <ThemeToggle />
            </div>
          </div>

          {/* Copyright */}
          <p className="text-[10px] text-muted-foreground/40 px-1">
            &copy; {new Date().getFullYear()} {settings.name || ""}
          </p>
        </div>
      </nav>

      {/* ── Mobile hamburger ── */}
      <button
        className="md:hidden fixed top-4 right-4 z-50 p-2 text-foreground bg-background/80 backdrop-blur-sm border border-border/60"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
        data-interactive
      >
        <Menu size={20} />
      </button>

      {mobileOpen && <MobileMenu onClose={() => setMobileOpen(false)} />}
    </>
  );
}
