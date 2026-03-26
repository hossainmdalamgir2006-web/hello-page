

# Admin Language Control — ভাষা ম্যানেজমেন্ট সিস্টেম

## Overview
Admin panel থেকে ভাষা enable/disable করা যাবে এবং নতুন ভাষা যোগ করা যাবে। Frontend-এ শুধু admin-enabled ভাষাগুলোই Language Toggle-এ দেখাবে।

## Architecture

```text
┌─────────────────────────┐
│  DB: language_settings  │  (code, name, flag, enabled, is_default)
└──────────┬──────────────┘
           │
    ┌──────▼──────┐
    │ Admin Panel  │  Enable/disable languages, set default
    │ Settings Tab │  Add new language (code + name + flag)
    └──────┬──────┘
           │
    ┌──────▼──────┐
    │LanguageToggle│  Only shows enabled languages from DB
    │LanguageCtx   │  Falls back to hardcoded en/bn if DB empty
    └──────────────┘
```

## Steps

### 1. Database — `language_settings` table
- Columns: `id`, `language_code` (unique), `language_name`, `native_name`, `flag_emoji`, `enabled` (boolean), `is_default` (boolean), `sort_order`, `created_at`
- Seed with `en` (English, default) and `bn` (বাংলা, enabled)
- RLS: public read, admin-only write

### 2. Admin Settings — New "Languages" tab
- Add a "Languages" tab in `/admin/settings` (Globe icon)
- Table showing all languages with toggle switches for enable/disable
- "Set as Default" button per language
- "Add Language" dialog: code, name, native name, flag emoji
- Delete option for non-default languages

### 3. Hook — `useLanguageSettings`
- Fetch enabled languages from `language_settings`
- Cache in React Query
- Provide `enabledLanguages` and `defaultLanguage` to components

### 4. Update `LanguageToggle`
- Use `useLanguageSettings` to dynamically render only enabled languages
- If only 1 language enabled, hide the toggle entirely
- Show flag + native name for each option

### 5. Update `LanguageContext`
- Accept dynamic language codes (not just `'en' | 'bn'`)
- Default language from DB setting
- `t()` function falls back to English if translation missing for a language

## What Admin Can Do
- Enable/disable Bengali or English
- Add new languages (e.g., Hindi, Arabic) — note: translations for new languages would need to be added to the translation keys separately
- Set which language is default
- Reorder languages in the dropdown

## Files to Create/Modify
- **New migration**: `language_settings` table + seed data
- **New**: `src/hooks/useLanguageSettings.ts`
- **New**: `src/components/settings/LanguageSettings.tsx`
- **Modify**: `src/pages/Settings.tsx` — add Languages tab
- **Modify**: `src/components/LanguageToggle.tsx` — dynamic from DB
- **Modify**: `src/contexts/LanguageContext.tsx` — dynamic type, default from DB

