// Pinned version expectations for @dnd-kit/* packages.
// If any required package is missing OR installed at a version that doesn't
// match the pinned spec, we print a loud warning. Used by the Vite plugin
// (startup + build) and runnable as a standalone script.
import { createRequire } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const require = createRequire(import.meta.url);

// Single source of truth for the pinned set.
export const PINNED_DND_KIT: Record<string, string> = {
  "@dnd-kit/core": "6.3.1",
  "@dnd-kit/sortable": "10.0.0",
  "@dnd-kit/utilities": "3.2.2",
};

type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

interface LockfileInfo {
  manager: PackageManager;
  path: string;
  exists: boolean;
}

function detectLockfile(cwd = process.cwd()): LockfileInfo {
  const candidates: { manager: PackageManager; file: string }[] = [
    { manager: "bun", file: "bun.lock" },
    { manager: "bun", file: "bun.lockb" },
    { manager: "pnpm", file: "pnpm-lock.yaml" },
    { manager: "yarn", file: "yarn.lock" },
    { manager: "npm", file: "package-lock.json" },
  ];
  for (const { manager, file } of candidates) {
    const p = resolve(cwd, file);
    if (existsSync(p)) return { manager, path: p, exists: true };
  }
  // Default to npm if nothing found.
  return { manager: "npm", path: resolve(cwd, "package-lock.json"), exists: false };
}

function buildInstallCommand(
  manager: PackageManager,
  packages: { pkg: string; version: string }[],
): string {
  const specs = packages.map(({ pkg, version }) => `${pkg}@${version}`).join(" ");
  switch (manager) {
    case "pnpm":
      return `pnpm add -E ${specs}`;
    case "yarn":
      return `yarn add --exact ${specs}`;
    case "bun":
      return `bun add --exact ${specs}`;
    case "npm":
    default:
      return `npm i -E ${specs}`;
  }
}

function readInstalledVersion(pkg: string): string | null {
  try {
    const pj = require(`${pkg}/package.json`);
    return pj.version ?? null;
  } catch {
    return null;
  }
}

export interface LockfileCheckResult {
  ok: boolean;
  manager: PackageManager;
  path: string;
  exists: boolean;
  missingInLockfile: string[];
  mismatchedInLockfile: { pkg: string; expected: string; foundVersions: string[] }[];
}

// Best-effort scan: confirms each pinned pkg name + exact version literal appears
// in the lockfile text. Works for npm/yarn/pnpm/bun text-based lockfiles.
// (bun.lockb is binary — we only check existence in that case.)
export function checkLockfile(cwd = process.cwd()): LockfileCheckResult {
  const info = detectLockfile(cwd);
  const result: LockfileCheckResult = {
    ok: true,
    manager: info.manager,
    path: info.path,
    exists: info.exists,
    missingInLockfile: [],
    mismatchedInLockfile: [],
  };

  if (!info.exists) {
    result.ok = false;
    return result;
  }

  // Binary bun lockfile: existence-only check.
  if (info.path.endsWith(".lockb")) return result;

  let text = "";
  try {
    text = readFileSync(info.path, "utf8");
  } catch {
    result.ok = false;
    return result;
  }

  for (const [pkg, expected] of Object.entries(PINNED_DND_KIT)) {
    if (!text.includes(pkg)) {
      result.missingInLockfile.push(pkg);
      result.ok = false;
      continue;
    }
    if (!text.includes(expected)) {
      // Try to surface what versions ARE present near the package name.
      const re = new RegExp(
        `${pkg.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[^\\n]*?(\\d+\\.\\d+\\.\\d+)`,
        "g",
      );
      const found = new Set<string>();
      let m: RegExpExecArray | null;
      while ((m = re.exec(text)) !== null) found.add(m[1]);
      result.mismatchedInLockfile.push({
        pkg,
        expected,
        foundVersions: [...found],
      });
      result.ok = false;
    }
  }

  return result;
}

export interface DepCheckResult {
  ok: boolean;
  missing: string[];
  mismatched: { pkg: string; expected: string; installed: string }[];
  lockfile: LockfileCheckResult;
}

export function checkDndKitDeps(
  { silent = false }: { silent?: boolean } = {},
): DepCheckResult {
  const missing: string[] = [];
  const mismatched: DepCheckResult["mismatched"] = [];

  for (const [pkg, expected] of Object.entries(PINNED_DND_KIT)) {
    const installed = readInstalledVersion(pkg);
    if (!installed) {
      missing.push(pkg);
    } else if (installed !== expected) {
      mismatched.push({ pkg, expected, installed });
    }
  }

  const lockfile = checkLockfile();
  const ok =
    missing.length === 0 &&
    mismatched.length === 0 &&
    lockfile.ok;

  if (!ok && !silent) {
    const yellow = (s: string) => `\x1b[33m${s}\x1b[0m`;
    const red = (s: string) => `\x1b[31m${s}\x1b[0m`;
    const cyan = (s: string) => `\x1b[36m${s}\x1b[0m`;

    console.warn(
      yellow("\n[dnd-kit] Dependency check failed — please review:"),
    );

    // Lockfile diagnostics first — they explain a lot of mismatches.
    if (!lockfile.exists) {
      console.warn(
        red(
          `  Lockfile missing. Expected one of: bun.lock(b), pnpm-lock.yaml, yarn.lock, package-lock.json`,
        ),
      );
    } else {
      if (lockfile.missingInLockfile.length) {
        console.warn(
          red(
            `  Lockfile (${lockfile.manager}) missing entries: ${lockfile.missingInLockfile.join(", ")}`,
          ),
        );
      }
      for (const { pkg, expected, foundVersions } of lockfile.mismatchedInLockfile) {
        console.warn(
          yellow(
            `  Lockfile ${pkg}: expected ${expected}, found ${foundVersions.length ? foundVersions.join(", ") : "no exact version"}`,
          ),
        );
      }
    }

    if (missing.length) {
      console.warn(red(`  Missing installs: ${missing.join(", ")}`));
    }
    if (mismatched.length) {
      for (const { pkg, expected, installed } of mismatched) {
        console.warn(
          yellow(`  ${pkg}: installed ${installed}, expected ${expected}`),
        );
      }
    }

    // Build a single copy-paste install command that fixes everything.
    const toInstall = new Set<string>([
      ...missing,
      ...mismatched.map((m) => m.pkg),
      ...lockfile.missingInLockfile,
      ...lockfile.mismatchedInLockfile.map((m) => m.pkg),
    ]);
    if (toInstall.size > 0) {
      const cmd = buildInstallCommand(
        lockfile.manager,
        [...toInstall].map((pkg) => ({ pkg, version: PINNED_DND_KIT[pkg] })),
      );
      console.warn("");
      console.warn(cyan(`  Fix with (${lockfile.manager} detected):`));
      console.warn(cyan(`    ${cmd}`));
    }
    console.warn("");
  }

  return { ok, missing, mismatched, lockfile };
}
