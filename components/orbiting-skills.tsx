"use client";

import { useEffect, useRef, useState } from "react";

interface OrbitingSkillsProps {
  skills: string[];
}

/*
 * A creative orbiting animation that arranges skill tags in
 * concentric rings around a centre core. Each ring rotates at
 * a different speed & direction. Fully CSS-driven after mount.
 */
export function OrbitingSkills({ skills }: OrbitingSkillsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Always split skills into exactly 2 rings
  const mid = Math.ceil(skills.length / 2);
  const rings: string[][] = [skills.slice(0, mid), skills.slice(mid)];

  // Ring configs – 2 rings, smaller radii on mobile
  const ringConfigs = isMobile
    ? [
        { radius: 70, duration: 25, reverse: false },
        { radius: 115, duration: 35, reverse: true },
      ]
    : [
        { radius: 100, duration: 25, reverse: false },
        { radius: 155, duration: 35, reverse: true },
      ];

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-square max-w-[260px] sm:max-w-[320px] mx-auto"
      aria-label="Skills visualisation"
    >
      {/* Centre core */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-[var(--accent-color)]/5 border border-[var(--accent-color)]/20 flex items-center justify-center">
          <span className="text-[var(--accent-color)] text-xs font-bold tracking-wider">
            {"</>"}
          </span>
        </div>
      </div>

      {/* Orbit rings */}
      {rings.map((ringSkills, ringIdx) => {
        const cfg = ringConfigs[ringIdx];
        const itemCount = ringSkills.length;

        return (
          <div
            key={ringIdx}
            className="absolute inset-0 flex items-center justify-center"
          >
            {/* Ring circle (visual) */}
            <div
              className="absolute rounded-full border border-dashed border-border/40"
              style={{
                width: cfg.radius * 2,
                height: cfg.radius * 2,
              }}
            />

            {/* Spinning wrapper */}
            <div
              className={`absolute ${mounted ? "" : "opacity-0"}`}
              style={{
                width: cfg.radius * 2,
                height: cfg.radius * 2,
                animation: `spin-orbit ${cfg.duration}s linear infinite ${
                  cfg.reverse ? "reverse" : "normal"
                }`,
                transition: "opacity 0.5s ease",
                opacity: mounted ? 1 : 0,
              }}
            >
              {ringSkills.map((skill, i) => {
                const angle = (360 / itemCount) * i;
                const rad = (angle * Math.PI) / 180;
                const x = Math.round(Math.cos(rad) * cfg.radius * 100) / 100;
                const y = Math.round(Math.sin(rad) * cfg.radius * 100) / 100;

                return (
                  <div
                    key={skill}
                    className="absolute"
                    style={{
                      left: "50%",
                      top: "50%",
                      transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
                    }}
                  >
                    {/* Counter-rotate so text stays level */}
                    <div
                      style={{
                        animation: `spin-orbit ${cfg.duration}s linear infinite ${
                          cfg.reverse ? "normal" : "reverse"
                        }`,
                      }}
                    >
                      <span
                        className="inline-block whitespace-nowrap px-2 py-1 text-[10px] md:text-[11px] border border-border bg-background text-foreground/80 
                          hover:border-[var(--accent-color)]/50 hover:text-[var(--accent-color)] hover:bg-[var(--accent-color)]/5
                          transition-all duration-200 cursor-default select-none"
                      >
                        {skill}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
