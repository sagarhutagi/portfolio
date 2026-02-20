/**
 * Shell emulator — a lightweight Unix-like shell that runs in the browser.
 * Works entirely on the virtual filesystem (wasm-fs.ts).
 * Supports: ls, cd, cat, pwd, echo, clear, whoami, date, uname,
 *           head, tail, wc, grep, tree, find, env, history,
 *           hexdump, base64, fortune, help, exit
 */

import type { FSNode } from "./wasm-fs";
import { resolve, toAbsolute } from "./wasm-fs";

/* ── Types ── */
export interface ShellState {
  cwd: string;
  env: Record<string, string>;
  history: string[];
  fs: FSNode;
}

export interface ShellResult {
  output: string;
  exit: boolean;      // true = user typed exit
  clear: boolean;     // true = user typed clear
  newCwd?: string;    // if cwd changed
}

/* ── ANSI helpers (xterm supports these) ── */
const GREEN = "\x1b[32m";
const CYAN = "\x1b[36m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const DIM = "\x1b[2m";
const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";

/* ── Fortune cookies ── */
const FORTUNES = [
  "There are only two hard things in CS: cache invalidation and naming things.",
  "It works on my machine. — Every developer ever",
  "// TODO: fix this later  — committed 3 years ago",
  "The best error message is the one that never shows up.",
  "First, solve the problem. Then, write the code. — John Johnson",
  "Code is like humor. When you have to explain it, it's bad.",
  "Any fool can write code that a computer can understand. Good programmers write code that humans can understand. — Martin Fowler",
  "Deleted code is debugged code. — Jeff Sickel",
  "Software and cathedrals are much the same — first we build them, then we pray.",
  "Talk is cheap. Show me the code. — Linus Torvalds",
  "Programming is 10% writing code and 90% understanding why it doesn't work.",
  "There is no cloud. It's just someone else's computer.",
  "A good programmer looks both ways before crossing a one-way street.",
  "It compiles; ship it!",
  "Weeks of coding can save you hours of planning.",
];

/* ── Main execute function ── */
export function executeCommand(input: string, state: ShellState): ShellResult {
  const trimmed = input.trim();
  if (!trimmed) return { output: "", exit: false, clear: false };

  state.history.push(trimmed);

  // Parse pipes (basic — output of prev becomes "stdin" for next)
  const pipeSegments = trimmed.split("|").map(s => s.trim());
  let pipeInput = "";

  for (let i = 0; i < pipeSegments.length; i++) {
    const seg = pipeSegments[i];
    const result = executeSingle(seg, state, pipeInput);
    if (result.exit || result.clear) return result;
    if (result.newCwd) state.cwd = result.newCwd;
    pipeInput = result.output;
  }

  return { output: pipeInput, exit: false, clear: false };
}

/* ── Shorthand: wrap a string into a ShellResult ── */
function out(output: string): ShellResult {
  return { output, exit: false, clear: false };
}

/* ── Execute a single command (no pipes) ── */
function executeSingle(raw: string, state: ShellState, stdin: string): ShellResult {
  const tokens = tokenize(raw);
  if (tokens.length === 0) return { output: "", exit: false, clear: false };

  const cmd = tokens[0];
  const args = tokens.slice(1);

  switch (cmd) {
    case "help":
      return out(shellHelp());

    case "ls":
      return out(cmdLs(args, state));

    case "cd":
      return cmdCd(args, state);

    case "pwd":
      return out(state.cwd);

    case "cat":
      return out(args.length > 0 ? cmdCat(args, state) : (stdin || `${RED}cat: missing operand${RESET}`));

    case "echo":
      return out(args.join(" ").replace(/\$(\w+)/g, (_, k) => state.env[k] ?? ""));

    case "whoami":
      return out("visitor");

    case "hostname":
      return out("portfolio");

    case "uname":
      if (args.includes("-a")) return out("PortfolioOS 1.0.0 wasm aarch64 Next.js/15 TypeScript");
      return out("PortfolioOS");

    case "date":
      return out(new Date().toString());

    case "uptime":
      return out(`up ${Math.floor(performance.now() / 1000)}s`);

    case "env":
    case "printenv":
      return out(Object.entries(state.env).map(([k, v]) => `${k}=${v}`).join("\n"));

    case "export": {
      for (const a of args) {
        const eq = a.indexOf("=");
        if (eq > 0) {
          state.env[a.slice(0, eq)] = a.slice(eq + 1);
        }
      }
      return out("");
    }

    case "head":
      return out(cmdHead(args, state, stdin));

    case "tail":
      return out(cmdTail(args, state, stdin));

    case "wc":
      return out(cmdWc(args, state, stdin));

    case "grep":
      return out(cmdGrep(args, state, stdin));

    case "tree":
      return out(cmdTree(args, state));

    case "find":
      return out(cmdFind(args, state));

    case "mkdir":
      return out(cmdMkdir(args, state));

    case "touch":
      return out(cmdTouch(args, state));

    case "history":
      return out(state.history.map((h, i) => `  ${String(i + 1).padStart(4)}  ${h}`).join("\n"));

    case "hexdump": {
      const content = args.length > 0 ? readFileContent(args[0], state) : stdin;
      if (content.startsWith(`${RED}`)) return out(content);
      return out(hexdump(content));
    }

    case "base64": {
      const content = args.length > 0 ? readFileContent(args[0], state) : stdin;
      if (content.startsWith(`${RED}`)) return out(content);
      try { return out(btoa(content)); } catch { return out(content); }
    }

    case "fortune":
      return out(FORTUNES[Math.floor(Math.random() * FORTUNES.length)]);

    case "cowsay": {
      const msg = args.join(" ") || "Moo!";
      const border = "─".repeat(msg.length + 2);
      return out([
        ` ┌${border}┐`,
        ` │ ${msg} │`,
        ` └${border}┘`,
        `        \\   ^__^`,
        `         \\  (oo)\\_______`,
        `            (__)\\       )\\/\\`,
        `                ||----w |`,
        `                ||     ||`,
      ].join("\n"));
    }

    case "neofetch":
      return out(cmdNeofetch(state));

    case "clear":
      return { output: "", exit: false, clear: true };

    case "exit":
    case "quit":
      return { output: `${DIM}Exiting WASM shell...${RESET}`, exit: true, clear: false };

    case "sudo":
      return out(`${RED}Permission denied. Nice try though.${RESET}`);

    case "rm":
      return out(`${RED}rm: operation not permitted — this portfolio is read-only!${RESET}`);

    case "vim":
    case "vi":
    case "nano":
      return out(`${YELLOW}${cmd}: editor not available in WASM mode. This is a read-only filesystem.${RESET}`);

    case "python":
    case "python3":
    case "node":
      return out(`${YELLOW}${cmd}: not loaded. This shell emulates basic Unix commands.\nThe filesystem contains the portfolio data — explore with ls, cd, cat.${RESET}`);

    case "man":
      return out(`${DIM}No manual entry for ${args[0] || "?"}. Try 'help'.${RESET}`);

    case "which":
      return out(args[0] ? `/usr/bin/${args[0]}` : `${RED}which: missing argument${RESET}`);

    case "true":
      return out("");
    case "false":
      return out("");

    default:
      return out(`${RED}${cmd}: command not found${RESET}\nType ${GREEN}help${RESET} for available commands.`);
  }
}

/* ── Builtin commands ── */

function cmdLs(args: string[], state: ShellState): string {
  const showAll = args.includes("-a") || args.includes("-la") || args.includes("-al");
  const showLong = args.includes("-l") || args.includes("-la") || args.includes("-al");
  const pathArg = args.find(a => !a.startsWith("-")) || ".";

  const { node, absPath } = resolve(state.fs, state.cwd, pathArg);
  if (!node) return `${RED}ls: cannot access '${pathArg}': No such file or directory${RESET}`;
  if (node.type === "file") return pathArg;

  const entries = Array.from(node.children!.entries())
    .filter(([name]) => showAll || !name.startsWith("."))
    .sort(([a], [b]) => a.localeCompare(b));

  if (entries.length === 0) return `${DIM}(empty directory)${RESET}`;

  if (showLong) {
    const lines: string[] = [];
    for (const [name, child] of entries) {
      const isDir = child.type === "dir";
      const size = isDir ? "-" : String(child.content?.length ?? 0);
      const perm = isDir ? "drwxr-xr-x" : "-rw-r--r--";
      const colored = isDir ? `${CYAN}${name}/${RESET}` : name;
      lines.push(`${perm}  visitor visitor  ${size.padStart(6)}  ${colored}`);
    }
    return lines.join("\n");
  }

  return entries
    .map(([name, child]) => child.type === "dir" ? `${CYAN}${name}/${RESET}` : name)
    .join("  ");
}

function cmdCd(args: string[], state: ShellState): ShellResult {
  const target = args[0] || "~";
  const { node, absPath } = resolve(state.fs, state.cwd, target);

  if (!node) return out(`${RED}cd: ${target}: No such file or directory${RESET}`);
  if (node.type !== "dir") return out(`${RED}cd: ${target}: Not a directory${RESET}`);

  return { output: "", exit: false, clear: false, newCwd: absPath };
}

function cmdCat(args: string[], state: ShellState): string {
  const results: string[] = [];
  for (const a of args) {
    const content = readFileContent(a, state);
    results.push(content);
  }
  return results.join("\n");
}

function cmdHead(args: string[], state: ShellState, stdin: string): string {
  let n = 10;
  const nIdx = args.indexOf("-n");
  if (nIdx !== -1 && args[nIdx + 1]) n = parseInt(args[nIdx + 1]) || 10;
  const fileArg = args.find(a => !a.startsWith("-") && a !== String(n));
  const content = fileArg ? readFileContent(fileArg, state) : stdin;
  if (content.startsWith(`${RED}`)) return content;
  return content.split("\n").slice(0, n).join("\n");
}

function cmdTail(args: string[], state: ShellState, stdin: string): string {
  let n = 10;
  const nIdx = args.indexOf("-n");
  if (nIdx !== -1 && args[nIdx + 1]) n = parseInt(args[nIdx + 1]) || 10;
  const fileArg = args.find(a => !a.startsWith("-") && a !== String(n));
  const content = fileArg ? readFileContent(fileArg, state) : stdin;
  if (content.startsWith(`${RED}`)) return content;
  const lines = content.split("\n");
  return lines.slice(Math.max(0, lines.length - n)).join("\n");
}

function cmdWc(args: string[], state: ShellState, stdin: string): string {
  const fileArg = args.find(a => !a.startsWith("-"));
  const content = fileArg ? readFileContent(fileArg, state) : stdin;
  if (content.startsWith(`${RED}`)) return content;
  const lines = content.split("\n").length;
  const words = content.split(/\s+/).filter(Boolean).length;
  const chars = content.length;
  return `  ${lines} ${words} ${chars}${fileArg ? `  ${fileArg}` : ""}`;
}

function cmdGrep(args: string[], state: ShellState, stdin: string): string {
  const caseInsensitive = args.includes("-i");
  const filtered = args.filter(a => !a.startsWith("-"));
  if (filtered.length === 0) return `${RED}grep: missing pattern${RESET}`;

  const pattern = filtered[0];
  const fileArg = filtered[1];
  const content = fileArg ? readFileContent(fileArg, state) : stdin;
  if (content.startsWith(`${RED}`)) return content;

  const flags = caseInsensitive ? "i" : "";
  let regex: RegExp;
  try { regex = new RegExp(pattern, flags); } catch { regex = new RegExp(escapeRegex(pattern), flags); }

  const matches = content.split("\n").filter(line => regex.test(line));
  if (matches.length === 0) return "";
  return matches.map(line => {
    return line.replace(regex, (m) => `${RED}${BOLD}${m}${RESET}`);
  }).join("\n");
}

function cmdTree(args: string[], state: ShellState): string {
  const pathArg = args.find(a => !a.startsWith("-")) || ".";
  const { node } = resolve(state.fs, state.cwd, pathArg);
  if (!node) return `${RED}tree: '${pathArg}': No such file or directory${RESET}`;
  if (node.type !== "dir") return pathArg;

  const lines: string[] = ["."];
  let dirCount = 0;
  let fileCount = 0;

  function walk(n: FSNode, prefix: string) {
    if (n.type !== "dir" || !n.children) return;
    const entries = Array.from(n.children.entries())
      .filter(([name]) => !name.startsWith("."))
      .sort(([a], [b]) => a.localeCompare(b));
    entries.forEach(([name, child], i) => {
      const isLast = i === entries.length - 1;
      const connector = isLast ? "└── " : "├── ";
      const isDir = child.type === "dir";
      if (isDir) dirCount++;
      else fileCount++;
      const colored = isDir ? `${CYAN}${name}${RESET}` : name;
      lines.push(`${prefix}${connector}${colored}`);
      if (isDir) {
        walk(child, prefix + (isLast ? "    " : "│   "));
      }
    });
  }

  walk(node, "");
  lines.push("");
  lines.push(`${DIM}${dirCount} directories, ${fileCount} files${RESET}`);
  return lines.join("\n");
}

function cmdFind(args: string[], state: ShellState): string {
  const pathArg = args[0] || ".";
  const nameIdx = args.indexOf("-name");
  const namePattern = nameIdx !== -1 ? args[nameIdx + 1] : null;
  const { node, absPath } = resolve(state.fs, state.cwd, pathArg);
  if (!node) return `${RED}find: '${pathArg}': No such file or directory${RESET}`;

  const results: string[] = [];
  function walk(n: FSNode, path: string) {
    if (n.type === "dir" && n.children) {
      for (const [name, child] of n.children) {
        const childPath = `${path}/${name}`;
        if (!namePattern || matchGlob(name, namePattern)) {
          results.push(childPath);
        }
        walk(child, childPath);
      }
    }
  }
  walk(node, absPath === "/" ? "" : absPath);
  return results.join("\n") || `${DIM}(no matches)${RESET}`;
}

function cmdMkdir(args: string[], state: ShellState): string {
  if (args.length === 0) return `${RED}mkdir: missing operand${RESET}`;
  for (const a of args) {
    const parentPath = a.includes("/") ? a.slice(0, a.lastIndexOf("/")) || "/" : ".";
    const dirName = a.includes("/") ? a.slice(a.lastIndexOf("/") + 1) : a;
    const { node } = resolve(state.fs, state.cwd, parentPath);
    if (!node || node.type !== "dir") return `${RED}mkdir: cannot create directory '${a}': No such file or directory${RESET}`;
    if (node.children!.has(dirName)) return `${RED}mkdir: cannot create directory '${a}': File exists${RESET}`;
    node.children!.set(dirName, { type: "dir", children: new Map() });
  }
  return "";
}

function cmdTouch(args: string[], state: ShellState): string {
  if (args.length === 0) return `${RED}touch: missing file operand${RESET}`;
  for (const a of args) {
    const parentPath = a.includes("/") ? a.slice(0, a.lastIndexOf("/")) || "/" : ".";
    const fileName = a.includes("/") ? a.slice(a.lastIndexOf("/") + 1) : a;
    const { node } = resolve(state.fs, state.cwd, parentPath);
    if (!node || node.type !== "dir") return `${RED}touch: cannot touch '${a}': No such file or directory${RESET}`;
    if (!node.children!.has(fileName)) {
      node.children!.set(fileName, { type: "file", content: "" });
    }
  }
  return "";
}

function cmdNeofetch(state: ShellState): string {
  const w = typeof window !== "undefined" ? window.innerWidth : 0;
  const h = typeof window !== "undefined" ? window.innerHeight : 0;
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const browser = /Firefox/.test(ua) ? "Firefox" : /Edg/.test(ua) ? "Edge" : /Chrome/.test(ua) ? "Chrome" : /Safari/.test(ua) ? "Safari" : "Unknown";
  const os = /Win/.test(ua) ? "Windows" : /Mac/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : "Unknown";

  return [
    `${GREEN}${BOLD}  visitor@portfolio${RESET}`,
    `  ${"─".repeat(22)}`,
    `  ${BOLD}OS:${RESET}         PortfolioOS (${os} host)`,
    `  ${BOLD}Shell:${RESET}      wasm-sh 1.0.0`,
    `  ${BOLD}Browser:${RESET}    ${browser}`,
    `  ${BOLD}Resolution:${RESET} ${w}x${h}`,
    `  ${BOLD}Framework:${RESET}  Next.js 15`,
    `  ${BOLD}Language:${RESET}   TypeScript`,
    `  ${BOLD}Styling:${RESET}    Tailwind CSS`,
    `  ${BOLD}Backend:${RESET}    Supabase`,
    `  ${BOLD}Terminal:${RESET}   xterm.js (WASM mode)`,
    `  ${BOLD}Uptime:${RESET}     ${Math.floor(performance.now() / 1000)}s`,
    "",
    `  ${RED}███${GREEN}███${YELLOW}███${CYAN}███${RESET}`,
  ].join("\n");
}

/* ── Help text ── */
function shellHelp(): string {
  return `${GREEN}${BOLD}WASM Shell v1.0${RESET} — A real Unix-like shell in your browser

${BOLD}Filesystem:${RESET}
  ls [-l] [-a] [path]     List directory contents
  cd <path>               Change directory
  cat <file>              Print file contents
  pwd                     Print working directory
  tree [path]             Display directory tree
  find [path] [-name pat] Search for files
  mkdir <dir>             Create directory
  touch <file>            Create empty file

${BOLD}Text Processing:${RESET}
  head [-n N] <file>      Show first N lines
  tail [-n N] <file>      Show last N lines
  wc <file>               Word/line/char count
  grep [-i] <pat> <file>  Search file for pattern
  echo <text>             Print text (supports $VAR)

${BOLD}System:${RESET}
  whoami                  Current user
  hostname                Show hostname
  uname [-a]              System info
  date                    Current date/time
  uptime                  Session uptime
  env / printenv          Show environment variables
  export KEY=VALUE        Set environment variable
  neofetch                System info (pretty)
  history                 Command history
  which <cmd>             Locate a command

${BOLD}Fun:${RESET}
  fortune                 Random dev quote
  cowsay <text>           ASCII cow
  hexdump <file>          Hex dump of file
  base64 <file>           Base64 encode file

${BOLD}Other:${RESET}
  clear                   Clear screen
  exit                    Exit WASM shell
  ${DIM}Pipes supported: cat file | grep pattern | head${RESET}

${DIM}Tip: Try 'tree ~' to see the full portfolio filesystem!${RESET}`;
}

/* ── Helper utilities ── */

function readFileContent(path: string, state: ShellState): string {
  const { node } = resolve(state.fs, state.cwd, path);
  if (!node) return `${RED}cat: ${path}: No such file or directory${RESET}`;
  if (node.type === "dir") return `${RED}cat: ${path}: Is a directory${RESET}`;
  return node.content ?? "";
}

function hexdump(text: string): string {
  const lines: string[] = [];
  const bytes = new TextEncoder().encode(text);
  for (let i = 0; i < bytes.length && i < 256; i += 16) {
    const hex = Array.from(bytes.slice(i, i + 16))
      .map(b => b.toString(16).padStart(2, "0"))
      .join(" ");
    const ascii = Array.from(bytes.slice(i, i + 16))
      .map(b => (b >= 32 && b < 127) ? String.fromCharCode(b) : ".")
      .join("");
    lines.push(`${i.toString(16).padStart(8, "0")}  ${hex.padEnd(48)}  |${ascii}|`);
  }
  if (bytes.length > 256) lines.push(`${DIM}... (truncated, ${bytes.length} bytes total)${RESET}`);
  return lines.join("\n");
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function matchGlob(name: string, pattern: string): boolean {
  const regex = new RegExp("^" + pattern.replace(/\*/g, ".*").replace(/\?/g, ".") + "$", "i");
  return regex.test(name);
}

function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let current = "";
  let inQuote: string | null = null;

  for (const ch of input) {
    if (inQuote) {
      if (ch === inQuote) { inQuote = null; }
      else { current += ch; }
    } else if (ch === '"' || ch === "'") {
      inQuote = ch;
    } else if (ch === " " || ch === "\t") {
      if (current) { tokens.push(current); current = ""; }
    } else {
      current += ch;
    }
  }
  if (current) tokens.push(current);
  return tokens;
}
