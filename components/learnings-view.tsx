"use client";

import { useState } from "react";
import type { Learning } from "@/types";
import { LearningCard } from "./learning-card";

interface LearningsViewProps {
  learnings: Learning[];
}

export function LearningsView({ learnings }: LearningsViewProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
      {learnings.map((learning) => (
        <LearningCard
          key={learning.id}
          learning={learning}
          expanded={expandedId === learning.id}
          onToggle={() =>
            setExpandedId(expandedId === learning.id ? null : learning.id)
          }
        />
      ))}
    </div>
  );
}
