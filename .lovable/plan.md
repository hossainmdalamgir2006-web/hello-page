

# MyAccount Payment Methods — Use Admin-Configured Methods

## What's Changing
Replace the hardcoded `METHOD_TYPES` array in `AccountPaymentMethods.tsx` with dynamically fetched payment methods from the database (the same ones configured in admin panel). Customers will only see payment methods that admin has enabled.

## Changes

### AccountPaymentMethods.tsx
- Remove hardcoded `METHOD_TYPES` array
- Import and use `useEnabledPaymentMethods` hook to fetch active payment methods from DB
- Populate the "Type" dropdown with admin-configured methods (showing name + icon, and logo_url if available)
- Use the fetched method's `icon` and `name` for display in the saved methods list
- Show a loading state while payment methods are being fetched

## Files to Modify
- `src/pages/store/account/AccountPaymentMethods.tsx` — replace hardcoded types with dynamic admin-configured methods

