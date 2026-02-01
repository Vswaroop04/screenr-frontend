"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { Candidate } from "@/lib/screening-api";

interface SkillsFrequencyChartProps {
  candidates: Candidate[];
}

export function SkillsFrequencyChart({ candidates }: SkillsFrequencyChartProps) {
  // Count skill occurrences from skillMatch data
  const skillCounts: Record<string, number> = {};

  for (const c of candidates) {
    if (c.skillMatch?.matched) {
      for (const m of c.skillMatch.matched) {
        skillCounts[m.skill] = (skillCounts[m.skill] || 0) + 1;
      }
    }
  }

  const data = Object.entries(skillCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([skill, count]) => ({ skill, count }));

  if (data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={Math.max(250, data.length * 28)}>
      <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
        <YAxis
          type="category"
          dataKey="skill"
          width={120}
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
        />
        <Bar dataKey="count" name="Candidates" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
