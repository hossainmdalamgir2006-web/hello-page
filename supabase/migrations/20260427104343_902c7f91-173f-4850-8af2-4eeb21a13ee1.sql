-- Fix: Allow anonymous customers to view their own chat conversations and messages
-- The previous SELECT policy required user_id = auth.uid(), which fails for anonymous chats
-- where user_id is NULL. This caused .select() after .insert() to fail with RLS error.

DROP POLICY IF EXISTS "Customers can view own conversations" ON public.live_chat_conversations;

CREATE POLICY "Customers can view own conversations"
ON public.live_chat_conversations
FOR SELECT
TO anon, authenticated
USING (
  has_admin_role(auth.uid())
  OR (user_id IS NOT NULL AND user_id = auth.uid())
  OR (user_id IS NULL AND auth.uid() IS NULL)
);

DROP POLICY IF EXISTS "Customers can view own conversation messages" ON public.live_chat_messages;

CREATE POLICY "Customers can view own conversation messages"
ON public.live_chat_messages
FOR SELECT
TO anon, authenticated
USING (
  has_admin_role(auth.uid())
  OR EXISTS (
    SELECT 1 FROM live_chat_conversations c
    WHERE c.id = live_chat_messages.conversation_id
      AND (
        (c.user_id IS NOT NULL AND c.user_id = auth.uid())
        OR (c.user_id IS NULL AND auth.uid() IS NULL)
      )
  )
);