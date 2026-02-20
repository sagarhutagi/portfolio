import type { Metadata } from "next";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { Mail, MapPin, Github, Twitter, Linkedin, User } from "lucide-react";
import { getSettings, getProjects, getLearnings, getExperience } from "@/lib/data";
import { ProjectsView } from "@/components/projects-view";
import { LearningsView } from "@/components/learnings-view";
import { ExperienceView } from "@/components/experience-view";
import { OrbitingSkills } from "@/components/orbiting-skills";
import { ContactForm } from "@/components/contact-form";
import { TerminalDrawer } from "@/components/terminal-drawer";

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

function buildSocialsPlain(s: { github_url: string; twitter_url: string; linkedin_url: string }) {
  const list: { label: string; href: string }[] = [];
  if (s.github_url) list.push({ label: "GitHub", href: s.github_url });
  if (s.twitter_url) list.push({ label: "Twitter / X", href: s.twitter_url });
  if (s.linkedin_url) list.push({ label: "LinkedIn", href: s.linkedin_url });
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
  const SOCIALS_PLAIN = buildSocialsPlain(s);

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

      <div className="px-6 py-14 md:py-20 md:pl-12 md:pr-8 max-w-4xl">
        {/* ── Hero ── */}
        <section id="home" className="mb-20 scroll-mt-20">
          <div className="flex items-start gap-6 mb-6">
            {/* Profile picture placeholder */}
            <div className="shrink-0 w-20 h-20 md:w-24 md:h-24 border border-[var(--accent-color)]/40 flex items-center justify-center overflow-hidden bg-[var(--accent-color)]/5">
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
              <p className="text-xs text-muted-foreground mb-2">$ whoami</p>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-1">
                {s.name}
              </h1>
              <p className="text-[var(--accent-color)]">{s.title}</p>
            </div>
          </div>
          <p className="text-muted-foreground max-w-lg mb-6 leading-relaxed text-sm">
            <span className="text-[var(--accent-color)] mr-2">&gt;</span>
            {s.intro}
          </p>
          <a
            href={s.resume_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs border border-[var(--accent-color)]/40 px-4 py-2 text-[var(--accent-color)] hover:bg-[var(--accent-color)]/10 transition-colors"
            data-interactive
          >
            View Resume <ExternalLink size={12} />
          </a>
        </section>

        {/* ── Skills & About side-by-side ── */}
        <section className="mb-20 grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Skills — orbiting animation */}
          <div>
            <h2 className="text-xs text-[var(--accent-color)] mb-4">
              <span className="text-muted-foreground">// </span>skills
            </h2>
            <OrbitingSkills skills={s.skills} />
          </div>

          {/* About */}
          <div>
            <h2 className="text-xs text-[var(--accent-color)] mb-4">
              <span className="text-muted-foreground">// </span>about
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {s.about}
            </p>
          </div>
        </section>

        {/* ── Info cards ── */}
        <section className="mb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-4 border border-border">
              <p className="text-[10px] text-[var(--accent-color)] uppercase tracking-wider mb-1">location</p>
              <p className="text-sm">{s.location}</p>
            </div>
            <div className="p-4 border border-border">
              <p className="text-[10px] text-[var(--accent-color)] uppercase tracking-wider mb-1">focus</p>
              <p className="text-sm">{s.focus}</p>
            </div>
            <div className="p-4 border border-border">
              <p className="text-[10px] text-[var(--accent-color)] uppercase tracking-wider mb-1">reading</p>
              <p className="text-sm">{s.reading}</p>
            </div>
            <div className="p-4 border border-border">
              <p className="text-[10px] text-[var(--accent-color)] uppercase tracking-wider mb-1">interests</p>
              <p className="text-sm">{s.interests}</p>
            </div>
          </div>
        </section>

        {/* ── Projects ── */}
        <section id="projects" className="mb-20 scroll-mt-20">
          <h2 className="text-xl font-bold tracking-tight mb-1">
            <span className="text-[var(--accent-color)] mr-2">$</span>ls ./projects
          </h2>
          <p className="text-xs text-muted-foreground mb-8">
            Things I&apos;ve built and contributed to.
          </p>
          <ProjectsView projects={projects} />
        </section>

        {/* ── Learnings ── */}
        <section id="learnings" className="mb-20 scroll-mt-20">
          <h2 className="text-xl font-bold tracking-tight mb-1">
            <span className="text-[var(--accent-color)] mr-2">$</span>cat ./learnings
          </h2>
          <p className="text-xs text-muted-foreground mb-8">
            Notes, insights, and things I&apos;ve picked up along the way.
          </p>
          <LearningsView learnings={learnings} />
        </section>

        {/* ── Experience ── */}
        <section id="experience" className="mb-20 scroll-mt-20">
          <h2 className="text-xl font-bold tracking-tight mb-1">
            <span className="text-[var(--accent-color)] mr-2">$</span>cat ./experience
          </h2>
          <p className="text-xs text-muted-foreground mb-8">
            My professional journey and work history.
          </p>
          <ExperienceView experience={experience} />
        </section>

        {/* ── Contact ── */}
        <section id="contact" className="mb-14 scroll-mt-20">
          <h2 className="text-xl font-bold tracking-tight mb-1">
            <span className="text-[var(--accent-color)] mr-2">$</span>send --message
          </h2>
          <p className="text-xs text-muted-foreground mb-8">
            Have a question or want to work together? Drop me a message.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <ContactForm />

            <div className="space-y-8">
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

              <div className="flex items-start gap-3">
                <MapPin size={18} className="mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">
                    Location
                  </p>
                  <p className="text-sm text-foreground">{s.location}</p>
                </div>
              </div>

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
                        className="text-muted-foreground hover:text-foreground"
                        data-interactive
                      >
                        <Icon size={20} />
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <TerminalDrawer
        settings={s}
        projects={projects}
        learnings={learnings}
        experience={experience}
        socials={SOCIALS_PLAIN}
      />
    </>
  );
}
