import { PaymentSettings } from "@/components/settings/PaymentSettings";

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Payment Methods</h2>
        <p className="text-sm text-muted-foreground">Configure payment gateways and manual payment options</p>
      </div>
      <PaymentSettings />
    </div>
  );
}
