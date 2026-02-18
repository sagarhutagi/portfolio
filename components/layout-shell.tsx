"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./navbar";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <main>{children}</main>;
  }

  return (
    <>
      <Navbar />
      <main className="md:ml-48">{children}</main>
    </>
  );
}
