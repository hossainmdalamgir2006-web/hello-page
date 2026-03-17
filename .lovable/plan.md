

## Plan: Add Remaining Toolbar Features to Rich Text Editor

### New Features (8 additions)

**1. Font Family Selector** — Dropdown with Sans-serif, Serif, Monospace, Cursive options. Uses `document.execCommand("fontName", false, font)`.

**2. Special Characters Popup** — Grid of symbols (©, ™, ®, →, ←, ↑, ↓, ★, ☆, ÷, ±, ≤, ≥, °, µ, §, ¶, •, etc.) inserted via `insertText`.

**3. YouTube/Video Embed** — Popover with URL input, extracts YouTube video ID, inserts responsive iframe HTML via `insertHTML`.

**4. Line Height Selector** — Dropdown (1.0, 1.25, 1.5, 2.0). Wraps selection in a `<span>` with inline `line-height` style.

**5. Find & Replace** — Small toolbar popup with search input + replace input + buttons (Find Next, Replace, Replace All). Uses `window.find()` and range manipulation.

**6. Text Direction Toggle** — LTR/RTL button, sets `dir` attribute on the editor or selected block.

**7. Print** — Opens `window.print()` with editor content in a print-friendly format.

**8. Special Characters Insert** — Popup grid, click to insert at cursor.

### Files Changed

1. **`src/components/ui/rich-text-editor/constants.ts`** — Add `FONT_FAMILIES`, `LINE_HEIGHTS`, `SPECIAL_CHARACTERS` arrays
2. **`src/components/ui/rich-text-editor/EditorToolbar.tsx`** — Add new toolbar buttons/dropdowns
3. **`src/components/ui/rich-text-editor/RichTextEditor.tsx`** — Add handler functions for new features (video embed, find/replace, print, text direction)
4. **`src/components/ui/rich-text-editor/FindReplaceBar.tsx`** — New component for find & replace UI
5. **`src/components/ui/rich-text-editor/SpecialCharsPicker.tsx`** — New component for special characters grid
6. **`src/components/ui/rich-text-editor/types.ts`** — Update props interface if needed

No new dependencies. All native browser APIs + existing shadcn/ui components.

