"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { InteractiveTerminal } from "./interactive-terminal";
import type { SiteSettings, Project, Learning, WorkExperience } from "@/types";

interface TerminalToggleProps {
  settings: SiteSettings;
  projects: Project[];
  learnings: Learning[];
  experience: WorkExperience[];
  socials: { label: string; href: string }[];
}

type ResizeEdge =
  | "n" | "s" | "e" | "w"
  | "ne" | "nw" | "se" | "sw"
  | null;

const MIN_W = 380;
const MIN_H = 220;
const EDGE_PX = 6; // invisible hit area thickness

/* Cursor CSS values for edges */
const EDGE_CURSOR_CSS: Record<string, string> = {
  n: "n-resize",
  s: "s-resize",
  e: "e-resize",
  w: "w-resize",
  ne: "ne-resize",
  nw: "nw-resize",
  se: "se-resize",
  sw: "sw-resize",
};

/* Position / size for each edge hit zone */
function edgeStyle(edge: string): React.CSSProperties {
  const E = EDGE_PX;
  const C = E * 2; // corner size
  switch (edge) {
    case "n":  return { top: 0, left: C, right: C, height: E };
    case "s":  return { bottom: 0, left: C, right: C, height: E };
    case "w":  return { top: C, bottom: C, left: 0, width: E };
    case "e":  return { top: C, bottom: C, right: 0, width: E };
    case "nw": return { top: 0, left: 0, width: C, height: C };
    case "ne": return { top: 0, right: 0, width: C, height: C };
    case "sw": return { bottom: 0, left: 0, width: C, height: C };
    case "se": return { bottom: 0, right: 0, width: C, height: C };
    default:   return {};
  }
}

