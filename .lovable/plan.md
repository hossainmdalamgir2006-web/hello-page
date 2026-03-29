

## Plan: Product Description-এ Image/Video Insert ফিক্স

### সমস্যা

Rich Text Editor যখন Dialog/Modal এর ভিতরে থাকে, তখন Image/Video Popover ক্লিক করলে contentEditable div থেকে focus চলে যায়। ফলে `document.execCommand("insertImage")` বা `document.execCommand("insertHTML")` কাজ করে না — কারণ selection/cursor হারিয়ে যায়।

### সমাধান

Editor-এ **selection save/restore** মেকানিজম যোগ করা হবে। Popover ওপেন হওয়ার আগে current selection সংরক্ষণ করা হবে, এবং insert করার সময় সেই selection restore করে তারপর command execute হবে।

### Steps

**1. `RichTextEditor.tsx` — Selection save/restore যোগ করা**
- একটি `savedRange` ref রাখা হবে
- Editor blur হলে বা popover-related action হলে current `Selection.getRangeAt(0)` সেভ করা
- `execCommand`, `handleInsertImage`, `handleInsertVideo`, `handleInsertTable` কল করার আগে saved range restore করা (focus + `Selection.removeAllRanges()` + `addRange()`)
- নতুন helper: `saveSelection()` এবং `restoreSelection()`

**2. `EditorToolbar.tsx` — Popover open হলে selection save করা**
- `EditorToolbarProps`-এ নতুন prop: `onSaveSelection: () => void`
- Image, Video, Link Popover-এর `onOpenChange` এ যখন open হয় তখন `onSaveSelection()` কল করা

### Technical Detail

```text
User clicks Image icon → Popover opens → onSaveSelection() saves cursor position
User picks image/URL → clicks Insert → restoreSelection() puts cursor back → execCommand runs → image inserted at correct position
```

### Files to modify
- `src/components/ui/rich-text-editor/RichTextEditor.tsx` — add `savedRange` ref, `saveSelection()`, `restoreSelection()`, wrap insert handlers
- `src/components/ui/rich-text-editor/EditorToolbar.tsx` — accept `onSaveSelection` prop, call it on popover open
- `src/components/ui/rich-text-editor/types.ts` — (if needed) update type

