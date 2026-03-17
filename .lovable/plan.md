

## Plan: Editor Enhancements, Status Cleanup, and Professional Product Details

### 1. Image Upload & Video Upload in Toolbar
The toolbar already has image URL insert and video/YouTube URL insert popvers. I'll enhance both to also support **file upload** (not just URL). Add a file input for image upload that converts to base64 or uses a URL, and keep the existing URL option. Same approach for video — add file upload alongside the YouTube URL option.

**Files changed:** `src/components/ui/rich-text-editor/EditorToolbar.tsx`
- Add file `<input type="file">` alongside the Image URL popover (accept images, convert to base64 data URL via FileReader)
- Add file `<input type="file">` alongside the Video URL popover (accept video files, insert `<video>` tag with data URL or object URL)
- Both poppovers will have tabs: "Upload" and "URL"

### 2. Remove "Archived" from Product Status
Remove all references to `archived` status across product components.

**Files changed:**
- `src/components/products/ProductCard.tsx` — Change type from `"active" | "draft" | "archived"` to `"active" | "draft"`; remove archived case
- `src/components/products/ProductModal.tsx` — Remove `<SelectItem value="archived">`
- `src/components/products/ProductTable.tsx` — Remove archived case
- `src/components/products/ProductViewModal.tsx` — Remove archived case
- `src/components/products/ProductFilters.tsx` — Remove archived filter option
- `src/components/products/ProductImportExport.tsx` — Remove archived from valid statuses
- `src/pages/Products.tsx` — Update type

### 3. Professional Product View Modal
Redesign `ProductViewModal` with a polished, modern layout:
- Two-column layout (image left, info right) on larger screens
- Better typography hierarchy and spacing
- Card-based sections for description, specs, variants
- Proper rendering of rich HTML content (descriptions with tables, images, videos, etc.)
- Better visual treatment for sizes/colors
- Professional badge styling

**Files changed:** `src/components/products/ProductViewModal.tsx`

### 4. Professional Store Product Detail Page
Update `src/pages/store/ProductDetail.tsx`:
- Render description as HTML (currently just plain text via `<p>` tag — needs `dangerouslySetInnerHTML`)
- Better prose styling for rich content (tables, embeds, images in description)
- Ensure YouTube embeds and images from the editor render properly

**Files changed:** `src/pages/store/ProductDetail.tsx` — Fix description tab to render HTML content properly

