import { RecentlyViewedTab } from "@/components/account/RecentlyViewedTab";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AccountRecentlyViewed() {
  const { t } = useLanguage();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">{t('account.recentlyViewedPageTitle')}</h1>
        <p className="text-sm text-muted-foreground">{t('account.recentlyViewedPageDesc')}</p>
      </div>
      <RecentlyViewedTab />
    </div>
  );
}