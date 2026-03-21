# Centered Search Bar with Category Dropdown — Below Header Nav

## What Changes

Add a **search bar row** below the main header navigation, matching the reference screenshot:

- Full-width search input, centered
- Category dropdown (`Select Category`) on the right side of the input
- Search icon button on the far right
- Visible on desktop; on mobile, a simpler compact version

## Layout

```text
┌─────────────────────────────────────────────────┐
│ 🔥 Free Shipping Banner                        │
├─────────────────────────────────────────────────┤
│ Logo    | [ Search for products...  ] [Category ▼] [🔍] |   Icons (cart…)  │
├─────────────────────────────────────────────────┤
│    MegaMenu Nav      │  ← NEW ROW
└─────────────────────────────────────────────────┘
```

## File Changes

### `src/components/store/StoreHeader.tsx`

1. Remove the existing inline search toggle (the