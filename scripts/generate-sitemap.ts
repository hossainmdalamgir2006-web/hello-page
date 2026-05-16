// Runs before `vite dev` and `vite build` (predev/prebuild hooks); writes public/sitemap.xml.
import { writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://hello-there-splas.lovable.app";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const entries: SitemapEntry[] = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/products", changefreq: "daily", priority: "0.9" },
  { path: "/contact", changefreq: "monthly", priority: "0.5" },
  { path: "/faq", changefreq: "monthly", priority: "0.4" },
  { path: "/shipping-info", changefreq: "monthly", priority: "0.4" },
  { path: "/returns", changefreq: "monthly", priority: "0.4" },
  { path: "/size-guide", changefreq: "monthly", priority: "0.3" },
  { path: "/privacy", changefreq: "yearly", priority: "0.2" },
  { path: "/terms", changefreq: "yearly", priority: "0.2" },
  { path: "/track-order", changefreq: "monthly", priority: "0.3" },
  { path: "/wishlist", changefreq: "monthly", priority: "0.3" },
];

function generateSitemap(entries: SitemapEntry[]) {
  const urls = entries.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ].filter(Boolean).join("\n"),
  );
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

writeFileSync(resolve("public/sitemap.xml"), generateSitemap(entries));
console.log(`sitemap.xml written (${entries.length} entries)`);
