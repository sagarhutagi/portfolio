"use client";

import { useEffect, useRef, useCallback } from "react";
import type { SiteSettings, Project, Learning, WorkExperience } from "@/types";
import { buildFilesystem, resolve as resolveFS } from "@/lib/wasm-fs";
import { executeCommand, type ShellState } from "@/lib/wasm-shell";

/* ── ANSI color codes for prompt ── */
const GREEN = "\x1b[32m";
const CYAN = "\x1b[36m";
const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";
const DIM = "\x1b[2m";

interface WasmTerminalProps {
  settings: SiteSettings;
  projects: Project[];
  learnings: Learning[];
  experience: WorkExperience[];
  socials: { label: string; href: string }[];
  onExit?: () => void;
}

const WASM_BANNER = `\x1b[32m\x1b[1m
 ╦ ╦╔═╗╔═╗╔╦╗  ╔═╗╦ ╦╔═╗╦  ╦  
 ║║║╠═╣╚═╗║║║  ╚═╗╠═╣║╣ ║  ║  
 ╚╩╝╩ ╩╚═╝╩ ╩  ╚═╝╩ ╩╚═╝╩═╝╩═╝
\x1b[0m
\x1b[2m Real Unix-like shell running in your browser via WebAssembly.
 Explore the portfolio filesystem — type 'help' for commands.
 Try: ls, cd projects, cat about.txt, tree ~\x1b[0m
`;

