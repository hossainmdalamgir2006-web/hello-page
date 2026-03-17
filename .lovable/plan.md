

## Current Toolbar Features
Bold, Italic, Underline, Strikethrough, Headings (H1-H3), Lists, Blockquote, Alignment, Link/Unlink, Color Picker, Image, Horizontal Rule, Code Block, Clear Formatting, Undo/Redo, HTML Source View.

## Additional Toolbar Features That Can Be Added

### Text Formatting
- **Font Size** selector (dropdown: 12px, 14px, 16px, 18px, 24px, 32px)
- **Font Family** selector (dropdown: Sans, Serif, Mono, etc.)
- **Background/Highlight Color** picker (like the text color but for background)
- **Superscript** / **Subscript** buttons
- **Inline Code** formatting (monospace with background)

### Content Insertion
- **Table Insert** — grid picker (e.g. 3x3) to insert HTML tables
- **Emoji Picker** — common emojis grid popup
- **YouTube/Video Embed** — paste URL, inserts iframe
- **Special Characters** — symbols like ©, ™, →, ★ etc.

### Layout & Structure
- **Indent** / **Outdent** buttons (increase/decrease indent)
- **Line Height** selector
- **Letter Spacing** control

### Utility
- **Find & Replace** — search within editor content
- **Word Count** display (alongside char count)
- **Print** button
- **Fullscreen** toggle — expand editor to full viewport
- **Select All** button

### Advanced
- **Text Direction** (LTR/RTL) toggle — useful for multilingual content
- **Anchor/Bookmark** insertion for in-page links

## Recommended Priority Additions
1. Font Size selector
2. Background Highlight Color
3. Superscript / Subscript
4. Indent / Outdent
5. Table Insert
6. Emoji Picker
7. Fullscreen toggle
8. Word Count

All achievable with native `document.execCommand` and `contentEditable` — no external libraries needed.

