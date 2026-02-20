"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  /* Avoid hydration mismatch — render placeholder until mounted */
  if (!mounted) {
    return <div className="h-9 w-9" aria-hidden />;
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="h-9 w-9 flex items-center justify-center text-muted-foreground hover:text-[var(--accent-color)] transition-colors duration-200"
      aria-label="Toggle theme"
      data-interactive
    >
      {theme === "dark" ? (
        <Sun size={18} className="transition-transform duration-300 hover:rotate-45" />
      ) : (
        <Moon size={18} className="transition-transform duration-300 hover:-rotate-12" />
      )}
    </button>
  );
}
