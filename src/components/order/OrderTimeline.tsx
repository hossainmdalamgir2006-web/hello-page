import { CheckCircle2, Circle, Clock, Package, Truck, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface OrderTimelineProps {
  /** 0 = placed, 1 = verified, 2 = packed, 3 = shipped, 4 = delivered */
  currentStep?: number;
  estimatedShipDate?: string;
  estimatedDeliveryDate?: string;
  isCOD?: boolean;
}

export function OrderTimeline({
  currentStep = 0,
  estimatedShipDate,
  estimatedDeliveryDate,
  isCOD = false,
}: OrderTimelineProps) {
  const { t } = useLanguage();

  const steps = [
    { icon: CheckCircle2, label: t('store.timelinePlaced'), eta: t('store.now') },
    {
      icon: Clock,
      label: isCOD ? 'Order Confirmed' : t('store.timelineVerified'),
      eta: isCOD ? 'Auto-confirmed' : t('store.within30min'),
    },
    { icon: Package, label: t('store.timelinePacked'), eta: t('store.within24hrs') },
    { icon: Truck, label: t('store.timelineShipped'), eta: estimatedShipDate || '' },
    { icon: Home, label: t('store.timelineDelivered'), eta: estimatedDeliveryDate || '' },
  ];

  return (
    <div className="space-y-1">
      {steps.map((step, idx) => {
        const isComplete = idx <= currentStep;
        const isCurrent = idx === currentStep;
        const isLast = idx === steps.length - 1;
        const Icon = isComplete ? CheckCircle2 : step.icon;

        return (
          <div key={idx} className="flex gap-4 relative">
            {/* Icon column */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "h-9 w-9 rounded-full flex items-center justify-center shrink-0 z-10 transition-all",
                  isComplete
                    ? "bg-store-primary text-white shadow-md shadow-store-primary/30"
                    : "bg-muted text-muted-foreground border border-border",
                  isCurrent && !isComplete && "ring-2 ring-store-primary/30"
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              {!isLast && (
                <div
                  className={cn(
                    "w-0.5 flex-1 min-h-[28px] my-1",
                    idx < currentStep ? "bg-store-primary" : "bg-border"
                  )}
                />
              )}
            </div>
            {/* Content */}
            <div className={cn("flex-1 pb-4", isLast && "pb-0")}>
              <p
                className={cn(
                  "text-sm font-medium",
                  isComplete ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.label}
              </p>
              {step.eta && (
                <p className="text-xs text-muted-foreground mt-0.5">{step.eta}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
