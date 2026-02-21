/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og";
import { getProjectBySlug, getSettings, getProjects } from "@/lib/data";
import { slugify } from "@/lib/utils";

export const runtime = "nodejs";
export const alt = "Project";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ slug: slugify(p.title) }));
}

export default async function ProjectOgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [project, settings] = await Promise.all([
    getProjectBySlug(slug),
    getSettings(),
  ]);

  if (!project) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#0a0a0a",
            color: "#ffffff",
            fontSize: 48,
          }}
        >
          Project not found
        </div>
      ),
      { ...size }
    );
  }

  const techTags = project.tech.slice(0, 5);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#0a0a0a",
          fontFamily: "monospace",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Grid pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            opacity: 0.06,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Accent glow top-right */}
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -120,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Accent glow bottom-left */}
        <div
          style={{
            position: "absolute",
            bottom: -80,
            left: -80,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(34,197,94,0.1) 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "50px 70px",
            height: "100%",
            position: "relative",
          }}
        >
          {/* Terminal dots */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 8,
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: "#ef4444",
                display: "flex",
              }}
            />
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: "#eab308",
                display: "flex",
              }}
            />
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: "#22c55e",
                display: "flex",
              }}
            />
          </div>

          {/* Terminal path */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginTop: 16,
            }}
          >
            <span style={{ color: "#22c55e", fontSize: 22 }}>❯</span>
            <span style={{ color: "#6b7280", fontSize: 18 }}>
              ~/portfolio/projects/{slug}
            </span>
          </div>

          {/* Project title */}
          <h1
            style={{
              fontSize: 56,
              fontWeight: 700,
              color: "#ffffff",
              margin: 0,
              marginTop: 24,
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}
          >
            {project.title}
          </h1>

          {/* Description */}
          <p
            style={{
              fontSize: 22,
              color: "#71717a",
              marginTop: 16,
              lineHeight: 1.5,
              maxWidth: 800,
            }}
          >
            {project.short_desc}
          </p>

          {/* Tech tags */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              marginTop: 32,
            }}
          >
            {techTags.map((t) => (
              <span
                key={t}
                style={{
                  padding: "8px 16px",
                  borderRadius: 6,
                  backgroundColor: "rgba(99,102,241,0.1)",
                  border: "1px solid rgba(99,102,241,0.2)",
                  color: "#a5b4fc",
                  fontSize: 16,
                  display: "flex",
                }}
              >
                {t}
              </span>
            ))}
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: "auto",
              paddingTop: 16,
              borderTop: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <span style={{ color: "#a1a1aa", fontSize: 16 }}>
              {settings.name} · {settings.title}
            </span>
            <span style={{ color: "#52525b", fontSize: 14 }}>
              {settings.email}
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
