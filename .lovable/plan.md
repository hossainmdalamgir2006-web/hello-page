

# Speed Optimization & Tab Navigation Fix

## সমস্যা চিহ্নিত

### 1. Duplicate API Calls (প্রতি page load-এ)
`AuthContext.tsx`-এ **দুটো parallel init** চলছে:
- `onAuthStateChange` callback — fires `SIGNED_IN` event
- `getSession()` — also runs same logic

দুটোই `fetchUserRole()`, `ensureProfile()`, এবং `logLoginActivity()` call করে। Network requests-এ দেখা যাচ্ছে প্রতি page load-এ `login_activity` POST, `user_roles` GET, `profiles` GET সব **duplicate** হচ্ছে।

### 2. Login Activity Spam
প্রতিটি page reload/HMR-এ `SIGNED_IN` event fire হয় → নতুন `login_activity` row insert হয়। এটা শুধু **actual login-এ** হওয়া উচিত।

### 3. Tab Switch-এ Page Reload
Browser tab switch করলে Supabase auth `TOKEN_REFRESHED` event fire করতে পারে → AuthContext re-runs all queries → UI re-renders.

## Plan

### Step 1: AuthContext — Duplicate call elimination
- `getSession()` call সরানো — শুধু `onAuthStateChange` দিয়ে handle করা (`INITIAL_SESSION` event দিয়ে)
- `logLoginActivity` শুধু **actual sign-in action** থেকে call করা (signIn function-এর ভিতর), `onAuthStateChange` থেকে না
- Role ও profile data `sessionStorage`-এ cache করা — background-এ re-verify

### Step 2: Auth state change — skip redundant work
- `TOKEN_REFRESHED` event-এ role re-fetch না করা (already cached আছে)
- `SIGNED_IN` event-এ শুধু initial session setup, login log নয়

### Step 3: Tab switch optimization
- `onAuthStateChange`-এ `TOKEN_REFRESHED` event ignore করা যদি role already loaded থাকে
- WishlistContext-এ unnecessary re-fetch prevent করা

## Files to modify
- **`src/contexts/AuthContext.tsx`** — remove getSession duplicate, cache role, fix login logging
- **`src/contexts/WishlistContext.tsx`** — check for duplicate fetching on auth state change

## Expected result
- Page load-এ DB calls: 6+ → 1-2 (cached থাকলে 0)
- Tab switch-এ: কোনো reload/re-fetch নেই
- Login activity: শুধু actual login-এ log হবে

