"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useTheme } from "next-themes";
import type { SiteSettings, Project, Learning, WorkExperience } from "@/types";

/* ── Types ── */
interface Line {
  id: number;
  type: "input" | "output" | "error" | "accent" | "muted";
  text: string;
}

interface TerminalProps {
  settings: SiteSettings;
  projects: Project[];
  learnings: Learning[];
  experience: WorkExperience[];
  socials: { label: string; href: string }[];
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  minimized?: boolean;
  maximized?: boolean;
  onTitleBarMouseDown?: (e: React.MouseEvent) => void;
  onTitleBarDoubleClick?: () => void;
}

/* ── Helpers ── */
const PROMPT = "visitor@portfolio:~$";

const HELP_TEXT = `
Available commands:

  Navigation
  -----------------------------------
  ls              List sections / files
  cd <section>    Navigate to a section
  cat <file>      Read a section's content
  pwd             Print current directory
  goto <section>  Scroll to section

  Portfolio
  -----------------------------------
  whoami          Display name, title & intro
  skills          List technical skills
  about           Show about info
  status          Show current status
  projects        List all projects
  project <n>     Show details for project #n
  learnings       List all learnings
  learning <n>    Show details for learning #n
  experience      List work experience
  exp <n>         Show details for experience #n
  socials         Show social links
  resume          Open resume in new tab
  repo            Open GitHub repo

  System
  -----------------------------------
  theme           Toggle dark/light mode
  neofetch        Display system info
  uptime          Show session uptime
  history         Show command history
  weather         Show local weather
  date            Show current date
  echo <text>     Echo back text
  cowsay <text>   Moo!
  clear           Clear the terminal
  exit            Close the terminal
  help            Show this help message
`.trim();

const ASCII_BANNER = `
 ___         _    __      _ _       
| _ \\___ _ _| |_ / _|___ | (_)___  
|  _/ _ \\ '_|  _|  _/ _ \\| | / _ \\ 
|_| \\___/_|  \\__|_| \\___/|_|_\\___/ 

  Type 'help' for available commands
`.trim();

