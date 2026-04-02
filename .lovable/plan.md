

## Unified Frontend Content Manager — Plan

### Problem
Currently content management is split across two separate admin pages (`/admin/homepage` and `/admin/page-content`) that both depend on two DB tables (`homepage_sections` and `page_contents`). The user wants a **single, unified content management page** that controls **all storefront pages and sections** from one place — with section-level enable/disable and editing — **without requiring DB-stored content** (purely frontend-driven defaults).

### Architecture: Config-Driven CMS (No DB Content)

**Core Idea:** Replace DB-dependent `homepage_sections` and `page_contents` tables with a **single TypeScript config registry** that defines every page and every section within each page. Each section has default content hardcoded in the config. The DB only stores **overrides** (title, subtitle, enabled/disabled, custom content JSON) — not the base content itself.

```text
┌──────────────────────────────────────────────────┐
│           src/config/siteContentRegistry.ts       │
│  ┌────────────────────────────────────────────┐   │
│  │  Page: "homepage"                          │   │
│  │  ├─ Section: hero_carousel (enabled, ...)  │   │
│  │  ├─ Section: feature_bar (enabled, ...)    │   │
│  │  ├─ Section: categories_grid               │   │
│  │  └─ Section: newsletter                    │   │
│  ├────────────────────────────────────────────┤   │
│  │  Page: "faq"                               │   │
│  │  ├─ Section: hero_banner                   │   │
│  │  ├─ Section: faq_list (enabled, ...)       │   │
│  │  └─ Section: contact_cta                   │   │
│  ├────────────────────────────────────────────┤   │
│  │  Page: "contact" / "privacy" / "terms"...  │   │
│  │  ├─ Section: hero_banner                   │   │
│  │  ├─ Section: main_content                  │   │
│  │  └─ Section: ...                           │   │
│  ├────────────────────────────────────────────┤   │
│  │  Global: "header" / "footer"               │   │
│  │  ├─ Section: announcement_bar              │   │
│  │  ├─ Section: footer_newsletter             │   │
│  │  └─ Section: social_links                  │   │
│  └────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────┘
         │
         ▼  DB stores only overrides
┌──────────────────────────────┐
│  site_content_overrides      │
│  page_slug | section_key     │
│  is_enabled | title | ...    │
│  content (JSON overrides)    │
└──────────────────────────────┘
```

### What Changes

#### 1. New Config Registry — `src/config/siteContentRegistry.ts`
A single TypeScript file defining every manageable page and its sections:
- Each page: `slug`, `label`, `icon`, `storePath`, `sections[]`
- Each section: `key`, `label`, `icon`, `defaultEnabled`, `defaultTitle`, `defaultSubtitle`, `defaultContent`, `editableFields[]` (defines what the admin UI shows — title, subtitle, badge, image, custom JSON fields)
- Covers: Homepage (12 sections), FAQ, Contact, Privacy, Terms, Returns, Shipping Info, Size Guide, Header, Footer

#### 2. New DB Table — `site_content_overrides`
Replaces both `homepage_sections` and `page_contents`:
- `id`, `page_slug`, `section_key`, `is_enabled` (nullable — null = use default), `title`, `subtitle`, `badge_text`, `image_url`, `content` (JSONB), `sort_order`, `updated_at`
- Unique constraint on `(page_slug, section_key)`
- Migration includes data migration from existing tables

#### 3. New Hook — `src/hooks/useSiteContent.ts`
- Fetches overrides from DB, merges with registry defaults
- `getSectionConfig(pageSlug, sectionKey)` → returns merged config
- `getPageSections(pageSlug)` → returns all sections for a page with merged defaults + overrides
- `updateSection(pageSlug, sectionKey, updates)` → upserts override
- `toggleSection(pageSlug, sectionKey, enabled)` → quick toggle
- Store pages use this hook instead of `useHomepageSections` / `usePageContent`

#### 4. New Admin Page — `src/pages/admin/ContentManager.tsx`
Replaces both `HomepageManager` and `PageContentManager`:
- **Left sidebar**: Page list (Homepage, FAQ, Contact, etc.) with icons
- **Main area**: Selected page's sections as expandable cards
- Each section card shows: icon, label, enable/disable toggle, edit button
- Edit mode: shows only the fields defined in `editableFields` from the registry
- Drag-and-drop reordering for homepage sections (sort_order)
- Live preview link per page

#### 5. Update Store Pages
- `StoreHome.tsx`: Replace `useHomepageSections()` with `useSiteContent("homepage")`
- `FAQ.tsx`, `Contact.tsx`, `Privacy.tsx`, `Terms.tsx`, `Returns.tsx`, `ShippingInfo.tsx`, `SizeGuide.tsx`: Replace `usePageContent(slug)` with `useSiteContent(slug)`
- `StoreHeader.tsx`, `StoreFooter.tsx`: Replace `usePageContent("header"/"footer")` with `useSiteContent("header"/"footer")`
- `StoreLayout.tsx`: Update announcement bar to use new hook

#### 6. Cleanup
- Delete `src/pages/admin/HomepageManager.tsx`
- Delete `src/pages/admin/PageContentManager.tsx`
- Remove routes from `App.tsx`, update sidebar link to single `/admin/content`
- Keep old hooks temporarily for backward compatibility, then remove

### Benefits
- **One page to rule all content** — no more switching between Homepage Manager and Page Content
- **No DB dependency for defaults** — pages work out of the box even with empty DB
- **Type-safe** — registry defines exactly what fields each section supports
- **Extensible** — adding a new page/section = add entry to registry, no migration needed
- **Section-level control** — toggle any section on any page independently

### Technical Details

**Registry type structure:**
```typescript
interface SectionDef {
  key: string;
  label: string;
  icon: LucideIcon;
  defaultEnabled: boolean;
  defaultTitle?: string;
  defaultSubtitle?: string;
  defaultContent?: Record<string, any>;
  editableFields: ('title' | 'subtitle' | 'badge' | 'image' | 'content')[];
  contentSchema?: Record<string, 'text' | 'textarea' | 'number' | 'boolean' | 'json'>;
}

interface PageDef {
  slug: string;
  label: string;
  icon: LucideIcon;
  storePath: string;
  sections: SectionDef[];
}
```

**DB migration:** Single `site_content_overrides` table with data migration from `homepage_sections` and `page_contents`.

**Files to create:** 3 (registry, hook, admin page)
**Files to modify:** ~12 (store pages + App.tsx + sidebar)
**Files to delete:** 2 (HomepageManager, PageContentManager)

