

# Full Website Translation — English ↔ Bengali

## Overview
Expand the existing `LanguageContext` translation system to cover the **entire storefront** and add the `LanguageToggle` to the **store header**. Default language: English.

## Current State
- `LanguageContext` exists with ~230 keys (admin/dashboard only)
- `LanguageToggle` component exists but only placed in `AdminHeader`
- Store frontend has zero translation coverage — all hardcoded English strings

## Plan

### 1. Add LanguageToggle to Store Header
**File: `src/components/store/StoreHeader.tsx`**
- Import `LanguageToggle`
- Place it in the actions row (next to `ThemeToggle`)

### 2. Expand Translations — Store Frontend Keys
**File: `src/contexts/LanguageContext.tsx`**

Add ~150+ new translation keys covering:

| Section | Keys | Examples |
|---|---|---|
| Store Header | ~10 | "Search for products...", "All Categories", "My Account", "My Orders", "Logout" |
| Store Home | ~15 | "Featured Products", "New Arrivals", "Flash Sale", "Shop Now", "View All" |
| Product Listing | ~20 | "Filters", "Clear Filters", "Sort by", "Price: Low to High", "In Stock", "Out of Stock", "Brand", "Color", "Size", "Rating", "No products found" |
| Product Detail | ~15 | "Add to Cart", "Add to Wishlist", "Description", "Reviews", "Related Products", "Size Guide", "Quantity" |
| Cart & Checkout | ~25 | "Shopping Cart", "Your cart is empty", "Continue Shopping", "Subtotal", "Shipping", "Total", "Proceed to Checkout", "Place Order", "Payment Method", "Shipping Address" |
| Account Pages | ~25 | "My Account", "Dashboard", "Orders", "Addresses", "Wishlist", "Security", "Support", "Settings", "Recently Viewed", "Returns", "Reviews", "Notifications" |
| Auth | Already done | — |
| Footer/Nav | ~10 | "Contact Us", "Track Order", "Shipping Info", "FAQ", "Privacy Policy", "Terms", "All Rights Reserved" |
| Common Store | ~10 | "Add to Cart", "Buy Now", "Free Shipping", "Sale", "New", "Sold Out" |

### 3. Apply `t()` to Key Store Components
Update these files to use `t()` instead of hardcoded strings:

**High-priority (visible on every page):**
- `StoreHeader.tsx` — search placeholder, dropdown labels, menu items
- `StoreFooter.tsx` — footer links, copyright text
- `MegaMenuNav.tsx` — static page links (Contact, Track Order, Shipping Info)
- `MobileBottomNav.tsx` — bottom nav labels

**Store pages:**
- `StoreHome.tsx` — section titles
- `StoreProducts.tsx` — filter labels, sort options, empty state
- `ProductDetail.tsx` — action buttons, tabs
- `Cart.tsx` — cart labels, empty state
- `Checkout.tsx` — form labels, step names
- `Wishlist.tsx` — page title, empty state

**Account pages:**
- `CustomerAccountLayout.tsx` / sidebar — menu labels
- `AccountDashboard.tsx` — stat labels
- `AccountOrders.tsx` — table headers
- `AccountAddresses.tsx` — form labels
- Other account sub-pages — titles and descriptions

**Static pages:**
- `Contact.tsx`, `FAQ.tsx`, `ShippingInfo.tsx`, `Returns.tsx`, `Privacy.tsx`, `Terms.tsx` — page titles and headings

### 4. No Changes Needed
- Admin panel — already has translations via `t()`
- `LanguageContext` provider setup — already wraps the app
- Language persistence — already saves to localStorage

## Files Summary

### Modified (~25-30 files)
- `src/contexts/LanguageContext.tsx` — add ~150 store translation keys
- `src/components/store/StoreHeader.tsx` — add LanguageToggle + use t()
- `src/components/store/StoreFooter.tsx` — use t()
- `src/components/store/MegaMenuNav.tsx` — use t()
- `src/components/store/MobileBottomNav.tsx` — use t()
- `src/pages/store/StoreHome.tsx` — use t()
- `src/pages/store/StoreProducts.tsx` — filter/sort labels via t()
- `src/pages/store/ProductDetail.tsx` — use t()
- `src/pages/store/Cart.tsx` — use t()
- `src/pages/store/Checkout.tsx` — use t()
- `src/pages/store/Wishlist.tsx` — use t()
- `src/pages/store/Contact.tsx` — use t()
- `src/pages/store/FAQ.tsx` — use t()
- `src/pages/store/ShippingInfo.tsx` — use t()
- `src/pages/store/Returns.tsx` — use t()
- `src/pages/store/Privacy.tsx` — use t()
- `src/pages/store/Terms.tsx` — use t()
- `src/layouts/CustomerAccountLayout.tsx` — sidebar labels via t()
- `src/pages/store/account/*.tsx` — page titles via t()
- `src/components/product/*.tsx` — action buttons via t()
- `src/components/store/CartDrawer.tsx` — labels via t()

