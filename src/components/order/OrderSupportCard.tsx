import { Phone, Mail, MessageCircle, HelpCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

export function OrderSupportCard() {
  const { t } = useLanguage();

  const items = [
    {
      icon: MessageCircle,
      label: t('store.whatsapp'),
      href: 'https://wa.me/8801407258741',
      external: true,
      tint: 'bg-success/10 text-success',
    },
    {
      icon: Phone,
      label: t('store.callUs'),
      href: 'tel:+8801407258741',
      external: true,
      tint: 'bg-store-primary/10 text-store-primary',
    },
    {
      icon: Mail,
      label: t('store.emailUs'),
      href: 'mailto:support@example.com',
      external: true,
      tint: 'bg-accent/10 text-accent-foreground',
    },
    {
      icon: HelpCircle,
      label: t('store.faq'),
      href: '/help',
      external: false,
      tint: 'bg-muted text-foreground',
    },
  ];

  return (
    <Card className="mb-4">
      <CardContent className="p-5">
        <div className="mb-3">
          <h3 className="font-semibold text-foreground">{t('store.needHelp')}</h3>
          <p className="text-sm text-muted-foreground">{t('store.contactSupport')}</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {items.map(({ icon: Icon, label, href, external, tint }) =>
            external ? (
              <a
                key={label}
                href={href}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border hover:border-store-primary/50 hover:bg-muted/50 transition-colors text-center"
              >
                <div className={`h-9 w-9 rounded-full flex items-center justify-center ${tint}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium">{label}</span>
              </a>
            ) : (
              <Link
                key={label}
                to={href}
                className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border hover:border-store-primary/50 hover:bg-muted/50 transition-colors text-center"
              >
                <div className={`h-9 w-9 rounded-full flex items-center justify-center ${tint}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium">{label}</span>
              </Link>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
}
