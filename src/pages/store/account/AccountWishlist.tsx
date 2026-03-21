import { WishlistTab } from "@/components/account/WishlistTab";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AccountWishlist() {
  const { t } = useLanguage();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">{t('account.myWishlist')}</h1>
        <p className="text-sm text-muted-foreground">{t('account.wishlistDesc')}</p>
      </div>
      <WishlistTab />
    </div>
  );
}