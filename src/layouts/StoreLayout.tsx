import { ReactNode, useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { StoreHeader } from "@/components/store/StoreHeader";
import { StoreFooter } from "@/components/store/StoreFooter";
import { LiveChatWidget } from "@/components/store/LiveChatWidget";
import { MaintenancePage } from "@/components/store/MaintenancePage";
import { BackToTop } from "@/components/store/BackToTop";
import { MobileBottomNav } from "@/components/store/MobileBottomNav";
import { StoreBreadcrumb } from "@/components/store/StoreBreadcrumb";
import { supabase } from "@/integrations/supabase/client";
import { usePageViewTracking } from "@/hooks/usePageViewTracking";
import { useMaintenanceCheck } from "@/hooks/useMaintenanceMode";
import { useAuth } from "@/contexts/AuthContext";
import { X } from "lucide-react";
import { Suspense } from "react";
import { useQuery } from "@tanstack/react-query";

const FAVICON_CACHE_KEY = "_favicon_url";

interface StoreLayoutProps {
  children?: ReactNode;
}

const StoreContentLoader = () => <div className="min-h-[200px]" />;

export function StoreLayout({ children }: StoreLayoutProps) {
  usePageViewTracking();
  const { isMaintenanceMode, message, estimatedEnd, loading: maintenanceLoading } = useMaintenanceCheck();
  const { user, isStaff } = useAuth();
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);

  // Fetch only the announcement section (lightweight query instead of full useHomepageSections)
  const { data: announcement } = useQuery({
    queryKey: ["homepage-announcement"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("homepage_sections")
        .select("title, content, is_enabled")
        .eq("section_type", "announcement")
        .eq("is_enabled", true)
        .maybeSingle();
      if (error || !data) return null;
      return data as { title: string | null; content: any; is_enabled: boolean };
    },
    staleTime: 10 * 60 * 1000,
  });

  // Favicon: read from cache instantly, update in background
  useEffect(() => {
    const cachedFavicon = localStorage.getItem(FAVICON_CACHE_KEY);
    if (cachedFavicon) {
      applyFavicon(cachedFavicon);
    }

    const fetchFavicon = async () => {
      try {
        const { data, error } = await supabase
          .from("store_settings" as any)
          .select("setting_value")
          .eq("key", "STORE_FAVICON")
          .single();

        if (!error && data && (data as any).setting_value) {
          const url = (data as any).setting_value;
          localStorage.setItem(FAVICON_CACHE_KEY, url);
          applyFavicon(url);
        }
      } catch {}
    };

    fetchFavicon();
  }, []);

  function applyFavicon(url: string) {
    let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = url;
  }

  // Show maintenance page for non-admin visitors
  if (!maintenanceLoading && isMaintenanceMode && !isStaff) {
    return <MaintenancePage message={message} estimatedEnd={estimatedEnd} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-store-background">
      {/* Announcement Bar */}
      {announcement && !announcementDismissed && (
        <div className="bg-primary text-primary-foreground py-2 px-4 text-center text-sm relative">
          <span>{announcement.title}</span>
          {announcement.content?.link && (
            <Link to={announcement.content.link} className="ml-2 underline font-medium">
              {announcement.content.link_text || "Shop Now"}
            </Link>
          )}
          <button
            onClick={() => setAnnouncementDismissed(true)}
            className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      <StoreHeader />
      <StoreBreadcrumb />
      <main className="flex-1 pb-16 md:pb-0">
        {children || (
          <Suspense fallback={<StoreContentLoader />}>
            <Outlet />
          </Suspense>
        )}
      </main>
      <StoreFooter />
      <LiveChatWidget />
      <BackToTop />
      <MobileBottomNav />
    </div>
  );
}
