"use client";

import type { WorkExperience } from "@/types";
import { ExperienceCard } from "./experience-card";

interface ExperienceViewProps {
  experience: WorkExperience[];
}

export function ExperienceView({ experience }: ExperienceViewProps) {
  return (
    <div className="space-y-0">
      {experience.map((exp, i) => (
        <ExperienceCard
          key={exp.id}
          experience={exp}
          isLast={i === experience.length - 1}
        />
      ))}
    </div>
  );
}
