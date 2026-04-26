## সমস্যা

আপনি যখন কোনো পেজে যান (যেমন Product Detail) তখন এই error দেখাচ্ছে:

> TypeError: Failed to fetch dynamically imported module: .../assets/ProductDetail-DOWO1Fv3.js

### কেন হয়

প্রতিবার নতুন build/deploy হলে Vite প্রতিটি page-এর JS chunk-কে নতুন hash সহ নতুন filename দেয় (যেমন `ProductDetail-DOWO1Fv3.js` → `ProductDetail-AbCd1234.js`)। কিন্তু যেসব ব্যবহারকারীর ব্রাউজারে আগের পুরোনো ট্যাব খোলা ছিল, তারা পুরোনো filename request করে — যেটা server-এ আর নেই → 404 → এই error।

App.tsx-এ ৭৪টা `lazy(() => import(...))` আছে, প্রত্যেকটাই এই সমস্যায় পড়তে পারে।

## সমাধান

একটা `lazyWithRetry` helper তৈরি করব যেটা:
1. Dynamic import fail করলে detect করবে এটা stale-chunk error কিনা।
2. হলে, একবার automatic page reload করবে (নতুন `index.html` + নতুন chunk URLs পেতে)।
3. `sessionStorage` flag দিয়ে infinite reload loop প্রতিরোধ করবে — যদি reload-এর পরেও fail হয়, তাহলে normal error boundary দেখাবে।

## পরিবর্তন

| File | কী হবে |
|------|--------|
| New: `src/lib/lazyWithRetry.ts` | Helper function — `lazy()` wrap করে chunk error catch করে এবং একবার reload করে |
| `src/App.tsx` | `lazy` import বাদ দিয়ে `lazyWithRetry` import করব এবং সব ৭৪টা `lazy(() => import(...))`-কে `lazyWithRetry(() => import(...))`-এ replace করব |

## প্রযুক্তিগত বিবরণ

```ts
// src/lib/lazyWithRetry.ts
export function lazyWithRetry(factory) {
  return lazy(async () => {
    try {
      return await factory();
    } catch (err) {
      if (isChunkLoadError(err) && !sessionStorage.getItem("__lovable_chunk_reload__")) {
        sessionStorage.setItem("__lovable_chunk_reload__", "1");
        window.location.reload();
        return new Promise(() => {}); // never resolves — wait for reload
      }
      throw err;
    }
  });
}
```

Detection covers: "Failed to fetch dynamically imported module", "Importing a module script failed", "ChunkLoadError" — Chrome / Firefox / Safari সব error message variant।

## ফলাফল

- নতুন deploy হলে পুরোনো ট্যাব নিজে নিজেই একবার reload হয়ে fresh version load করবে।
- User কোনো error screen দেখবে না — শুধু একটা smooth refresh।
- যদি genuine error হয় (যেমন network down), reload loop হবে না — second attempt-এ normal error boundary trigger হবে।
