import { lazy, type ComponentType } from "react";

/**
 * Wraps React.lazy with automatic recovery from stale chunk errors.
 *
 * After a new deploy, Vite emits new hashed chunk filenames. Browsers that
 * loaded the old `index.html` will request chunks that no longer exist and
 * crash with "Failed to fetch dynamically imported module" / "Importing a
 * module script failed". We detect that error and force a one-time hard
 * reload so the user picks up the latest `index.html` + new chunk URLs.
 */
const RELOAD_FLAG = "__lovable_chunk_reload__";

function isChunkLoadError(err: unknown): boolean {
  if (!err) return false;
  const msg = (err as Error)?.message || String(err);
  return (
    /Failed to fetch dynamically imported module/i.test(msg) ||
    /Importing a module script failed/i.test(msg) ||
    /error loading dynamically imported module/i.test(msg) ||
    /ChunkLoadError/i.test(msg)
  );
}

export function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
) {
  return lazy(async () => {
    try {
      return await factory();
    } catch (err) {
      if (!isChunkLoadError(err)) throw err;

      // Only reload once per session to avoid an infinite reload loop if
      // the chunk really is missing (e.g. corrupt deploy).
      try {
        const alreadyReloaded = sessionStorage.getItem(RELOAD_FLAG);
        if (!alreadyReloaded) {
          sessionStorage.setItem(RELOAD_FLAG, "1");
          window.location.reload();
          // Return a never-resolving promise so React doesn't render an
          // error fallback before the reload kicks in.
          return await new Promise<{ default: T }>(() => {});
        }
      } catch {
        // sessionStorage may be unavailable — fall through and rethrow.
      }

      throw err;
    }
  });
}
