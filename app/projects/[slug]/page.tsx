import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink, Github, ArrowLeft } from "lucide-react";
import { getProjects, getProjectBySlug, getSettings } from "@/lib/data";
import { slugify } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/scroll-reveal";
import { ScreenshotGallery } from "@/components/screenshot-gallery";

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
  const ogImageUrl = `${siteUrl}/projects/${slug}/opengraph-image`;

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
          url: ogImageUrl,
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
      images: [ogImageUrl],
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
            <div
              className="text-sm text-foreground/80 leading-relaxed prose-rendered"
              dangerouslySetInnerHTML={{ __html: project.long_desc }}
            />
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
            <ScreenshotGallery
              screenshots={project.screenshots}
              projectTitle={project.title}
            />
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
