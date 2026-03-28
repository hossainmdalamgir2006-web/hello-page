

## Plan: Chat Page — File Attachments + Status Badge + Close Conversation

### What will change

**1. File/Image Attachment Support**
- Add a file input button (paperclip icon) next to the message input
- Upload files to the existing `chat-attachments` storage bucket
- Save attachment metadata in the `attachments` JSON column of `live_chat_messages`
- Render image attachments inline in chat bubbles; other files as downloadable links

**2. Conversation Status Badge**
- Show a colored badge (open/closed/resolved) next to each conversation in the sidebar list
- Show status badge in the chat header area

**3. Close Conversation Option**
- Add a chat header bar with conversation subject + status badge + "Close Chat" button
- Clicking "Close Chat" updates `status` to `closed` in `live_chat_conversations`
- Disable message input when conversation is closed, show informational text instead

### Technical Details

**File: `src/pages/store/account/AccountChat.tsx`**

- Import `Paperclip`, `Image`, `FileText`, `XCircle` from lucide-react and `Badge` component
- Add `fileInputRef` and `uploading` state
- Add `handleFileUpload` function:
  - Upload to `chat-attachments` bucket under `{conversationId}/{timestamp}-{random}.ext`
  - Get public URL, insert message with `attachments` JSON array and content like "📎 filename"
- Add `closeConversation` function:
  - Update conversation status to `closed`, refresh conversations list
- Chat header section (new): show subject, status badge, close button
- Message rendering: check `m.attachments` array, render images with `<img>` tags, other files as links
- Input area: add hidden file input + paperclip button; disable input when conversation status is `closed`
- Sidebar: add small status badge dot/text next to each conversation's timestamp

No database changes needed — `attachments` column and `status` column already exist on the tables.

