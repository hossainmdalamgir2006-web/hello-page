import { ReactNode, useEffect } from "react";
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
import { useHomepageSections } from "@/hooks/useHomepageSections";
import { useMaintenanceCheck } from "@/hooks/useMaintenanceMode";
import { useAuth } from "@/contexts/AuthContext";
import { X } from "lucide-react";
import { useState, Suspense } from "react";
import { Loader2 } from "lucide-react";

interface StoreLayoutProps {
  children?: ReactNode;
}

const StoreContentLoader = () => <div className="min-h-[200px]" />;

export function StoreLayout({ children }: StoreLayoutProps) {
  usePageViewTracking();
  const { getSection } = useHomepageSections();
  const { isMaintenanceMode, message, estimatedEnd, loading: maintenanceLoading } = useMaintenanceCheck();
  const { user, isStaff } = useAuth();
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);
  const announcement = getSection("announcement");

  useEffect(() => {
    const fetchAndApplyFavicon = async () => {
      try {
        const { data, error } = await supabase
          .from("store_settings" as any)
          .select("key, setting_value")
          .eq("key", "STORE_FAVICON")
          .single();

        if (error) throw error;

        if (data && (data as any).setting_value) {
          let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
          if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
          }
          link.href = (data as any).setting_value;
        }
      } catch (error) {
        console.error("Error fetching favicon:", error);
      }
    };

    fetchAndApplyFavicon();
  }, []);

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
