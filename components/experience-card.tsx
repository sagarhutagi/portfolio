"use client";

import type { WorkExperience } from "@/types";
import { Briefcase } from "lucide-react";

interface ExperienceCardProps {
  experience: WorkExperience;
  isLast: boolean;
}

function formatDate(d: string): string {
  if (!d) return "Present";
  const [year, month] = d.split("-");
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${months[parseInt(month, 10) - 1]} ${year}`;
}

export function ExperienceCard({ experience, isLast }: ExperienceCardProps) {
  const startLabel = formatDate(experience.start_date);
  const endLabel = experience.end_date ? formatDate(experience.end_date) : "Present";
  const isCurrent = !experience.end_date;

  return (
    <div className="relative flex gap-5">
      {/* Timeline line + dot */}
      <div className="flex flex-col items-center">
        <div
          className={`w-3 h-3 rounded-full shrink-0 mt-1.5 border-2 ${
            isCurrent
              ? "border-[var(--accent-color)] bg-[var(--accent-color)]/30"
              : "border-muted-foreground/40 bg-background"
          }`}
        />
        {!isLast && (
          <div className="w-px flex-1 bg-border mt-1" />
        )}
      </div>

      {/* Content */}
      <div className={`pb-8 ${isLast ? "pb-0" : ""}`}>
        {/* Date range */}
        <p className="text-[11px] text-muted-foreground mb-1 tracking-wide">
          {startLabel} — {endLabel}
          {isCurrent && (
            <span className="ml-2 inline-flex items-center px-1.5 py-0.5 text-[10px] bg-[var(--accent-color)]/10 text-[var(--accent-color)] border border-[var(--accent-color)]/20">
              current
            </span>
          )}
        </p>

        {/* Role & company */}
        <h3 className="text-sm font-semibold text-foreground mb-0.5">
          {experience.role}
        </h3>
        <p className="text-xs text-[var(--accent-color)] mb-2 flex items-center gap-1.5">
          <Briefcase size={11} />
          {experience.company}
        </p>

        {/* Description */}
        <p className="text-xs text-muted-foreground leading-relaxed mb-3">
          {experience.description}
        </p>

        {/* Tech */}
        {experience.tech.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {experience.tech.map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 text-[10px] border border-border text-foreground/70 hover:border-[var(--accent-color)]/40 hover:text-[var(--accent-color)] transition-colors"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
