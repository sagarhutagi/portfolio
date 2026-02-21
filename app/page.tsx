import type { Metadata } from "next";
import Image from "next/image";
import { ExternalLink, FileText } from "lucide-react";
import { Mail, MapPin, Github, Twitter, Linkedin, User, Heart } from "lucide-react";
import { getSettings, getProjects, getLearnings, getExperience } from "@/lib/data";
import { ProjectsView } from "@/components/projects-view";
import { LearningsView } from "@/components/learnings-view";
import { ExperienceView } from "@/components/experience-view";
import { OrbitingSkills } from "@/components/orbiting-skills";
import { ContactForm } from "@/components/contact-form";
import { ScrambleText } from "@/components/scramble-text";
import { TerminalToggle } from "@/components/terminal-toggle";
import { ScrollReveal } from "@/components/scroll-reveal";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";
  return {
    title: `${s.name} — ${s.title}`,
    description: s.intro,
    openGraph: {
      title: `${s.name} — ${s.title}`,
      description: s.intro,
      images: [
        {
          url: `${siteUrl}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${s.name} — ${s.title}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${s.name} — ${s.title}`,
      description: s.intro,
      images: [`${siteUrl}/twitter-image`],
    },
  };
}

const SOCIAL_ICON_MAP = {
  GitHub: Github,
  "Twitter / X": Twitter,
  LinkedIn: Linkedin,
};

function buildSocials(s: { github_url: string; twitter_url: string; linkedin_url: string }) {
  const list: { label: string; href: string; icon: typeof Github }[] = [];
  if (s.github_url) list.push({ label: "GitHub", href: s.github_url, icon: Github });
  if (s.twitter_url) list.push({ label: "Twitter / X", href: s.twitter_url, icon: Twitter });
  if (s.linkedin_url) list.push({ label: "LinkedIn", href: s.linkedin_url, icon: Linkedin });
  return list;
}

export default async function HomePage() {
  const [s, projects, learnings, experience] = await Promise.all([
    getSettings(),
    getProjects(),
    getLearnings(),
    getExperience(),
  ]);

  const SOCIALS = buildSocials(s);

  /* JSON-LD structured data */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: s.name,
    jobTitle: s.title,
    description: s.intro,
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="px-4 sm:px-6 py-10 md:py-20 md:pl-12 md:pr-8 max-w-4xl">
        {/* ── Hero ── */}
        <section id="home" className="mb-14 sm:mb-20 scroll-mt-20 relative">
          {/* Ambient glow behind hero */}
          <div className="hero-glow" aria-hidden />

          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 mb-6">
            {/* Profile picture */}
            <div className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 border border-[var(--accent-color)]/40 hover:border-[var(--accent-color)] flex items-center justify-center overflow-hidden bg-[var(--accent-color)]/5 transition-all duration-300 hover:shadow-[0_0_20px_rgba(var(--accent-rgb),0.15)]">
              {s.profile_image_url ? (
                <Image
                  src={s.profile_image_url}
                  alt={s.name}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={36} className="text-[var(--accent-color)]/60" />
              )}
            </div>
            <div>
              <p className="text-xs font-mono text-muted-foreground mb-2">$ whoami</p>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-1">
                <ScrambleText text={s.name} delay={200} speed={40} />
              </h1>
              <p className="text-sm sm:text-base text-[var(--accent-color)] font-mono">
                <ScrambleText text={s.title} delay={600} speed={35} />
              </p>
            </div>
          </div>
          {s.intro && (
            <p className="text-muted-foreground max-w-lg mb-6 leading-relaxed text-sm sm:text-base">
              <span className="text-[var(--accent-color)] mr-2 font-mono">&gt;</span>
              <span dangerouslySetInnerHTML={{ __html: s.intro }} />
            </p>
          )}
          {/* Action links */}
          <div className="flex flex-wrap items-center gap-3">
            {s.github_url && (
              <a
                href={s.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-mono border border-border px-4 py-2 text-foreground hover:border-[var(--accent-color)]/60 hover:text-[var(--accent-color)] hover:bg-[var(--accent-color)]/5 transition-all duration-200"
                data-interactive
              >
                <Github size={13} /> GitHub
              </a>
            )}
            {s.linkedin_url && (
              <a
                href={s.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-mono border border-border px-4 py-2 text-foreground hover:border-[var(--accent-color)]/60 hover:text-[var(--accent-color)] hover:bg-[var(--accent-color)]/5 transition-all duration-200"
                data-interactive
              >
                <Linkedin size={13} /> LinkedIn
              </a>
            )}
            {s.resume_url && (
              <a
                href={s.resume_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-mono border border-border px-4 py-2 text-foreground hover:border-[var(--accent-color)]/60 hover:text-[var(--accent-color)] hover:bg-[var(--accent-color)]/5 transition-all duration-200"
                data-interactive
              >
                <FileText size={13} /> Resume
              </a>
            )}
          </div>
        </section>

        {/* ── Skills & About side-by-side ── */}
        {(s.skills.length > 0 || s.about) && (
          <ScrollReveal>
            <div className="section-divider" aria-hidden />
            <section className="mb-14 sm:mb-20 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              {/* Skills — orbiting animation */}
              {s.skills.length > 0 && (
                <div>
                  <h2 className="text-xs font-mono text-[var(--accent-color)] mb-4">
                    <span className="text-muted-foreground">// </span>skills
                  </h2>
                  <OrbitingSkills skills={s.skills} />
                </div>
              )}

              {/* About */}
              {s.about && (
                <div>
                  <h2 className="text-xs font-mono text-[var(--accent-color)] mb-4">
                    <span className="text-muted-foreground">// </span>about
                  </h2>
                  <div
                    className="text-sm text-muted-foreground leading-relaxed prose-rendered"
                    dangerouslySetInnerHTML={{ __html: s.about }}
                  />
                </div>
              )}
            </section>
          </ScrollReveal>
        )}

        {/* ── Info cards ── */}
        {(s.location || s.focus || s.reading || s.interests) && (
          <ScrollReveal delay={100}>
            <div className="section-divider" aria-hidden />
            <section className="mb-14 sm:mb-20">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {s.location && (
                  <div className="info-card p-4 border border-border">
                    <p className="text-[10px] font-mono text-[var(--accent-color)] uppercase tracking-wider mb-1">location</p>
                    <p className="text-sm">{s.location}</p>
                  </div>
                )}
                {s.focus && (
                  <div className="info-card p-4 border border-border">
                    <p className="text-[10px] font-mono text-[var(--accent-color)] uppercase tracking-wider mb-1">focus</p>
                    <p className="text-sm">{s.focus}</p>
                  </div>
                )}
                {s.reading && (
                  <div className="info-card p-4 border border-border">
                    <p className="text-[10px] font-mono text-[var(--accent-color)] uppercase tracking-wider mb-1">reading</p>
                    <p className="text-sm">{s.reading}</p>
                  </div>
                )}
                {s.interests && (
                  <div className="info-card p-4 border border-border">
                    <p className="text-[10px] font-mono text-[var(--accent-color)] uppercase tracking-wider mb-1">interests</p>
                    <p className="text-sm">{s.interests}</p>
                  </div>
                )}
              </div>
            </section>
          </ScrollReveal>
        )}

        {/* ── Projects ── */}
        {projects.length > 0 && (
          <ScrollReveal>
            <div className="section-divider" aria-hidden />
            <section id="projects" className="mb-14 sm:mb-20 scroll-mt-20">
              <h2 className="text-base sm:text-xl font-bold tracking-tight mb-1">
                <span className="text-[var(--accent-color)] mr-2">$</span>ls ./projects
              </h2>
              <p className="text-xs text-muted-foreground mb-8">
                Things I&apos;ve built and contributed to.
              </p>
              <ProjectsView projects={projects} />
            </section>
          </ScrollReveal>
        )}

        {/* ── Learnings ── */}
        {learnings.length > 0 && (
          <ScrollReveal>
            <div className="section-divider" aria-hidden />
            <section id="learnings" className="mb-14 sm:mb-20 scroll-mt-20">
              <h2 className="text-base sm:text-xl font-bold tracking-tight mb-1">
                <span className="text-[var(--accent-color)] mr-2">$</span>cat ./learnings
              </h2>
              <p className="text-xs text-muted-foreground mb-6 sm:mb-8">
                Notes, insights, and things I&apos;ve picked up along the way.
              </p>
              <LearningsView learnings={learnings} />
            </section>
          </ScrollReveal>
        )}

        {/* ── Experience ── */}
        {experience.length > 0 && (
          <ScrollReveal>
            <div className="section-divider" aria-hidden />
            <section id="experience" className="mb-14 sm:mb-20 scroll-mt-20">
              <h2 className="text-base sm:text-xl font-bold tracking-tight mb-1">
                <span className="text-[var(--accent-color)] mr-2">$</span>cat ./experience
              </h2>
              <p className="text-xs text-muted-foreground mb-8">
                My professional journey and work history.
              </p>
              <ExperienceView experience={experience} />
            </section>
          </ScrollReveal>
        )}

        {/* ── Contact ── */}
        <ScrollReveal>
          <div className="section-divider" aria-hidden />
          <section id="contact" className="mb-14 scroll-mt-20">
            <h2 className="text-base sm:text-xl font-bold tracking-tight mb-1">
              <span className="text-[var(--accent-color)] mr-2">$</span>send --message
            </h2>
            <p className="text-xs text-muted-foreground mb-6 sm:mb-8">
              Have a question or want to work together? Drop me a message.
            </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            <ContactForm />

            <div className="space-y-8">
              {s.email && (
                <div className="flex items-start gap-3">
                  <Mail size={18} className="mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Email</p>
                    <a
                      href={`mailto:${s.email}`}
                      className="text-sm text-foreground hover:text-[var(--accent-color)]"
                      data-interactive
                    >
                      {s.email}
                    </a>
                  </div>
                </div>
              )}

              {s.location && (
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">
                      Location
                    </p>
                    <p className="text-sm text-foreground">{s.location}</p>
                  </div>
                </div>
              )}

              {SOCIALS.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-3">Socials</p>
                  <div className="flex gap-4">
                    {SOCIALS.map((social) => {
                      const Icon = social.icon;
                      return (
                        <a
                          key={social.label}
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={social.label}
                          className="text-muted-foreground hover:text-[var(--accent-color)] hover:-translate-y-0.5 transition-all duration-200"
                          data-interactive
                        >
                          <Icon size={20} />
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
          </section>
        </ScrollReveal>

        {/* ── Footer ── */}
        <footer className="mt-8 mb-10">
          <div className="footer-gradient-line mb-6" aria-hidden />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-muted-foreground/50">
            <p>
              &copy; {new Date().getFullYear()} {s.name}. All rights reserved.
            </p>
            <p className="flex items-center gap-1">
              Built with <Heart size={10} className="text-[var(--accent-color)]/60" /> using Next.js &amp; Tailwind
            </p>
          </div>
        </footer>
      </div>

      <TerminalToggle
        settings={s}
        projects={projects}
        learnings={learnings}
        experience={experience}
        socials={SOCIALS.map(({ label, href }) => ({ label, href }))}
      />
    </>
  );
}
