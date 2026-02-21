"use client";

import type { Learning } from "@/types";
import { ChevronDown } from "lucide-react";

interface LearningCardProps {
  learning: Learning;
  expanded: boolean;
  onToggle: () => void;
}

export function LearningCard({ learning, expanded, onToggle }: LearningCardProps) {
  return (
    <div className="learning-card-enhanced border border-border hover:border-[var(--accent-color)]/40 transition-colors duration-75">
      {/* Header — always visible */}
      <button
        onClick={onToggle}
        className="w-full text-left p-4 sm:p-5 flex items-start justify-between gap-3 sm:gap-4"
        data-interactive
      >
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground mb-1">
            <span className="text-[var(--accent-color)] mr-1.5">#</span>
            {learning.title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2"
            dangerouslySetInnerHTML={{ __html: learning.summary }}
          />
        </div>
        <ChevronDown
          size={14}
          className={`mt-1 shrink-0 text-muted-foreground transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="px-4 sm:px-5 pb-4 sm:pb-5">
          <div className="h-px bg-border mb-4" />
          <div
            className="text-xs text-foreground/80 leading-relaxed prose-rendered"
            dangerouslySetInnerHTML={{ __html: learning.full_details }}
          />
        </div>
      )}
    </div>
  );
}
