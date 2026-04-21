import { ReactNode } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollapsibleSectionProps {
  icon: ReactNode;
  title: string;
  isComplete: boolean;
  isOpen: boolean;
  onToggle: () => void;
  summary?: string;
  children: ReactNode;
  stepNumber?: number;
}

export function CollapsibleSection({
  icon,
  title,
  isComplete,
  isOpen,
  onToggle,
  summary,
  children,
  stepNumber,
}: CollapsibleSectionProps) {
  return (
    <Card className={cn("transition-all", isComplete && !isOpen && "border-store-primary/30 bg-store-primary/[0.02]")}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onToggle}
            className="flex items-center gap-3 flex-1 text-left min-w-0 group"
          >
            <div
              className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors",
                isComplete
                  ? "bg-store-primary text-store-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {isComplete ? <Check className="h-4 w-4" /> : (stepNumber ? <span className="text-xs font-semibold">{stepNumber}</span> : icon)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-base flex items-center gap-2">
                  {!isComplete && <span className="text-store-primary">{icon}</span>}
                  {title}
                </h3>
              </div>
              {isComplete && !isOpen && summary && (
                <p className="text-sm text-muted-foreground truncate mt-0.5">{summary}</p>
              )}
            </div>
          </button>
          {isComplete && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="text-store-primary hover:text-store-primary hover:bg-store-primary/10 flex-shrink-0"
            >
              {isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <>
                  <Pencil className="h-3.5 w-3.5 mr-1" />
                  Edit
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      {isOpen && <CardContent className="space-y-4 pt-0">{children}</CardContent>}
    </Card>
  );
}
