"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { Candidate } from "@/lib/screening-api";

interface PredictedRolesChartProps {
  candidates: Candidate[];
}

const COLORS = [
  "#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899",
  "#f43f5e", "#f97316", "#eab308", "#22c55e", "#14b8a6",
];

export function PredictedRolesChart({ candidates }: PredictedRolesChartProps) {
  const roleCounts: Record<string, number> = {};

  for (const c of candidates) {
    if (c.predictedRoles) {
      for (const role of c.predictedRoles) {
        roleCounts[role] = (roleCounts[role] || 0) + 1;
      }
    }
  }

  const data = Object.entries(roleCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, value]) => ({ name, value }));

  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">No role prediction data</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={80}
          paddingAngle={2}
          dataKey="value"
          label={({ name, value }) => `${name}: ${value}`}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
