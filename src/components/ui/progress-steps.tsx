import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  label: string;
  status: "completed" | "current" | "upcoming";
}

interface ProgressStepsProps {
  steps: Step[];
  className?: string;
}

export function ProgressSteps({ steps, className }: ProgressStepsProps) {
  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      {steps.map((step, index) => (
        <div key={step.label} className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all",
                step.status === "completed" &&
                  "border-primary bg-primary text-primary-foreground",
                step.status === "current" &&
                  "border-primary bg-background text-primary",
                step.status === "upcoming" &&
                  "border-muted bg-background text-muted-foreground"
              )}
            >
              {step.status === "completed" ? (
                <Check className="h-4 w-4" />
              ) : (
                <span className="text-sm font-semibold">{index + 1}</span>
              )}
            </div>
            <span
              className={cn(
                "text-sm font-medium transition-colors",
                step.status === "completed" && "text-primary",
                step.status === "current" && "text-foreground",
                step.status === "upcoming" && "text-muted-foreground"
              )}
            >
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                "h-0.5 w-8 transition-colors",
                step.status === "completed" ? "bg-primary" : "bg-muted"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
