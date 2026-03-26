

# Remove CurrencySwitcher & GoogleTranslateWidget

## Changes

### 1. Remove from 3 Headers
- **StoreHeader.tsx** — remove import + render of both components
- **AdminHeader.tsx** — remove import + render of both components
- **AccountHeader.tsx** — remove import + render of both components

### 2. Remove from Providers
- **Providers.tsx** — remove `CurrencyProvider` wrapper (keep other providers)

### 3. No file deletion needed
The component files (`CurrencySwitcher.tsx`, `GoogleTranslateWidget.tsx`) and context (`CurrencyContext.tsx`) can stay as unused files — they won't affect the build. Or we can delete them for cleanliness.

## Technical detail
- 3 files modified (headers): remove imports and JSX for both widgets
- 1 file modified (Providers.tsx): remove CurrencyProvider wrapper
- Optionally delete: `CurrencySwitcher.tsx`, `GoogleTranslateWidget.tsx`, `CurrencyContext.tsx`, `useCurrencySettings.ts`

