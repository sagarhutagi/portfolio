/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og";
import { getSettings } from "@/lib/data";

export const runtime = "nodejs";
export const alt = "Portfolio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function TwitterImage() {
  const s = await getSettings();
  const profileImg = s.profile_image_url;

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
        {/* Profile image as blurred background */}
        {profileImg && (
          <img
            src={profileImg}
            alt=""
            width={1200}
            height={630}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "blur(30px) brightness(0.25)",
              transform: "scale(1.2)",
            }}
          />
        )}

        {/* Dark overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background:
              "linear-gradient(135deg, rgba(10,10,10,0.9) 0%, rgba(10,10,10,0.7) 50%, rgba(10,10,10,0.9) 100%)",
          }}
        />

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
          {/* Terminal dots */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#ef4444", display: "flex" }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#eab308", display: "flex" }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#22c55e", display: "flex" }} />
          </div>

          <h1
            style={{
              fontSize: 60,
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
            <span style={{ color: "#22c55e", fontSize: 26 }}>❯</span>
            <span style={{ fontSize: 26, color: "#a1a1aa" }}>{s.title}</span>
          </div>

          <p style={{ fontSize: 20, color: "#d4d4d8", marginTop: 20, lineHeight: 1.5, maxWidth: 700 }}>
            {s.intro}
          </p>

          {/* Skills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 28 }}>
            {s.skills.slice(0, 5).map((skill) => (
              <div
                key={skill}
                style={{
                  padding: "6px 14px",
                  borderRadius: 6,
                  backgroundColor: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "#d4d4d8",
                  fontSize: 15,
                  display: "flex",
                }}
              >
                {skill}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
