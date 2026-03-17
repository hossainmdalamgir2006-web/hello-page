

## Plan: Convert all Bengali text to English in Messages page and related hooks

### Files to update

**1. `src/components/admin/TicketEscalationDialog.tsx`** — All Bengali labels and text:
- "টিকেট এসকেলেট করুন" → "Escalate Ticket"
- Warning text → "Escalating will increase the ticket priority and notify the relevant manager."
- "বর্তমান প্রায়োরিটি" → "Current Priority"
- "নতুন প্রায়োরিটি" → "New Priority"
- "এসকেলেট করুন (ম্যানেজার/এডমিন)" → "Escalate To (Manager/Admin)"
- "সিলেক্ট করুন" → "Select"
- "কাউকে নির্দিষ্ট করবেন না" → "Don't assign to anyone"
- "এসকেলেশনের কারণ *" → "Escalation Reason *"
- Placeholder → "Describe why you are escalating..."
- "বাতিল" → "Cancel"
- "এসকেলেট করুন" (button) → "Escalate"

**2. `src/hooks/useSupportTickets.ts`** — All toast messages:
- "টিকেট স্ট্যাটাস আপডেট হয়েছে" → "Ticket status updated"
- "স্ট্যাটাস আপডেট করতে ব্যর্থ হয়েছে" → "Failed to update status"
- "প্রায়োরিটি আপডেট হয়েছে" → "Priority updated"
- "প্রায়োরিটি আপডেট করতে ব্যর্থ হয়েছে" → "Failed to update priority"
- "টিকেট অ্যাসাইন হয়েছে" → "Ticket assigned"
- "অ্যাসাইন করতে ব্যর্থ হয়েছে" → "Failed to assign ticket"
- "টিকেট ডিলিট হয়েছে" → "Ticket deleted"
- "ডিলিট করতে ব্যর্থ হয়েছে" → "Failed to delete"
- "টিকেটগুলো ডিলিট হয়েছে" → "Tickets deleted"
- "স্ট্যাটাস আপডেট হয়েছে" → "Status updated"
- "আপডেট করতে ব্যর্থ হয়েছে" → "Failed to update"
- "টিকেটগুলো অ্যাসাইন হয়েছে" → "Tickets assigned"

**3. `src/hooks/useChatNotifications.ts`** — Notification titles:
- "নতুন চ্যাট মেসেজ" → "New Chat Message"
- "নতুন সাপোর্ট টিকেট" → "New Support Ticket"
- "নতুন কন্টাক্ট মেসেজ" → "New Contact Message"

**4. `src/hooks/useTabNotifications.ts`** — Tab title defaults:
- "মেসেজ ও সাপোর্ট" → "Messages & Support"
- "নতুন মেসেজ!" → "New Message!"

**5. `src/components/admin/SupportTicketsTab.tsx`** — Menu items and labels:
- "এসকেলেট করুন" → "Escalate"
- "CSAT রেটিং" → "CSAT Rating"
- "ইন্টারনাল নোট" → "Internal Note"
- "টিমের জন্য ইন্টারনাল নোট..." → "Internal note for team..."

**6. `src/components/admin/LiveChatTab.tsx`** — Menu items and labels:
- "ট্রান্সফার" → "Transfer"
- "CSAT রেটিং" → "CSAT Rating"
- "ইন্টারনাল নোট" → "Internal Note"
- "📝 [ইন্টারনাল নোট]" → "📝 [Internal Note]"

All changes are straightforward string replacements — no logic changes needed.

