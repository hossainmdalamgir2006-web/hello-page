

## Plan: Live Chat Data Auto-Delete After 6 Hours

### What will change

Create a new Edge Function `auto-clean-chat` that deletes live chat conversations and their messages when the conversation's `updated_at` is older than 6 hours. Set up a cron job to run it periodically (every 30 minutes).

### Steps

**1. Create Edge Function `supabase/functions/auto-clean-chat/index.ts`**
- Use service role key to bypass RLS
- Calculate 6-hour cutoff: `Date.now() - 6 * 60 * 60 * 1000`
- Delete `live_chat_messages` where `conversation_id` matches old conversations
- Delete `csat_ratings` where `conversation_id` matches old conversations
- Delete `customer_notes` where `conversation_id` matches old conversations (if FK exists)
- Delete `live_chat_conversations` where `updated_at < 6h ago`
- Return count of cleaned conversations

**2. Schedule cron job (every 30 minutes)**
- Enable `pg_cron` and `pg_net` extensions via migration
- Use insert tool to create `cron.schedule` calling the edge function every 30 minutes

### Technical Details

- Edge function uses `SUPABASE_SERVICE_ROLE_KEY` for full access
- Deletes related records first (messages, CSAT ratings) to avoid FK constraint issues
- Conversations with recent activity (within 6 hours based on `updated_at`) are preserved
- No UI changes needed — this is fully automatic background cleanup

