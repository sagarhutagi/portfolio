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
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  return (
    <aside className="w-56 min-h-screen bg-card flex flex-col py-6 px-4 shrink-0">
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm font-semibold text-foreground">Admin</p>
        <p className="text-xs text-muted-foreground">Portfolio Dashboard</p>
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
              className={`flex items-center gap-3 px-3 py-2 text-sm rounded-sm ${
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
    </aside>
  );
}
