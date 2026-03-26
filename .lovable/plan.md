

# Tab Switch Reload Fix

## Root Cause
`AuthContext.tsx` line 215 — `role !== null` check is inside a `useEffect([], [])` closure, so `role` is **always captured as `null`** (initial state). The `TOKEN_REFRESHED` guard never fires, causing full re-fetch on every tab return.

## Fix

### `src/contexts/AuthContext.tsx`
- Add a `useRef` to track role: `const roleRef = useRef<AppRole | null>(null)` 
- Update `roleRef.current` whenever `setRole()` is called
- Change line 215 from `role !== null` to `roleRef.current !== null`
- Also add `initDone.current` check — if already initialized and user hasn't changed, skip all work on `TOKEN_REFRESHED`

This is a 1-file, ~10-line change that fixes the stale closure bug.

## Expected result
- Tab switch back: **zero DB calls**, instant — no reload, no flicker

