import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Mail, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface CheckoutContactSectionProps {
  email: string;
  onEmailChange: (email: string) => void;
  isLoggedIn: boolean;
  createAccount: boolean;
  onCreateAccountChange: (checked: boolean) => void;
  hideHeader?: boolean;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function CheckoutContactSection({
  email, onEmailChange, isLoggedIn, createAccount, onCreateAccountChange, hideHeader,
}: CheckoutContactSectionProps) {
  const { t } = useLanguage();
  const isValidEmail = emailRegex.test(email);

  const body = (
    <>
      <div>
        <Label htmlFor="email">{t('store.emailAddress')} *</Label>
        <div className="relative">
          <Input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="your@email.com"
            required
            className={cn(isValidEmail && "pr-9 border-green-500/50 focus-visible:ring-green-500")}
          />
          {isValidEmail && (
            <CheckCircle2 className="h-4 w-4 text-green-600 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          )}
        </div>
      </div>
      {!isLoggedIn && (
        <div className="flex items-center gap-2">
          <Checkbox
            id="createAccount"
            checked={createAccount}
            onCheckedChange={(checked) => onCreateAccountChange(checked as boolean)}
          />
          <Label htmlFor="createAccount" className="text-sm font-normal cursor-pointer">
            {t('store.createAccountCheckout')}
          </Label>
        </div>
      )}
    </>
  );

  if (hideHeader) {
    return <div className="space-y-4">{body}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-store-primary" /> {t('store.contactInformation')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">{body}</CardContent>
    </Card>
  );
}
