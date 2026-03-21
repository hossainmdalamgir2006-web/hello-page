import { CustomerSupportTickets } from "@/components/store/CustomerSupportTickets";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AccountSupport() {
  const { t } = useLanguage();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">{t('account.supportPageTitle')}</h1>
        <p className="text-sm text-muted-foreground">{t('account.getHelpFromTeam')}</p>
      </div>
      <CustomerSupportTickets />
    </div>
  );
}