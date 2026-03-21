

# Fixed Filter Sidebar — Store Products Page

## What Changes
Replace the current **Sheet (slide-out drawer)** filter on `/products` with a **fixed left sidebar** that stays visible on desktop. On mobile, keep the Sheet drawer behavior.

## Layout

```text
Desktop (≥1024px):
┌──────────────────────────────────────────────┐
│              Page Header                     │
├──────────┬───────────────────────────────────┤
│ FILTERS  │  Search + Sort + View Toggle      │
│ (fixed)  │───────────────────────────────────│
│ 260px    │  Product Grid (3 cols)            │
│          │                                   │
│ Category │                                   │
│ Price    │                                   │
│ Sale/New │                                   │
│          │                                   │
│ [Clear]  │                                   │
└──────────┴───────────────────────────────────┘

Mobile (<1024px):
Same as now — Sheet drawer via "Filters" button
```

## File Changes

### `src/pages/store/StoreProducts.tsx`
1. Extract filter content into a reusable `FilterPanel` component (inline or separate)
2. Desktop layout: `flex` container with:
   - Left: `w-[260px] shrink-0 sticky top-20` filter sidebar (always visible, scrolls independently with `overflow-y-auto max-h-[calc(100vh-5rem)]`)
   - Right: `flex-1` product grid area (search bar + sort + grid)
3. Mobile: Keep existing Sheet trigger + Sheet content with same filter controls
4. Product grid changes from `lg:grid-cols-4` to `lg:grid-cols-3` to accommodate sidebar width
5. Hide the "Filters" button on desktop (`lg:hidden`), show sidebar `hidden lg:block`

### `src/components/skeletons/StoreFrontSkeletons.tsx`
- Add `FilterSkeleton` variant for the sidebar (already exists, just needs integration)

## Key Details
- Sidebar uses `sticky top-20` so it stays in view while scrolling products
- `ScrollArea` wrapping for long category lists
- No new dependencies
- Mobile UX unchanged — Sheet drawer stays

