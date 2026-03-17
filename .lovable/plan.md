

## Plan: Remove Unused Code in Rich Text Editor

Small cleanup — 2 unused items found:

### 1. Remove unused `Pilcrow` import in `EditorToolbar.tsx`
- Line 19: `Pilcrow` is imported from `lucide-react` but never used in the component JSX
- Remove it from the import statement

### 2. Remove stale `ToolBtnProps` from `types.ts`
- `types.ts` exports a `ToolBtnProps` interface, but `ToolBtn.tsx` defines its own local `ToolBtnProps` with different shape (includes `execCommand`)
- The exported one in `types.ts` is never imported anywhere — remove it

### Files Changed
- `src/components/ui/rich-text-editor/EditorToolbar.tsx` — remove `Pilcrow` from import
- `src/components/ui/rich-text-editor/types.ts` — remove unused `ToolBtnProps` export

