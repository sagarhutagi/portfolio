"use client";

import type { Project } from "@/types";
import { Badge } from "./ui/badge";

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  return (
    <button
      onClick={onClick}
      className="text-left w-full p-5 border border-border hover:border-[var(--accent-color)]/40 transition-colors duration-75 group"
      data-interactive
    >
      <h3 className="text-sm font-semibold text-foreground mb-2 group-hover:text-[var(--accent-color)] transition-colors">
        <span className="text-[var(--accent-color)] mr-1.5">▸</span>
        {project.title}
      </h3>
      <p className="text-xs text-muted-foreground mb-4 line-clamp-2">
        {project.short_desc}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {project.tech.map((t) => (
          <Badge key={t} variant="secondary" className="text-[10px]">
            {t}
          </Badge>
        ))}
      </div>
    </button>
  );
}
