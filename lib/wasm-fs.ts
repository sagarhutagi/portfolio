/**
 * Virtual filesystem for the WASM terminal.
 * Populates a Unix-like directory tree from portfolio data.
 */

import type { SiteSettings, Project, Learning, WorkExperience } from "@/types";

/* ── Types ── */
export interface FSNode {
  type: "file" | "dir";
  content?: string;          // file content
  children?: Map<string, FSNode>;  // directory children
}

/* ── Build the filesystem from portfolio data ── */
export function buildFilesystem(
  settings: SiteSettings,
  projects: Project[],
  learnings: Learning[],
  experience: WorkExperience[],
  socials: { label: string; href: string }[],
): FSNode {
  const root = dir();

  // /home/visitor
  const home = dir();
  const visitor = dir();
  set(root, "home", home);
  set(home, "visitor", visitor);

  // ~/about.txt
  set(visitor, "about.txt", file(
    `${settings.name}\n${settings.title}\n${"─".repeat(40)}\n\n${settings.about}\n\nLocation: ${settings.location}\nEmail: ${settings.email}\nStatus: ${settings.current_status}`
  ));

  // ~/resume.txt
  set(visitor, "resume.txt", file(
    `Resume: ${settings.resume_url}\n\nTo download, visit the URL above.`
  ));

  // ~/skills.txt
  set(visitor, "skills.txt", file(
    settings.skills.map((s, i) => `  ${i + 1}. ${s}`).join("\n")
  ));

  // ~/socials.txt
  set(visitor, "socials.txt", file(
    socials.map(s => `${s.label.padEnd(14)} ${s.href}`).join("\n") || "No socials configured."
  ));

  // ~/projects/
  const projDir = dir();
  set(visitor, "projects", projDir);
  for (const p of projects) {
    const slug = slugify(p.title);
    const pDir = dir();
    set(projDir, slug, pDir);
    set(pDir, "README.md", file(
      `# ${p.title}\n\n${p.long_desc}\n\n## Tech Stack\n${p.tech.map(t => `- ${t}`).join("\n")}\n\n## Links\n- Live: ${p.live_url}\n- GitHub: ${p.github_url}`
    ));
    set(pDir, "tech.txt", file(p.tech.join("\n")));
    if (p.screenshots.length > 0) {
      set(pDir, "screenshots.txt", file(p.screenshots.join("\n")));
    }
  }

  // ~/learnings/
  const learnDir = dir();
  set(visitor, "learnings", learnDir);
  for (const l of learnings) {
    const slug = slugify(l.title);
    set(learnDir, `${slug}.md`, file(
      `# ${l.title}\n\n${l.summary}\n\n---\n\n${l.full_details}`
    ));
  }

  // ~/experience/
  const expDir = dir();
  set(visitor, "experience", expDir);
  for (const e of experience) {
    const slug = slugify(`${e.role}-at-${e.company}`);
    set(expDir, `${slug}.md`, file(
      `# ${e.role} @ ${e.company}\n${e.start_date} — ${e.end_date || "Present"}\n\n${e.description}\n\n## Tech\n${e.tech.map(t => `- ${t}`).join("\n")}`
    ));
  }

  // /etc
  const etc = dir();
  set(root, "etc", etc);
  set(etc, "hostname", file("portfolio"));
  set(etc, "os-release", file(
    `NAME="PortfolioOS"\nVERSION="1.0.0"\nBUILD="Next.js 15 + TypeScript"\nMOTTO="Built different."`
  ));
  set(etc, "motd", file(
    `Welcome to ${settings.name}'s portfolio terminal.\nType 'help' for commands, or explore the filesystem with ls, cd, cat.\n\nThis is a real shell running via WebAssembly in your browser.\nNo server involved — everything executes locally.`
  ));
  // /etc/secrets - Easter egg!
  const secrets = dir();
  set(etc, "secrets", secrets);
  set(secrets, "flag.txt", file("🏴 CTF{you_found_the_secret_filesystem} — Nice work, explorer!"));
  set(secrets, ".hidden_message", file("If you're reading this, you're exactly the kind of person I'd love to work with.\nReach out: " + settings.email));

  // /tmp
  const tmp = dir();
  set(root, "tmp", tmp);
  set(tmp, "welcome.txt", file("You're in /tmp. Nothing persists here — just like real life."));

  // /usr
  const usr = dir();
  set(root, "usr", usr);
  const bin = dir();
  set(usr, "bin", bin);
  set(bin, "README", file("Built-in commands: help, ls, cd, cat, pwd, echo, clear, whoami, date, uname, head, tail, wc, grep, tree, find, env, history, hexdump, base64, fortune"));

  return root;
}

/* ── Resolve a path to a node ── */
export function resolve(root: FSNode, cwd: string, path: string): { node: FSNode | null; absPath: string } {
  const abs = toAbsolute(cwd, path);
  const parts = abs.split("/").filter(Boolean);
  let current = root;
  for (const part of parts) {
    if (part === "." || part === "") continue;
    if (part === "..") continue; // handled in toAbsolute
    if (current.type !== "dir" || !current.children?.has(part)) {
      return { node: null, absPath: abs };
    }
    current = current.children.get(part)!;
  }
  return { node: current, absPath: abs };
}

/* ── Normalize path ── */
export function toAbsolute(cwd: string, path: string): string {
  // Handle home directory
  let resolved = path;
  if (resolved.startsWith("~")) {
    resolved = "/home/visitor" + resolved.slice(1);
  }
  if (!resolved.startsWith("/")) {
    resolved = cwd + "/" + resolved;
  }

  /* Normalize . and .. */
  const parts = resolved.split("/");
  const stack: string[] = [];
  for (const part of parts) {
    if (part === "" || part === ".") continue;
    if (part === "..") {
      stack.pop();
    } else {
      stack.push(part);
    }
  }
  return "/" + stack.join("/");
}

/* ── Helpers ── */
function dir(): FSNode {
  return { type: "dir", children: new Map() };
}

function file(content: string): FSNode {
  return { type: "file", content };
}

function set(parent: FSNode, name: string, child: FSNode) {
  parent.children!.set(name, child);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
