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

interface ExperienceDistributionChartProps {
  candidates: Candidate[];
}

export function ExperienceDistributionChart({ candidates }: ExperienceDistributionChartProps) {
  const withExp = candidates.filter((c) => c.totalYearsExperience !== undefined);

  const ranges = [
    { range: "0-1 yr", min: 0, max: 1 },
    { range: "2-3 yr", min: 2, max: 3 },
    { range: "4-5 yr", min: 4, max: 5 },
    { range: "6-8 yr", min: 6, max: 8 },
    { range: "9-12 yr", min: 9, max: 12 },
    { range: "13+ yr", min: 13, max: 100 },
  ];

  const data = ranges.map((r) => ({
    range: r.range,
    count: withExp.filter(
      (c) => c.totalYearsExperience! >= r.min && c.totalYearsExperience! <= r.max
    ).length,
  }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="range" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
        />
        <Bar dataKey="count" name="Candidates" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