export function WasmTerminal({
  settings,
  projects,
  learnings,
  experience,
  socials,
  onExit,
}: WasmTerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<import("@xterm/xterm").Terminal | null>(null);
  const stateRef = useRef<ShellState | null>(null);
  const inputBuffer = useRef("");
  const cursorPos = useRef(0);
  const initRef = useRef(false);

  /* Build the prompt string */
  const getPrompt = useCallback(() => {
    const cwd = stateRef.current?.cwd ?? "/home/visitor";
    // Shorten /home/visitor to ~
    const displayCwd = cwd.replace(/^\/home\/visitor/, "~") || "~";
    return `${GREEN}${BOLD}visitor${RESET}@${CYAN}portfolio${RESET}:${BOLD}${displayCwd}${RESET}$ `;
  }, []);

  /* Initialize xterm + filesystem */
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    async function init() {
      const { Terminal } = await import("@xterm/xterm");
      const { FitAddon } = await import("@xterm/addon-fit");
      const { WebLinksAddon } = await import("@xterm/addon-web-links");

      /* Import CSS — using dynamic import for side-effect */
      // @ts-expect-error — CSS module import handled by bundler
      await import("@xterm/xterm/css/xterm.css");

      const term = new Terminal({
        cursorBlink: true,
        cursorStyle: "bar",
        fontSize: 13,
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
        lineHeight: 1.4,
        theme: {
          background: "transparent",
          foreground: "#e0e0e0",
          cursor: "#4ade80",
          cursorAccent: "#000000",
          selectionBackground: "rgba(74, 222, 128, 0.2)",
          black: "#1a1a2e",
          red: "#f87171",
          green: "#4ade80",
          yellow: "#fbbf24",
          blue: "#60a5fa",
          magenta: "#c084fc",
          cyan: "#22d3ee",
          white: "#e0e0e0",
          brightBlack: "#6b7280",
          brightRed: "#fca5a5",
          brightGreen: "#86efac",
          brightYellow: "#fde68a",
          brightBlue: "#93c5fd",
          brightMagenta: "#d8b4fe",
          brightCyan: "#67e8f9",
          brightWhite: "#ffffff",
        },
        allowTransparency: true,
        scrollback: 1000,
        convertEol: true,
      });

      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      term.loadAddon(new WebLinksAddon());

      if (containerRef.current) {
        term.open(containerRef.current);
        fitAddon.fit();
      }

      termRef.current = term;

      /* Build filesystem */
      const fs = buildFilesystem(settings, projects, learnings, experience, socials);
      stateRef.current = {
        cwd: "/home/visitor",
        env: {
          HOME: "/home/visitor",
          USER: "visitor",
          SHELL: "/bin/wasm-sh",
          TERM: "xterm-256color",
          PATH: "/usr/bin:/bin",
          HOSTNAME: "portfolio",
          EDITOR: "cat",
          LANG: "en_US.UTF-8",
          PS1: "visitor@portfolio:~$ ",
        },
        history: [],
        fs,
      };

      /* Write banner */
      term.write(WASM_BANNER);
      term.write("\r\n");
      writePrompt(term);

      /* Handle resize */
      const resizeObserver = new ResizeObserver(() => {
        try { fitAddon.fit(); } catch { /* ignore */ }
      });
      if (containerRef.current) resizeObserver.observe(containerRef.current);

      /* Handle input */
      let historyIdx = -1;
      let savedInput = "";

      term.onKey(({ key, domEvent }) => {
        const ev = domEvent;
        const state = stateRef.current;
        if (!state) return;

        if (ev.key === "Enter") {
          term.write("\r\n");
          const line = inputBuffer.current;
          inputBuffer.current = "";
          cursorPos.current = 0;
          historyIdx = -1;

          if (line.trim()) {
            const result = executeCommand(line, state);

            if (result.clear) {
              term.clear();
              term.write("\x1b[H");
            } else {
              if (result.output) {
                // Write output line by line
                const lines = result.output.split("\n");
                for (const l of lines) {
                  term.write(l + "\r\n");
                }
              }
            }

            if (result.newCwd) {
              state.cwd = result.newCwd;
            }

            if (result.exit) {
              setTimeout(() => onExit?.(), 400);
              return;
            }
          }

          writePrompt(term);
        } else if (ev.key === "Backspace") {
          if (cursorPos.current > 0) {
            const before = inputBuffer.current.slice(0, cursorPos.current - 1);
            const after = inputBuffer.current.slice(cursorPos.current);
            inputBuffer.current = before + after;
            cursorPos.current--;
            // Redraw the line from cursor
            term.write("\b");
            term.write(after + " ");
            // Move cursor back to position
            for (let i = 0; i < after.length + 1; i++) term.write("\b");
          }
        } else if (ev.key === "Delete") {
          if (cursorPos.current < inputBuffer.current.length) {
            const before = inputBuffer.current.slice(0, cursorPos.current);
            const after = inputBuffer.current.slice(cursorPos.current + 1);
            inputBuffer.current = before + after;
            term.write(after + " ");
            for (let i = 0; i < after.length + 1; i++) term.write("\b");
          }
        } else if (ev.key === "ArrowUp") {
          ev.preventDefault();
          if (state.history.length > 0) {
            if (historyIdx === -1) savedInput = inputBuffer.current;
            if (historyIdx < state.history.length - 1) {
              historyIdx++;
              replaceInput(term, state.history[state.history.length - 1 - historyIdx]);
            }
          }
        } else if (ev.key === "ArrowDown") {
          ev.preventDefault();
          if (historyIdx > 0) {
            historyIdx--;
            replaceInput(term, state.history[state.history.length - 1 - historyIdx]);
          } else if (historyIdx === 0) {
            historyIdx = -1;
            replaceInput(term, savedInput);
          }
        } else if (ev.key === "ArrowLeft") {
          if (cursorPos.current > 0) {
            cursorPos.current--;
            term.write(key);
          }
        } else if (ev.key === "ArrowRight") {
          if (cursorPos.current < inputBuffer.current.length) {
            cursorPos.current++;
            term.write(key);
          }
        } else if (ev.key === "Home") {
          while (cursorPos.current > 0) {
            cursorPos.current--;
            term.write("\b");
          }
        } else if (ev.key === "End") {
          while (cursorPos.current < inputBuffer.current.length) {
            term.write(inputBuffer.current[cursorPos.current]);
            cursorPos.current++;
          }
        } else if (ev.ctrlKey && ev.key === "c") {
          term.write("^C\r\n");
          inputBuffer.current = "";
          cursorPos.current = 0;
          writePrompt(term);
        } else if (ev.ctrlKey && ev.key === "l") {
          term.clear();
          term.write("\x1b[H");
          writePrompt(term);
          term.write(inputBuffer.current);
        } else if (ev.ctrlKey && ev.key === "a") {
          // Move to beginning
          while (cursorPos.current > 0) {
            cursorPos.current--;
            term.write("\b");
          }
        } else if (ev.ctrlKey && ev.key === "e") {
          // Move to end
          while (cursorPos.current < inputBuffer.current.length) {
            term.write(inputBuffer.current[cursorPos.current]);
            cursorPos.current++;
          }
        } else if (ev.ctrlKey && ev.key === "u") {
          // Clear line
          replaceInput(term, "");
        } else if (ev.ctrlKey && ev.key === "w") {
          // Delete word backward
          const before = inputBuffer.current.slice(0, cursorPos.current);
          const after = inputBuffer.current.slice(cursorPos.current);
          const trimmed = before.replace(/\S+\s*$/, "");
          inputBuffer.current = trimmed + after;
          const diff = before.length - trimmed.length;
          for (let i = 0; i < diff; i++) term.write("\b");
          cursorPos.current = trimmed.length;
          term.write(after + " ".repeat(diff));
          for (let i = 0; i < after.length + diff; i++) term.write("\b");
        } else if (ev.key === "Tab") {
          ev.preventDefault();
          // Tab completion
          const completed = tabComplete(inputBuffer.current, state);
          if (completed !== inputBuffer.current) {
            replaceInput(term, completed);
          }
        } else if (key.length === 1 && !ev.ctrlKey && !ev.altKey && !ev.metaKey) {
          // Insert character at cursor position
          const before = inputBuffer.current.slice(0, cursorPos.current);
          const after = inputBuffer.current.slice(cursorPos.current);
          inputBuffer.current = before + key + after;
          cursorPos.current++;
          term.write(key + after);
          for (let i = 0; i < after.length; i++) term.write("\b");
        }
      });

      // Also handle paste
      term.onData((data) => {
        // Only handle paste (multi-char data that isn't a control sequence)
        if (data.length > 1 && !data.startsWith("\x1b")) {
          const clean = data.replace(/[\r\n]/g, "");
          const before = inputBuffer.current.slice(0, cursorPos.current);
          const after = inputBuffer.current.slice(cursorPos.current);
          inputBuffer.current = before + clean + after;
          cursorPos.current += clean.length;
          term.write(clean + after);
          for (let i = 0; i < after.length; i++) term.write("\b");
        }
      });

      return () => {
        resizeObserver.disconnect();
        term.dispose();
      };
    }

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function writePrompt(term: import("@xterm/xterm").Terminal) {
    const cwd = stateRef.current?.cwd ?? "/home/visitor";
    const displayCwd = cwd.replace(/^\/home\/visitor/, "~") || "~";
    term.write(`${GREEN}${BOLD}visitor${RESET}@${CYAN}portfolio${RESET}:${BOLD}${displayCwd}${RESET}$ `);
  }

  function replaceInput(term: import("@xterm/xterm").Terminal, newInput: string) {
    // Erase current input
    const len = inputBuffer.current.length;
    // Move to end first
    while (cursorPos.current < len) {
      term.write(inputBuffer.current[cursorPos.current]);
      cursorPos.current++;
    }
    // Delete backwards
    for (let i = 0; i < len; i++) {
      term.write("\b \b");
    }
    inputBuffer.current = newInput;
    cursorPos.current = newInput.length;
    term.write(newInput);
  }

  return (
    <div className="wasm-terminal-container flex flex-col flex-1 min-h-0 overflow-hidden">
      {/* WASM mode indicator */}
      <div className="flex items-center gap-2 px-4 py-1.5 bg-[var(--accent-color)]/5 border-b border-[var(--accent-color)]/20 shrink-0">
        <span className="inline-block w-2 h-2 rounded-full bg-[var(--accent-color)] animate-pulse" />
        <span className="text-[10px] text-[var(--accent-color)] font-mono tracking-wider">
          WASM SHELL ACTIVE
        </span>
        <span className="text-[10px] text-muted-foreground ml-auto">
          xterm.js + WebAssembly
        </span>
      </div>
      {/* xterm container */}
      <div
        ref={containerRef}
        className="flex-1 min-h-0 p-2 wasm-xterm-host"
        style={{ backgroundColor: "transparent" }}
      />
    </div>
  );
}

