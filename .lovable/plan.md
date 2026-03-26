

# Add Hindi & Italian Languages + How to Add New Languages

## What will be done

### 1. Insert Hindi and Italian into the database
- **Hindi**: code `hi`, flag 🇮🇳, native name हिन्दी
- **Italian**: code `it`, flag 🇮🇹, native name Italiano
- Both will be added as `enabled: true` so they appear in the language toggle immediately

### 2. Important note about translations
These languages will appear in the toggle, but since only English (`en`) and Bengali (`bn`) translations exist in `LanguageContext.tsx`, selecting Hindi or Italian will **fall back to English** for all text. To add actual Hindi/Italian translations, each translation key would need `hi` and `it` values added to the context — that's a separate large task.

## How YOU can add new languages yourself (no code needed!)

1. Go to **Admin Panel → Settings → Languages**
2. Click the **"Add Language"** button (top right)
3. Fill in the form:
   - **Language Code**: e.g. `fr`, `ar`, `es` (2-letter ISO code)
   - **Flag Emoji**: e.g. 🇫🇷, 🇸🇦, 🇪🇸
   - **Language Name**: e.g. French, Arabic, Spanish
   - **Native Name**: e.g. Français, العربية, Español
4. Click **Add Language** — done!

You can also:
- **Toggle** any language on/off with the switch
- **Set Default** language for your store
- **Delete** non-default languages

## Does it work?
The language will appear in the toggle dropdown across all panels. However, **actual translations** for new languages (beyond English and Bengali) need to be added to the codebase separately. Without translations, the site will show English text as fallback.

## Technical details
- 1 data insert operation (2 rows into `language_settings`)
- No schema changes needed
- No code changes needed

