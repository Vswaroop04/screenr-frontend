import { cn } from "@/lib/utils";

interface TypingIndicatorProps {
  text?: string;
  className?: string;
}

export function TypingIndicator({ text = "Processing", className }: TypingIndicatorProps) {
  return (
    <div className={cn("flex items-center gap-2 text-muted-foreground", className)}>
      <span className="text-sm">{text}</span>
      <div className="flex gap-1">
        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" />
      </div>
    </div>
  );
}
