"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Home, FolderOpen, BookOpen, Briefcase, Mail, Menu, Github, Twitter, Linkedin } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { MobileMenu } from "./mobile-menu";
import { supabase } from "@/lib/supabase";

const NAV_LINKS = [
  { href: "#home", label: "Home", icon: Home },
  { href: "#projects", label: "Projects", icon: FolderOpen },
  { href: "#learnings", label: "Learnings", icon: BookOpen },
  { href: "#experience", label: "Experience", icon: Briefcase },
  { href: "#contact", label: "Contact", icon: Mail },
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
  const pathname = usePathname();

  /* Hide on admin routes */
  if (pathname.startsWith("/admin")) return null;

  /* Fetch social links from settings */
  useEffect(() => {
    async function loadSocials() {
      const { data } = await supabase
        .from("settings")
        .select("github_url, twitter_url, linkedin_url")
        .eq("id", 1)
        .single();
      if (data) {
        const links: SocialLink[] = [];
        if (data.github_url) links.push({ label: "GitHub", href: data.github_url, icon: Github });
        if (data.twitter_url) links.push({ label: "Twitter", href: data.twitter_url, icon: Twitter });
        if (data.linkedin_url) links.push({ label: "LinkedIn", href: data.linkedin_url, icon: Linkedin });
        setSocials(links);
      }
    }
    loadSocials();
  }, []);

  /* Hide on admin routes */
  if (pathname.startsWith("/admin")) return null;

  /* Track which section is in view */
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
      {/* ── Desktop left sidebar ── */}
      <nav className="hidden md:flex fixed left-0 top-0 bottom-0 w-48 flex-col py-6 px-4 z-40 bg-background/90 backdrop-blur-sm border-r border-border">
        {/* Logo / initials */}
        <button
          onClick={() => scrollTo("#home")}
          className="text-sm font-bold text-[var(--accent-color)] mb-8 tracking-tight text-left"
          data-interactive
        >
          <span className="text-muted-foreground">~/</span>portfolio
        </button>

        {/* Links */}
        <div className="flex flex-col gap-0.5 flex-1">
          {NAV_LINKS.map((link) => {
            const isActive = activeSection === link.href;
            return (
              <button
                key={link.href}
                onClick={() => scrollTo(link.href)}
                className={`flex items-center gap-2 px-2 py-1.5 text-xs transition-colors text-left ${
                  isActive
                    ? "text-[var(--accent-color)]"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                data-interactive
              >
                <span className="text-[var(--accent-color)] w-3">{isActive ? "▸" : " "}</span>
                {link.label.toLowerCase()}
              </button>
            );
          })}
        </div>

        {/* Separator */}
        <div className="h-px bg-border mb-4" />

        {/* Social links */}
        <div className="flex items-center gap-3 mb-4">
          {socials.map((social) => {
            const Icon = social.icon;
            return (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                title={social.label}
                className="text-muted-foreground hover:text-[var(--accent-color)] transition-colors"
                data-interactive
              >
                <Icon size={14} />
              </a>
            );
          })}
        </div>

        {/* Theme toggle */}
        <ThemeToggle />
      </nav>

      {/* ── Mobile hamburger ── */}
      <button
        className="md:hidden fixed top-4 right-4 z-50 p-2 text-foreground"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
        data-interactive
      >
        <Menu size={24} />
      </button>

      {/* Mobile overlay menu */}
      {mobileOpen && <MobileMenu onClose={() => setMobileOpen(false)} />}
    </>
  );
}
