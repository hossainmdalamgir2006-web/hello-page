

# Settings Sidebar — Expandable Groups

## What's Changing
Convert the flat Settings sidebar into 4 collapsible groups, matching the Profile sidebar pattern (Sessions/Security style).

## Groups
| Group | Items |
|-------|-------|
| **General** | Store, Payments |
| **Communication** | Email Templates, Alerts & Email |
| **Security** | Security, Audit Log |
| **System** | Backup, Integrations |

## Approach
- Use `Collapsible` / `CollapsibleTrigger` / `CollapsibleContent` in `SettingsLayout.tsx`
- Each group has a label header with `ChevronDown` toggle
- Groups auto-expand when current route matches any child item
- Desktop: vertical collapsible groups; Mobile: keep horizontal scroll (flat, no groups — too cramped for collapsible on mobile)

## File to Modify
- `src/layouts/SettingsLayout.tsx` — restructure nav into collapsible groups

