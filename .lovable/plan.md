

## Plan: Build a Custom Reusable Rich Text Editor

The current `RichTextEditor` already uses no external library — it's built with `contentEditable` + `document.execCommand`. I'll enhance it significantly to make it a robust, project-wide reusable editor.

### Enhancements to `src/components/ui/rich-text-editor.tsx`

**Additional toolbar features:**
- Underline, Strikethrough
- Heading levels (H1, H2, H3) via dropdown
- Text alignment (left, center, right, justify)
- Blockquote
- Horizontal rule
- Clear formatting
- Code inline / Code block
- Text color picker (basic preset colors)
- Image insert (URL input)

**UX improvements:**
- Active state detection — toolbar buttons highlight when cursor is in bold/italic/etc
- Keyboard shortcuts (Ctrl+B, Ctrl+I, Ctrl+U, etc.) handled natively by contentEditable
- `minHeight` prop for flexible sizing
- `disabled` / `readOnly` props
- Better link insertion via a small popover instead of `prompt()`
- Divider separators between toolbar groups
- Source/HTML view toggle

**Props interface:**
```typescript
interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  maxLength?: number;
  minHeight?: string;       // e.g. "200px"
  disabled?: boolean;
  readOnly?: boolean;
  toolbar?: "full" | "minimal";  // preset toolbar configs
}
```

### Files Changed
1. **`src/components/ui/rich-text-editor.tsx`** — Rewrite with enhanced toolbar, active states, more formatting options, and configurable props
2. **`src/components/products/ProductModal.tsx`** — No changes needed (already uses `RichTextEditor`)

No database changes required. No new dependencies — everything built with native browser APIs, Tailwind, and existing shadcn/ui components.

