

## Plan: Login Activity পেজ Two-Column Layout

### বর্তমান অবস্থা
SessionsPage-এ এখন **Active Sessions** এবং **Login Activity** দুটি card একটার নিচে আরেকটা stacked আছে (full-width, vertical)।

### পরিবর্তন
SecurityPage-এর মতো `lg:grid-cols-2` two-column layout করা হবে:

```text
┌─────────────────────┬─────────────────────┐
│  Active Sessions    │   Login Activity    │
│  (left column)      │   (right column)    │
│  - This device      │   - Filter tabs     │
│  - Other sessions   │   - Search          │
│  - Log out all      │   - Activity list   │
└─────────────────────┴─────────────────────┘
```

- Mobile-এ (< lg breakpoint) → automatic single column stack (responsive)
- Desktop (≥ lg, 1024px+) → side-by-side two columns
- উভয় column-এ `space-y-6` থাকবে যাতে future cards add করা যায়

### ফাইল পরিবর্তন

| ফাইল | কাজ |
|------|------|
| `src/pages/profile/SessionsPage.tsx` | Wrap দুটি component-কে `<div className="grid gap-6 lg:grid-cols-2">` দিয়ে; প্রতিটি child `<div className="space-y-6">`-এ |

কোনো নতুন file, database change, বা component refactor লাগবে না। শুধু layout wrapper পরিবর্তন।