/* ── Tab completion ── */
function tabComplete(input: string, state: ShellState): string {
  const tokens = input.split(/\s+/);
  if (tokens.length <= 1) {
    // Complete command name
    const partial = tokens[0] || "";
    const commands = [
      "ls", "cd", "cat", "pwd", "echo", "whoami", "hostname", "uname", "date",
      "uptime", "env", "printenv", "export", "head", "tail", "wc", "grep",
      "tree", "find", "mkdir", "touch", "history", "hexdump", "base64",
      "fortune", "cowsay", "neofetch", "clear", "exit", "help", "which", "man",
    ];
    const matches = commands.filter(c => c.startsWith(partial));
    if (matches.length === 1) return matches[0] + " ";
    return input;
  }

  // Complete file/directory path
  const partial = tokens[tokens.length - 1];
  const lastSlash = partial.lastIndexOf("/");
  const dirPart = lastSlash >= 0 ? partial.slice(0, lastSlash + 1) : "";
  const filePart = lastSlash >= 0 ? partial.slice(lastSlash + 1) : partial;

  const { node } = resolveFS(state.fs, state.cwd, dirPart || ".");
  if (!node || node.type !== "dir") return input;

  const entries = Array.from(node.children!.keys());
  const matches = entries.filter(name => name.startsWith(filePart));
  if (matches.length === 1) {
    const match = matches[0];
    const child = node.children!.get(match)!;
    const suffix = child.type === "dir" ? "/" : " ";
    const prefix = tokens.slice(0, -1).join(" ");
    return `${prefix} ${dirPart}${match}${suffix}`;
  }
  return input;
}
