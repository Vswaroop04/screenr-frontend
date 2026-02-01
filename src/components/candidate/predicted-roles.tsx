"use client";

import { Briefcase } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PredictedRole {
  role: string;
  confidence: number;
  reasoning: string;
}

interface PredictedRolesProps {
  roles: PredictedRole[];
}

export function PredictedRoles({ roles }: PredictedRolesProps) {
  if (!roles || roles.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Predicted Roles for You
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {roles.map((role, i) => (
          <div key={i} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">{role.role}</span>
              <span className="text-xs text-muted-foreground">
                {Math.round(role.confidence * 100)}% match
              </span>
            </div>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${role.confidence * 100}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">{role.reasoning}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