export function InteractiveTerminal({
  settings,
  projects,
  learnings,
  experience,
  socials,
  onClose,
  onMinimize,
  onMaximize,
  minimized = false,
  maximized = false,
  onTitleBarMouseDown,
  onTitleBarDoubleClick,
}: TerminalProps) {
  const { theme, setTheme } = useTheme();
  const [lines, setLines] = useState<Line[]>([
    { id: 0, type: "accent", text: ASCII_BANNER },
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [cwd, setCwd] = useState("~");
  const nextId = useRef(1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mountTime = useRef(Date.now());

  /* Auto-scroll to bottom */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  /* Push lines helper */
  const push = useCallback(
    (...newLines: Omit<Line, "id">[]) => {
      setLines((prev) => [
        ...prev,
        ...newLines.map((l) => ({ ...l, id: nextId.current++ })),
      ]);
    },
    []
  );

  /* ── Command handler ── */
  const execute = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      if (!trimmed) return;

      // Echo the command
      push({ type: "input", text: `${PROMPT} ${trimmed}` });

      const [cmd, ...args] = trimmed.toLowerCase().split(/\s+/);
      const rest = args.join(" ");

      switch (cmd) {
        case "help":
          push({ type: "output", text: HELP_TEXT });
          break;

        case "whoami":
          push(
            { type: "accent", text: settings.name },
            { type: "output", text: settings.title },
            { type: "muted", text: "" },
            { type: "output", text: settings.intro }
          );
          break;

        case "skills":
          push({
            type: "output",
            text: settings.skills.map((s) => `  • ${s}`).join("\n"),
          });
          break;

        case "about":
          push({ type: "output", text: settings.about });
          break;

        case "projects":
          if (projects.length === 0) {
            push({ type: "muted", text: "No projects found." });
          } else {
            push({
              type: "output",
              text: projects
                .map(
                  (p, i) =>
                    `  [${i + 1}] ${p.title}\n      ${p.short_desc}`
                )
                .join("\n\n"),
            });
            push({
              type: "muted",
              text: "\nUse 'project <n>' for details.",
            });
          }
          break;

        case "project": {
          const idx = parseInt(rest) - 1;
          if (isNaN(idx) || idx < 0 || idx >= projects.length) {
            push({
              type: "error",
              text: `Invalid project number. Use 1-${projects.length}.`,
            });
          } else {
            const p = projects[idx];
            push(
              { type: "accent", text: p.title },
              { type: "output", text: p.long_desc },
              { type: "muted", text: "" },
              {
                type: "output",
                text: `Tech: ${p.tech.join(", ")}`,
              },
              {
                type: "output",
                text: `Live: ${p.live_url}`,
              },
              {
                type: "output",
                text: `GitHub: ${p.github_url}`,
              }
            );
          }
          break;
        }

        case "learnings":
          if (learnings.length === 0) {
            push({ type: "muted", text: "No learnings found." });
          } else {
            push({
              type: "output",
              text: learnings
                .map(
                  (l, i) =>
                    `  [${i + 1}] ${l.title}\n      ${l.summary}`
                )
                .join("\n\n"),
            });
            push({
              type: "muted",
              text: "\nUse 'learning <n>' for details.",
            });
          }
          break;

        case "learning": {
          const idx = parseInt(rest) - 1;
          if (isNaN(idx) || idx < 0 || idx >= learnings.length) {
            push({
              type: "error",
              text: `Invalid learning number. Use 1-${learnings.length}.`,
            });
          } else {
            const l = learnings[idx];
            push(
              { type: "accent", text: l.title },
              { type: "muted", text: l.summary },
              { type: "muted", text: "" },
              { type: "output", text: l.full_details }
            );
          }
          break;
        }

        case "experience":
          if (experience.length === 0) {
            push({ type: "muted", text: "No experience found." });
          } else {
            push({
              type: "output",
              text: experience
                .map(
                  (e, i) =>
                    `  [${i + 1}] ${e.role} @ ${e.company}\n      ${e.start_date} — ${e.end_date || "Present"}`
                )
                .join("\n\n"),
            });
            push({
              type: "muted",
              text: "\nUse 'exp <n>' for details.",
            });
          }
          break;

        case "exp": {
          const idx = parseInt(rest) - 1;
          if (isNaN(idx) || idx < 0 || idx >= experience.length) {
            push({
              type: "error",
              text: `Invalid experience number. Use 1-${experience.length}.`,
            });
          } else {
            const e = experience[idx];
            push(
              { type: "accent", text: `${e.role} @ ${e.company}` },
              { type: "muted", text: `${e.start_date} — ${e.end_date || "Present"}` },
              { type: "muted", text: "" },
              { type: "output", text: e.description },
              { type: "muted", text: "" },
              { type: "output", text: `Tech: ${e.tech.join(", ")}` }
            );
          }
          break;
        }

        case "socials":
          push({
            type: "output",
            text: socials
              .map((s) => `  ${s.label.padEnd(14)} ${s.href}`)
              .join("\n"),
          });
          break;

        case "resume":
          push({ type: "accent", text: "Opening resume..." });
          window.open(settings.resume_url, "_blank");
          break;

        case "goto":
        case "cd": {
          const valid = ["home", "projects", "learnings", "experience", "contact"];
          const target = rest.replace(/^[~/\\.]+/, "").replace(/\/$/, "");
          if (!target || !valid.includes(target)) {
            push({
              type: "error",
              text: `Usage: ${cmd} <${valid.join("|")}>`,
            });
          } else {
            setCwd(`~/${target}`);
            push({ type: "accent", text: `Navigating to #${target}...` });
            const el = document.getElementById(target);
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }
          break;
        }

        case "pwd":
          push({ type: "output", text: cwd });
          break;

        case "ls": {
          const sections = [
            { name: "home/", desc: "Hero & introduction" },
            { name: "projects/", desc: `${projects.length} projects` },
            { name: "learnings/", desc: `${learnings.length} learnings` },
            { name: "experience/", desc: `${experience.length} roles` },
            { name: "contact/", desc: "Get in touch" },
          ];
          push({
            type: "output",
            text: sections
              .map((s) => `  ${s.name.padEnd(16)} ${s.desc}`)
              .join("\n"),
          });
          break;
        }

        case "cat": {
          const file = rest.replace(/^[~/\\.]+/, "").replace(/\/$/, "");
          const catMap: Record<string, () => void> = {
            home: () =>
              push(
                { type: "accent", text: settings.name },
                { type: "output", text: settings.title },
                { type: "output", text: settings.intro }
              ),
            about: () => push({ type: "output", text: settings.about }),
            skills: () =>
              push({
                type: "output",
                text: settings.skills.map((s) => `  • ${s}`).join("\n"),
              }),
            projects: () =>
              push({
                type: "output",
                text:
                  projects
                    .map((p, i) => `  [${i + 1}] ${p.title}`)
                    .join("\n") || "Empty.",
              }),
            learnings: () =>
              push({
                type: "output",
                text:
                  learnings
                    .map((l, i) => `  [${i + 1}] ${l.title}`)
                    .join("\n") || "Empty.",
              }),
            experience: () =>
              push({
                type: "output",
                text:
                  experience
                    .map((e, i) => `  [${i + 1}] ${e.role} @ ${e.company}`)
                    .join("\n") || "Empty.",
              }),
            contact: () =>
              push({
                type: "output",
                text: "Use the contact form or scroll to #contact.",
              }),
          };
          if (!file || !catMap[file]) {
            push({
              type: "error",
              text: `cat: ${file || "?"}: No such file. Try: ${Object.keys(catMap).join(", ")}`,
            });
          } else {
            catMap[file]();
          }
          break;
        }

        case "status":
          push(
            { type: "accent", text: "Current Status" },
            { type: "output", text: `  ${settings.current_status}` }
          );
          break;

        case "theme": {
          const newTheme = theme === "dark" ? "light" : "dark";
          setTheme(newTheme);
          push({
            type: "accent",
            text: `Theme switched to ${newTheme} mode.`,
          });
          break;
        }

        case "history":
          if (history.length === 0) {
            push({ type: "muted", text: "No command history yet." });
          } else {
            push({
              type: "output",
              text: history
                .slice(0, 20)
                .map((h, i) => `  ${String(i + 1).padStart(3)}  ${h}`)
                .join("\n"),
            });
          }
          break;

        case "uptime": {
          const ms = Date.now() - mountTime.current;
          const secs = Math.floor(ms / 1000) % 60;
          const mins = Math.floor(ms / 60000) % 60;
          const hrs = Math.floor(ms / 3600000);
          push({
            type: "output",
            text: `Session uptime: ${hrs}h ${mins}m ${secs}s`,
          });
          break;
        }

        case "neofetch": {
          const ua = navigator.userAgent;
          const browser = /Firefox/.test(ua)
            ? "Firefox"
            : /Edg/.test(ua)
              ? "Edge"
              : /Chrome/.test(ua)
                ? "Chrome"
                : /Safari/.test(ua)
                  ? "Safari"
                  : "Unknown";
          const os = /Win/.test(ua)
            ? "Windows"
            : /Mac/.test(ua)
              ? "macOS"
              : /Linux/.test(ua)
                ? "Linux"
                : /Android/.test(ua)
                  ? "Android"
                  : /iPhone|iPad/.test(ua)
                    ? "iOS"
                    : "Unknown";
          const w = window.innerWidth;
          const h = window.innerHeight;
          push(
            { type: "accent", text: `  ${settings.name}@portfolio` },
            { type: "muted", text: "  ──────────────────────" },
            { type: "output", text: `  OS:         ${os}` },
            { type: "output", text: `  Browser:    ${browser}` },
            { type: "output", text: `  Resolution: ${w}x${h}` },
            { type: "output", text: `  Theme:      ${theme ?? "dark"}` },
            { type: "output", text: `  Framework:  Next.js 15` },
            { type: "output", text: `  Language:   TypeScript` },
            { type: "output", text: `  Styling:    Tailwind CSS` },
            { type: "output", text: `  Backend:    Supabase` },
            { type: "output", text: `  Font:       JetBrains Mono` },
            { type: "output", text: `  Projects:   ${projects.length}` },
            { type: "output", text: `  Learnings:  ${learnings.length}` },
            { type: "output", text: `  Experience: ${experience.length}` }
          );
          break;
        }

        case "weather": {
          const conditions = [
            "Sunny", "Cloudy", "Rainy", "Snowy",
            "Stormy", "Windy", "Foggy", "Clear",
          ];
          const icons = ["☀️", "☁️", "🌧️", "❄️", "⛈️", "💨", "🌫️", "🌙"];
          const wi = Math.floor(Math.random() * conditions.length);
          const temp = Math.floor(Math.random() * 35) + 5;
          push(
            { type: "accent", text: `  ${icons[wi]} ${conditions[wi]}` },
            {
              type: "output",
              text: `  Temperature: ${temp}°C / ${Math.round((temp * 9) / 5 + 32)}°F`,
            },
            { type: "muted", text: "  (simulated — no API call)" }
          );
          break;
        }

        case "repo": {
          const ghUrl = socials.find((s) => s.label === "GitHub")?.href || "https://github.com";
          push({ type: "accent", text: "Opening GitHub repo..." });
          window.open(ghUrl, "_blank");
          break;
        }

        case "cowsay": {
          const msg = rest || "Moo!";
          const border = "-".repeat(msg.length + 2);
          push({
            type: "output",
            text: [
              ` /${border}\\`,
              ` | ${msg} |`,
              ` \\${border}/`,
              `        \\   ^__^`,
              `         \\  (oo)\\_______`,
              `            (__)\\       )\\/\\`,
              `                ||----w |`,
              `                ||     ||`,
            ].join("\n"),
          });
          break;
        }

        case "clear":
          setLines([]);
          return;

        case "date":
          push({
            type: "output",
            text: new Date().toString(),
          });
          break;

        case "echo":
          push({ type: "output", text: rest || "" });
          break;

        case "sudo":
          push({
            type: "error",
            text: "Nice try. You don't have root access here.",
          });
          break;

        case "rm":
          push({
            type: "error",
            text: "Permission denied. This portfolio is precious!",
          });
          break;

        case "exit":
        case "quit":
          push({ type: "muted", text: "Closing terminal..." });
          setTimeout(() => onClose?.(), 500);
          break;

        default:
          push({
            type: "error",
            text: `Command not found: ${cmd}. Type 'help' for available commands.`,
          });
      }
    },
    [push, settings, projects, learnings, socials, history, theme, setTheme, cwd, onClose]
  );

  /* ── Key handling ── */
  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      execute(input);
      setHistory((prev) => [input, ...prev]);
      setHistoryIdx(-1);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHistoryIdx((prev) => {
        const next = Math.min(prev + 1, history.length - 1);
        setInput(history[next] ?? "");
        return next;
      });
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setHistoryIdx((prev) => {
        const next = Math.max(prev - 1, -1);
        setInput(next === -1 ? "" : history[next] ?? "");
        return next;
      });
    }
  };

  /* Color map */
  const colorFor = (type: Line["type"]) => {
    switch (type) {
      case "input":
        return "text-foreground";
      case "output":
        return "text-foreground/80";
      case "error":
        return "text-red-400";
      case "accent":
        return "text-[var(--accent-color)]";
      case "muted":
        return "text-muted-foreground";
    }
  };

  return (
    <div
      className="border border-border bg-[hsl(var(--card))] flex flex-col flex-1 min-h-0 overflow-hidden"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Title bar — draggable area */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b border-border bg-background/60 shrink-0 cursor-grab active:cursor-grabbing"
        onMouseDown={onTitleBarMouseDown}
        onDoubleClick={onTitleBarDoubleClick}
      >
        {/* Left: logo + title */}
        <div className="flex items-center gap-2 select-none pointer-events-none">
          <span className="font-mono text-xs font-bold text-[var(--accent-color)]">&gt;_</span>
          <span className="text-[11px] text-muted-foreground">
            terminal — visitor@portfolio
          </span>
        </div>

        {/* Right: window controls */}
        <div className="flex items-center gap-0.5">
          {/* Minimize */}
          <button
            onClick={(e) => { e.stopPropagation(); onMinimize?.(); }}
            className="w-7 h-6 flex items-center justify-center text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
            aria-label="Minimize terminal"
            data-interactive
          >
            <svg viewBox="0 0 16 16" className="w-3 h-3" fill="currentColor">
              <rect x="3" y="7.5" width="10" height="1" />
            </svg>
          </button>
          {/* Maximize / Restore */}
          <button
            onClick={(e) => { e.stopPropagation(); onMaximize?.(); }}
            className="w-7 h-6 flex items-center justify-center text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
            aria-label={maximized ? "Restore terminal" : "Maximize terminal"}
            data-interactive
          >
            {maximized ? (
              <svg viewBox="0 0 16 16" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="1.2">
                <rect x="1.5" y="3.5" width="9" height="9" rx="0.5" />
                <path d="M5.5 3.5V1.5h9v9h-2" />
              </svg>
            ) : (
              <svg viewBox="0 0 16 16" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="1.2">
                <rect x="2" y="2" width="12" height="12" rx="0.5" />
              </svg>
            )}
          </button>
          {/* Close */}
          <button
            onClick={(e) => { e.stopPropagation(); onClose?.(); }}
            className="w-7 h-6 flex items-center justify-center text-muted-foreground hover:bg-red-500 hover:text-white transition-colors"
            aria-label="Close terminal"
            data-interactive
          >
            <svg viewBox="0 0 16 16" className="w-3 h-3" fill="currentColor">
              <path d="M3.5 3.5l9 9m0-9l-9 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Output area */}
      {!minimized && (
        <div className="flex-1 overflow-y-auto p-4 text-xs leading-relaxed scrollbar-thin">
          {lines.map((line) => (
            <pre
              key={line.id}
              className={`whitespace-pre-wrap break-words font-mono ${colorFor(
                line.type
              )}${line.type === "input" ? " mt-2" : ""}`}
            >
              {line.text}
            </pre>
          ))}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Input line */}
      {!minimized && (
        <div className="flex items-center gap-2 px-4 py-3 border-t border-border bg-background/30 shrink-0">
          <span className="text-[var(--accent-color)] text-xs shrink-0">
            {PROMPT}
          </span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            className="flex-1 bg-transparent text-xs text-foreground outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0 caret-[var(--accent-color)] border-none"
            spellCheck={false}
            autoComplete="off"
            data-interactive
          />
        </div>
      )}
    </div>
  );
}
