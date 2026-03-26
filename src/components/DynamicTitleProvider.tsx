import { useEffect, useState, createContext, useContext, ReactNode } from "react";
import { useStoreSettingsCache } from "@/hooks/useStoreSettingsCache";

const STORE_NAME_CACHE_KEY = "_store_name";

interface TitleContextType {
  storeName: string;
  setPageTitle: (title?: string) => void;
}

const TitleContext = createContext<TitleContextType>({
  storeName: "Store",
  setPageTitle: () => {},
});

export function useSiteTitle() {
  return useContext(TitleContext);
}

export function DynamicTitleProvider({ children }: { children: ReactNode }) {
  const cachedName = localStorage.getItem(STORE_NAME_CACHE_KEY) || "Store";
  const [storeName, setStoreName] = useState(cachedName);
  const { data: settings } = useStoreSettingsCache();

  useEffect(() => {
    if (cachedName !== "Store") {
      document.title = cachedName;
    }
  }, []);

  // Update from shared cache when available
  useEffect(() => {
    const name = settings?.STORE_NAME;
    if (name && name !== storeName) {
      setStoreName(name);
      document.title = name;
      localStorage.setItem(STORE_NAME_CACHE_KEY, name);
      updateMetaTags(name);
    }
  }, [settings?.STORE_NAME]);

  const updateMetaTags = (name: string) => {
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', name);
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) twitterTitle.setAttribute('content', name);
  };

  const setPageTitle = (title?: string) => {
    if (title) {
      document.title = `${title} | ${storeName}`;
    } else {
      document.title = storeName;
    }
  };

  return (
    <TitleContext.Provider value={{ storeName, setPageTitle }}>
      {children}
    </TitleContext.Provider>
  );
}
