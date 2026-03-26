

# Currency Switcher — Admin-Controlled Multi-Currency সিস্টেম

## Overview
Admin panel থেকে currency যোগ/সরানো যাবে এবং manual exchange rate সেট করবে। Default BDT থাকবে। User যেকোনো panel থেকে currency switch করলে সব দাম সেই currency-তে convert হবে।

## Architecture

```text
┌───────────────────────────┐
│  DB: currency_settings    │  (code, symbol, name, rate_to_bdt, enabled)
└──────────┬────────────────┘
           │
    ┌──────▼──────────┐
    │ CurrencyContext  │  Selected currency + formatPrice(amount)
    └──────┬──────────┘
           │
    ┌──────▼──────────────┐
    │ formatPrice(500)    │  ৳500 → $4.17 (rate: 120)
    │ All 77 files use it │
    └─────────────────────┘
```

## Steps

### 1. Database — `currency_settings` table
- Columns: `id`, `code` (BDT/USD/INR), `symbol` (৳/$), `name`, `rate_to_bdt` (1 USD = 120 BDT means rate=120), `is_enabled`, `is_default`, `sort_order`
- Seed: BDT (default, rate=1), USD, INR
- RLS: public read, admin write

### 2. Admin Currency Management Page
- `/admin/settings/currencies` route
- Table: code, symbol, name, rate, enabled toggle
- Add new currency form
- Edit exchange rate inline
- Set default currency
- Added to Settings sidebar

### 3. CurrencyContext + Hook
- `CurrencyContext` — stores selected currency, provides `formatPrice(amountInBDT)`
- `formatPrice(500)` → converts from BDT using rate, adds symbol
- Selected currency saved in `localStorage`
- Default: BDT (or admin-set default)

### 4. Currency Switcher Widget
- Small dropdown showing current currency symbol
- Shows only enabled currencies
- Placed in StoreHeader, AdminHeader, AccountHeader
- Similar placement to GoogleTranslateWidget

### 5. Refactor all 77 files — Replace hardcoded ৳
- Replace all `৳${amount}` patterns with `formatPrice(amount)`
- This is the biggest step — systematic find-and-replace across:
  - Store components (ProductCard, QuickView, CartDrawer, etc.)
  - Admin components (Dashboard, Orders, Customers, Analytics, etc.)
  - Checkout components
  - Account components

## How it works for user
1. Admin → Settings → Currencies → Add USD, set rate 120
2. User sees currency dropdown in header
3. Selects USD → all prices show $4.17 instead of ৳500
4. Prices are stored in BDT in DB, only display converts

## Files
- **New migration**: `currency_settings` table + seed
- **New**: `src/contexts/CurrencyContext.tsx`
- **New**: `src/hooks/useCurrencySettings.ts`
- **New**: `src/components/CurrencySwitcher.tsx`
- **New**: `src/components/settings/CurrencySettings.tsx`
- **New**: `src/pages/settings/CurrenciesPage.tsx`
- **Modify**: `src/layouts/SettingsLayout.tsx` — add Currencies tab
- **Modify**: `src/App.tsx` — add route, wrap with CurrencyContext
- **Modify**: `src/components/Providers.tsx` — add CurrencyProvider
- **Modify**: All 3 headers — add CurrencySwitcher
- **Modify**: ~77 files — replace `৳` with `formatPrice()`

