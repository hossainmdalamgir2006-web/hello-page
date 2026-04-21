import { Check, User, Truck, CreditCard, ClipboardCheck } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface CheckoutStepsProps {
  currentStep: number;
  variant?: "default" | "onGradient";
}

export function CheckoutSteps({ currentStep, variant = "default" }: CheckoutStepsProps) {
  const { t } = useLanguage();
  const onGradient = variant === "onGradient";

  const steps = [
    { label: t('store.stepContact'), icon: User },
    { label: t('store.stepShipping'), icon: Truck },
    { label: t('store.stepPayment'), icon: CreditCard },
    { label: t('store.stepReview'), icon: ClipboardCheck },
  ];

  // Color tokens per variant
  const completedCircle = onGradient
    ? "bg-white text-store-primary"
    : "bg-store-primary text-store-primary-foreground";
  const currentCircle = onGradient
    ? "bg-white text-store-primary ring-4 ring-white/30"
    : "bg-store-primary text-store-primary-foreground ring-4 ring-store-primary/20";
  const idleCircle = onGradient
    ? "bg-white/15 text-white/70 backdrop-blur"
    : "bg-muted text-muted-foreground";
  const activeLabel = onGradient ? "text-store-primary-foreground" : "text-store-primary";
  const idleLabel = onGradient ? "text-store-primary-foreground/60" : "text-muted-foreground";
  const completedConnector = onGradient ? "bg-white/80" : "bg-store-primary";
  const idleConnector = onGradient ? "bg-white/20" : "bg-muted";

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          return (
            <div key={step.label} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${isCompleted ? completedCircle : isCurrent ? currentCircle : idleCircle}`}>
                  {isCompleted ? <Check className="h-5 w-5" /> : <StepIcon className="h-5 w-5" />}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${isCompleted || isCurrent ? activeLabel : idleLabel}`}>{step.label}</span>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 mt-[-1rem] sm:mt-[-0.5rem] ${isCompleted ? completedConnector : idleConnector}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
