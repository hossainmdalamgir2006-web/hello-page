import { RecentlyViewedTab } from "@/components/account/RecentlyViewedTab";
import { SEOHead } from "@/components/SEOHead";

export default function AccountRecentlyViewed() {
  return (
    <>
      <SEOHead title="Recently Viewed" noIndex />
      <RecentlyViewedTab />
    </>
  );
}