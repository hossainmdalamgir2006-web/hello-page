import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Mail } from 'lucide-react';

interface CheckoutContactSectionProps {
  email: string;
  onEmailChange: (email: string) => void;
  isLoggedIn: boolean;
  createAccount: boolean;
  onCreateAccountChange: (checked: boolean) => void;
}

export function CheckoutContactSection({ email, onEmailChange, isLoggedIn, createAccount, onCreateAccountChange }: CheckoutContactSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-store-primary" /> Contact Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="email">Email Address *</Label>
          <Input id="email" name="email" type="email" value={email} onChange={(e) => onEmailChange(e.target.value)} placeholder="your@email.com" required />
        </div>
        {!isLoggedIn && (
          <div className="flex items-center gap-2">
            <Checkbox id="createAccount" checked={createAccount} onCheckedChange={(checked) => onCreateAccountChange(checked as boolean)} />
            <Label htmlFor="createAccount" className="text-sm font-normal cursor-pointer">Create an account for faster checkout next time</Label>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
