import { useEffect } from "react";
import { useSiteTitle } from "@/components/DynamicTitleProvider";

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonicalPath?: string;
  ogImage?: string;
  ogType?: string;
  jsonLd?: Record<string, any> | Record<string, any>[];
  noIndex?: boolean;
}

/**
 * Manages document <head> tags via direct DOM (no react-helmet-async).
 * Avoids React 18 reconciliation crashes (removeChild NotFoundError) caused
 * by Helmet portals when navigating between routes.
 */
function upsertMeta(attr: "name" | "property", key: string, content: string | undefined, marker: string) {
  if (!content) return;
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"][data-seo="${marker}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    el.setAttribute("data-seo", marker);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel: string, href: string | undefined, marker: string) {
  if (!href) return;
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"][data-seo="${marker}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    el.setAttribute("data-seo", marker);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function upsertJsonLd(data: any, marker: string) {
  let el = document.head.querySelector<HTMLScriptElement>(`script[type="application/ld+json"][data-seo="${marker}"]`);
  if (!el) {
    el = document.createElement("script");
    el.setAttribute("type", "application/ld+json");
    el.setAttribute("data-seo", marker);
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

export function SEOHead({
  title,
  description,
  canonicalPath,
  ogImage,
  ogType = "website",
  jsonLd,
  noIndex = false,
}: SEOHeadProps) {
  const { storeName } = useSiteTitle();
  const fullTitle = title ? `${title} | ${storeName}` : storeName;

  useEffect(() => {
    const marker = "seohead";
    const baseUrl = window.location.origin;
    const canonical = canonicalPath ? `${baseUrl}${canonicalPath}` : undefined;

    document.title = fullTitle;

    upsertMeta("name", "description", description, marker);
    upsertMeta("name", "robots", noIndex ? "noindex,nofollow" : undefined, marker);
    upsertLink("canonical", canonical, marker);

    upsertMeta("property", "og:title", fullTitle, marker);
    upsertMeta("property", "og:description", description, marker);
    upsertMeta("property", "og:type", ogType, marker);
    upsertMeta("property", "og:url", canonical, marker);
    upsertMeta("property", "og:image", ogImage, marker);

    upsertMeta("name", "twitter:card", "summary_large_image", marker);
    upsertMeta("name", "twitter:title", fullTitle, marker);
    upsertMeta("name", "twitter:description", description, marker);
    upsertMeta("name", "twitter:image", ogImage, marker);

    if (jsonLd) {
      upsertJsonLd(jsonLd, marker);
    } else {
      const existing = document.head.querySelector(`script[type="application/ld+json"][data-seo="${marker}"]`);
      if (existing) existing.remove();
    }

    // Clear noindex if turned off (only when noIndex is false on this page)
    if (!noIndex) {
      const robotsEl = document.head.querySelector(`meta[name="robots"][data-seo="${marker}"]`);
      if (robotsEl) robotsEl.remove();
    }
  }, [fullTitle, description, canonicalPath, ogImage, ogType, jsonLd, noIndex]);

  return null;
}
