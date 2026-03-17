

## Plan: Add Short Description + Rich Text Editor for Products

### 1. Database Migration
Add a `short_description` column to the `products` table:
```sql
ALTER TABLE products ADD COLUMN short_description text DEFAULT NULL;
```

### 2. Update Product Interfaces
- **`src/hooks/useProductsData.ts`**: Add `short_description: string | null` to the `Product` interface
- **`src/components/products/ProductCard.tsx`**: Add `short_description?: string` to the UI `Product` interface
- **`src/pages/Products.tsx`**: Add `short_description` to the `ProductCardData` adapter type and mapping functions (`toUIProduct`, `handleSaveProduct`, `handleImport`)

### 3. Install Rich Text Editor
Add `react-quill` (or `@tiptap/react` + extensions) as a dependency for WYSIWYG editing of both description and short description fields.

### 4. Create RichTextEditor Component
- New file: `src/components/ui/rich-text-editor.tsx`
- A reusable wrapper around the editor library with toolbar (bold, italic, lists, links, headings)
- Accept `value`, `onChange`, `placeholder`, `className` props

### 5. Update ProductModal Form
- **`src/components/products/ProductModal.tsx`**:
  - Add `short_description` to `defaultProduct`
  - Replace the plain `<Textarea>` for Description with the new `RichTextEditor`
  - Add a new Short Description field (also using `RichTextEditor`) between product name and the full description
  - Short description limited to ~300 chars with a character counter

### 6. Update ProductViewModal
- **`src/components/products/ProductViewModal.tsx`**: Display short description (render HTML safely) alongside the existing description

### Technical Details
- The rich text editor will store HTML strings in the database
- `dangerouslySetInnerHTML` with sanitization (via DOMPurify or similar) for rendering stored HTML
- Short description is optional, meant for product cards/listings summary

