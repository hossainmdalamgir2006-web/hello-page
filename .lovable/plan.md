

# Translation কে Database-তে নিয়ে যাওয়া

## সমস্যা
বর্তমানে `LanguageContext.tsx` ফাইলে ~১,১০০ লাইনে ~৫০০+ translation key হার্ডকোড করা আছে। নতুন ভাষা (Hindi, Italian ইত্যাদি) যোগ করলে ফাইল আরও বড় হবে এবং কোড maintain করা কঠিন হবে। Database-তে রাখলে Admin panel থেকেই translation manage করা যাবে — কোড পরিবর্তন লাগবে না।

## Architecture

```text
┌──────────────────────┐
│ DB: translations     │  (key, language_code, value)
│ ~500+ rows per lang  │
└──────────┬───────────┘
           │
    ┌──────▼──────────┐
    │ useTranslations  │  Fetch all translations for current language
    │ hook (cached)    │  React Query with staleTime
    └──────┬──────────┘
           │
    ┌──────▼──────────┐
    │ LanguageContext   │  t() reads from DB cache instead of hardcoded object
    └──────────────────┘
           │
    ┌──────▼──────────┐
    │ Admin Panel      │  Translation Manager page — search, edit, bulk import
    └──────────────────┘
```

## Steps

### 1. Database — `translations` table
- Columns: `id`, `key` (text), `language_code` (text), `value` (text), `created_at`, `updated_at`
- Unique constraint on (`key`, `language_code`)
- RLS: public read, admin-only write
- **Seed**: Migrate all existing ~500 keys × 2 languages (en, bn) from `LanguageContext.tsx` into the table (~1000 rows)
- Also seed `hi` and `it` rows with English fallback values (admin can edit later)

### 2. Hook — `useTranslations`
- Fetch all translations for the current language from DB
- Cache with React Query (`staleTime: 10 minutes`)
- Returns a `Record<string, string>` lookup map
- Prefetch English as fallback

### 3. Update `LanguageContext.tsx`
- Remove the massive hardcoded `translations` object (~1,050 lines gone!)
- `t()` function reads from the cached DB data
- Falls back to English if key missing in current language
- Falls back to key itself if not found at all
- File goes from ~1,127 lines → ~80 lines

### 4. Admin Translation Manager Page
- New page: `/admin/settings/translations`
- Searchable table of all translation keys
- Inline edit values for each language
- Filter by language, search by key or value
- Bulk import/export (optional, can add later)
- Add new key with values for all enabled languages

## Benefits
- কোড ~1,050 লাইন কমবে
- নতুন ভাষার translation Admin panel থেকে যোগ করা যাবে
- কোড deploy ছাড়াই translation update করা যাবে
- Performance: ~500 key × 4 lang = ~2000 rows, একটি query-তেই আসবে, cached থাকবে

## Files
- **New migration**: `translations` table + seed data
- **New**: `src/hooks/useTranslations.ts`
- **New**: `src/components/settings/TranslationManager.tsx`
- **New**: `src/pages/settings/TranslationsPage.tsx`
- **Modify**: `src/contexts/LanguageContext.tsx` — remove hardcoded translations, use DB
- **Modify**: `src/layouts/SettingsLayout.tsx` — add Translations tab
- **Modify**: `src/App.tsx` — add route

