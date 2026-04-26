import { defineConfig, type PluginOption } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { checkDndKitDeps, PINNED_DND_KIT } from "./scripts/check-dnd-kit-deps";

// Vite plugin: warn on startup AND fail the build if required dnd-kit deps
// are missing or don't match the pinned versions.
function dndKitDepCheck(): PluginOption {
  return {
    name: "dnd-kit-dep-check",
    apply: () => true,
    configResolved(config) {
      const { ok, missing, lockfile } = checkDndKitDeps();
      const isBuild = config.command === "build";
      // Hard fail builds if anything is outright missing OR lockfile is absent
      // / doesn't pin the required @dnd-kit versions.
      if (isBuild) {
        if (missing.length > 0) {
          throw new Error(
            `[dnd-kit] Missing required packages: ${missing.join(
              ", ",
            )}. Pinned versions: ${JSON.stringify(PINNED_DND_KIT)}`,
          );
        }
        if (!lockfile.exists) {
          throw new Error(
            `[dnd-kit] No lockfile found. Commit a lockfile (bun.lock, pnpm-lock.yaml, yarn.lock, or package-lock.json) with pinned @dnd-kit versions.`,
          );
        }
        if (lockfile.missingInLockfile.length > 0) {
          throw new Error(
            `[dnd-kit] Lockfile (${lockfile.manager}) is missing entries for: ${lockfile.missingInLockfile.join(", ")}. Run install to refresh it.`,
          );
        }
      }
      // Mismatches only warn (already logged by checkDndKitDeps).
      if (!ok && !isBuild) {
        console.warn(
          "[dnd-kit] Dev server starting with dependency issues (see above).",
        );
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    dndKitDepCheck(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "es2020",
    cssCodeSplit: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "supabase": ["@supabase/supabase-js"],
          "query": ["@tanstack/react-query"],
          "radix": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-popover",
            "@radix-ui/react-select",
            "@radix-ui/react-tabs",
            "@radix-ui/react-toast",
          ],
          "icons": ["lucide-react"],
          "charts": ["recharts"],
          "dnd": ["@dnd-kit/core", "@dnd-kit/sortable", "@dnd-kit/utilities"],
        },
      },
    },
  },
}));
