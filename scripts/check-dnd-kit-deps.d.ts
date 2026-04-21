declare module "./scripts/check-dnd-kit-deps.mjs" {
  export const PINNED_DND_KIT: Record<string, string>;
  export function checkDndKitDeps(opts?: { silent?: boolean }): {
    ok: boolean;
    missing: string[];
    mismatched: { pkg: string; expected: string; installed: string }[];
  };
}
