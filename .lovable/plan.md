

## Plan: Convert Hard Deletes to Soft Delete (Move to Trash)

### Current State

**Already using soft delete (move to trash):** Products, Brands, Categories, Coupons, Orders — these all have `deleted_at` columns and use `.update({ deleted_at: ... })`. Good.

**Still doing permanent/hard deletes (need fixing):**

| Area | Hook/File | What's deleted | Table |
|------|-----------|---------------|-------|
| Support Tickets | `useSupportTickets.ts` | Single + bulk delete | `support_tickets` |
| Contact Messages | `useContactMessages.ts` | Single delete (+ replies) | `contact_messages` |
| Reviews | `ReviewsManager.tsx` | Single + bulk delete | `product_reviews` |
| Carousel Slides | `CarouselSlidesManager.tsx` | Single delete | `homepage_carousel_slides` |
| Auto Discount Rules | `Coupons.tsx` | Single delete | `auto_discount_rules` |

### Implementation

#### Step 1: Add `deleted_at` column to 5 tables
SQL migration to add `deleted_at timestamptz` to:
- `support_tickets`
- `contact_messages`
- `product_reviews`
- `homepage_carousel_slides`
- `auto_discount_rules`

#### Step 2: Update hooks/components to use soft delete

**`src/hooks/useSupportTickets.ts`**
- Change `deleteTicket` and `bulkDeleteTickets` from `.delete()` to `.update({ deleted_at: new Date().toISOString() })`
- Add Undo toast
- Filter query to exclude `deleted_at IS NOT NULL`

**`src/hooks/useContactMessages.ts`**
- Change `deleteMessage` from `.delete()` to `.update({ deleted_at: new Date().toISOString() })`
- Add Undo toast
- Filter query to exclude soft-deleted

**`src/pages/admin/ReviewsManager.tsx`**
- Change `deleteMutation` from `.delete()` to `.update({ deleted_at: new Date().toISOString() })`
- Add Undo toast
- Filter query

**`src/components/admin/CarouselSlidesManager.tsx`**
- Change `deleteSlide` from `.delete()` to `.update({ deleted_at: new Date().toISOString() })`
- Add Undo toast
- Filter fetch query

**`src/pages/Coupons.tsx`**
- Change `deleteRuleMutation` from `.delete()` to `.update({ deleted_at: new Date().toISOString() })`
- Add Undo toast
- Filter rules query

#### Step 3: Update Global Trash to include new entity types
- Add `support_ticket`, `contact_message`, `review`, `carousel_slide`, `auto_discount_rule` to `ENTITY_CONFIGS` in `useGlobalTrash.ts`
- Update the `TrashEntityType` type
- Update filter UI in `GlobalTrash.tsx` page

#### Step 4: Update `auto-clean-trash` edge function
- Add the 5 new tables to the auto-cleanup list

#### Step 5: Update UI labels
- Change "Delete" labels to "Move to Trash" in `ContactMessagesTab.tsx`, `SupportTicketsTab.tsx`, `ReviewsManager.tsx`, `CarouselSlidesManager.tsx`

### Files Changed
- **Migration SQL** — add `deleted_at` to 5 tables
- `src/hooks/useSupportTickets.ts`
- `src/hooks/useContactMessages.ts`
- `src/pages/admin/ReviewsManager.tsx`
- `src/components/admin/CarouselSlidesManager.tsx`
- `src/pages/Coupons.tsx`
- `src/hooks/useGlobalTrash.ts`
- `src/pages/GlobalTrash.tsx`
- `supabase/functions/auto-clean-trash/index.ts`
- `src/components/admin/ContactMessagesTab.tsx`
- `src/components/admin/SupportTicketsTab.tsx`

