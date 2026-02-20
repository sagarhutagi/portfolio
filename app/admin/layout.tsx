"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { AdminSidebar } from "@/components/admin-sidebar";
import type { User } from "@supabase/supabase-js";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    /* Check initial session */
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    /* Subscribe to auth changes */
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading && !user && pathname !== "/admin/login") {
      router.push("/admin/login");
    }
  }, [loading, user, pathname, router]);

  /* Login page — skip auth check, just render */
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  /* Loading or not authenticated — show loading state */
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground text-sm">
        Loading…
      </div>
    );
  }

  /* Authenticated — render admin with sidebar */
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 pt-16 md:pt-0 p-4 sm:p-6 md:p-8 overflow-y-auto">{children}</div>
    </div>
  );
}
