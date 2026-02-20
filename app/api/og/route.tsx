/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og";
import { type NextRequest } from "next/server";
import { getSettings, getProjects, getLearnings } from "@/lib/data";

export const runtime = "nodejs";

const SIZE = { width: 1200, height: 630 };

// Shared background wrapper
function OgBackground({ children }: { children: React.ReactNode }) {
  return (
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
      {/* Accent glow */}
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
      {children}
    </div>
  );
}

function TerminalDots() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
      <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#ef4444", display: "flex" }} />
      <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#eab308", display: "flex" }} />
      <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#22c55e", display: "flex" }} />
    </div>
  );
}

async function renderProjects() {
  const [s, projects] = await Promise.all([getSettings(), getProjects()]);
  const top = projects.slice(0, 3);

  return (
    <OgBackground>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "50px 70px",
          height: "100%",
          position: "relative",
        }}
      >
        <TerminalDots />
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16 }}>
          <span style={{ color: "#22c55e", fontSize: 22 }}>❯</span>
          <span style={{ color: "#6b7280", fontSize: 18 }}>~/portfolio/projects</span>
        </div>

        <h1
          style={{
            fontSize: 52,
            fontWeight: 700,
            color: "#ffffff",
            margin: 0,
            marginTop: 20,
            letterSpacing: "-0.02em",
          }}
        >
          Projects
        </h1>
        <p style={{ fontSize: 20, color: "#71717a", marginTop: 4 }}>
          by {s.name} · {s.title}
        </p>

        {/* Project cards */}
        <div
          style={{
            display: "flex",
            gap: 20,
            marginTop: 28,
            flex: 1,
          }}
        >
          {top.map((p, i) => (
            <div
              key={p.id}
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                padding: "20px 22px",
                borderRadius: 10,
                backgroundColor: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: "#6366f1", fontSize: 16 }}>0{i + 1}</span>
                <span style={{ color: "#ffffff", fontSize: 20, fontWeight: 600 }}>
                  {p.title}
                </span>
              </div>
              <p
                style={{
                  color: "#71717a",
                  fontSize: 14,
                  marginTop: 8,
                  lineHeight: 1.5,
                  display: "-webkit-box",
                  overflow: "hidden",
                }}
              >
                {p.short_desc.slice(0, 80)}…
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: "auto" }}>
                {p.tech.slice(0, 3).map((t) => (
                  <span
                    key={t}
                    style={{
                      padding: "4px 10px",
                      borderRadius: 4,
                      backgroundColor: "rgba(99,102,241,0.1)",
                      border: "1px solid rgba(99,102,241,0.2)",
                      color: "#a5b4fc",
                      fontSize: 12,
                      display: "flex",
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 16,
            paddingTop: 12,
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <span style={{ color: "#52525b", fontSize: 14 }}>
            {projects.length} projects
          </span>
          <span style={{ color: "#52525b", fontSize: 14 }}>{s.email}</span>
        </div>
      </div>
    </OgBackground>
  );
}

async function renderLearnings() {
  const [s, learnings] = await Promise.all([getSettings(), getLearnings()]);
  const top = learnings.slice(0, 4);

  return (
    <OgBackground>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "50px 70px",
          height: "100%",
          position: "relative",
        }}
      >
        <TerminalDots />
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16 }}>
          <span style={{ color: "#22c55e", fontSize: 22 }}>❯</span>
          <span style={{ color: "#6b7280", fontSize: 18 }}>~/portfolio/learnings</span>
        </div>

        <h1
          style={{
            fontSize: 52,
            fontWeight: 700,
            color: "#ffffff",
            margin: 0,
            marginTop: 20,
            letterSpacing: "-0.02em",
          }}
        >
          Learnings
        </h1>
        <p style={{ fontSize: 20, color: "#71717a", marginTop: 4 }}>
          by {s.name} · Things I&apos;m exploring
        </p>

        {/* Learning items */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            marginTop: 28,
            flex: 1,
          }}
        >
          {top.map((l, i) => (
            <div
              key={l.id}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 16,
                padding: "14px 20px",
                borderRadius: 10,
                backgroundColor: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <span
                style={{
                  color: "#22c55e",
                  fontSize: 14,
                  fontWeight: 700,
                  minWidth: 28,
                  display: "flex",
                }}
              >
                0{i + 1}
              </span>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ color: "#ffffff", fontSize: 18, fontWeight: 600 }}>
                  {l.title}
                </span>
                <span style={{ color: "#71717a", fontSize: 14, marginTop: 2 }}>
                  {l.summary.slice(0, 90)}…
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 16,
            paddingTop: 12,
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <span style={{ color: "#52525b", fontSize: 14 }}>
            {learnings.length} learnings
          </span>
          <span style={{ color: "#52525b", fontSize: 14 }}>{s.email}</span>
        </div>
      </div>
    </OgBackground>
  );
}

export async function GET(req: NextRequest) {
  const section = req.nextUrl.searchParams.get("section") ?? "home";

  let element: React.ReactNode;

  switch (section) {
    case "projects":
      element = await renderProjects();
      break;
    case "learnings":
      element = await renderLearnings();
      break;
    default: {
      // Fallback to home-style image
      const s = await getSettings();
      element = (
        <OgBackground>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "60px 70px",
              height: "100%",
              position: "relative",
            }}
          >
            <TerminalDots />
            <h1
              style={{
                fontSize: 64,
                fontWeight: 700,
                color: "#ffffff",
                margin: 0,
                marginTop: 24,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
              }}
            >
              {s.name}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
              <span style={{ color: "#22c55e", fontSize: 28 }}>❯</span>
              <span style={{ fontSize: 28, color: "#a1a1aa" }}>{s.title}</span>
            </div>
            <p style={{ fontSize: 20, color: "#71717a", marginTop: 20, maxWidth: 700 }}>
              {s.intro}
            </p>
          </div>
        </OgBackground>
      );
    }
  }

  return new ImageResponse(element, { ...SIZE });
}
