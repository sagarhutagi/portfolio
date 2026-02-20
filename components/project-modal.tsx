"use client";

import { useEffect } from "react";
import type { Project } from "@/types";
import { X, ExternalLink, Github } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import Image from "next/image";

interface ProjectModalProps {
  project: Project;
  onClose: () => void;
}

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  /* Lock body scroll while modal is open */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
      {/* Close button */}
      <button
        onClick={onClose}
        className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 p-2 text-muted-foreground hover:text-[var(--accent-color)] transition-colors bg-background/80 backdrop-blur-sm"
        aria-label="Close project details"
        data-interactive
      >
        <X size={20} />
      </button>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:px-8 md:pl-12">
        {/* Title */}
        <p className="text-xs text-muted-foreground mb-2">$ cat ./projects/{project.title.toLowerCase().replace(/\s+/g, "-")}</p>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight mb-6 sm:mb-8">
          {project.title}
        </h1>

        {/* ── Overview ── */}
        {project.long_desc && (
          <section className="mb-10">
            <h2 className="text-xs text-[var(--accent-color)] mb-4">
              <span className="text-muted-foreground">// </span>overview
            </h2>
            <div className="text-sm text-foreground/80 whitespace-pre-line leading-relaxed">
              {project.long_desc}
            </div>
          </section>
        )}

        {/* ── Tech Stack ── */}
        {project.tech.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xs text-[var(--accent-color)] mb-4">
              <span className="text-muted-foreground">// </span>tech_stack
            </h2>
            <div className="flex flex-wrap gap-2">
              {project.tech.map((t) => (
                <Badge
                  key={t}
                  variant="default"
                  className="text-xs px-2.5 py-1"
                >
                  {t}
                </Badge>
              ))}
            </div>
          </section>
        )}

        {/* ── Screenshots ── */}
        {project.screenshots.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xs text-[var(--accent-color)] mb-4">
              <span className="text-muted-foreground">// </span>screenshots
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {project.screenshots.map((src, i) => (
                <div
                  key={i}
                  className="relative aspect-video border border-border overflow-hidden"
                >
                  <Image
                    src={src}
                    alt={`${project.title} screenshot ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Links ── */}
        {(project.live_url || project.github_url) && (
          <section className="mb-10">
            <h2 className="text-xs text-[var(--accent-color)] mb-4">
              <span className="text-muted-foreground">// </span>links
            </h2>
            <div className="flex flex-wrap gap-3">
              {project.live_url && (
                <Button asChild>
                  <a
                    href={project.live_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink size={14} className="mr-2" />
                    Live Demo
                  </a>
                </Button>
              )}
              {project.github_url && (
                <Button variant="secondary" asChild>
                  <a
                    href={project.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github size={14} className="mr-2" />
                    GitHub
                  </a>
                </Button>
              )}
            </div>
          </section>
        )}

        {/* Back link */}
        <button
          onClick={onClose}
          className="text-xs text-muted-foreground hover:text-[var(--accent-color)] transition-colors"
          data-interactive
        >
          ← Back to projects
        </button>
      </div>
    </div>
  );
}
