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
 * All elements are tagged with data-seo so we can safely query and update
 * without conflicting with React's reconciliation tree (we never touch
 * elements React renders).
 */
function safeRemove(el: Element | null) {
  if (!el) return;
  try {
    if (el.parentNode) el.parentNode.removeChild(el);
  } catch {
    // Element already detached by React or another mutation — ignore
  }
}

function safeAppend(el: Element) {
  try {
    document.head.appendChild(el);
  } catch {
    // Ignore if head mutation conflicts
  }
}

function upsertMeta(attr: "name" | "property", key: string, content: string | undefined) {
  const selector = `meta[${attr}="${key}"][data-seo="1"]`;
  const existing = document.head.querySelector<HTMLMetaElement>(selector);
  if (!content) {
    safeRemove(existing);
    return;
  }
  if (existing) {
    existing.setAttribute("content", content);
    return;
  }
  const el = document.createElement("meta");
  el.setAttribute(attr, key);
  el.setAttribute("data-seo", "1");
  el.setAttribute("content", content);
  safeAppend(el);
}

function upsertCanonical(href: string | undefined) {
  const selector = `link[rel="canonical"][data-seo="1"]`;
  const existing = document.head.querySelector<HTMLLinkElement>(selector);
  if (!href) {
    safeRemove(existing);
    return;
  }
  if (existing) {
    existing.setAttribute("href", href);
    return;
  }
  const el = document.createElement("link");
  el.setAttribute("rel", "canonical");
  el.setAttribute("data-seo", "1");
  el.setAttribute("href", href);
  safeAppend(el);
}

function upsertJsonLd(data: any | null) {
  const selector = `script[type="application/ld+json"][data-seo="1"]`;
  const existing = document.head.querySelector<HTMLScriptElement>(selector);
  if (!data) {
    safeRemove(existing);
    return;
  }
  if (existing) {
    existing.textContent = JSON.stringify(data);
    return;
  }
  const el = document.createElement("script");
  el.setAttribute("type", "application/ld+json");
  el.setAttribute("data-seo", "1");
  el.textContent = JSON.stringify(data);
  safeAppend(el);
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
    const baseUrl = window.location.origin;
    const canonical = canonicalPath ? `${baseUrl}${canonicalPath}` : undefined;

    document.title = fullTitle;

    upsertMeta("name", "description", description);
    upsertMeta("name", "robots", noIndex ? "noindex,nofollow" : undefined);
    upsertCanonical(canonical);

    upsertMeta("property", "og:title", fullTitle);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:type", ogType);
    upsertMeta("property", "og:url", canonical);
    upsertMeta("property", "og:image", ogImage);

    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", fullTitle);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:image", ogImage);

    upsertJsonLd(jsonLd ?? null);
  }, [fullTitle, description, canonicalPath, ogImage, ogType, jsonLd, noIndex]);

  return null;
}
