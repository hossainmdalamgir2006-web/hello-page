import { SecurityTab } from "@/components/account/SecurityTab";
import { useLanguage } from "@/contexts/LanguageContext";
import { SEOHead } from "@/components/SEOHead";

export default function AccountSecurity() {
  const { t } = useLanguage();
  return (
    <>
      <SEOHead title="Security" noIndex />
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">{t('account.securityTitle')}</h1>
          <p className="text-sm text-muted-foreground">{t('account.securityDesc')}</p>
        </div>
        <SecurityTab />
      </div>
    </>
  );
}