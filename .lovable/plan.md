

## Products Page Modernization Plan

### Current State
Products page functional কিন্তু plain — basic header, simple badge status bar, no animations, grid view-তে pagination নেই।

### Changes

**1. Modernized Page Header**
- Gradient background card with glassmorphic effect
- Better spacing, animated entrance with framer-motion
- MigrateImagesButton remove (developer utility, not needed in main UI)

**2. ProductStatusBar Upgrade**
- Plain badges replace with animated stat cards (4 cards in a row)
- Each card: icon, count (animated number), label
- Subtle hover effects, framer-motion stagger animation

**3. Grid View Pagination**
- Currently grid mode shows ALL products without pagination
- Add pagination to grid view as well (same as list view)

**4. ProductCard Animation**
- Add framer-motion entrance animations (stagger effect)
- Smooth fade-in when cards appear

**5. Empty State Polish**
- Add illustration icon with gradient background
- Subtle animation on the empty state

**6. Loading Skeleton Improvement**
- Better shimmer skeletons matching actual card layout

### Files to Modify
- `src/pages/Products.tsx` — header, pagination for grid, animations, remove MigrateImagesButton
- `src/components/admin/ProductStatusBar.tsx` — upgrade to animated stat cards

### Technical Details
- Use `framer-motion` for entrance animations (already in project)
- Grid pagination: use existing `usePagination` hook's `paginatedProducts` for grid view too
- StatusBar: 4 cards in a responsive grid with `motion.div` variants

