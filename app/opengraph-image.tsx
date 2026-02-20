/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og";
import { getSettings } from "@/lib/data";

export const runtime = "nodejs";
export const alt = "Portfolio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  const s = await getSettings();

  const skills = s.skills.slice(0, 6);

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
        {/* Background grid pattern */}
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
            background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Bottom-left glow */}
        <div
          style={{
            position: "absolute",
            bottom: -80,
            left: -80,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(34,197,94,0.1) 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Content */}
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
          {/* Terminal-style header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 8,
            }}
          >
            <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#ef4444", display: "flex" }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#eab308", display: "flex" }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#22c55e", display: "flex" }} />
            <span style={{ color: "#6b7280", fontSize: 16, marginLeft: 12 }}>
              ~/portfolio
            </span>
          </div>

          {/* Name */}
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

          {/* Title with accent */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginTop: 12,
            }}
          >
            <span style={{ color: "#22c55e", fontSize: 28 }}>❯</span>
            <span
              style={{
                fontSize: 28,
                color: "#a1a1aa",
                fontWeight: 400,
              }}
            >
              {s.title}
            </span>
          </div>

          {/* Intro */}
          <p
            style={{
              fontSize: 20,
              color: "#71717a",
              marginTop: 20,
              lineHeight: 1.5,
              maxWidth: 700,
            }}
          >
            {s.intro}
          </p>

          {/* Skills tags */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              marginTop: 32,
            }}
          >
            {skills.map((skill) => (
              <div
                key={skill}
                style={{
                  padding: "8px 16px",
                  borderRadius: 6,
                  backgroundColor: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#d4d4d8",
                  fontSize: 16,
                  display: "flex",
                }}
              >
                {skill}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: "auto",
              paddingTop: 24,
              borderTop: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <span style={{ color: "#52525b", fontSize: 16 }}>
              {s.location}
            </span>
            <span style={{ color: "#52525b", fontSize: 16 }}>
              {s.email}
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
