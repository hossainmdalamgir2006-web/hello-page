

## Contact Page — 3 Updates

### 1. Remove Duplicate Breadcrumb
Contact page has no `<StoreBreadcrumb />` component but the `StoreLayout` likely renders one. The Contact page's hero banner area doesn't have a manual breadcrumb either (it was already removed). Let me check if `StoreLayout` adds one — if so, no duplicate exists. But given the screenshot shows a duplicate, I'll ensure only `StoreBreadcrumb` from the layout is used and remove any manual breadcrumb nav from Contact.tsx.

### 2. Search Bar with Suggestions
Add a search/filter bar to the Contact page FAQ section (similar to the FAQ page). When the user types, matching FAQ questions will be shown as clickable suggestions below the input. Clicking a suggestion scrolls to / opens that accordion item.

### 3. Update Contact FAQ Design to Match FAQ Page
The Contact page FAQ (lines 327-338) uses a basic `Accordion` without category icons, rounded cards, shadows, or animations. Update it to match the FAQ page style:
- Rounded card-style accordion items with shadows
- Category icons and colored badges
- Framer Motion staggered animations
- "Was this helpful?" feedback buttons
- Same spacing and typography

### Files to Modify
- `src/pages/store/Contact.tsx` — all 3 changes in this single file

### Technical Details
- Import additional icons (Package, Truck, etc.) and Badge component
- Add `category` field to `faqItems` array
- Add `search` state for FAQ filtering with suggestion dropdown
- Restyle accordion items with `border rounded-xl px-5 bg-card shadow-sm` classes
- Add helpful feedback buttons matching FAQ page pattern
- Remove any duplicate breadcrumb markup

