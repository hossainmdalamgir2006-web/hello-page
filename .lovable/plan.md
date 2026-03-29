

## Plan: Content Area থেকে Spinner সরিয়ে Direct Content দেখানো

### পরিবর্তন

`src/layouts/CustomerAccountLayout.tsx` ফাইলে Suspense fallback এর spinner সরিয়ে `null` দেওয়া হবে — তাহলে পেজ পরিবর্তনে কোনো spinner দেখাবে না, সরাসরি content লোড হবে।

### Technical Detail

- Line 102: `Suspense fallback` কে `{null}` করা হবে — এতে lazy-loaded page লোড হওয়ার সময় blank থাকবে কিন্তু কোনো spinner/flicker হবে না
- `animate-fade-in` class content আসার সাথে সাথে smooth fade-in দেবে

