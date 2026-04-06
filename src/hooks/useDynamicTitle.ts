import { useEffect, useState } from "react";
import { useSiteContent } from "@/hooks/useSiteContent";

export function useDynamicTitle() {
  const [storeName, setStoreName] = useState<string | null>(null);
  const { section } = useSiteContent("header");

  useEffect(() => {
    const headerContent = section("main_content")?.content;
    const name = headerContent?.store_name || null;
    
    if (name) {
      setStoreName(name);
      document.title = name;
      
      // Also update OG title meta tag
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        ogTitle.setAttribute('content', name);
      }
    }
  }, [section]);

  return storeName;
}

// Helper to set page-specific titles
export function setPageTitle(pageTitle?: string, storeName?: string | null) {
  const siteName = storeName || document.title.split(' | ').pop() || 'Store';
  
  if (pageTitle) {
    document.title = `${pageTitle} | ${siteName}`;
  } else {
    document.title = siteName;
  }
}
