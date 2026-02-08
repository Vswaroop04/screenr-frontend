import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorTextProps {
  children: React.ReactNode;
  className?: string;
}

export function ErrorText({ children, className }: ErrorTextProps) {
  if (!children) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-sm text-destructive animate-in fade-in-0 slide-in-from-top-1 duration-200",
        className
      )}
      role="alert"
    >
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      <span>{children}</span>
    </div>
  );
}
