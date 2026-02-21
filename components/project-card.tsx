import Link from "next/link";
import Image from "next/image";
import type { Project } from "@/types";
import { slugify } from "@/lib/utils";
import { Badge } from "./ui/badge";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const thumb = project.screenshots?.[0];

  return (
    <Link
      href={`/projects/${slugify(project.title)}`}
      className="project-card-enhanced text-left w-full block border border-border hover:border-[var(--accent-color)]/40 transition-colors duration-75 group overflow-hidden"
      data-interactive
    >
      {/* Banner image */}
      {thumb && (
        <div className="relative h-36 sm:h-40 w-full overflow-hidden">
          <Image
            src={thumb}
            alt={project.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>
      )}

      <div className="p-4 sm:p-5">
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
      </div>
    </Link>
  );
}
