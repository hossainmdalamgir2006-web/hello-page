

## Favicon Dynamic Update Fix ও Badge Hide

### সমস্যা
1. `index.html`-এ কোনো favicon `<link>` tag নেই — তাই Lovable-এর default `favicon.ico` দেখাচ্ছে
2. `DynamicTitleProvider.tsx`-এ favicon dynamically update হচ্ছে কিনা verify করা দরকার

### পরিবর্তন

#### 1. `public/favicon.ico` — Delete
- Lovable-এর default favicon file মুছে দেব

#### 2. `index.html` — Favicon link tag add
- একটা generic transparent/empty favicon link add করব যেন browser default Lovable icon না দেখায়:
  ```html
  <link rel="icon" href="data:," type="image/x-icon">
  ```
- Header Settings-এ favicon upload করলে `DynamicTitleProvider` dynamically এটা replace করবে

#### 3. `src/components/DynamicTitleProvider.tsx` — Favicon update logic verify/fix
- Header content থেকে `store_favicon` পড়ে dynamically `<link rel="icon">` update করা হচ্ছে কিনা check করব
- না থাকলে add করব:
  ```tsx
  const favicon = headerCont.store_favicon;
  if (favicon) {
    let link = document.querySelector('link[rel="icon"]');
    if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link); }
    link.href = favicon;
  }
  ```

#### 4. Badge — Information
- নিজের Vercel/domain-এ নিজে build করে deploy করলে badge থাকবে না
- Lovable-এর published URL-এ badge hide করতে Pro plan প্রয়োজন

### Technical Details
- 3 files: `index.html`, `DynamicTitleProvider.tsx`, delete `public/favicon.ico`
- No DB changes

