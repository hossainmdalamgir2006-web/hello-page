import { ShieldCheck, Lock, BadgeCheck, Headphones } from "lucide-react";

const signals = [
  { icon: Lock, label: "SSL Encrypted", sub: "256-bit" },
  { icon: ShieldCheck, label: "Secure Checkout", sub: "PCI Compliant" },
  { icon: BadgeCheck, label: "Money-back", sub: "Guarantee" },
  { icon: Headphones, label: "24/7 Support", sub: "Always here" },
];

export function TrustSignalsStrip() {
  return (
    <div className="rounded-lg border bg-gradient-to-r from-store-primary/5 via-background to-store-primary/5 p-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {signals.map((signal) => {
          const Icon = signal.icon;
          return (
            <div
              key={signal.label}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-background/60 transition-colors"
            >
              <div className="h-8 w-8 rounded-full bg-store-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="h-4 w-4 text-store-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium leading-tight truncate">{signal.label}</p>
                <p className="text-[10px] text-muted-foreground leading-tight truncate">{signal.sub}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
