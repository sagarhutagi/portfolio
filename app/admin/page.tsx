"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { FolderOpen, BookOpen, MessageSquare, Settings } from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  const [counts, setCounts] = useState({
    projects: 0,
    learnings: 0,
    messages: 0,
  });

  useEffect(() => {
    async function load() {
      const [p, l, m] = await Promise.all([
        supabase.from("projects").select("id", { count: "exact", head: true }),
        supabase.from("learnings").select("id", { count: "exact", head: true }),
        supabase
          .from("contact_submissions")
          .select("id", { count: "exact", head: true }),
      ]);
      setCounts({
        projects: p.count ?? 0,
        learnings: l.count ?? 0,
        messages: m.count ?? 0,
      });
    }
    load();
  }, []);

  const cards = [
    {
      label: "Projects",
      count: counts.projects,
      icon: FolderOpen,
      href: "/admin/projects",
    },
    {
      label: "Learnings",
      count: counts.learnings,
      icon: BookOpen,
      href: "/admin/learnings",
    },
    {
      label: "Messages",
      count: counts.messages,
      icon: MessageSquare,
      href: "/admin/messages",
    },
    {
      label: "Settings",
      count: null,
      icon: Settings,
      href: "/admin/settings",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Welcome back. Here&apos;s an overview of your portfolio.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className="p-6 bg-card hover:bg-muted/60 rounded-sm transition-colors duration-75"
              data-interactive
            >
              <Icon size={20} className="text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">{card.label}</p>
              {card.count !== null && (
                <p className="text-2xl font-bold mt-1">{card.count}</p>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
