"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Settings,
  FolderOpen,
  BookOpen,
  MessageSquare,
  LogOut,
  Home,
  Briefcase,
  BarChart3,
  Menu,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const ADMIN_LINKS = [
  { href: "/admin", label: "Dashboard", icon: Home },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/projects", label: "Projects", icon: FolderOpen },
  { href: "/admin/learnings", label: "Learnings", icon: BookOpen },
  { href: "/admin/experience", label: "Experience", icon: Briefcase },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  /* Close mobile menu on route change */
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  /* Lock body scroll when mobile menu is open */
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [mobileOpen]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  const sidebarContent = (
    <>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">Admin</p>
          <p className="text-xs text-muted-foreground">Portfolio Dashboard</p>
        </div>
        {/* Close button — mobile only */}
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-1 text-muted-foreground hover:text-foreground"
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
      </div>

      {/* Links */}
      <nav className="flex flex-col gap-1 flex-1">
        {ADMIN_LINKS.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 sm:py-2 text-sm rounded-sm ${
                isActive
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
              data-interactive
            >
              <Icon size={16} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="flex flex-col gap-2 pt-4">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground"
          data-interactive
        >
          ← View Site
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground"
          data-interactive
        >
          <LogOut size={14} />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* ── Mobile top bar ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-card border-b border-border">
        <div>
          <p className="text-sm font-semibold text-foreground">Admin</p>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-1.5 text-muted-foreground hover:text-foreground"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* ── Mobile sidebar overlay ── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          {/* Sidebar panel */}
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-card flex flex-col py-6 px-4 shadow-xl overflow-y-auto">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex w-56 min-h-screen bg-card flex-col py-6 px-4 shrink-0">
        {sidebarContent}
      </aside>
    </>
  );
}
