import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ExternalLink, Github, ArrowLeft } from "lucide-react";
import { getProjects, getProjectBySlug, getSettings } from "@/lib/data";
import { slugify } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/scroll-reveal";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ slug: slugify(p.title) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [project, settings] = await Promise.all([
    getProjectBySlug(slug),
    getSettings(),
  ]);
  if (!project) return {};

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";
  const title = `${project.title} — ${settings.name}`;
  const description = project.short_desc;

  return {
    title: project.title,
    description,
    openGraph: {
      title,
      description,
      url: `${siteUrl}/projects/${slug}`,
      type: "article",
      images: [
        {
          url: `/projects/${slug}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/projects/${slug}/opengraph-image`],
    },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <div className="px-4 sm:px-6 py-10 md:py-16 md:pl-12 md:pr-8 max-w-3xl">
      {/* Back link */}
      <Link
        href="/#projects"
        className="inline-flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-[var(--accent-color)] transition-colors mb-8"
        data-interactive
      >
        <ArrowLeft size={14} />
        back to projects
      </Link>

      {/* Terminal-style path */}
      <p className="text-xs text-muted-foreground mb-2 font-mono">
        $ cat ./projects/{slug}
      </p>

      {/* Title */}
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight mb-6 sm:mb-8">
        {project.title}
      </h1>

      {/* Overview */}
      {project.long_desc && (
        <ScrollReveal>
          <section className="mb-10">
            <h2 className="text-xs text-[var(--accent-color)] mb-4 font-mono">
              <span className="text-muted-foreground">// </span>overview
            </h2>
            <div className="text-sm text-foreground/80 whitespace-pre-line leading-relaxed">
              {project.long_desc}
            </div>
          </section>
        </ScrollReveal>
      )}

      {/* Tech Stack */}
      {project.tech.length > 0 && (
        <ScrollReveal delay={100}>
          <section className="mb-10">
            <h2 className="text-xs text-[var(--accent-color)] mb-4 font-mono">
              <span className="text-muted-foreground">// </span>tech_stack
            </h2>
            <div className="flex flex-wrap gap-2">
              {project.tech.map((t) => (
                <Badge key={t} variant="default" className="text-xs px-2.5 py-1">
                  {t}
                </Badge>
              ))}
            </div>
          </section>
        </ScrollReveal>
      )}

      {/* Screenshots */}
      {project.screenshots.length > 0 && (
        <ScrollReveal delay={200}>
          <section className="mb-10">
            <h2 className="text-xs text-[var(--accent-color)] mb-4 font-mono">
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
        </ScrollReveal>
      )}

      {/* Links */}
      {(project.live_url || project.github_url) && (
        <ScrollReveal delay={300}>
          <section className="mb-10">
            <h2 className="text-xs text-[var(--accent-color)] mb-4 font-mono">
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
        </ScrollReveal>
      )}

      {/* Back link bottom */}
      <Link
        href="/#projects"
        className="text-xs text-muted-foreground hover:text-[var(--accent-color)] transition-colors font-mono"
        data-interactive
      >
        ← back to projects
      </Link>
    </div>
  );
}
