import { RecentlyViewedTab } from "@/components/account/RecentlyViewedTab";

export default function AccountRecentlyViewed() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">Recently Viewed</h1>
        <p className="text-sm text-muted-foreground">Products you've browsed recently</p>
      </div>
      <RecentlyViewedTab />
    </div>
  );
}
