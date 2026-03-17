

# UX-Perfect Loading System — Full Website

## Overview
Replace all jarring full-page `Loader2` spinners with a professional multi-layered loading system: **top progress bar** (global), **skeleton placeholders** (data pages), **delayed loader** (300ms threshold), and **fade-in animations** (all content). Button-level spinners stay as-is.

## Architecture

### Layer 1: Global Top Progress Bar
**New: `src/components/ui/TopProgressBar.tsx`**
- Slim animated bar at top of viewport (YouTube/GitHub style)
- Triggers on every route change via React Router `useNavigation`
- Pure CSS animation, no dependencies

**Update: `src/App.tsx`**
- Add `<TopProgressBar />` inside `<BrowserRouter>`
- Replace the `PageLoader` fallback with a minimal skeleton or nothing (bar handles it)

**Update: `src/index.css`**
- Add progress bar keyframes + fade-in utility class

### Layer 2: Delayed Loader Wrapper
**New: `src/components/ui/DelayedLoader.tsx`**
- Shows nothing for 300ms, then renders children
- Fast loads = no visible loader at all
- Wraps all page-level loading states

### Layer 3: Skeleton Components

**New: `src/components/skeletons/StoreFrontSkeletons.tsx`**
- `HeroSkeleton` — banner placeholder
- `ProductGridSkeleton` — card grid (2x4 or 2x2 mobile)
- `ProductDetailSkeleton` — image + info layout
- `CartSkeleton` — cart items list
- `TimelineSkeleton` — order tracking steps

**New: `src/components/skeletons/AccountSkeletons.tsx`**
- `DashboardSkeleton` — stat cards + orders
- `OrdersListSkeleton` — order cards
- `AddressesSkeleton` — address cards grid
- `ChatSkeleton` — conversation list + messages area
- `GenericListSkeleton` — fallback for wishlist, reviews, returns, etc.
- `GenericCardGridSkeleton` — for payment methods, shopping, recently viewed

**New: `src/components/skeletons/AdminSkeletons.tsx`**
- `AdminDashboardSkeleton` — stat cards + chart + widgets
- `TableSkeleton` — table with header + rows (reusable for products, orders, customers, etc.)
- `ChartSkeleton` — chart placeholder for analytics/reports

### Layer 4: Page-by-Page Updates

#### Store Frontend
| Page | Loading Strategy |
|---|---|
| `/` StoreHome | Already has `FeaturedProductsSkeleton` — add hero skeleton, section-by-section progressive load with fade-in |
| `/products` | `ProductGridSkeleton` + filter shimmer, keep bottom scroll spinner |
| `/product/:slug` | `ProductDetailSkeleton` — image + title/price first, lazy load reviews/related |
| `/cart` | `CartSkeleton`, inline button spinners for quantity updates (already done) |
| `/checkout` | Section-based skeletons for address/payment, button spinner for submit |
| `/track-order` | No loader for form, `TimelineSkeleton` after submit |
| `/order-confirmation` | No loader — instant render with success animation |
| `/payment-processing` | Keep full-screen spinner + add progress message text |
| `/payment/callback` | Keep brief spinner + auto redirect |
| `/order-tracking/:id` | `TimelineSkeleton` with step animation |
| `/wishlist` | `ProductGridSkeleton` |
| `/contact` | No loader — button spinner on submit |
| FAQ/Shipping/Returns/SizeGuide/Privacy/Terms | No change — static content |
| `/login` | No loader — button spinner on submit |

#### My Account (16 pages)
| Page | Skeleton |
|---|---|
| Dashboard | `DashboardSkeleton` |
| Orders | `OrdersListSkeleton` |
| Order Detail | `OrdersListSkeleton` + progressive |
| Invoice | Loading overlay |
| Wishlist / Shopping / Recently Viewed | `GenericCardGridSkeleton` |
| Addresses | `AddressesSkeleton` |
| Security | No page loader — button spinners only |
| Support / Chat | `ChatSkeleton` |
| Settings | No page loader — button spinners only |
| Returns / Reviews / Notifications | `GenericListSkeleton` |
| Payment Methods | `GenericCardGridSkeleton` |

#### Admin Panel
| Page | Skeleton |
|---|---|
| Dashboard | `AdminDashboardSkeleton` (already partially uses `Skeleton`) |
| Products / Categories / Brands | `TableSkeleton` |
| Orders | `TableSkeleton` |
| Analytics | `ChartSkeleton` |
| Customers | `TableSkeleton` |
| All Settings pages | No skeleton — button spinner only |
| Shipping / Coupons / Messages | `TableSkeleton` |
| Reports | `ChartSkeleton` |
| Trash | `TableSkeleton` |
| Homepage / Appearance / Content | No skeleton for editor, skeleton for preview |
| Reviews Manager | `GenericListSkeleton` |

#### Manager & Support Panels
- Same skeleton mappings as admin (they share the same page components)

## Files Summary

### New Files (6)
1. `src/components/ui/TopProgressBar.tsx`
2. `src/components/ui/DelayedLoader.tsx`
3. `src/components/skeletons/StoreFrontSkeletons.tsx`
4. `src/components/skeletons/AccountSkeletons.tsx`
5. `src/components/skeletons/AdminSkeletons.tsx`
6. `src/components/skeletons/index.ts` (barrel export)

### Modified Files (~30+)
- `src/App.tsx` — add TopProgressBar, update PageLoader fallback
- `src/index.css` — add progress bar keyframes, fade-in-up animation
- `tailwind.config.ts` — add fade-in animation config
- ~12 account pages — replace `Loader2` spinner with DelayedLoader + skeleton
- ~8 admin pages — replace inline loading states with skeleton
- ~5 store pages — add skeletons for products, product detail, cart, wishlist, checkout
- `src/layouts/StoreLayout.tsx` — update Suspense fallback

### No Changes Needed
- Button-level spinners (save, submit, upload) — keep as-is
- Static pages (FAQ, Terms, etc.) — already instant
- `src/integrations/supabase/*` — never touch

## Global UX Rules Implemented
1. **300ms delay** before any loader appears
2. **Top progress bar** on all route changes
3. **Inline spinners** for actions (never full-screen for button clicks)
4. **Progressive loading**: layout → content → secondary data
5. **Fade-in animation** on all content after load
6. **No new dependencies** — pure CSS + existing Skeleton component

