"use client";

import { Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ResumeTip {
  category: string;
  tip: string;
  priority: string;
}

interface ResumeTipsProps {
  tips: ResumeTip[];
}

const priorityColors: Record<string, string> = {
  high: "bg-red-500/10 text-red-600 border-red-500/20",
  medium: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  low: "bg-blue-500/10 text-blue-600 border-blue-500/20",
};

export function ResumeTips({ tips }: ResumeTipsProps) {
  if (!tips || tips.length === 0) return null;

  const sorted = [...tips].sort((a, b) => {
    const order: Record<string, number> = { high: 0, medium: 1, low: 2 };
    return (order[a.priority] ?? 2) - (order[b.priority] ?? 2);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Resume Improvement Tips
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sorted.map((tip, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
              <Badge
                variant="outline"
                className={cn("text-xs flex-shrink-0 mt-0.5", priorityColors[tip.priority])}
              >
                {tip.priority}
              </Badge>
              <div className="space-y-0.5 min-w-0">
                <p className="text-xs font-medium text-muted-foreground capitalize">
                  {tip.category}
                </p>
                <p className="text-sm">{tip.tip}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
