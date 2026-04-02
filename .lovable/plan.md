

## Plan: Make All Page Content Editable from Content Manager

### Problem
Currently, each store page (FAQ, Contact, Privacy, Terms, Returns, Shipping Info, Size Guide) has rich hardcoded default content (FAQ items, contact cards, privacy sections, size charts, return policies, etc.) but the registry only exposes basic `title`/`subtitle` fields. The actual page data isn't available for editing in the Content Manager.

### What Changes

#### 1. Update `src/config/siteContentRegistry.ts`
Add `defaultContent` and expanded `contentSchema` for every page so all the hardcoded data becomes editable:

- **FAQ**: `defaultContent.faqs` (the 12 FAQ items with question/answer/category), `contentSchema: { faqs: "json" }`
- **Contact**: `defaultContent.cards` (4 info cards), `defaultContent.form_title`, social links, FAQ items. `contentSchema: { cards: "json", form_title: "text", social_links: "json", faqs: "json" }`
- **Privacy**: `defaultContent.sections` (6 policy sections with heading/body/list/icon). `contentSchema: { sections: "json", last_updated: "text" }`
- **Terms**: `defaultContent.sections` (6 terms sections). `contentSchema: { sections: "json", last_updated: "text" }`
- **Returns**: `defaultContent.eligible`, `defaultContent.not_eligible`, `defaultContent.steps`, `defaultContent.refund_info`, `defaultContent.exchange_text`, `defaultContent.faqs`. `contentSchema: { eligible: "json", not_eligible: "json", steps: "json", refund_info: "json", exchange_text: "textarea", faqs: "json" }`
- **Shipping Info**: `defaultContent.delivery_options`, `defaultContent.delivery_areas`, `defaultContent.processing_text`, `defaultContent.tracking_text`, `defaultContent.notes`, `defaultContent.faqs`. `contentSchema: { delivery_options: "json", delivery_areas: "json", processing_text: "textarea", tracking_text: "textarea", notes: "json", faqs: "json" }`
- **Size Guide**: `defaultContent.mens_sizes`, `defaultContent.womens_sizes`, `defaultContent.how_to_measure`, `defaultContent.tips`, `defaultContent.faqs`. `contentSchema: { mens_sizes: "json", womens_sizes: "json", how_to_measure: "json", tips: "json", faqs: "json" }`
- **Header**: Add `defaultContent` for announcement text
- **Footer**: Add `defaultContent` for social/shop/help links

Each page's `defaultSubtitle` will also be set to match the current hardcoded subtitle.

#### 2. Update Store Pages to Read from Merged Content
Each store page already uses `usePageContent(slug)` and falls back to defaults. The key change: move the hardcoded defaults OUT of each page file and INTO the registry's `defaultContent`. The pages will then read from `data.content` which auto-merges registry defaults with DB overrides.

Files to update:
- `src/pages/store/FAQ.tsx` — remove `defaultFaqs` array, read from content
- `src/pages/store/Contact.tsx` — remove hardcoded cards/FAQ, read from content
- `src/pages/store/Privacy.tsx` — remove `defaultSections`, read from content
- `src/pages/store/Terms.tsx` — remove `defaultSections`, read from content
- `src/pages/store/Returns.tsx` — remove all default arrays, read from content
- `src/pages/store/ShippingInfo.tsx` — remove default arrays, read from content
- `src/pages/store/SizeGuide.tsx` — remove default arrays, read from content

#### 3. No DB or Migration Changes Needed
The existing `site_content_overrides` table already supports JSONB `content` column. The registry defaults serve as fallbacks — admin edits are saved as overrides.

### How It Works
1. Registry defines ALL default data per page (FAQs, cards, sections, size charts, etc.)
2. `useSiteContent` hook merges: `{ ...registryDefaults, ...dbOverrides }`
3. Store pages read merged content — works out of the box without DB data
4. Admin edits via Content Manager save only the changed fields to DB
5. Content Manager shows JSON editors for complex fields (FAQ lists, size tables, etc.)

### Files to Create: 0
### Files to Modify: 8
- `src/config/siteContentRegistry.ts` (add all defaultContent + contentSchema)
- `src/pages/store/FAQ.tsx`
- `src/pages/store/Contact.tsx`
- `src/pages/store/Privacy.tsx`
- `src/pages/store/Terms.tsx`
- `src/pages/store/Returns.tsx`
- `src/pages/store/ShippingInfo.tsx`
- `src/pages/store/SizeGuide.tsx`

