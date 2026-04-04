import { ReactNode, useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { StoreHeader } from "@/components/store/StoreHeader";
import { StoreFooter } from "@/components/store/StoreFooter";
import { LiveChatWidget } from "@/components/store/LiveChatWidget";
import { MaintenancePage } from "@/components/store/MaintenancePage";
import { BackToTop } from "@/components/store/BackToTop";
import { MobileBottomNav } from "@/components/store/MobileBottomNav";
import { StoreBreadcrumb } from "@/components/store/StoreBreadcrumb";
import { usePageViewTracking } from "@/hooks/usePageViewTracking";
import { useMaintenanceCheck } from "@/hooks/useMaintenanceMode";
import { useAuth } from "@/contexts/AuthContext";
import { useStoreSettingsCache } from "@/hooks/useStoreSettingsCache";
import { useSiteContent } from "@/hooks/useSiteContent";
import { X } from "lucide-react";
import { Suspense } from "react";

interface StoreLayoutProps {
  children?: ReactNode;
}

const StoreContentLoader = () => <div className="min-h-[200px]" />;

export function StoreLayout({ children }: StoreLayoutProps) {
  usePageViewTracking();
  const { isMaintenanceMode, message, estimatedEnd, loading: maintenanceLoading } = useMaintenanceCheck();
  const { user, isStaff } = useAuth();
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);
  const { data: settings } = useStoreSettingsCache();

  // Read announcement from site content overrides
  const { getSectionConfig } = useSiteContent();
  const announcementSection = getSectionConfig("homepage", "announcement");
  const announcement = announcementSection?.isEnabled ? announcementSection : null;

  // Favicon: read from shared store settings cache
  useEffect(() => {
    const faviconUrl = settings?.STORE_FAVICON;
    if (faviconUrl) {
      applyFavicon(faviconUrl);
    }
  }, [settings?.STORE_FAVICON]);

  function applyFavicon(url: string) {
    let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = url;
  }

  // Show maintenance page for non-admin visitors (allow login page access)
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  if (!maintenanceLoading && isMaintenanceMode && !isStaff && !isLoginPage) {
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
