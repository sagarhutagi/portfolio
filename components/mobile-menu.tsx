"use client";

import { X } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

const NAV_LINKS = [
  { href: "#home", label: "Home" },
  { href: "#projects", label: "Projects" },
  { href: "#learnings", label: "Learnings" },
  { href: "#experience", label: "Experience" },
  { href: "#contact", label: "Contact" },
];

interface MobileMenuProps {
  onClose: () => void;
}

export function MobileMenu({ onClose }: MobileMenuProps) {
  const scrollTo = (hash: string) => {
    onClose();
    // Small delay so the overlay closes before scrolling
    setTimeout(() => {
      const el = document.getElementById(hash.slice(1));
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col items-start justify-center gap-5 px-6 sm:px-8">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-[var(--accent-color)]" 
        aria-label="Close menu"
        data-interactive
      >
        <X size={20} />
      </button>

      <p className="text-xs text-muted-foreground mb-2">$ navigate</p>

      {/* Links */}
      {NAV_LINKS.map((link) => (
        <button
          key={link.href}
          onClick={() => scrollTo(link.href)}
          className="text-base sm:text-lg font-medium text-foreground hover:text-[var(--accent-color)] transition-colors"
          data-interactive
        >
          <span className="text-[var(--accent-color)] mr-2">▸</span>
          {link.label.toLowerCase()}
        </button>
      ))}

      <div className="mt-4">
        <ThemeToggle />
      </div>
    </div>
  );
}
