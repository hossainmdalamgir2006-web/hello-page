import { defineConfig, type PluginOption } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { checkDndKitDeps, PINNED_DND_KIT } from "./scripts/check-dnd-kit-deps.mjs";

// Vite plugin: warn on startup AND fail the build if required dnd-kit deps
// are missing or don't match the pinned versions.
function dndKitDepCheck(): PluginOption {
  return {
    name: "dnd-kit-dep-check",
    apply: () => true,
    configResolved(config) {
      const { ok, missing, mismatched } = checkDndKitDeps();
      const isBuild = config.command === "build";
      // Hard fail builds if anything is outright missing.
      if (isBuild && missing.length > 0) {
        throw new Error(
          `[dnd-kit] Missing required packages: ${missing.join(
            ", ",
          )}. Pinned versions: ${JSON.stringify(PINNED_DND_KIT)}`,
        );
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
}));
