

# Remove Redundant Page Titles from MyAccount Sub-Pages

## Problem
Every MyAccount sub-page has a `<h1>` title and `<p>` description using `t()` keys like `account.ordersTitle` → renders as "Orders Title" and `account.ordersDesc` → renders as "Orders Desc". These look ugly because the `t()` function just auto-converts camelCase keys to spaced words.

The layout header (`CustomerAccountLayout`) already shows the correct page title and description via `pageTitleKeys` — so these per-page titles are **redundant**.

## Fix
Remove the title/description `<div>` block from all 7 account sub-pages:

1. `AccountOrders.tsx` — remove h1/p block
2. `AccountSecurity.tsx` — remove h1/p block
3. `AccountWishlist.tsx` — remove h1/p block
4. `AccountShopping.tsx` — remove h1/p block
5. `AccountRecentlyViewed.tsx` — remove h1/p block
6. `AccountSupport.tsx` — remove h1/p block
7. `AccountReturns.tsx` — check and remove if present

Also update `CustomerAccountLayout.tsx` `pageTitleKeys` to use hardcoded English strings instead of `t()` keys, so titles display properly (e.g., "My Orders" instead of "Orders Title").

## Files to Modify
- `src/pages/store/account/AccountOrders.tsx`
- `src/pages/store/account/AccountSecurity.tsx`
- `src/pages/store/account/AccountWishlist.tsx`
- `src/pages/store/account/AccountShopping.tsx`
- `src/pages/store/account/AccountRecentlyViewed.tsx`
- `src/pages/store/account/AccountSupport.tsx`
- `src/pages/store/account/AccountReturns.tsx`
- `src/layouts/CustomerAccountLayout.tsx`

