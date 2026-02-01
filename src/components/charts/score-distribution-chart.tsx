"use client";

import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { Candidate } from "@/lib/screening-api";

interface ScoreDistributionChartProps {
  candidates: Candidate[];
}

export function ScoreDistributionChart({ candidates }: ScoreDistributionChartProps) {
  const processed = candidates.filter((c) => c.overallScore !== undefined);

  const ranges = [
    { range: "0-20", min: 0, max: 20, fill: "#ef4444" },
    { range: "21-40", min: 21, max: 40, fill: "#f97316" },
    { range: "41-60", min: 41, max: 60, fill: "#eab308" },
    { range: "61-80", min: 61, max: 80, fill: "#22c55e" },
    { range: "81-100", min: 81, max: 100, fill: "#16a34a" },
  ];

  const data = ranges.map((r) => ({
    range: r.range,
    count: processed.filter((c) => c.overallScore! >= r.min && c.overallScore! <= r.max).length,
    fill: r.fill,
  }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="range" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
        />
        <Bar dataKey="count" name="Candidates" radius={[4, 4, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
