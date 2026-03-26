

# Google Translate Widget দিয়ে সিম্পল Translation সিস্টেম

## কী হবে
- পুরো complex translation সিস্টেম সরিয়ে **Google Translate widget** বসবে
- Admin শুধু language enable/disable করবে — বাকি সব Google করবে
- কোডে `t()` function English text দেবে, Google Translate সেটা auto-translate করবে
- **~3,000 rows** translations table থেকে সরানো যাবে (শুধু English রাখবো)

## Architecture
```text
Admin enables languages → Google Translate shows those languages only
User picks language → Google auto-translates entire page
t() returns English → Google translates the visible text
```

## Steps

### 1. Add Google Translate Widget component
- New `GoogleTranslateWidget.tsx` — loads Google Translate script
- Admin-enabled languages থেকে `includedLanguages` সেট করবে (e.g. `en,bn,hi,it`)
- LanguageToggle এর জায়গায় এটা বসবে (StoreHeader + AdminHeader)

### 2. Simplify `LanguageContext.tsx`
- `useTranslations` hook কে শুধু English fetch করতে বলবো
- `t()` function শুধু English key→value return করবে
- Google Translate বাকিটা handle করবে

### 3. Clean up database
- `translations` table থেকে non-English rows delete করবো (~2,800 rows কম)
- English rows রাখবো যাতে `t()` কাজ করে
- TranslationManager page সরিয়ে দেবো (আর দরকার নেই)

### 4. Remove TranslationManager
- `/admin/settings/translations` page remove
- SettingsLayout থেকে Translations tab remove
- Route remove from App.tsx

## Benefits
- ❌ কোনো manual translation দরকার নেই
- ❌ Database এ হাজার হাজার row রাখতে হবে না
- ✅ Admin panel থেকে language control
- ✅ Auto-translate সব text
- ✅ কোড ছোট থাকবে

## Files
- **New**: `src/components/GoogleTranslateWidget.tsx`
- **Modify**: `src/components/store/StoreHeader.tsx` — LanguageToggle → GoogleTranslateWidget
- **Modify**: `src/components/admin/AdminHeader.tsx` — same
- **Modify**: `src/contexts/LanguageContext.tsx` — simplify to English-only
- **Modify**: `src/hooks/useTranslations.ts` — fetch English only
- **Modify**: `src/layouts/SettingsLayout.tsx` — remove Translations tab
- **Modify**: `src/App.tsx` — remove translations route
- **Delete content**: `src/components/settings/TranslationManager.tsx`, `src/pages/settings/TranslationsPage.tsx`
- **Migration**: Delete non-English rows from translations table

