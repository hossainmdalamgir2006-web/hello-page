

# Messages & Support — Bulk Actions, Auto-Assign Rules, Message Analytics

## 1. Bulk Actions (Contact Messages & Support Tickets)

### Contact Messages Tab
- Checkbox column যোগ — প্রতিটি মেসেজের পাশে select checkbox
- "Select All" header checkbox
- Selected count সহ floating action bar: **Mark Read**, **Mark Unread**, **Delete Selected**
- `useContactMessages` hook-এ `bulkMarkAsRead`, `bulkMarkAsUnread`, `bulkDelete` mutation যোগ

### Support Tickets Tab
- একইভাবে checkbox + bulk action bar
- Actions: **Close Selected**, **Assign Selected**, **Delete Selected**
- `useSupportTickets` hook-এ bulk mutations যোগ

### Files
- `src/components/admin/ContactMessagesTab.tsx`
- `src/components/admin/SupportTicketsTab.tsx`
- `src/hooks/useContactMessages.ts`
- `src/hooks/useSupportTickets.ts`

---

## 2. Auto-Assign Rules

### Database
নতুন টেবিল `auto_assign_rules`:
```sql
CREATE TABLE public.auto_assign_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  rule_type text NOT NULL, -- 'keyword', 'category', 'priority'
  conditions jsonb NOT NULL DEFAULT '{}',
  assign_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  assign_to_email text,
  is_active boolean DEFAULT true,
  priority integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```
RLS: Admin only (ALL)

### UI
- Messages page header-এ "Auto-Assign Rules" বাটন → Dialog/Sheet
- Rule তৈরি form: Name, Type (Keyword Match / Category / Priority Level), Conditions, Assign To (agent dropdown)
- Active rules list সহ toggle, edit, delete

### Logic
- `useAutoAssignRules` hook — CRUD + matching function
- নতুন chat/ticket আসলে rules চেক করে auto-assign করা (client-side matching on create)

### Files
- নতুন: `src/hooks/useAutoAssignRules.ts`
- নতুন: `src/components/admin/AutoAssignRulesDialog.tsx`
- এডিট: `src/pages/Messages.tsx` (button যোগ)
- এডিট: `src/hooks/useLiveChat.ts` (auto-assign on new conversation)
- এডিট: `src/hooks/useSupportTickets.ts` (auto-assign on new ticket)

---

## 3. Message Analytics Tab

### UI
Messages page-এর Tabs-এ নতুন "Analytics" ট্যাব যোগ:
- **Response Time Trend** — গত ৩০ দিনের avg response time line chart (recharts)
- **Message Volume** — Daily message/ticket/chat volume bar chart
- **Busiest Hours** — Heatmap বা bar chart (hour of day vs count)
- **Channel Breakdown** — Contact vs Chat vs Ticket pie chart
- **Agent Performance** — Table: agent name, avg response time, total handled, CSAT

### Data Source
Existing টেবিল থেকে aggregate:
- `contact_messages` (created_at, response_time_seconds)
- `live_chat_conversations` (created_at, response_time_seconds, assigned_to)
- `support_tickets` (created_at, first_response_at, assigned_to)

### Files
- নতুন: `src/components/admin/MessageAnalyticsTab.tsx`
- নতুন: `src/hooks/useMessageAnalytics.ts`
- এডিট: `src/pages/Messages.tsx` (tab যোগ)

---

## Summary of Changes
| Area | New Files | Edited Files | DB Migration |
|------|-----------|-------------|-------------|
| Bulk Actions | — | 4 files | — |
| Auto-Assign | 2 files | 3 files | 1 table |
| Analytics | 2 files | 1 file | — |

