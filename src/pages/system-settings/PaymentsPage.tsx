import { PaymentSettings } from "@/components/settings/PaymentSettings";

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2"><span className="text-primary">💳</span></div>
          Payment Methods
        </h2>
        <p className="text-sm text-muted-foreground ml-12">Configure payment gateways and manual payment options</p>
      </div>
      <PaymentSettings />
    </div>
  );
}
