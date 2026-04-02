

## Plan: Replace Raw JSON Editors with Structured Form Editors

### Problem
Currently, all complex content fields (FAQs, contact cards, size charts, policy sections, etc.) are rendered as raw JSON textareas in the Content Manager. This is not user-friendly — admins have to manually edit JSON, which is error-prone and confusing.

### Solution
Replace the `"json"` schema type rendering in `ContentManager.tsx` with **structured form editors** that detect the data shape and render appropriate UI controls. No raw JSON editing anywhere.

### What Changes

#### 1. Update `src/config/siteContentRegistry.ts` — New Schema Types
Replace generic `"json"` with specific typed schemas so the editor knows what UI to render:

- `"faq_list"` — FAQ items (question + answer + category) with add/remove
- `"card_list"` — Cards (icon + title + text) with add/remove  
- `"section_list"` — Policy sections (heading + body + list + icon + extra) with add/remove
- `"step_list"` — Numbered steps (title + text) with add/remove
- `"string_list"` — Simple text list with add/remove
- `"size_table"` — Size chart rows with fixed columns
- `"shipping_rate_list"` — Shipping cost rows (area + label + cost + days)
- `"courier_list"` — Courier partners (name + logo)
- `"link_list"` — Links (label + href) for footer

Each page's `contentSchema` entries change from `"json"` to the appropriate type.

#### 2. Update `src/pages/admin/ContentManager.tsx` — Structured Renderers
Replace the single `renderFieldEditor` function's JSON branch with type-specific renderers:

- **`string_list`**: Each item as an Input with delete button + "Add Item" button
- **`faq_list`**: Accordion/collapsible cards, each with Question (Input), Answer (Textarea), Category (Input), delete button + "Add FAQ"
- **`card_list`**: Each card with Icon (select/input), Title (Input), Text (Textarea), delete + "Add Card"
- **`section_list`**: Each section with Heading, Body (Textarea), List items (nested string_list), Icon, Extra text, delete + "Add Section"
- **`step_list`**: Each step with Title + Text + delete + "Add Step"
- **`size_table`**: Table with editable cells, "Add Row" button
- **`shipping_rate_list`**: Each row with Area, Label, Cost, Days fields + delete + "Add Rate"
- **`courier_list`**: Each with Name + Logo URL + delete + "Add Courier"
- **`link_list`**: Each with Label + URL + delete + "Add Link"

All structured editors will have drag-to-reorder (optional, can use move up/down buttons) and inline add/remove.

#### 3. No DB Changes
The data shape in the JSONB column stays identical — only the admin UI rendering changes.

### Mapping Summary

| Old Schema | New Schema | Fields per Item |
|---|---|---|
| `faqs: "json"` | `faqs: "faq_list"` | question, answer, category |
| `cards: "json"` | `cards: "card_list"` | icon, title, text |
| `sections: "json"` | `sections: "section_list"` | heading, body, list[], icon, extra |
| `steps: "json"` | `steps: "step_list"` | title, text |
| `eligible: "json"` | `eligible: "string_list"` | (plain string) |
| `not_eligible: "json"` | `not_eligible: "string_list"` | (plain string) |
| `refund_info: "json"` | `refund_info: "string_list"` | (plain string) |
| `notes: "json"` | `notes: "string_list"` | (plain string) |
| `tips: "json"` | `tips: "string_list"` | (plain string) |
| `mens_sizes: "json"` | `mens_sizes: "size_table"` | size, chest, waist, hip, *_cm |
| `womens_sizes: "json"` | `womens_sizes: "size_table"` | size, bust, waist, hip, *_cm |
| `how_to_measure: "json"` | `how_to_measure: "step_list"` | title, text |
| `delivery_options: "json"` | `delivery_options: "step_list"` | title, text |
| `delivery_areas: "json"` | `delivery_areas: "step_list"` | title, text |
| `shipping_costs: "json"` | `shipping_costs: "shipping_rate_list"` | area, label, cost, days |
| `courier_partners: "json"` | `courier_partners: "courier_list"` | name, logo |
| `features: "json"` | `features: "card_list"` | icon, title, text |
| `shop_links: "json"` | `shop_links: "link_list"` | label, href |
| `help_links: "json"` | `help_links: "link_list"` | label, href |
| `social_links: "json"` | `social_links: "link_list"` | label, href |

### Files to Modify: 2
- `src/config/siteContentRegistry.ts` — update `contentSchema` types
- `src/pages/admin/ContentManager.tsx` — add structured form renderers for each new type

### Files to Create: 0

