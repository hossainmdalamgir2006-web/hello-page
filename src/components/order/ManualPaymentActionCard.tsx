import { useState } from "react";
import { AlertTriangle, Copy, Check, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatPrice } from "@/lib/formatPrice";
import { Link } from "react-router-dom";

interface ManualPaymentActionCardProps {
  amount: number;
  accountNumber: string;
  accountType?: string | null;
  methodName: string;
  methodLogo?: string | null;
  transactionId?: string;
}

export function ManualPaymentActionCard({
  amount,
  accountNumber,
  accountType,
  methodName,
  methodLogo,
  transactionId,
}: ManualPaymentActionCardProps) {
  const { t } = useLanguage();
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);

  const copy = async (val: string, setter: (v: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(val);
      setter(true);
      setTimeout(() => setter(false), 2000);
    } catch {}
  };

  return (
    <Card className="mb-4 border-warning/30 bg-warning/5 overflow-hidden">
      <div className="bg-warning/10 px-5 py-2.5 flex items-center gap-2 border-b border-warning/20">
        <AlertTriangle className="h-4 w-4 text-warning" />
        <span className="text-sm font-semibold text-warning-foreground">
          {t('store.actionRequired')}
        </span>
      </div>
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start gap-3">
          {methodLogo ? (
            <img
              src={methodLogo}
              alt={methodName}
              className="h-10 w-10 object-contain rounded-md border border-border bg-background p-1 shrink-0"
            />
          ) : null}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground">{t('store.sendPaymentTo')} ({methodName})</p>
            <p className="text-xs text-muted-foreground mt-1">{t('store.verifiedWithin')}</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div className="rounded-lg bg-background border border-border p-3">
            <p className="text-xs text-muted-foreground mb-1">Amount</p>
            <div className="flex items-center justify-between gap-2">
              <p className="font-mono font-bold text-foreground text-lg">{formatPrice(amount)}</p>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 shrink-0"
                onClick={() => copy(String(amount), setCopiedAmount)}
                title="Copy amount"
              >
                {copiedAmount ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="rounded-lg bg-background border border-border p-3">
            <p className="text-xs text-muted-foreground mb-1">
              Account Number{accountType ? ` (${accountType})` : ''}
            </p>
            <div className="flex items-center justify-between gap-2">
              <p className="font-mono font-bold text-foreground text-lg truncate">{accountNumber}</p>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 shrink-0"
                onClick={() => copy(accountNumber, setCopiedNumber)}
                title="Copy number"
              >
                {copiedNumber ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        {transactionId && (
          <div className="rounded-lg bg-success/10 border border-success/30 p-3 flex items-center gap-2">
            <Check className="h-4 w-4 text-success shrink-0" />
            <p className="text-sm">
              <span className="text-muted-foreground">TrxID submitted: </span>
              <span className="font-mono font-semibold">{transactionId}</span>
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" asChild>
            <Link to="/help">
              <HelpCircle className="mr-1.5 h-4 w-4" />
              {t('store.howToPay')}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