export function TerminalToggle({
  settings,
  projects,
  learnings,
  experience,
  socials,
}: TerminalToggleProps) {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const [terminalKey, setTerminalKey] = useState(0);

  /* Window position & size */
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 650, height: 420 });
  const [initialized, setInitialized] = useState(false);

  /* Refs for drag / resize */
  const windowRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const resizeEdge = useRef<ResizeEdge>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const resizeOrigin = useRef({ mx: 0, my: 0, x: 0, y: 0, w: 0, h: 0 });

  /* Pre-maximize snapshot for restore */
  const preMaxState = useRef({ x: 0, y: 0, width: 650, height: 420 });

  /* Initialise position to bottom-right on first open */
  useEffect(() => {
    if (open && !initialized && !minimized) {
      const x = window.innerWidth - 650 - 20;
      const y = window.innerHeight - 420 - 20;
      setPosition({ x: Math.max(0, x), y: Math.max(0, y) });
      setSize({ width: 650, height: 420 });
      setInitialized(true);
    }
  }, [open, initialized, minimized]);

  /* ── Close: unmount + reset so next open starts fresh ── */
  const handleClose = useCallback(() => {
    setOpen(false);
    setMinimized(false);
    setMaximized(false);
    setInitialized(false);
    setTerminalKey((k) => k + 1);
  }, []);

  /* ── Minimize: hide window, show icon ── */
  const handleMinimize = useCallback(() => {
    setMinimized(true);
  }, []);

  /* ── Restore from minimized ── */
  const handleRestore = useCallback(() => {
    setMinimized(false);
  }, []);

  /* ── Maximize / Restore ── */
  const handleMaximize = useCallback(() => {
    setMaximized((prev) => {
      if (prev) {
        setPosition({ x: preMaxState.current.x, y: preMaxState.current.y });
        setSize({
          width: preMaxState.current.width,
          height: preMaxState.current.height,
        });
        return false;
      }
      preMaxState.current = {
        x: position.x,
        y: position.y,
        width: size.width,
        height: size.height,
      };
      setPosition({ x: 0, y: 0 });
      setSize({ width: window.innerWidth, height: window.innerHeight });
      return true;
    });
  }, [position, size]);

  /* ── Drag ── */
  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      if (maximized) return;
      isDragging.current = true;
      dragOffset.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      };
      document.body.classList.add("terminal-resizing");
      document.body.style.setProperty("cursor", "grabbing", "important");
      e.preventDefault();
    },
    [position, maximized]
  );

  /* ── Edge / corner resize start ── */
  const handleEdgeResizeStart = useCallback(
    (edge: ResizeEdge) => (e: React.MouseEvent) => {
      if (maximized) return;
      resizeEdge.current = edge;
      resizeOrigin.current = {
        mx: e.clientX,
        my: e.clientY,
        x: position.x,
        y: position.y,
        w: size.width,
        h: size.height,
      };
      /* Lock cursor on body so it persists while dragging */
      document.body.classList.add("terminal-resizing");
      document.body.style.setProperty("cursor", EDGE_CURSOR_CSS[edge ?? ""] ?? "", "important");
      e.preventDefault();
      e.stopPropagation();
    },
    [position, size, maximized]
  );

  /* Global mouse listeners for drag / resize */
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      /* ── Dragging ── */
      if (isDragging.current) {
        setPosition({
          x: Math.max(
            0,
            Math.min(e.clientX - dragOffset.current.x, window.innerWidth - 100)
          ),
          y: Math.max(
            0,
            Math.min(e.clientY - dragOffset.current.y, window.innerHeight - 40)
          ),
        });
      }

      /* ── Edge / corner resizing ── */
      const edge = resizeEdge.current;
      if (!edge) return;

      const o = resizeOrigin.current;
      const dx = e.clientX - o.mx;
      const dy = e.clientY - o.my;

      let newX = o.x;
      let newY = o.y;
      let newW = o.w;
      let newH = o.h;

      // Horizontal
      if (edge.includes("e")) {
        newW = Math.max(MIN_W, o.w + dx);
      }
      if (edge.includes("w")) {
        const candidateW = o.w - dx;
        if (candidateW >= MIN_W) {
          newW = candidateW;
          newX = o.x + dx;
        } else {
          newW = MIN_W;
          newX = o.x + (o.w - MIN_W);
        }
      }

      // Vertical
      if (edge.includes("s")) {
        newH = Math.max(MIN_H, o.h + dy);
      }
      if (edge === "n" || edge === "ne" || edge === "nw") {
        const candidateH = o.h - dy;
        if (candidateH >= MIN_H) {
          newH = candidateH;
          newY = o.y + dy;
        } else {
          newH = MIN_H;
          newY = o.y + (o.h - MIN_H);
        }
      }

      setPosition({ x: newX, y: newY });
      setSize({ width: newW, height: newH });
    };

    const onUp = () => {
      isDragging.current = false;
      resizeEdge.current = null;
      document.body.classList.remove("terminal-resizing");
      document.body.style.removeProperty("cursor");
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  /* Double-click title bar → toggle maximize */
  const handleTitleBarDoubleClick = useCallback(() => {
    handleMaximize();
  }, [handleMaximize]);

  return (
    <>
      {/* Floating toggle button — shown when closed OR minimized */}
      {(!open || minimized) && (
        <button
          onClick={() => {
            if (minimized) {
              handleRestore();
            } else {
              setOpen(true);
            }
          }}
          className="fixed bottom-5 right-5 z-50 w-10 h-10 flex items-center justify-center bg-[var(--accent-color)]/10 border border-[var(--accent-color)]/40 text-[var(--accent-color)] hover:bg-[var(--accent-color)]/20 transition-colors font-mono text-sm font-bold"
          aria-label={minimized ? "Restore terminal" : "Open terminal"}
          data-interactive
        >
          &gt;_
        </button>
      )}

      {/* Terminal window — hidden when minimized */}
      {open && !minimized && (
        <div
          ref={windowRef}
          className="fixed z-50 flex flex-col shadow-2xl select-none"
          style={
            maximized
              ? { left: 0, top: 0, width: "100vw", height: "100vh" }
              : {
                  left: position.x,
                  top: position.y,
                  width: size.width,
                  height: size.height,
                }
          }
        >
          <InteractiveTerminal
            key={terminalKey}
            settings={settings}
            projects={projects}
            learnings={learnings}
            experience={experience}
            socials={socials}
            onClose={handleClose}
            onMinimize={handleMinimize}
            onMaximize={handleMaximize}
            minimized={false}
            maximized={maximized}
            onTitleBarMouseDown={handleDragStart}
            onTitleBarDoubleClick={handleTitleBarDoubleClick}
          />

          {/* ── Invisible resize edges & corners ── */}
          {!maximized && (
            <>
              {(["n", "s", "e", "w", "ne", "nw", "se", "sw"] as const).map(
                (edge) => (
                  <div
                    key={edge}
                    onMouseDown={handleEdgeResizeStart(edge)}
                    onMouseEnter={() => {
                      document.body.classList.add("terminal-resizing");
                      document.body.style.setProperty("cursor", EDGE_CURSOR_CSS[edge], "important");
                    }}
                    onMouseLeave={() => {
                      if (!resizeEdge.current) {
                        document.body.classList.remove("terminal-resizing");
                        document.body.style.removeProperty("cursor");
                      }
                    }}
                    className="absolute"
                    style={edgeStyle(edge)}
                  />
                )
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}
