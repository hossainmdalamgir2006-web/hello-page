

# Google Translate Widget — সব Panel-এ যোগ করা

## বর্তমান অবস্থা
- ✅ **StoreHeader** — Google Translate আছে
- ✅ **AdminHeader** — Google Translate আছে  
- ❌ **AccountHeader** — Google Translate **নেই**

## কিভাবে কাজ করে
Google Translate widget একটি dropdown দেখায় header-এ। User সেখান থেকে যেকোনো enabled ভাষা সিলেক্ট করলে **পুরো পেজ** সেই ভাষায় auto-translate হয়ে যায়। Admin যে ভাষাগুলো enable করেছে (Settings → Languages) শুধু সেগুলোই dropdown-এ দেখায়।

## Plan

### 1. AccountHeader-এ GoogleTranslateWidget যোগ করা
- `src/components/account/AccountHeader.tsx` ফাইলে `GoogleTranslateWidget` import করে ThemeToggle-এর পাশে বসাবো
- এতে Customer Account panel থেকেও ভাষা পরিবর্তন করা যাবে

**শুধু এই একটি ফাইল পরিবর্তন করতে হবে।**

## Technical detail
- `AccountHeader.tsx` — import `GoogleTranslateWidget` and render it next to `ThemeToggle` in the right-side actions area (line ~128 area)

