// Pinned version expectations for @dnd-kit/* packages.
// If any required package is missing OR installed at a version that doesn't
// satisfy the pinned spec, we print a loud warning. Run from Vite plugin
// (startup + build) and as a standalone script.
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

// Single source of truth for the pinned set.
export const PINNED_DND_KIT = {
  "@dnd-kit/core": "6.3.1",
  "@dnd-kit/sortable": "10.0.0",
  "@dnd-kit/utilities": "3.2.2",
};

function readInstalledVersion(pkg) {
  try {
    const pj = require(`${pkg}/package.json`);
    return pj.version ?? null;
  } catch {
    return null;
  }
}

export function checkDndKitDeps({ silent = false } = {}) {
  const missing = [];
  const mismatched = [];

  for (const [pkg, expected] of Object.entries(PINNED_DND_KIT)) {
    const installed = readInstalledVersion(pkg);
    if (!installed) {
      missing.push(pkg);
    } else if (installed !== expected) {
      mismatched.push({ pkg, expected, installed });
    }
  }

  const ok = missing.length === 0 && mismatched.length === 0;

  if (!ok && !silent) {
    const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
    const red = (s) => `\x1b[31m${s}\x1b[0m`;
    console.warn(
      yellow("\n[dnd-kit] Dependency check failed — please review:"),
    );
    if (missing.length) {
      console.warn(red(`  Missing: ${missing.join(", ")}`));
      console.warn(
        `  Install with: npm i ${missing
          .map((p) => `${p}@${PINNED_DND_KIT[p]}`)
          .join(" ")}`,
      );
    }
    if (mismatched.length) {
      for (const { pkg, expected, installed } of mismatched) {
        console.warn(
          yellow(`  ${pkg}: installed ${installed}, expected ${expected}`),
        );
      }
    }
    console.warn("");
  }

  return { ok, missing, mismatched };
}

// Standalone CLI: `node scripts/check-dnd-kit-deps.mjs`
if (import.meta.url === `file://${process.argv[1]}`) {
  const { ok } = checkDndKitDeps();
  if (!ok) process.exitCode = 1;
  else console.log("[dnd-kit] All required packages present at pinned versions.");
}
